import { googleOAuthGmailAccessToken, sendOwnerTransactionalEmail } from "./agentid-site.js";
import { googleSearchConsoleStatus } from "./google-search-console.js";

export const GMAIL_READONLY_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";

const SNAPSHOT_TIME_ZONE = "America/Chicago";
const SNAPSHOT_HISTORY_LIMIT = 31;
const SYNTHETIC_EMAIL_SQL = `(
  LOWER(COALESCE(email, '')) LIKE '%@example.com'
  OR LOWER(COALESCE(email, '')) LIKE '%@example.org'
  OR LOWER(COALESCE(email, '')) LIKE '%@example.net'
  OR LOWER(COALESCE(email, '')) LIKE '%@example.invalid'
  OR LOWER(COALESCE(email, '')) LIKE '%.invalid'
)`;

function integer(value) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : 0;
}

function cleanText(value, maxLength = 500) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function dayKeyInTimeZone(date = new Date(), timeZone = SNAPSHOT_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${byType.year}-${byType.month}-${byType.day}`;
}

function internalEmails(env) {
  return [...new Set([
    env.OWNER_NOTIFICATION_EMAIL,
    env.OWNER_EMAIL,
    env.SUPPORT_EMAIL,
    env.CONTACT_EMAIL,
    env.GMAIL_SENDER_EMAIL,
  ].map((value) => String(value || "").trim().toLowerCase()).filter(Boolean))];
}

async function d1First(env, sql, bindings = []) {
  if (!env.GMP_DB) return null;
  const statement = env.GMP_DB.prepare(sql);
  return (bindings.length ? statement.bind(...bindings) : statement).first();
}

async function d1All(env, sql, bindings = []) {
  if (!env.GMP_DB) return [];
  const statement = env.GMP_DB.prepare(sql);
  const result = await (bindings.length ? statement.bind(...bindings) : statement).all();
  return Array.isArray(result?.results) ? result.results : [];
}

function internalEmailClause(column, emails) {
  if (!emails.length) return { sql: "", bindings: [] };
  return {
    sql: ` AND LOWER(COALESCE(${column}, '')) NOT IN (${emails.map(() => "?").join(", ")})`,
    bindings: emails,
  };
}

async function genuineLeadCounts(env) {
  const excludedEmails = internalEmails(env);
  const genericInternal = internalEmailClause("email", excludedEmails);
  const agentIdInternal = internalEmailClause("email", excludedEmails);
  const [generic, agentId] = await Promise.all([
    d1First(env, `SELECT COUNT(*) AS total
      FROM leads
      WHERE LOWER(COALESCE(stage, '')) NOT IN ('test', 'test_record', 'qa')
        AND LOWER(COALESCE(notification_status, '')) <> 'excluded_test'
        AND LOWER(COALESCE(source, '')) NOT LIKE '%qa%'
        AND LOWER(COALESCE(source, '')) NOT LIKE '%internal%'
        AND NOT ${SYNTHETIC_EMAIL_SQL}
        ${genericInternal.sql}`, genericInternal.bindings),
    d1First(env, `SELECT COUNT(*) AS total
      FROM agentid_leads
      WHERE LOWER(COALESCE(crm_stage, '')) NOT IN ('test', 'test_record', 'qa')
        AND LOWER(COALESCE(lead_status, '')) <> 'test'
        AND LOWER(COALESCE(follow_up_status, '')) <> 'excluded_test'
        AND LOWER(COALESCE(notes, '')) NOT LIKE '%classification:%'
        AND LOWER(COALESCE(source_page, '')) NOT LIKE '%utm_medium=qa%'
        AND LOWER(COALESCE(source_page, '')) NOT LIKE '%traffic_type=internal%'
        AND NOT ${SYNTHETIC_EMAIL_SQL}
        ${agentIdInternal.sql}`, agentIdInternal.bindings),
  ]);
  const genericTotal = integer(generic?.total);
  const agentIdTotal = integer(agentId?.total);
  return {
    total: genericTotal + agentIdTotal,
    generic: genericTotal,
    agentId: agentIdTotal,
  };
}

async function settledPaypalMetrics(env) {
  if (String(env.PAYPAL_MODE || "").trim().toLowerCase() !== "live") {
    return { paidCheckouts: 0, settledRevenueCents: 0, liveMode: false };
  }
  const excludedEmails = internalEmails(env);
  const emailFilter = internalEmailClause("customer_email", excludedEmails);
  const row = await d1First(env, `SELECT
      SUM(CASE
        WHEN LOWER(COALESCE(payment_status, '')) IN ('paid', 'earned_from_prepaid_funds')
          THEN MAX(amount_cents, 0)
        ELSE 0
      END) AS settled_revenue_cents,
      SUM(CASE
        WHEN LOWER(COALESCE(payment_status, '')) = 'paid'
          AND LOWER(COALESCE(source, '')) IN ('paypal_order', 'paypal_subscription')
          THEN 1
        ELSE 0
      END) AS paid_checkouts
    FROM revenue_events
    WHERE LOWER(COALESCE(mode, '')) NOT IN ('sandbox', 'test', 'qa')
      AND LOWER(COALESCE(source, '')) NOT LIKE '%test%'
      AND LOWER(COALESCE(source, '')) NOT LIKE '%qa%'
      AND LOWER(COALESCE(customer_email, '')) NOT LIKE '%@example.%'
      ${emailFilter.sql}`, emailFilter.bindings);
  return {
    paidCheckouts: integer(row?.paid_checkouts),
    settledRevenueCents: integer(row?.settled_revenue_cents),
    liveMode: true,
  };
}

function gmailHeader(message, name) {
  const headers = Array.isArray(message?.payload?.headers) ? message.payload.headers : [];
  return cleanText(headers.find((header) => String(header?.name || "").toLowerCase() === name.toLowerCase())?.value || "", 1000);
}

function gmailMessageTime(message) {
  const internalDate = Number(message?.internalDate || 0);
  if (Number.isFinite(internalDate) && internalDate > 0) return internalDate;
  const parsed = Date.parse(gmailHeader(message, "date"));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function sponsorReplyStatusFromMessages(messages, recipientEmail, sentAt) {
  const recipient = String(recipientEmail || "").trim().toLowerCase();
  const sentAtMs = Date.parse(String(sentAt || ""));
  const reply = (Array.isArray(messages) ? messages : [])
    .filter((message) => !Array.isArray(message?.labelIds) || !message.labelIds.includes("SENT"))
    .filter((message) => gmailHeader(message, "from").toLowerCase().includes(recipient))
    .filter((message) => !Number.isFinite(sentAtMs) || gmailMessageTime(message) > sentAtMs)
    .sort((left, right) => gmailMessageTime(right) - gmailMessageTime(left))[0];
  return reply
    ? { status: "replied", repliedAt: new Date(gmailMessageTime(reply)).toISOString() }
    : { status: "no_reply", repliedAt: null };
}

async function gmailJson(url, accessToken) {
  const response = await fetch(url, {
    headers: {
      authorization: `Bearer ${accessToken}`,
      accept: "application/json",
    },
  });
  const payload = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, payload };
}

async function gmailMessagesForSponsor(accessToken, sponsor) {
  const query = `in:anywhere {from:${sponsor.recipient_email} to:${sponsor.recipient_email}} after:${String(sponsor.sent_at).slice(0, 10).replace(/-/g, "/")}`;
  const listUrl = new URL("https://gmail.googleapis.com/gmail/v1/users/me/messages");
  listUrl.searchParams.set("q", query);
  listUrl.searchParams.set("maxResults", "25");
  const list = await gmailJson(listUrl.toString(), accessToken);
  if (!list.ok) return { ok: false, providerStatus: list.status, messages: [] };
  const messageRefs = Array.isArray(list.payload?.messages) ? list.payload.messages : [];
  const messages = await Promise.all(messageRefs.map(async ({ id }) => {
    const messageUrl = new URL(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(id)}`);
    messageUrl.searchParams.set("format", "metadata");
    for (const header of ["From", "To", "Date"]) messageUrl.searchParams.append("metadataHeaders", header);
    const response = await gmailJson(messageUrl.toString(), accessToken);
    return response.ok ? response.payload : null;
  }));
  return { ok: true, messages: messages.filter(Boolean) };
}

