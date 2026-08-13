const SEARCH_CONSOLE_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const SEARCH_CONSOLE_API = "https://www.googleapis.com/webmasters/v3";
const URL_INSPECTION_API = "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect";
const STATUS_CACHE_SECONDS = 6 * 60 * 60;
const ERROR_CACHE_SECONDS = 60 * 60;

let accessTokenCache = { token: "", expiresAt: 0 };

function bytesToBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function textToBase64Url(value) {
  return bytesToBase64Url(new TextEncoder().encode(String(value || "")));
}

function pemPrivateKeyBytes(pem) {
  const encoded = String(pem || "")
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s+/g, "");
  const binary = atob(encoded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function safeDate(value) {
  const parsed = Date.parse(String(value || ""));
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : null;
}

function integer(value) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : 0;
}

function decimal(value) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? Math.max(0, Number(parsed.toFixed(4))) : 0;
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function cacheKey(hostname) {
  return `google-search-console:status:v4:${hostname}`;
}

function serviceAccountPrincipal(env) {
  try {
    const credentials = JSON.parse(String(env.GOOGLE_SERVICE_ACCOUNT_JSON || ""));
    const email = String(credentials?.client_email || "").trim().toLowerCase();
    return /^[^\s@]+@[^\s@]+\.iam\.gserviceaccount\.com$/.test(email) ? email : null;
  } catch {
    return null;
  }
}

async function googleServiceAccountToken(env) {
  if (accessTokenCache.token && accessTokenCache.expiresAt > Date.now() + 60_000) {
    return accessTokenCache.token;
  }

  let credentials;
  try {
    credentials = JSON.parse(String(env.GOOGLE_SERVICE_ACCOUNT_JSON || ""));
  } catch {
    return "";
  }
  if (!credentials?.client_email || !credentials?.private_key) return "";

  const now = Math.floor(Date.now() / 1000);
  const header = textToBase64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = textToBase64Url(JSON.stringify({
    iss: credentials.client_email,
    scope: SEARCH_CONSOLE_SCOPE,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }));
  const unsignedJwt = `${header}.${claims}`;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemPrivateKeyBytes(credentials.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    { name: "RSASSA-PKCS1-v1_5" },
    key,
    new TextEncoder().encode(unsignedJwt),
  );
  const assertion = `${unsignedJwt}.${bytesToBase64Url(new Uint8Array(signature))}`;
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.access_token) return "";

  accessTokenCache = {
    token: String(result.access_token),
    expiresAt: Date.now() + Math.max(300, Number(result.expires_in || 3600) - 120) * 1000,
  };
  return accessTokenCache.token;
}

