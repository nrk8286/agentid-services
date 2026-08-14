const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43,86}$/;
const DEFAULT_TTL_HOURS = 48;
const MAX_TTL_HOURS = 72;
const PROVISIONING_RETRY_MS = 2 * 60 * 1000;

function cleanText(value, maxLength) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function cleanEmail(value) {
  const email = String(value || "").trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email.slice(0, 160) : "";
}

function base64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function normalizeToken(value) {
  const token = String(value || "").trim();
  return TOKEN_PATTERN.test(token) ? token : "";
}

function normalizeNow(value) {
  const parsed = value instanceof Date ? value : new Date(value || Date.now());
  return Number.isFinite(parsed.getTime()) ? parsed : new Date();
}

function resultChanges(result) {
  return Number(result?.meta?.changes || 0);
}

export function paypalApprovalFeatureEnabled(env) {
  return String(env.PAYPAL_APPROVAL_LINKS_ENABLED || "").trim().toLowerCase() === "true"
    && String(env.SPONSOR_CHECKOUT_ENABLED || "").trim().toLowerCase() === "true";
}

export function maskApprovalEmail(value) {
  const email = cleanEmail(value);
  if (!email) return "";
  const [local, domain] = email.split("@");
  const visibleLocal = local.length <= 2 ? local.slice(0, 1) : local.slice(0, 2);
  return `${visibleLocal}${"*".repeat(Math.max(2, Math.min(6, local.length - visibleLocal.length)))}@${domain}`;
}

