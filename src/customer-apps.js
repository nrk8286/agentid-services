import { normalizeEmailAddress } from "./input-validation.js";

const APP_STATUSES = new Set(["draft", "active", "paused", "archived"]);
const FOLLOW_UP_STATUSES = new Set(["not_queued", "queued", "in_progress", "completed", "suppressed"]);
const PUBLIC_CACHE_PREFIX = "customer-app:public:";

function cleanText(value, maxLength = 500) {
  return String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function cleanEmail(value) {
  return normalizeEmailAddress(cleanText(value, 254), 254);
}

function object(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function json(value, fallback = {}) {
  try {
    return object(JSON.parse(String(value || "")));
  } catch {
    return fallback;
  }
}

function base64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function randomId(prefix) {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  return `${prefix}${base64Url(bytes)}`;
}

async function sha256(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(value || "")));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function nowIso(now) {
  return typeof now === "function" ? now() : new Date().toISOString();
}

function cacheKey(publicKey) {
  return `${PUBLIC_CACHE_PREFIX}${publicKey}`;
}

async function getPublicCache(env, publicKey) {
  if (!env?.GMP_KV) return null;
  try {
    return await env.GMP_KV.get(cacheKey(publicKey), "json");
  } catch {
    return null;
  }
}

async function putPublicCache(env, app, ttl = 300) {
  if (!env?.GMP_KV) return;
  try {
    await env.GMP_KV.put(cacheKey(app.publicKey), JSON.stringify(app), { expirationTtl: Math.max(60, Math.min(3600, Number(ttl) || 300)) });
  } catch (error) {
    console.warn("customer app public-config cache write failed", { appId: app.id, error: String(error?.message || error) });
  }
}

async function clearPublicCache(env, publicKey) {
  if (!env?.GMP_KV || !publicKey) return;
  try {
    await env.GMP_KV.delete(cacheKey(publicKey));
  } catch (error) {
    console.warn("customer app public-config cache delete failed", { publicKey, error: String(error?.message || error) });
  }
}

function appFromRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    tenantId: row.tenant_id,
    name: row.name,
    publicKey: row.public_key,
    status: row.status,
    publicConfig: json(row.public_config_json),
    privateConfig: json(row.private_config_json),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function sanitizePublicCustomerAppConfig(config = {}) {
  const input = object(config);
  const fields = object(input.fields);
  const cleanList = (value, maxItems, maxLength) => (Array.isArray(value) ? value : [])
    .map((item) => cleanText(item, maxLength))
    .filter(Boolean)
    .slice(0, maxItems);
  return {
    title: cleanText(input.title, 120),
    description: cleanText(input.description, 500),
    brandTagline: cleanText(input.brandTagline, 240),
    serviceSummary: cleanList(input.serviceSummary, 6, 140),
    serviceOptions: cleanList(input.serviceOptions, 12, 140),
    consentLabel: cleanText(input.consentLabel, 240),
    responseTime: cleanText(input.responseTime, 180),
    submitLabel: cleanText(input.submitLabel, 80) || "Send request",
    successMessage: cleanText(input.successMessage, 300) || "Thanks — we’ll be in touch soon.",
    fields: {
      name: fields.name !== false,
      email: fields.email !== false,
      phone: Boolean(fields.phone),
      message: fields.message !== false,
    },
    requiredFields: [...new Set((Array.isArray(input.requiredFields) ? input.requiredFields : ["email"])
      .map((field) => cleanText(field, 20))
      .filter((field) => ["name", "email", "phone", "message"].includes(field)))],
  };
}

export function normalizeCustomerAppInput(input = {}) {
  const data = object(input);
  const tenantId = cleanText(data.tenantId, 120);
  const name = cleanText(data.name, 120);
  const status = cleanText(data.status || "draft", 20).toLowerCase();
  if (!tenantId) return { ok: false, error: "A tenant ID is required." };
  if (!name) return { ok: false, error: "An app name is required." };
  if (!APP_STATUSES.has(status)) return { ok: false, error: "Invalid app status." };
  return {
    ok: true,
    value: {
      tenantId,
      name,
      status,
      publicConfig: sanitizePublicCustomerAppConfig(data.publicConfig),
      privateConfig: object(data.privateConfig),
    },
  };
}

export function publicCustomerAppConfig(app) {
  if (!app) return null;
  const source = app.publicConfig || json(app.public_config_json);
  return {
    id: String(app.id || ""),
    publicKey: String(app.publicKey ?? app.public_key ?? ""),
    name: cleanText(app.name, 120),
    status: String(app.status || "draft"),
    config: sanitizePublicCustomerAppConfig(source),
  };
}

export async function hashCustomerAppDashboardToken(token, { hash = sha256 } = {}) {
  const cleanToken = cleanText(token, 1000);
  return cleanToken ? hash(cleanToken) : "";
}

export async function createCustomerApp(env, input, { idFactory = () => randomId("capp_"), publicKeyFactory = () => randomId("lca_"), now, cacheTtl = 300 } = {}) {
  if (!env?.GMP_DB) return { ok: false, status: "storage_unavailable" };
  const normalized = normalizeCustomerAppInput(input);
  if (!normalized.ok) return normalized;
  const createdAt = nowIso(now);
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const app = { id: await idFactory(), publicKey: await publicKeyFactory(), ...normalized.value, createdAt, updatedAt: createdAt };
    try {
      await env.GMP_DB.prepare(`INSERT INTO customer_apps
        (id, tenant_id, name, public_key, status, public_config_json, private_config_json, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(app.id, app.tenantId, app.name, app.publicKey, app.status, JSON.stringify(app.publicConfig), JSON.stringify(app.privateConfig), app.createdAt, app.updatedAt)
        .run();
      await putPublicCache(env, publicCustomerAppConfig(app), cacheTtl);
      return { ok: true, app };
    } catch (error) {
      if (attempt === 2) throw error;
    }
  }
  return { ok: false, status: "create_failed" };
}

export async function grantCustomerAppDashboardAccess(env, appId, dashboardToken, { hash, now } = {}) {
  if (!env?.GMP_DB) return { ok: false, status: "storage_unavailable" };
  const tokenHash = await hashCustomerAppDashboardToken(dashboardToken, { hash });
  if (!cleanText(appId, 160) || !tokenHash) return { ok: false, status: "invalid_access_grant" };
  const app = await env.GMP_DB.prepare("SELECT id FROM customer_apps WHERE id = ?").bind(appId).first();
  if (!app) return { ok: false, status: "not_found" };
  await env.GMP_DB.prepare(`INSERT INTO customer_app_dashboard_access (app_id, dashboard_token_hash, created_at, revoked_at)
    VALUES (?, ?, ?, NULL)
    ON CONFLICT(app_id, dashboard_token_hash) DO UPDATE SET revoked_at = NULL`)
    .bind(appId, tokenHash, nowIso(now)).run();
  return { ok: true };
}

export async function getCustomerAppById(env, appId) {
  if (!env?.GMP_DB || !cleanText(appId, 160)) return null;
  return appFromRow(await env.GMP_DB.prepare("SELECT * FROM customer_apps WHERE id = ?").bind(appId).first());
}

export async function getCustomerAppByTenantId(env, tenantId) {
  if (!env?.GMP_DB || !cleanText(tenantId, 160)) return null;
  return appFromRow(await env.GMP_DB.prepare("SELECT * FROM customer_apps WHERE tenant_id = ? ORDER BY updated_at DESC LIMIT 1").bind(tenantId).first());
}

export async function revokeCustomerAppDashboardAccess(env, appId, dashboardToken, { hash, now } = {}) {
  if (!env?.GMP_DB) return { ok: false, status: "storage_unavailable" };
  const tokenHash = await hashCustomerAppDashboardToken(dashboardToken, { hash });
  if (!cleanText(appId, 160) || !tokenHash) return { ok: false, status: "invalid_access_grant" };
  await env.GMP_DB.prepare(`UPDATE customer_app_dashboard_access SET revoked_at = ?
    WHERE app_id = ? AND dashboard_token_hash = ? AND revoked_at IS NULL`).bind(nowIso(now), appId, tokenHash).run();
  return { ok: true };
}

export async function customerAppForDashboardToken(env, dashboardToken, { hash } = {}) {
  if (!env?.GMP_DB) return { ok: false, status: "storage_unavailable", apps: [] };
  const tokenHash = await hashCustomerAppDashboardToken(dashboardToken, { hash });
  if (!tokenHash) return { ok: false, status: "unauthorized", apps: [] };
  return customerAppForDashboardTokenHash(env, tokenHash);
}

export async function customerAppForDashboardTokenHash(env, tokenHash, appId = "") {
  if (!env?.GMP_DB || !cleanText(tokenHash, 160)) return { ok: false, status: "unauthorized", apps: [] };
  const appFilter = cleanText(appId, 160);
  const result = await env.GMP_DB.prepare(`SELECT a.* FROM customer_apps a
    INNER JOIN customer_app_dashboard_access access ON access.app_id = a.id
    WHERE access.dashboard_token_hash = ? AND access.revoked_at IS NULL
      ${appFilter ? "AND a.id = ?" : ""}
    ORDER BY a.updated_at DESC`).bind(...(appFilter ? [tokenHash, appFilter] : [tokenHash])).all();
  return { ok: true, apps: (result.results || []).map(appFromRow) };
}

export async function getPublicCustomerApp(env, publicKey, { cacheTtl = 300 } = {}) {
  const key = cleanText(publicKey, 160);
  if (!key) return null;
  const cached = await getPublicCache(env, key);
  if (cached) return cached.status === "active" ? cached : null;
  if (!env?.GMP_DB) return null;
  const app = appFromRow(await env.GMP_DB.prepare("SELECT * FROM customer_apps WHERE public_key = ?").bind(key).first());
  if (!app || app.status !== "active") return null;
  const publicApp = publicCustomerAppConfig(app);
  await putPublicCache(env, publicApp, cacheTtl);
  return publicApp;
}

export async function updateCustomerApp(env, appId, patch, { now, cacheTtl = 300 } = {}) {
  if (!env?.GMP_DB) return { ok: false, status: "storage_unavailable" };
  const current = appFromRow(await env.GMP_DB.prepare("SELECT * FROM customer_apps WHERE id = ?").bind(appId).first());
  if (!current) return { ok: false, status: "not_found" };
  const input = object(patch);
  const status = input.status === undefined ? current.status : cleanText(input.status, 20).toLowerCase();
  if (!APP_STATUSES.has(status)) return { ok: false, error: "Invalid app status." };
  const app = {
    ...current,
    name: input.name === undefined ? current.name : cleanText(input.name, 120),
    status,
    publicConfig: input.publicConfig === undefined ? current.publicConfig : sanitizePublicCustomerAppConfig(input.publicConfig),
    privateConfig: input.privateConfig === undefined ? current.privateConfig : object(input.privateConfig),
    updatedAt: nowIso(now),
  };
  if (!app.name) return { ok: false, error: "An app name is required." };
  await env.GMP_DB.prepare(`UPDATE customer_apps SET name = ?, status = ?, public_config_json = ?, private_config_json = ?, updated_at = ? WHERE id = ?`)
    .bind(app.name, app.status, JSON.stringify(app.publicConfig), JSON.stringify(app.privateConfig), app.updatedAt, app.id).run();
  await clearPublicCache(env, app.publicKey);
  if (app.status === "active") await putPublicCache(env, publicCustomerAppConfig(app), cacheTtl);
  return { ok: true, app };
}

export function normalizeCustomerAppLead(input = {}) {
  const data = object(input);
  const followUpStatus = cleanText(data.followUpStatus || (data.contactConsent ? "queued" : "not_queued"), 20).toLowerCase();
  const lead = {
    name: cleanText(data.name, 120),
    email: cleanEmail(data.email),
    phone: cleanText(data.phone, 40),
    service: cleanText(data.service, 160),
    message: cleanText(data.message, 4000),
    source: cleanText(data.source, 300),
    metadata: {},
    contactConsent: data.contactConsent === true || data.contactConsent === 1 || data.contactConsent === "true" ? 1 : 0,
    followUpStatus,
  };
  if (!lead.email && !lead.phone) return { ok: false, error: "An email address or phone number is required." };
  if (!FOLLOW_UP_STATUSES.has(followUpStatus)) return { ok: false, error: "Invalid follow-up status." };
  if (!lead.contactConsent && followUpStatus !== "not_queued" && followUpStatus !== "suppressed") return { ok: false, error: "Contact consent is required to queue follow-up." };
  return { ok: true, value: lead };
}

export async function captureCustomerAppLead(env, publicKey, input, { idFactory = () => randomId("clead_"), now, onLeadCaptured } = {}) {
  if (!env?.GMP_DB) return { ok: false, status: "storage_unavailable" };
  const app = await getPublicCustomerApp(env, publicKey);
  if (!app) return { ok: false, status: "app_unavailable" };
  const normalized = normalizeCustomerAppLead(input);
  if (!normalized.ok) return normalized;
  const timestamp = nowIso(now);
  const lead = { id: await idFactory(), appId: app.id, ...normalized.value, createdAt: timestamp, updatedAt: timestamp };
  await env.GMP_DB.prepare("DELETE FROM customer_app_leads WHERE app_id = ? AND datetime(created_at) < datetime('now', '-90 days')")
    .bind(lead.appId).run();
  await env.GMP_DB.prepare(`INSERT INTO customer_app_leads
    (id, app_id, created_at, updated_at, name, email, phone, service, message, source, metadata_json, contact_consent, follow_up_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(lead.id, lead.appId, lead.createdAt, lead.updatedAt, lead.name || null, lead.email || null, lead.phone || null, lead.service || null, lead.message || null, lead.source || null, JSON.stringify(lead.metadata), lead.contactConsent, lead.followUpStatus).run();
  if (typeof onLeadCaptured === "function") await onLeadCaptured({ app, lead });
  return { ok: true, app: publicCustomerAppConfig(app), lead };
}

export async function listCustomerAppLeads(env, appId, { limit = 50 } = {}) {
  if (!env?.GMP_DB) return { ok: false, status: "storage_unavailable", leads: [] };
  const safeLimit = Math.max(1, Math.min(100, Number.isFinite(Number(limit)) ? Math.floor(Number(limit)) : 50));
  const result = await env.GMP_DB.prepare(`SELECT * FROM customer_app_leads WHERE app_id = ?
    AND datetime(created_at) >= datetime('now', '-90 days')
    ORDER BY created_at DESC LIMIT ?`).bind(appId, safeLimit).all();
  return {
    ok: true,
    leads: (result.results || []).map((row) => ({
      id: row.id, appId: row.app_id, createdAt: row.created_at, updatedAt: row.updated_at,
      name: row.name, email: row.email, phone: row.phone, service: row.service, message: row.message, source: row.source,
      metadata: json(row.metadata_json), contactConsent: Boolean(row.contact_consent), followUpStatus: row.follow_up_status,
    })),
  };
}

export async function deleteCustomerAppLead(env, appId, leadId) {
  if (!env?.GMP_DB || !cleanText(appId, 160) || !cleanText(leadId, 160)) {
    return { ok: false, status: "invalid_request", deleted: false };
  }
  const result = await env.GMP_DB.prepare("DELETE FROM customer_app_leads WHERE app_id = ? AND id = ?")
    .bind(appId, leadId).run();
  return { ok: true, deleted: Number(result?.meta?.changes || 0) > 0 };
}

export async function customerAppStatus(env, appId) {
  if (!env?.GMP_DB) return { ok: false, status: "storage_unavailable" };
  const row = await env.GMP_DB.prepare(`SELECT a.id, a.tenant_id, a.name, a.public_key, a.status, a.created_at, a.updated_at,
    COUNT(l.id) AS lead_count, SUM(CASE WHEN l.follow_up_status = 'queued' THEN 1 ELSE 0 END) AS queued_follow_up_count
    FROM customer_apps a LEFT JOIN customer_app_leads l ON l.app_id = a.id WHERE a.id = ? GROUP BY a.id`).bind(appId).first();
  if (!row) return { ok: false, status: "not_found" };
  return { ok: true, app: {
    id: row.id, tenantId: row.tenant_id, name: row.name, publicKey: row.public_key, status: row.status,
    createdAt: row.created_at, updatedAt: row.updated_at, leadCount: Number(row.lead_count || 0), queuedFollowUpCount: Number(row.queued_follow_up_count || 0),
  } };
}