async function googleJson(url, accessToken, options = {}) {
  const response = await fetch(url, {
    method: options.method || "GET",
    headers: {
      authorization: `Bearer ${accessToken}`,
      accept: "application/json",
      ...(options.body === undefined ? {} : { "content-type": "application/json" }),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const payload = await response.json().catch(() => null);
  return { ok: response.ok, status: response.status, payload };
}

export function googlePropertyCandidates(siteUrl) {
  try {
    const url = new URL(siteUrl);
    if (url.protocol !== "https:") return [];
    return [`sc-domain:${url.hostname}`, `${url.origin}/`];
  } catch {
    return [];
  }
}

export function summarizeGoogleIndexInspection(payload) {
  const result = payload?.inspectionResult?.indexStatusResult || {};
  return {
    verdict: String(result.verdict || "UNKNOWN"),
    coverageState: String(result.coverageState || ""),
    indexingState: String(result.indexingState || ""),
    pageFetchState: String(result.pageFetchState || ""),
    robotsTxtState: String(result.robotsTxtState || ""),
    lastCrawlTime: safeDate(result.lastCrawlTime),
    googleCanonical: String(result.googleCanonical || ""),
    userCanonical: String(result.userCanonical || ""),
  };
}

export function summarizeGoogleSearchAnalytics(payload, startDate, endDate) {
  const row = Array.isArray(payload?.rows) ? payload.rows[0] || {} : {};
  return {
    startDate,
    endDate,
    clicks: integer(row.clicks),
    impressions: integer(row.impressions),
    ctr: decimal(row.ctr),
    position: decimal(row.position),
  };
}

export function summarizeGoogleSearchPages(payload, origin) {
  const canonicalOrigin = new URL(origin).origin;
  const pages = [];
  for (const row of Array.isArray(payload?.rows) ? payload.rows : []) {
    const pageUrl = String(row?.keys?.[0] || "");
    let page;
    try {
      const parsed = new URL(pageUrl);
      if (parsed.origin !== canonicalOrigin) continue;
      page = `${parsed.pathname}${parsed.search}`;
    } catch {
      continue;
    }
    pages.push({
      page,
      clicks: integer(row.clicks),
      impressions: integer(row.impressions),
      ctr: decimal(row.ctr),
      position: decimal(row.position),
    });
  }
  return pages
    .sort((left, right) => (
      right.impressions - left.impressions
      || right.clicks - left.clicks
      || left.position - right.position
      || left.page.localeCompare(right.page)
    ))
    .slice(0, 10);
}

const SEARCH_INTENTS = [
  { intent: "branded", label: "Brand searches", pattern: /\b(gptmarketplus|agentid)\b/i },
  { intent: "small_business_ai", label: "Small-business AI", pattern: /\bsmall business(?:es)?\b/i },
  { intent: "ai_receptionist", label: "AI receptionist", pattern: /\b(receptionist|call answering|answering service|phone agent)\b/i },
  { intent: "lead_automation", label: "Lead automation", pattern: /\b(lead|prospect)(?:s|ing)?\b|follow[ -]?up/i },
  { intent: "sales_automation", label: "Sales automation", pattern: /\b(sales|funnel|conversion)\b/i },
  { intent: "marketing_automation", label: "Marketing automation", pattern: /\b(marketing|content|social media|campaign)\b/i },
  { intent: "roi_planning", label: "ROI and payback", pattern: /\b(roi|return on investment|payback|savings|calculator)\b/i },
  { intent: "comparison", label: "Product comparison", pattern: /\b(vs\.?|versus|compare|comparison|alternative)\b/i },
  { intent: "pricing_research", label: "Pricing research", pattern: /\b(cost|price|pricing|fee|fees|how much|affordable)\b/i },
  { intent: "diy_resources", label: "Templates and DIY", pattern: /\b(template|checklist|workbook|launch kit|guide|script)\b/i },
];

function searchIntentForQuery(query) {
  return SEARCH_INTENTS.find((entry) => entry.pattern.test(query))
    || { intent: "other", label: "Other AI automation searches" };
}

export function summarizeGoogleSearchIntents(payload, origin) {
  const canonicalOrigin = new URL(origin).origin;
  const aggregates = new Map();
  for (const row of Array.isArray(payload?.rows) ? payload.rows : []) {
    const query = String(row?.keys?.[0] || "").trim();
    if (!query) continue;
    try {
      if (new URL(String(row?.keys?.[1] || "")).origin !== canonicalOrigin) continue;
    } catch {
      continue;
    }
    const category = searchIntentForQuery(query);
    const impressions = integer(row.impressions);
    const clicks = integer(row.clicks);
    const position = decimal(row.position);
    const current = aggregates.get(category.intent) || {
      intent: category.intent,
      label: category.label,
      clicks: 0,
      impressions: 0,
      weightedPosition: 0,
      queries: new Set(),
    };
    current.clicks += clicks;
    current.impressions += impressions;
    current.weightedPosition += position * impressions;
    current.queries.add(query);
    aggregates.set(category.intent, current);
  }

  return [...aggregates.values()]
    .filter((entry) => entry.impressions > 0)
    .map((entry) => ({
      intent: entry.intent,
      label: entry.label,
      clicks: entry.clicks,
      impressions: entry.impressions,
      ctr: entry.impressions ? decimal(entry.clicks / entry.impressions) : 0,
      position: entry.impressions ? decimal(entry.weightedPosition / entry.impressions) : 0,
      queryCount: entry.queries.size,
    }))
    .sort((left, right) => (
      right.impressions - left.impressions
      || right.clicks - left.clicks
      || left.position - right.position
      || left.intent.localeCompare(right.intent)
    ));
}

async function googleSearchAnalyticsAllRows(url, accessToken, body) {
  const rowLimit = 25_000;
  const rows = [];
  let startRow = 0;
  while (true) {
    const response = await googleJson(url, accessToken, {
      method: "POST",
      body: { ...body, rowLimit, startRow },
    });
    if (!response.ok) return response;
    const pageRows = Array.isArray(response.payload?.rows) ? response.payload.rows : [];
    rows.push(...pageRows);
    if (pageRows.length < rowLimit) {
      return { ...response, payload: { ...response.payload, rows } };
    }
    startRow += rowLimit;
  }
}

function summarizeSitemap(payload, sitemapUrl) {
  const entries = Array.isArray(payload?.sitemap) ? payload.sitemap : [];
  const sitemap = entries.find((item) => String(item.path || "") === sitemapUrl);
  if (!sitemap) return { submitted: false, url: sitemapUrl };
  return {
    submitted: true,
    url: sitemapUrl,
    pending: Boolean(sitemap.isPending),
    warnings: integer(sitemap.warnings),
    errors: integer(sitemap.errors),
    lastSubmitted: safeDate(sitemap.lastSubmitted),
    lastDownloaded: safeDate(sitemap.lastDownloaded),
  };
}

async function writeCachedStatus(env, key, status, expirationTtl) {
  if (!env.GMP_KV || typeof env.GMP_KV.put !== "function") return;
  await env.GMP_KV.put(key, JSON.stringify(status), { expirationTtl });
}

export async function googleSearchConsoleStatus(env, { force = false } = {}) {
  let origin;
  try {
    origin = new URL(String(env.SITE_URL || "https://gptmarketplus.com")).origin;
  } catch {
    origin = "https://gptmarketplus.com";
  }
  const hostname = new URL(origin).hostname;
  const checkedAt = new Date().toISOString();
  const key = cacheKey(hostname);
  if (!force && env.GMP_KV && typeof env.GMP_KV.get === "function") {
    const cached = await env.GMP_KV.get(key, "json");
    if (cached?.checkedAt) return { ...cached, cached: true };
  }

  const base = {
    ok: true,
    provider: "google_search_console",
    site: origin,
    configured: Boolean(String(env.GOOGLE_SERVICE_ACCOUNT_JSON || "").trim()),
    permissionGrantPrincipal: serviceAccountPrincipal(env),
    checkedAt,
    cached: false,
  };
  if (!base.configured) return { ...base, authorized: false, propertyFound: false, status: "credential_not_configured" };

  let accessToken = "";
  try {
    accessToken = await googleServiceAccountToken(env);
  } catch {
    accessToken = "";
  }
  if (!accessToken) {
    const status = { ...base, ok: false, authorized: false, propertyFound: false, status: "service_account_auth_failed" };
    await writeCachedStatus(env, key, status, ERROR_CACHE_SECONDS);
    return status;
  }

  const sitesResponse = await googleJson(`${SEARCH_CONSOLE_API}/sites`, accessToken);
  if (!sitesResponse.ok) {
    const status = {
      ...base,
      ok: false,
      authorized: false,
      propertyFound: false,
      status: sitesResponse.status === 403 ? "api_or_permission_denied" : "provider_unavailable",
      providerStatus: sitesResponse.status,
    };
    await writeCachedStatus(env, key, status, ERROR_CACHE_SECONDS);
    return status;
  }

  const entries = Array.isArray(sitesResponse.payload?.siteEntry) ? sitesResponse.payload.siteEntry : [];
  const candidates = googlePropertyCandidates(origin);
  const property = entries.find((entry) => candidates.includes(String(entry.siteUrl || "")));
  if (!property) {
    const status = { ...base, authorized: true, propertyFound: false, status: "property_not_shared_with_service_account" };
    await writeCachedStatus(env, key, status, ERROR_CACHE_SECONDS);
    return status;
  }

  const propertyUrl = String(property.siteUrl);
  const encodedProperty = encodeURIComponent(propertyUrl);
  const sitemapUrl = `${origin}/sitemap.xml`;
  const end = new Date();
  end.setUTCDate(end.getUTCDate() - 3);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 27);
  const startDate = isoDate(start);
  const endDate = isoDate(end);
  const [sitemapsResponse, inspectionResponse, analyticsResponse, pagesResponse, intentsResponse] = await Promise.all([
    googleJson(`${SEARCH_CONSOLE_API}/sites/${encodedProperty}/sitemaps`, accessToken),
    googleJson(URL_INSPECTION_API, accessToken, {
      method: "POST",
      body: { inspectionUrl: `${origin}/`, siteUrl: propertyUrl, languageCode: "en-US" },
    }),
    googleJson(`${SEARCH_CONSOLE_API}/sites/${encodedProperty}/searchAnalytics/query`, accessToken, {
      method: "POST",
      body: { startDate, endDate, rowLimit: 1 },
    }),
    googleJson(`${SEARCH_CONSOLE_API}/sites/${encodedProperty}/searchAnalytics/query`, accessToken, {
      method: "POST",
      body: {
        startDate,
        endDate,
        dimensions: ["page"],
        rowLimit: 250,
        dataState: "final",
      },
    }),
    googleSearchAnalyticsAllRows(
      `${SEARCH_CONSOLE_API}/sites/${encodedProperty}/searchAnalytics/query`,
      accessToken,
      {
        startDate,
        endDate,
        dimensions: ["query", "page"],
        dataState: "final",
      },
    ),
  ]);

  const status = {
    ...base,
    authorized: true,
    propertyFound: true,
    status: "ready",
    propertyType: propertyUrl.startsWith("sc-domain:") ? "domain" : "url_prefix",
    permissionLevel: String(property.permissionLevel || "unknown"),
    sitemap: sitemapsResponse.ok
      ? summarizeSitemap(sitemapsResponse.payload, sitemapUrl)
      : { submitted: false, url: sitemapUrl, providerStatus: sitemapsResponse.status },
    homepageIndex: inspectionResponse.ok
      ? summarizeGoogleIndexInspection(inspectionResponse.payload)
      : { verdict: "UNKNOWN", providerStatus: inspectionResponse.status },
    searchAnalytics: analyticsResponse.ok
      ? summarizeGoogleSearchAnalytics(analyticsResponse.payload, startDate, endDate)
      : { startDate, endDate, providerStatus: analyticsResponse.status },
    topPages: pagesResponse.ok
      ? summarizeGoogleSearchPages(pagesResponse.payload, origin)
      : [],
    searchIntents: intentsResponse.ok
      ? summarizeGoogleSearchIntents(intentsResponse.payload, origin)
      : [],
  };
  await writeCachedStatus(env, key, status, STATUS_CACHE_SECONDS);
  return status;
}
