import { normalizeEmailAddress } from "./input-validation.js";

export const CPC_TERMS_VERSION = "2026-08-08-v1";
export const CPC_DEFAULT_RATE_CENTS = 200;
export const CPC_DEFAULT_CLICK_CAP = 25;
export const CPC_DEFAULT_DURATION_DAYS = 30;
export const CPC_ADVERTISER_ACCESS_DAYS = 120;
const CPC_ADVERTISER_ACCESS_MAX_DAYS = 180;
const ACCESS_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43,86}$/;

function cleanText(value, maxLength) {
  return String(value || "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function cleanEmail(value) {
  return normalizeEmailAddress(cleanText(value, 254), 254);
}

function base64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function normalizeAccessToken(value) {
  const token = String(value || "").trim();
  return ACCESS_TOKEN_PATTERN.test(token) ? token : "";
}

function normalizeNow(value) {
  const parsed = value instanceof Date ? value : new Date(value || Date.now());
  return Number.isFinite(parsed.getTime()) ? parsed : new Date();
}

function resultChanges(result) {
  return Number(result?.meta?.changes || 0);
}

function integerWithin(value, fallback, minimum, maximum) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  const rounded = Math.round(parsed);
  return rounded >= minimum && rounded <= maximum ? rounded : null;
}

export function normalizeCpcDestination(value) {
  try {
    const destination = new URL(String(value || "").trim());
    if (destination.protocol !== "https:" || destination.username || destination.password) return "";
    destination.hash = "";
    return destination.toString();
  } catch {
    return "";
  }
}

export function normalizeCpcCampaignInput(input = {}) {
  const advertiserEmail = cleanEmail(input.advertiserEmail || input.email);
  const sponsorName = cleanText(input.sponsorName || input.name || input.businessName, 100);
  const sponsorCopy = cleanText(input.sponsorCopy || input.copy, 220);
  const destinationUrl = normalizeCpcDestination(input.destinationUrl || input.website);
  const cpcCents = integerWithin(input.cpcCents, CPC_DEFAULT_RATE_CENTS, 50, 10000);
  const clickCap = integerWithin(input.clickCap, CPC_DEFAULT_CLICK_CAP, 10, 5000);
  const durationDays = integerWithin(input.durationDays, CPC_DEFAULT_DURATION_DAYS, 7, 90);
  const approvalReference = cleanText(input.approvalReference, 160);
  const approvedBy = cleanText(input.approvedBy || "manual_admin", 80);

  if (!advertiserEmail) return { ok: false, error: "A valid advertiser email is required." };
  if (sponsorName.length < 2) return { ok: false, error: "A sponsor name is required." };
  if (sponsorCopy.length < 10) return { ok: false, error: "Sponsor copy must be at least 10 characters." };
  if (!destinationUrl) return { ok: false, error: "A valid HTTPS destination URL is required." };
  if (cpcCents === null) return { ok: false, error: "CPC must be between $0.50 and $100.00." };
  if (clickCap === null) return { ok: false, error: "Click cap must be between 10 and 5,000." };
  if (durationDays === null) return { ok: false, error: "Campaign duration must be between 7 and 90 days." };
  if (!approvalReference) return { ok: false, error: "A written approval reference is required before PayPal invoicing." };

  const budgetCents = cpcCents * clickCap;
  if (budgetCents > 1_000_000) return { ok: false, error: "Campaign funding cannot exceed $10,000." };

  return {
    ok: true,
    value: {
      advertiserEmail,
      sponsorName,
      sponsorCopy,
      destinationUrl,
      cpcCents,
      clickCap,
      durationDays,
      budgetCents,
      termsVersion: CPC_TERMS_VERSION,
      approvalReference,
      approvedBy,
    },
  };
}