async function sponsorReplyStatuses(env) {
  const sponsors = await d1All(env, `SELECT campaign_id, sponsor_name, recipient_email, sent_at, initial_status, active
    FROM growth_sponsor_threads ORDER BY sent_at, campaign_id`);
  const access = await googleOAuthGmailAccessToken(env, [GMAIL_READONLY_SCOPE]);
  const results = [];
  for (const sponsor of sponsors) {
    if (!Number(sponsor.active)) {
      results.push({
        campaignId: sponsor.campaign_id,
        sponsor: sponsor.sponsor_name,
        status: sponsor.initial_status || "excluded",
        repliedAt: null,
      });
      continue;
    }
    if (!access.ok) {
      results.push({
        campaignId: sponsor.campaign_id,
        sponsor: sponsor.sponsor_name,
        status: "unavailable",
        repliedAt: null,
      });
      continue;
    }
    const messages = await gmailMessagesForSponsor(access.accessToken, sponsor);
    const status = messages.ok
      ? sponsorReplyStatusFromMessages(messages.messages, sponsor.recipient_email, sponsor.sent_at)
      : { status: "unavailable", repliedAt: null };
    results.push({
      campaignId: sponsor.campaign_id,
      sponsor: sponsor.sponsor_name,
      ...status,
    });
  }
  return {
    ready: access.ok,
    status: access.ok ? "ready" : access.code,
    campaigns: results,
    counts: results.reduce((counts, item) => ({
      ...counts,
      [item.status]: integer(counts[item.status]) + 1,
    }), {}),
  };
}