export async function hashApprovalToken(value) {
  const token = normalizeToken(value);
  if (!token) return "";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function publicApproval(record) {
  return {
    id: record.id,
    packageId: record.package_id,
    packageName: record.package_name,
    amountCents: Number(record.amount_cents || 0),
    currency: record.currency || "USD",
    priceLabel: record.price_label,
    businessName: record.business_name || "",
    advertiserEmailMasked: maskApprovalEmail(record.advertiser_email),
    approvalReference: record.approval_reference,
    status: record.status,
    approvedAt: record.approved_at,
    expiresAt: record.expires_at,
  };
}

async function expireApproval(db, record, now) {
  if (!record || Date.parse(record.expires_at) > now.getTime()) return record;
  if (["approved", "failed", "provisioning"].includes(record.status)) {
    await db.prepare(`UPDATE paypal_subscription_approvals
      SET status = 'expired', updated_at = ?
      WHERE id = ? AND status IN ('approved', 'failed', 'provisioning')`)
      .bind(now.toISOString(), record.id).run();
    return { ...record, status: "expired", updated_at: now.toISOString() };
  }
  return record;
}

export async function createPaypalSubscriptionApproval(db, input) {
  if (!db) return { ok: false, status: 503, error: "Approval storage is unavailable." };
  const packageId = cleanText(input.packageId, 80);
  const packageName = cleanText(input.packageName, 120);
  const planId = cleanText(input.planId, 80);
  const advertiserEmail = cleanEmail(input.advertiserEmail);
  const businessName = cleanText(input.businessName, 160);
  const approvalReference = cleanText(input.approvalReference, 160);
  const amountCents = Math.max(0, Math.trunc(Number(input.amountCents || 0)));
  const currency = cleanText(input.currency || "USD", 3).toUpperCase();
  const priceLabel = cleanText(input.priceLabel, 120);
  const approvedBy = cleanText(input.approvedBy || "manual_admin", 80);
  const ttlHours = Math.min(MAX_TTL_HOURS, Math.max(1, Math.trunc(Number(input.expiresInHours || DEFAULT_TTL_HOURS))));
  if (!packageId || !packageName || !planId || !advertiserEmail || !businessName || !approvalReference || !amountCents || currency !== "USD") {
    return { ok: false, status: 400, error: "Package, advertiser, written approval reference, and USD price are required." };
  }

  const now = normalizeNow(input.now);
  const expiresAt = new Date(now.getTime() + ttlHours * 60 * 60 * 1000);
  const tokenBytes = crypto.getRandomValues(new Uint8Array(32));
  const token = base64Url(tokenBytes);
  const tokenHash = await hashApprovalToken(token);
  const id = crypto.randomUUID();
  const paypalRequestId = crypto.randomUUID();
  await db.prepare(`INSERT INTO paypal_subscription_approvals
    (id, token_hash, package_id, package_name, paypal_plan_id, amount_cents, currency, price_label,
     advertiser_email, business_name, approval_reference, approved_by, status, approved_at, expires_at,
     paypal_request_id, attempt_count, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', ?, ?, ?, 0, ?, ?)`)
    .bind(
      id,
      tokenHash,
      packageId,
      packageName,
      planId,
      amountCents,
      currency,
      priceLabel,
      advertiserEmail,
      businessName,
      approvalReference,
      approvedBy,
      now.toISOString(),
      expiresAt.toISOString(),
      paypalRequestId,
      now.toISOString(),
      now.toISOString(),
    ).run();

  const baseUrl = new URL(String(input.baseUrl || "https://gptmarketplus.com"));
  baseUrl.pathname = "/sponsor/subscribe";
  baseUrl.search = "";
  baseUrl.hash = token;
  return {
    ok: true,
    status: 201,
    checkoutLink: baseUrl.toString(),
    approval: publicApproval({
      id,
      package_id: packageId,
      package_name: packageName,
      amount_cents: amountCents,
      currency,
      price_label: priceLabel,
      business_name: businessName,
      advertiser_email: advertiserEmail,
      approval_reference: approvalReference,
      status: "approved",
      approved_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    }),
  };
}

export async function inspectPaypalSubscriptionApproval(db, rawToken, nowValue) {
  if (!db) return { ok: false, status: 503, error: "Approval storage is unavailable." };
  const tokenHash = await hashApprovalToken(rawToken);
  if (!tokenHash) return { ok: false, status: 404, error: "Approval link is invalid or unavailable." };
  let record = await db.prepare("SELECT * FROM paypal_subscription_approvals WHERE token_hash = ? LIMIT 1")
    .bind(tokenHash).first();
  if (!record) return { ok: false, status: 404, error: "Approval link is invalid or unavailable." };
  const now = normalizeNow(nowValue);
  const linkExpired = Date.parse(record.expires_at) <= now.getTime();
  record = await expireApproval(db, record, now);
  if (linkExpired || ["expired", "revoked", "cancelled"].includes(record.status)) {
    return { ok: false, status: 410, error: "Approval link has expired or was revoked." };
  }
  return { ok: true, status: 200, approval: publicApproval(record), record };
}

export async function claimPaypalSubscriptionApproval(db, input) {
  const inspected = await inspectPaypalSubscriptionApproval(db, input.token, input.now);
  if (!inspected.ok) return inspected;
  const email = cleanEmail(input.advertiserEmail);
  if (!email || email !== cleanEmail(inspected.record.advertiser_email)) {
    return { ok: false, status: 403, error: "Email does not match the approved recipient." };
  }
  if (inspected.record.status === "issued" || inspected.record.status === "active") {
    return {
      ok: true,
      status: 200,
      replay: true,
      record: inspected.record,
      checkoutUrl: inspected.record.paypal_approval_url || "",
      subscriptionId: inspected.record.paypal_subscription_id || "",
    };
  }

  const now = normalizeNow(input.now);
  const retryBefore = new Date(now.getTime() - PROVISIONING_RETRY_MS).toISOString();
  const result = await db.prepare(`UPDATE paypal_subscription_approvals
    SET status = 'provisioning', provisioning_started_at = ?, attempt_count = attempt_count + 1,
        last_error_code = NULL, updated_at = ?
    WHERE id = ? AND advertiser_email = ? AND expires_at > ?
      AND (status IN ('approved', 'failed') OR (status = 'provisioning' AND provisioning_started_at <= ?))`)
    .bind(now.toISOString(), now.toISOString(), inspected.record.id, email, now.toISOString(), retryBefore).run();
  if (resultChanges(result) !== 1) {
    const current = await db.prepare("SELECT * FROM paypal_subscription_approvals WHERE id = ? LIMIT 1")
      .bind(inspected.record.id).first();
    if (current && ["issued", "active"].includes(current.status) && current.paypal_approval_url) {
      return { ok: true, status: 200, replay: true, record: current, checkoutUrl: current.paypal_approval_url, subscriptionId: current.paypal_subscription_id || "" };
    }
    return { ok: false, status: 409, error: "Approval link is already being processed. Try again shortly." };
  }
  return {
    ok: true,
    status: 200,
    replay: false,
    record: { ...inspected.record, status: "provisioning", provisioning_started_at: now.toISOString() },
  };
}

export async function completePaypalSubscriptionApproval(db, input) {
  const now = normalizeNow(input.now).toISOString();
  const subscriptionId = cleanText(input.subscriptionId, 80);
  const checkoutUrl = cleanText(input.checkoutUrl, 1000);
  if (!db || !input.id || !subscriptionId || !checkoutUrl) return { ok: false };
  const result = await db.prepare(`UPDATE paypal_subscription_approvals
    SET status = 'issued', paypal_subscription_id = ?, paypal_approval_url = ?, issued_at = ?,
        provisioning_started_at = NULL, last_error_code = NULL, updated_at = ?
    WHERE id = ? AND status = 'provisioning'`)
    .bind(subscriptionId, checkoutUrl, now, now, input.id).run();
  return { ok: resultChanges(result) === 1 };
}

export async function failPaypalSubscriptionApproval(db, input) {
  const now = normalizeNow(input.now).toISOString();
  const errorCode = cleanText(input.errorCode || "provider_error", 80);
  if (!db || !input.id) return { ok: false };
  const result = await db.prepare(`UPDATE paypal_subscription_approvals
    SET status = 'failed', last_error_code = ?, provisioning_started_at = NULL, updated_at = ?
    WHERE id = ? AND status = 'provisioning'`)
    .bind(errorCode, now, input.id).run();
  return { ok: resultChanges(result) === 1 };
}

export async function revokePaypalSubscriptionApproval(db, id, nowValue) {
  if (!db || !/^[0-9a-f-]{36}$/i.test(String(id || ""))) {
    return { ok: false, status: 400, error: "A valid approval ID is required." };
  }
  const now = normalizeNow(nowValue).toISOString();
  const result = await db.prepare(`UPDATE paypal_subscription_approvals
    SET status = 'revoked', updated_at = ?
    WHERE id = ? AND status IN ('approved', 'failed')`)
    .bind(now, id).run();
  if (resultChanges(result) !== 1) {
    return { ok: false, status: 409, error: "Only unused approval links can be revoked here." };
  }
  return { ok: true, status: 200, id, approvalStatus: "revoked" };
}

export async function listPaypalSubscriptionApprovals(db, limitValue = 50) {
  if (!db) return { ok: false, status: 503, error: "Approval storage is unavailable." };
  const limit = Math.min(100, Math.max(1, Math.trunc(Number(limitValue || 50))));
  const result = await db.prepare(`SELECT id, package_id, package_name, amount_cents, currency, price_label,
      advertiser_email, business_name, approval_reference, status, approved_at, expires_at,
      paypal_subscription_id, issued_at, attempt_count, last_error_code, created_at, updated_at
    FROM paypal_subscription_approvals ORDER BY datetime(created_at) DESC LIMIT ?`).bind(limit).all();
  return {
    ok: true,
    status: 200,
    approvals: (result.results || []).map((record) => ({
      ...publicApproval(record),
      subscriptionId: record.paypal_subscription_id || null,
      issuedAt: record.issued_at || null,
      attemptCount: Number(record.attempt_count || 0),
      lastErrorCode: record.last_error_code || null,
    })),
  };
}

export async function recordPaypalSubscriptionApprovalEvent(db, input) {
  if (!db || !input.subscriptionId) return { ok: false };
  const eventStatus = {
    "BILLING.SUBSCRIPTION.ACTIVATED": "active",
    "BILLING.SUBSCRIPTION.SUSPENDED": "suspended",
    "BILLING.SUBSCRIPTION.CANCELLED": "cancelled",
    "BILLING.SUBSCRIPTION.EXPIRED": "expired",
  }[input.eventType];
  if (!eventStatus) return { ok: true, ignored: true };
  const now = normalizeNow(input.now).toISOString();
  const eventId = cleanText(input.eventId, 120);
  const result = await db.prepare(`UPDATE paypal_subscription_approvals
    SET status = ?, webhook_event_id = ?, updated_at = ?
    WHERE paypal_subscription_id = ?`)
    .bind(eventStatus, eventId, now, cleanText(input.subscriptionId, 80)).run();
  return { ok: true, updated: resultChanges(result) };
}