export function maskCpcAdvertiserEmail(value) {
  const email = cleanEmail(value);
  if (!email) return "";
  const [local, domain] = email.split("@");
  const visible = local.length <= 2 ? local.slice(0, 1) : local.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(2, Math.min(6, local.length - visible.length)))}@${domain}`;
}

export async function hashCpcAdvertiserAccessToken(value) {
  const token = normalizeAccessToken(value);
  if (!token) return "";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function advertiserCpcCampaign(record) {
  if (!record) return null;
  const publicCampaign = publicCpcCampaign(record);
  return {
    ...publicCampaign,
    advertiserEmailMasked: maskCpcAdvertiserEmail(record.advertiser_email),
    sponsorCopy: String(record.sponsor_copy || ""),
    destinationUrl: String(record.destination_url || ""),
    invoiceStatus: String(record.invoice_status || "NOT_CREATED"),
    approvalReference: String(record.approval_reference || ""),
    approvedAt: record.approved_at || null,
    paidAt: record.paid_at || null,
    unearnedCents: Math.max(publicCampaign.fundedCents - publicCampaign.earnedCents, 0),
    accessExpiresAt: record.advertiser_access_expires_at || null,
  };
}

export async function issueCpcAdvertiserAccess(db, campaignId, input = {}) {
  if (!db) return { ok: false, status: 503, error: "Campaign storage is unavailable." };
  const id = cleanText(campaignId, 80);
  if (!/^cpc-[a-z0-9-]{8,72}$/i.test(id)) {
    return { ok: false, status: 400, error: "A valid campaign ID is required." };
  }
  const campaign = await db.prepare("SELECT * FROM sponsor_cpc_campaigns WHERE id = ? LIMIT 1").bind(id).first();
  if (!campaign) return { ok: false, status: 404, error: "Campaign not found." };
  if (!campaign.approval_reference || !campaign.approved_at) {
    return { ok: false, status: 409, error: "Written creative and placement approval is required before advertiser access." };
  }

  const days = Math.min(CPC_ADVERTISER_ACCESS_MAX_DAYS, Math.max(1, Math.trunc(Number(input.expiresInDays || CPC_ADVERTISER_ACCESS_DAYS))));
  const now = normalizeNow(input.now);
  const expiresAt = new Date(now.getTime() + days * 86400000).toISOString();
  const token = base64Url(crypto.getRandomValues(new Uint8Array(32)));
  const tokenHash = await hashCpcAdvertiserAccessToken(token);
  const updated = await db.prepare(`UPDATE sponsor_cpc_campaigns
    SET advertiser_access_token_hash = ?, advertiser_access_expires_at = ?,
        advertiser_access_revoked_at = NULL, updated_at = ?
    WHERE id = ?`).bind(tokenHash, expiresAt, now.toISOString(), id).run();
  if (resultChanges(updated) !== 1) {
    return { ok: false, status: 409, error: "Campaign access could not be issued." };
  }

  const accessUrl = new URL(String(input.baseUrl || "https://gptmarketplus.com"));
  accessUrl.pathname = "/sponsor/campaign";
  accessUrl.search = "";
  accessUrl.hash = token;
  return {
    ok: true,
    status: 201,
    accessUrl: accessUrl.toString(),
    campaign: advertiserCpcCampaign({
      ...campaign,
      advertiser_access_expires_at: expiresAt,
      advertiser_access_revoked_at: null,
    }),
  };
}

export async function inspectCpcAdvertiserAccess(db, input = {}) {
  if (!db) return { ok: false, status: 503, error: "Campaign storage is unavailable." };
  const tokenHash = await hashCpcAdvertiserAccessToken(input.token);
  if (!tokenHash) return { ok: false, status: 404, error: "Campaign access is invalid or unavailable." };
  const record = await db.prepare("SELECT * FROM sponsor_cpc_campaigns WHERE advertiser_access_token_hash = ? LIMIT 1")
    .bind(tokenHash).first();
  if (!record) return { ok: false, status: 404, error: "Campaign access is invalid or unavailable." };
  const now = normalizeNow(input.now);
  if (record.advertiser_access_revoked_at || Date.parse(record.advertiser_access_expires_at || "") <= now.getTime()) {
    return { ok: false, status: 410, error: "Campaign access has expired or was revoked." };
  }
  const advertiserEmail = cleanEmail(input.advertiserEmail);
  if (!advertiserEmail || advertiserEmail !== cleanEmail(record.advertiser_email)) {
    return { ok: false, status: 403, error: "Email does not match the approved advertiser." };
  }
  return { ok: true, status: 200, campaign: advertiserCpcCampaign(record), record };
}

export async function revokeCpcAdvertiserAccess(db, campaignId, nowValue) {
  if (!db) return { ok: false, status: 503, error: "Campaign storage is unavailable." };
  const id = cleanText(campaignId, 80);
  if (!/^cpc-[a-z0-9-]{8,72}$/i.test(id)) {
    return { ok: false, status: 400, error: "A valid campaign ID is required." };
  }
  const now = normalizeNow(nowValue).toISOString();
  const result = await db.prepare(`UPDATE sponsor_cpc_campaigns
    SET advertiser_access_revoked_at = ?, advertiser_access_token_hash = NULL, updated_at = ?
    WHERE id = ? AND advertiser_access_token_hash IS NOT NULL`)
    .bind(now, now, id).run();
  if (resultChanges(result) !== 1) {
    return { ok: false, status: 409, error: "Campaign access is already unavailable." };
  }
  return { ok: true, status: 200, campaignId: id, accessStatus: "revoked" };
}

export function buildCpcInvoicePayload(campaign, { brandName = "GPTMarketPlus", invoiceDate = new Date().toISOString().slice(0, 10) } = {}) {
  const rate = (Number(campaign.cpcCents || 0) / 100).toFixed(2);
  return {
    detail: {
      invoice_number: `CPC-${String(campaign.id || "").replace(/^cpc-/, "").toUpperCase()}`.slice(0, 25),
      reference: String(campaign.id || "").slice(0, 120),
      invoice_date: invoiceDate,
      currency_code: "USD",
      note: `${brandName} reviewed CPC sponsor campaign. Impressions, known bots, duplicate visitor clicks within 24 hours, and invalid traffic do not consume campaign credit.`,
      terms_and_conditions: `Rate: $${rate} USD per server-validated click. Cap: ${campaign.clickCap} clicks. Initial flight: ${campaign.durationDays} days after verified PayPal payment. Unused funding is not earned revenue and is eligible for a written extension or refund of the undelivered balance. Terms ${campaign.termsVersion || CPC_TERMS_VERSION}.`,
      payment_term: { term_type: "DUE_ON_RECEIPT" },
    },
    invoicer: {
      name: { business_name: brandName },
    },
    primary_recipients: [
      {
        billing_info: { email_address: campaign.advertiserEmail },
      },
    ],
    items: [
      {
        name: "Server-validated sponsor clicks",
        description: `${campaign.sponsorName}: up to ${campaign.clickCap} validated outbound sponsor clicks at $${rate} each.`,
        quantity: String(campaign.clickCap),
        unit_amount: { currency_code: "USD", value: rate },
        unit_of_measure: "QUANTITY",
      },
    ],
    configuration: {
      allow_tip: false,
      partial_payment: { allow_partial_payment: false },
    },
  };
}

export function publicCpcCampaign(campaign) {
  if (!campaign) return null;
  const validatedClicks = Math.max(0, Number(campaign.validated_clicks ?? campaign.validatedClicks ?? 0));
  const clickCap = Math.max(0, Number(campaign.click_cap ?? campaign.clickCap ?? 0));
  const cpcCents = Math.max(0, Number(campaign.cpc_cents ?? campaign.cpcCents ?? 0));
  return {
    id: String(campaign.id || ""),
    sponsorName: String(campaign.sponsor_name ?? campaign.sponsorName ?? ""),
    status: String(campaign.status || "unknown"),
    cpcCents,
    clickCap,
    validatedClicks,
    remainingClicks: Math.max(clickCap - validatedClicks, 0),
    earnedCents: Math.min(validatedClicks, clickCap) * cpcCents,
    fundedCents: Math.max(0, Number(campaign.budget_cents ?? campaign.budgetCents ?? 0)),
    startsAt: campaign.starts_at ?? campaign.startsAt ?? null,
    endsAt: campaign.ends_at ?? campaign.endsAt ?? null,
    termsVersion: String(campaign.terms_version ?? campaign.termsVersion ?? CPC_TERMS_VERSION),
  };
}

export function cpcInvoiceFullyFunded(summary, campaign) {
  return Boolean(summary?.providerPaid)
    && !summary.refunded
    && Number(summary.refundCount || 0) === 0
    && summary.currency === "USD"
    && Number(summary.totalCents) === Number(campaign?.budget_cents ?? campaign?.budgetCents)
    && Number(summary.paidCents) === Number(campaign?.budget_cents ?? campaign?.budgetCents)
    && Number(summary.dueCents) === 0;
}

export function cpcRefundDisposition(summary) {
  return summary?.status === "REFUNDED" ? "refunded" : "refund_review";
}

export function likelyAutomatedClick({ userAgent = "", cf = {} } = {}) {
  const agent = String(userAgent || "").trim();
  if (!agent) return true;
  if (/(?:bot|crawler|spider|slurp|headless|phantom|lighthouse|pagespeed|preview|facebookexternalhit|whatsapp|telegrambot|discordbot|curl|wget|python-requests|httpclient)/i.test(agent)) return true;
  if (cf?.verifiedBotCategory || cf?.botManagement?.verifiedBot) return true;
  const score = Number(cf?.botManagement?.score);
  return Number.isFinite(score) && score > 0 && score < 30;
}

export async function cpcVisitorHash({ secret, campaignId, ip, userAgent }) {
  const material = [secret, campaignId, ip, userAgent].map((value) => String(value || "")).join("|");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(material));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