export function canonicalGrowthMetrics(snapshot) {
  const campaigns = Array.isArray(snapshot?.sponsorReplies?.campaigns) ? snapshot.sponsorReplies.campaigns : [];
  return {
    searchConsole: {
      impressions: integer(snapshot?.searchConsole?.impressions),
      clicks: integer(snapshot?.searchConsole?.clicks),
    },
    genuineLeads: integer(snapshot?.genuineLeads?.total),
    paypalCheckouts: integer(snapshot?.paypal?.paidCheckouts),
    settledRevenueCents: integer(snapshot?.paypal?.settledRevenueCents),
    sponsorRepliedCampaigns: campaigns
      .filter((campaign) => campaign.status === "replied")
      .map((campaign) => cleanText(campaign.campaignId, 120))
      .sort(),
    sponsorBouncedCampaigns: campaigns
      .filter((campaign) => campaign.status === "bounced")
      .map((campaign) => cleanText(campaign.campaignId, 120))
      .sort(),
  };
}

export function changedGrowthMetricFields(previousMetrics, currentMetrics, previousQuality = {}, currentQuality = {}) {
  if (!previousMetrics) return [];
  const fields = [];
  if (Number(previousMetrics.genuineLeads || 0) !== Number(currentMetrics.genuineLeads || 0)) fields.push("genuineLeads");
  for (const field of ["paypalCheckouts", "settledRevenueCents"]) {
    if (!previousQuality.paypalLiveMode || !currentQuality.paypalLiveMode) continue;
    if (Number(previousMetrics[field] || 0) !== Number(currentMetrics[field] || 0)) fields.push(field);
  }
  for (const field of ["impressions", "clicks"]) {
    if (!previousQuality.searchConsoleReady || !currentQuality.searchConsoleReady) continue;
    if (Number(previousMetrics.searchConsole?.[field] || 0) !== Number(currentMetrics.searchConsole?.[field] || 0)) {
      fields.push(`searchConsole.${field}`);
    }
  }
  for (const field of ["sponsorRepliedCampaigns", "sponsorBouncedCampaigns"]) {
    if (JSON.stringify(previousMetrics[field] || []) !== JSON.stringify(currentMetrics[field] || [])) fields.push(field);
  }
  return fields;
}

async function sha256(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(value || "")));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function parseJson(value, fallback) {
  try {
    return JSON.parse(String(value || ""));
  } catch {
    return fallback;
  }
}

function snapshotFromRow(row) {
  if (!row) return null;
  return {
    dayKey: row.day_key,
    capturedAt: row.captured_at,
    trigger: row.trigger,
    metrics: parseJson(row.metric_json, {}),
    sponsorReplies: parseJson(row.sponsor_status_json, {}),
    dataQuality: parseJson(row.data_quality_json, {}),
    changedFields: parseJson(row.changed_fields_json, []),
    fingerprint: row.fingerprint,
    alertStatus: row.alert_status,
    alertUpdatedAt: row.alert_updated_at || null,
  };
}

function growthAlertMessage(current, previous) {
  const currentMetrics = current.metrics;
  const previousMetrics = previous?.metrics || {};
  const delta = (field, nested = null) => {
    const currentValue = nested ? Number(currentMetrics[nested]?.[field] || 0) : Number(currentMetrics[field] || 0);
    const previousValue = nested ? Number(previousMetrics[nested]?.[field] || 0) : Number(previousMetrics[field] || 0);
    const difference = currentValue - previousValue;
    return `${currentValue} (${difference >= 0 ? "+" : ""}${difference})`;
  };
  const replied = Array.isArray(currentMetrics.sponsorRepliedCampaigns) ? currentMetrics.sponsorRepliedCampaigns.length : 0;
  const previousReplied = Array.isArray(previousMetrics.sponsorRepliedCampaigns) ? previousMetrics.sponsorRepliedCampaigns.length : 0;
  const rows = [
    ["Search impressions", delta("impressions", "searchConsole")],
    ["Search clicks", delta("clicks", "searchConsole")],
    ["Genuine leads", delta("genuineLeads")],
    ["PayPal checkouts", delta("paypalCheckouts")],
    ["Settled revenue", `$${(Number(currentMetrics.settledRevenueCents || 0) / 100).toFixed(2)} (${((Number(currentMetrics.settledRevenueCents || 0) - Number(previousMetrics.settledRevenueCents || 0)) / 100).toLocaleString("en-US", { style: "currency", currency: "USD", signDisplay: "always" })})`],
    ["Sponsor replies", `${replied} (${replied - previousReplied >= 0 ? "+" : ""}${replied - previousReplied})`],
  ];
  const text = [
    `GPTMarketPlus growth metrics changed on ${current.dayKey}.`,
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    `Changed fields: ${current.changedFields.join(", ")}`,
    "QA, internal, synthetic, and test records are excluded.",
  ].join("\n");
  const html = `<h1>GPTMarketPlus growth changed</h1>
    <p>Verified metrics changed on ${escapeHtml(current.dayKey)}.</p>
    <table>${rows.map(([label, value]) => `<tr><th align="left">${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`).join("")}</table>
    <p><strong>Changed fields:</strong> ${escapeHtml(current.changedFields.join(", "))}</p>
    <p>QA, internal, synthetic, and test records are excluded.</p>`;
  return { subject: `GPTMarketPlus growth changed — ${current.dayKey}`, text, html };
}

async function updateAlertStatus(env, dayKey, status) {
  await env.GMP_DB.prepare(`UPDATE growth_snapshots
    SET alert_status = ?, alert_updated_at = ? WHERE day_key = ?`).bind(
    status,
    new Date().toISOString(),
    dayKey,
  ).run();
}

async function deliverGrowthAlert(env, current, previous) {
  const message = growthAlertMessage(current, previous);
  const result = await sendOwnerTransactionalEmail(env, message.subject, message.text, message.html);
  const status = result.delivered ? "delivered" : `failed:${cleanText(result.code || "unknown", 80)}`;
  await updateAlertStatus(env, current.dayKey, status);
  return { delivered: Boolean(result.delivered), provider: result.provider, status };
}

async function latestSnapshotRows(env, limit = 2) {
  return d1All(env, `SELECT day_key, captured_at, trigger, metric_json, sponsor_status_json,
      data_quality_json, changed_fields_json, fingerprint, alert_status, alert_updated_at
    FROM growth_snapshots ORDER BY captured_at DESC LIMIT ?`, [Math.max(1, Math.min(SNAPSHOT_HISTORY_LIMIT, integer(limit) || 1))]);
}

export async function runDailyGrowthSnapshot(env, { trigger = "scheduler", force = false } = {}) {
  if (!env.GMP_DB) return { ok: false, status: "storage_unavailable" };
  const timeZone = cleanText(env.GROWTH_SNAPSHOT_TIME_ZONE || SNAPSHOT_TIME_ZONE, 80) || SNAPSHOT_TIME_ZONE;
  const dayKey = dayKeyInTimeZone(new Date(), timeZone);
  const existing = snapshotFromRow(await d1First(env, `SELECT day_key, captured_at, trigger, metric_json, sponsor_status_json,
      data_quality_json, changed_fields_json, fingerprint, alert_status, alert_updated_at
    FROM growth_snapshots WHERE day_key = ?`, [dayKey]));
  const priorRows = await latestSnapshotRows(env, 3);
  const previous = priorRows.map(snapshotFromRow).find((row) => row.dayKey !== dayKey) || null;

  if (existing && !force) {
    if (String(existing.alertStatus || "").startsWith("failed:") && existing.changedFields.length && previous) {
      const alert = await deliverGrowthAlert(env, existing, previous);
      return { ok: alert.delivered, skipped: true, reason: "alert_retry", snapshot: { ...existing, alertStatus: alert.status }, alert };
    }
    return { ok: true, skipped: true, reason: "already_captured_today", snapshot: existing };
  }

  const [searchConsole, genuineLeads, paypal, sponsorReplies] = await Promise.all([
    googleSearchConsoleStatus(env, { force: true }),
    genuineLeadCounts(env),
    settledPaypalMetrics(env),
    sponsorReplyStatuses(env),
  ]);
  const capturedAt = new Date().toISOString();
  const rawSnapshot = {
    searchConsole: {
      startDate: searchConsole.searchAnalytics?.startDate || null,
      endDate: searchConsole.searchAnalytics?.endDate || null,
      impressions: integer(searchConsole.searchAnalytics?.impressions),
      clicks: integer(searchConsole.searchAnalytics?.clicks),
    },
    genuineLeads,
    paypal,
    sponsorReplies,
  };
  const metrics = canonicalGrowthMetrics(rawSnapshot);
  const fingerprint = await sha256(JSON.stringify(metrics));
  const dataQuality = {
    searchConsoleReady: searchConsole.status === "ready",
    sponsorRepliesReady: sponsorReplies.ready,
    paypalLiveMode: paypal.liveMode,
    exclusions: ["qa", "internal", "synthetic_email", "test_record", "sandbox_payment"],
  };
  const changedFields = changedGrowthMetricFields(
    previous?.metrics || null,
    metrics,
    previous?.dataQuality || {},
    dataQuality,
  );
  const alertStatus = previous && changedFields.length ? "pending" : "not_required";

  await env.GMP_DB.prepare(`INSERT INTO growth_snapshots
    (day_key, captured_at, trigger, metric_json, sponsor_status_json, data_quality_json,
     changed_fields_json, fingerprint, alert_status, alert_updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)
    ON CONFLICT(day_key) DO UPDATE SET
      captured_at=excluded.captured_at,
      trigger=excluded.trigger,
      metric_json=excluded.metric_json,
      sponsor_status_json=excluded.sponsor_status_json,
      data_quality_json=excluded.data_quality_json,
      changed_fields_json=excluded.changed_fields_json,
      fingerprint=excluded.fingerprint,
      alert_status=excluded.alert_status,
      alert_updated_at=NULL`).bind(
    dayKey,
    capturedAt,
    cleanText(trigger, 80),
    JSON.stringify(metrics),
    JSON.stringify(sponsorReplies),
    JSON.stringify(dataQuality),
    JSON.stringify(changedFields),
    fingerprint,
    alertStatus,
  ).run();

  const snapshot = {
    dayKey,
    capturedAt,
    trigger: cleanText(trigger, 80),
    metrics,
    sponsorReplies,
    dataQuality,
    changedFields,
    fingerprint,
    alertStatus,
    alertUpdatedAt: null,
  };
  if (!previous || !changedFields.length) {
    return { ok: true, skipped: false, baseline: !previous, snapshot, alert: { delivered: false, status: "not_required" } };
  }
  const alert = await deliverGrowthAlert(env, snapshot, previous);
  return { ok: true, skipped: false, snapshot: { ...snapshot, alertStatus: alert.status }, alert };
}

export async function growthSnapshotStatus(env, limit = 14) {
  if (!env.GMP_DB) return { ok: false, status: "storage_unavailable", snapshots: [] };
  const snapshots = (await latestSnapshotRows(env, limit)).map(snapshotFromRow);
  return {
    ok: true,
    status: snapshots.length ? "ready" : "awaiting_first_snapshot",
    schedule: "daily-via-durable-object-alarm",
    timeZone: cleanText(env.GROWTH_SNAPSHOT_TIME_ZONE || SNAPSHOT_TIME_ZONE, 80) || SNAPSHOT_TIME_ZONE,
    latest: snapshots[0] || null,
    snapshots,
  };
}
