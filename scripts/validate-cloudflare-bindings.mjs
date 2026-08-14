import { readFileSync } from "node:fs";
import {
  classifyLeadRecord,
  handleAgentIdSiteRequest,
  notifyQueuedSalesReadyLeads,
  sendQueuedCustomerFollowups,
  sendCustomerTransactionalEmail,
  sendOwnerTransactionalEmail,
} from "../src/agentid-site.js";
import {
  googlePropertyCandidates,
  summarizeGoogleIndexInspection,
  summarizeGoogleSearchAnalytics,
  summarizeGoogleSearchIntents,
  summarizeGoogleSearchPages,
} from "../src/google-search-console.js";
import {
  canonicalGrowthMetrics,
  changedGrowthMetricFields,
  sponsorReplyStatusFromMessages,
} from "../src/growth-snapshot.js";
import { tagAssistantDebugResponse } from "../src/response-security.js";
import { normalizePaypalInvoiceId, summarizePaypalInvoice } from "../src/paypal-invoice.js";

const raw = readFileSync(new URL("../wrangler.jsonc", import.meta.url), "utf8");
const runtimeMigration = readFileSync(new URL("../migrations/0004_agent_runtime.sql", import.meta.url), "utf8");
const genericLeadNotificationMigration = readFileSync(new URL("../migrations/0008_generic_lead_notifications.sql", import.meta.url), "utf8");
const growthSnapshotMigration = readFileSync(new URL("../migrations/0009_daily_growth_snapshots.sql", import.meta.url), "utf8");
const workerSource = readFileSync(new URL("../src/index.js", import.meta.url), "utf8");
const siteSource = readFileSync(new URL("../src/agentid-site.js", import.meta.url), "utf8");
const searchConsoleSource = readFileSync(new URL("../src/google-search-console.js", import.meta.url), "utf8");
const failures = [];

if (typeof sendQueuedCustomerFollowups !== "function") {
  failures.push("customer follow-up sender must be exported for the scheduler");
}

if (!growthSnapshotMigration.includes("CREATE TABLE IF NOT EXISTS growth_snapshots")
    || !growthSnapshotMigration.includes("CREATE TABLE IF NOT EXISTS growth_sponsor_threads")
    || !growthSnapshotMigration.includes("founding_sponsor_withconnect")
    || !growthSnapshotMigration.includes("'bounced', 0")) {
  failures.push("daily growth snapshot migration must persist snapshots and exclude the known bounced sponsor thread");
}

if (!workerSource.includes('runDailyGrowthSnapshot(scopedEnv, {')
    || !workerSource.includes('url.pathname === "/api/agents/growth-snapshot"')
    || !workerSource.includes('growthSnapshotVersion !== GROWTH_SNAPSHOT_VERSION')
    || !workerSource.includes('"growthSnapshotBootstrapPending"')
    || !workerSource.includes('"https://www.googleapis.com/auth/gmail.readonly"')) {
  failures.push("the Durable Object bootstrap alarm, private status route, and Gmail read-only scope must support daily growth snapshots");
}

const unavailableSponsorBaseline = canonicalGrowthMetrics({
  searchConsole: { impressions: 10, clicks: 1 },
  genuineLeads: { total: 2 },
  paypal: { paidCheckouts: 1, settledRevenueCents: 2900 },
  sponsorReplies: {
    campaigns: [
      { campaignId: "campaign_a", status: "unavailable" },
      { campaignId: "campaign_b", status: "bounced" },
    ],
  },
});
const readySponsorBaseline = canonicalGrowthMetrics({
  searchConsole: { impressions: 10, clicks: 1 },
  genuineLeads: { total: 2 },
  paypal: { paidCheckouts: 1, settledRevenueCents: 2900 },
  sponsorReplies: {
    campaigns: [
      { campaignId: "campaign_a", status: "no_reply" },
      { campaignId: "campaign_b", status: "bounced" },
    ],
  },
});
const readyDataQuality = { searchConsoleReady: true, paypalLiveMode: true };
if (changedGrowthMetricFields(unavailableSponsorBaseline, readySponsorBaseline, readyDataQuality, readyDataQuality).length !== 0) {
  failures.push("Gmail readiness alone must not trigger a growth alert");
}
const repliedSponsorMetrics = canonicalGrowthMetrics({
  searchConsole: { impressions: 10, clicks: 1 },
  genuineLeads: { total: 2 },
  paypal: { paidCheckouts: 1, settledRevenueCents: 2900 },
  sponsorReplies: {
    campaigns: [
      { campaignId: "campaign_a", status: "replied" },
      { campaignId: "campaign_b", status: "bounced" },
    ],
  },
});
if (!changedGrowthMetricFields(readySponsorBaseline, repliedSponsorMetrics, readyDataQuality, readyDataQuality).includes("sponsorRepliedCampaigns")) {
  failures.push("a genuine sponsor reply must trigger a growth alert");
}
const restoredProviderMetrics = canonicalGrowthMetrics({
  searchConsole: { impressions: 25, clicks: 2 },
  genuineLeads: { total: 2 },
  paypal: { paidCheckouts: 1, settledRevenueCents: 2900 },
  sponsorReplies: { campaigns: [] },
});
if (changedGrowthMetricFields(
  canonicalGrowthMetrics({ searchConsole: {}, genuineLeads: { total: 2 }, paypal: { paidCheckouts: 1, settledRevenueCents: 2900 }, sponsorReplies: { campaigns: [] } }),
  restoredProviderMetrics,
  { searchConsoleReady: false, paypalLiveMode: true },
  readyDataQuality,
).some((field) => field.startsWith("searchConsole."))) {
  failures.push("Search Console recovery must not be reported as a real growth change");
}
const replyFixture = sponsorReplyStatusFromMessages([
  {
    internalDate: String(Date.parse("2026-08-15T12:00:00Z")),
    labelIds: ["INBOX"],
    payload: { headers: [{ name: "From", value: "Partner <partner@example.biz>" }] },
  },
], "partner@example.biz", "2026-08-07T05:00:00Z");
if (replyFixture.status !== "replied" || replyFixture.repliedAt !== "2026-08-15T12:00:00.000Z") {
  failures.push("sponsor reply status must detect an inbound post-send Gmail message without reading its body");
}

function cspDirectiveSources(source, directiveName) {
  const cspMatch = source.match(/"content-security-policy"\s*:\s*"([^"\r\n]*)"/i);
  if (!cspMatch) return [];

  const normalizedDirectiveName = String(directiveName || "").trim().toLowerCase();
  const directive = cspMatch[1]
    .split(";")
    .map((value) => value.trim())
    .find((value) => value.split(/\s+/, 1)[0]?.toLowerCase() === normalizedDirectiveName);

  return directive ? directive.split(/\s+/).slice(1) : [];
}

function hasExactCspSource(source, directiveName, expectedSource) {
  return cspDirectiveSources(source, directiveName)
    .some((candidate) => candidate === expectedSource);
}

if (/stripe/i.test(`${workerSource}\n${siteSource}\n${raw}`)) {
  failures.push("runtime source and Worker configuration must remain PayPal-only");
}
if (!workerSource.includes('return handlePaypalOrderCreate(request, env);')
    || !workerSource.includes('body.productId || body.packageId || body.buildId')) {
  failures.push("one-time product, deposit, and software-build checkout must route through PayPal Orders");
}
if (!workerSource.includes('return handlePaypalSubscriptionCheckout(request, env);')) {
  failures.push("eligible recurring checkout must route through PayPal subscriptions");
}
if (!workerSource.includes('const recovery = await paypalApiRequest(env, `/v2/checkout/orders/${encodeURIComponent(orderId)}`)')) {
  failures.push("PayPal capture must recover a completed order when the initial response is lost");
}
if (!workerSource.includes('payload.type === "paypal_purchase_fulfillment"')
    || !workerSource.includes('await fulfillPaypalPurchaseEmail(env, payload.payload?.orderId)')) {
  failures.push("failed PayPal customer delivery must use the retryable fulfillment queue");
}
if (!workerSource.includes('order?.emailDelivery?.delivered || !order.payerEmail')) {
  failures.push("PayPal customer email retries must remain idempotent after a successful delivery");
}
for (const requiredPaypalRecoveryControl of [
  'id="paypal-fallback" hidden',
  'id="paypal-delivery-link"',
  'intent=paypal-delivery&amp;source=paypal-complete',
  'const deliveryUrl = new URL(result.deliveryUrl, location.origin)',
  'if (!result.emailSent)',
]) {
  if (!workerSource.includes(requiredPaypalRecoveryControl)) {
    failures.push(`PayPal completion recovery is missing ${requiredPaypalRecoveryControl}`);
  }
}
for (const requiredCustomerFollowupControl of [
  "sendQueuedCustomerFollowups",
  "FROM agentid_followups f",
  "f.consent_required = 0 OR l.marketing_consent = 1",
  "status = 'sending'",
  "send_after_hours",
  "const customerFollowups = await sendQueuedCustomerFollowups(env)",
  "sendQueuedCustomerFollowups(env, { limit: 1, leadId: saved.id })",
  "const leadFilter = leadId ? \"AND f.lead_id = ?\" : \"\"",
]) {
  if (!`${workerSource}\n${siteSource}`.includes(requiredCustomerFollowupControl)) {
    failures.push(`customer follow-up delivery is missing ${requiredCustomerFollowupControl}`);
  }
}
if (siteSource.includes('data-endpoint="/api/checkout"') || siteSource.includes("Pay by card")) {
  failures.push("public product pages must not expose a non-PayPal checkout path");
}
for (const requiredChatCtaControl of [
  'href="/ai-agent-launch-kit?source=chat"',
  'data-track-event="product_view"',
  'Chat Strategy Call CTA',
]) {
  if (!siteSource.includes(requiredChatCtaControl)) {
    failures.push(`chat conversion path is missing ${requiredChatCtaControl}`);
  }
}
for (const requiredBookingHonestyControl of [
  "const hasDirectBooking = Boolean(calendarEmbedUrl(env) || bookingUrl(env))",
  "Request My Free AI Strategy Call",
  "const bookingHeading = hasDirectBooking",
  "href=\"/book-a-consultation?package=${encodeURIComponent(tier.id)}&amp;source=pricing-custom\"",
  "const requestedTier = PRICING_TIERS.find((tier) => tier.id === requestedPackageId)",
  "requested_package:${cleanText(body.requestedPackageId, 80)}",
  "before any custom-service payment is requested",
]) {
  if (!siteSource.includes(requiredBookingHonestyControl)) {
    failures.push(`booking path honesty is missing ${requiredBookingHonestyControl}`);
  }
}
for (const requiredConfirmationControl of [
  "nextStep: isSponsorApplication",
  "campaign: \"agentid_contact_confirmation\"",
  "campaign: \"agentid_consultation_confirmation\"",
  "This request does not book a meeting automatically",
  "This form does not book a meeting automatically",
  "nextUrl.origin === location.origin",
]) {
  if (!siteSource.includes(requiredConfirmationControl)) {
    failures.push(`lead confirmation recovery is missing ${requiredConfirmationControl}`);
  }
}

if (!/"durable_objects"\s*:\s*\{[\s\S]{0,220}?"name"\s*:\s*"AGENT_SCHEDULER"[\s\S]{0,120}?"class_name"\s*:\s*"AgentScheduler"/.test(raw)) {
  failures.push("AGENT_SCHEDULER Durable Object binding is missing");
}

if (!/"exports"\s*:\s*\{[\s\S]{0,180}?"AgentScheduler"\s*:\s*\{[\s\S]{0,120}?"type"\s*:\s*"durable-object"[\s\S]{0,80}?"storage"\s*:\s*"sqlite"/.test(raw)) {
  failures.push("AgentScheduler must be declared as a SQLite Durable Object export");
}

if (/"triggers"\s*:\s*\{[\s\S]{0,160}?"crons"/.test(raw)) {
  failures.push("AgentID must use its Durable Object alarm instead of consuming an account Cron Trigger");
}

const dbBinding = raw.match(/"binding"\s*:\s*"GMP_DB"[\s\S]{0,300}?"database_id"\s*:\s*"([^"]+)"/);
if (!dbBinding) {
  failures.push("GMP_DB must include database_id in wrangler.jsonc");
} else if (!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(dbBinding[1]) || /placeholder|00000000/i.test(dbBinding[1])) {
  failures.push("GMP_DB database_id is not a provisioned UUID");
}

if (!/"binding"\s*:\s*"GMP_QUEUE"[\s\S]{0,160}?"queue"\s*:\s*"agentid-services-events"/.test(raw)) {
  failures.push("GMP_QUEUE producer binding is missing or targets the wrong queue");
}

const cspSubstringAttackFixtures = [
  '"content-security-policy": "connect-src \'self\' https://track.hubspot.com.attacker.example"',
  '"content-security-policy": "connect-src \'self\' https://attacker.example/https://track.hubspot.com"',
];
if (cspSubstringAttackFixtures.some((fixture) => (
  hasExactCspSource(fixture, "connect-src", "https://track.hubspot.com")
))) {
  failures.push("CSP source validation must reject hosts that only contain a trusted URL substring");
}

if (![workerSource, siteSource].every((source) => (
  hasExactCspSource(source, "connect-src", "https://track.hubspot.com")
))) {
  failures.push("Worker CSP must permit the configured HubSpot Zaraz tracking endpoint");
}

const requiredGoogleConnectSources = [
  "https://analytics.google.com",
  "https://*.google-analytics.com",
  "https://www.google.com",
];
if (![workerSource, siteSource].every((source) => (
  requiredGoogleConnectSources.every((expectedSource) => (
    hasExactCspSource(source, "connect-src", expectedSource)
  ))
))) {
  failures.push("Worker CSP must permit Google measurement requests emitted by the configured Google tag");
}

if (![workerSource, siteSource].every((source) => (
  hasExactCspSource(source, "script-src", "https://www.googletagmanager.com")
))) {
  failures.push("Worker CSP must permit the Google Tag Assistant debug bootstrap");
}

const requiredGoogleDebugStyleSources = [
  "https://www.googletagmanager.com",
  "https://fonts.googleapis.com",
];
if (![workerSource, siteSource].every((source) => (
  requiredGoogleDebugStyleSources.every((expectedSource) => (
    hasExactCspSource(source, "style-src", expectedSource)
  ))
  && hasExactCspSource(source, "font-src", "https://fonts.gstatic.com")
))) {
  failures.push("Worker CSP must permit Google Tag Assistant debug styles and fonts");
}

const normalTagResponse = tagAssistantDebugResponse(
  new Request("https://gptmarketplus.com/"),
  new Response("<!doctype html>", {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cross-origin-opener-policy": "same-origin-allow-popups",
    },
  }),
);
if (normalTagResponse.headers.get("cross-origin-opener-policy") !== "same-origin-allow-popups") {
  failures.push("Normal pages must retain the configured cross-origin opener policy");
}

const debugTagResponse = tagAssistantDebugResponse(
  new Request("https://gptmarketplus.com/?gtm_debug=regression"),
  new Response("<!doctype html>", {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cross-origin-opener-policy": "same-origin-allow-popups",
    },
  }),
);
if (
  debugTagResponse.headers.get("cross-origin-opener-policy") !== "unsafe-none"
  || debugTagResponse.headers.get("cache-control") !== "private, no-store"
) {
  failures.push("Tag Assistant debug pages must preserve their opener without entering the public cache");
}

if (
  !workerSource.includes('String(result.hostname || "").toLowerCase() === expectedHostname')
  || !siteSource.includes('String(result.hostname || "").toLowerCase() === expectedHostname')
) {
  failures.push("Every Turnstile verifier must bind successful tokens to the request-scoped production hostname");
}

if (!siteSource.includes('businessName: "organization"') || !siteSource.includes('email: "email"')) {
  failures.push("Lead forms must provide autocomplete metadata for identity and organization fields");
}

if (!/"consumers"[\s\S]{0,220}?"queue"\s*:\s*"agentid-services-events"/.test(raw)) {
  failures.push("agentid-services-events consumer binding is missing");
}

if (!/"queue"\s*:\s*"agentid-services-events"[\s\S]{0,220}?"dead_letter_queue"\s*:\s*"agentid-services-events-dlq"/.test(raw)) {
  failures.push("agentid-services-events consumer must route exhausted retries to agentid-services-events-dlq");
}

if (!/"binding"\s*:\s*"GMP_ASSETS"[\s\S]{0,160}?"bucket_name"\s*:\s*"gptmarketplus-assets"/.test(raw)) {
  failures.push("GMP_ASSETS R2 binding is missing or targets the wrong bucket");
}

if (!/"binding"\s*:\s*"AGENTID_AI_SEARCH"[\s\S]{0,180}?"instance_name"\s*:\s*"agentid-services-search"/.test(raw)) {
  failures.push("AGENTID_AI_SEARCH binding is missing or targets the wrong instance");
}

if (!/"binding"\s*:\s*"ANALYTICS_ENGINE"[\s\S]{0,180}?"dataset"\s*:\s*"agentid_services_events"/.test(raw)) {
  failures.push("ANALYTICS_ENGINE binding is missing or targets the wrong dataset");
}

if (!/"send_email"\s*:\s*\[[\s\S]{0,260}?"name"\s*:\s*"TRANSACTIONAL_EMAIL"[\s\S]{0,180}?"destination_address"\s*:\s*"nrk8286@gmail\.com"[\s\S]{0,180}?"allowed_sender_addresses"\s*:\s*\[[\s\S]{0,80}?"admin@gptmarketplus\.com"/.test(raw)) {
  failures.push("TRANSACTIONAL_EMAIL must be restricted to the verified owner destination and admin@gptmarketplus.com sender");
}

if (!/"OWNER_NOTIFICATION_EMAIL"\s*:\s*"nrk8286@gmail\.com"/.test(raw)) {
  failures.push("OWNER_NOTIFICATION_EMAIL must match the verified Cloudflare Email Routing destination");
}

for (const requiredGenericLeadControl of [
  'name="contactConsent" type="checkbox" value="1" required',
  'error: "Contact consent is required."',
  "notifyOwnerOfGenericLead(env, lead)",
  "sendOwnerTransactionalEmail(",
  '"owner_notified"',
  "notification_status = ?, notification_updated_at = ?",
  "conversionEligible: !classification.excluded",
  "result.conversionEligible !== false",
]) {
  if (!workerSource.includes(requiredGenericLeadControl)) {
    failures.push(`generic lead owner handoff is missing ${requiredGenericLeadControl}`);
  }
}
for (const requiredGenericLeadColumn of ["contact_consent", "notification_status", "notification_updated_at"]) {
  if (!genericLeadNotificationMigration.includes(requiredGenericLeadColumn)) {
    failures.push(`generic lead notification migration is missing ${requiredGenericLeadColumn}`);
  }
}
for (const requiredTestLeadControl of [
  'crm_stage: classification.excluded ? "test_record"',
  'lead_status: effectiveLeadTag',
  'follow_up_status: classification.excluded ? "excluded_test" : "queued"',
  'event_name: classification.excluded ? "test_submission"',
  'crm_stage <> \'test_record\'',
]) {
  if (!siteSource.includes(requiredTestLeadControl)) {
    failures.push(`test lead exclusion is missing ${requiredTestLeadControl}`);
  }
}

if (!/"GMAIL_SENDER_EMAIL"\s*:\s*"nrk8286@gmail\.com"/.test(raw)) {
  failures.push("GMAIL_SENDER_EMAIL must identify the account authorized by the Gmail OAuth adapter");
}

if (
  !workerSource.includes("deliverAndRecordPaypalCustomerEmail(env, paidOrder)")
  || !workerSource.includes("emailSent: Boolean(fulfilledOrder.emailDelivery?.delivered)")
) {
  failures.push("completed PayPal orders must invoke and report the customer transactional-email adapter");
}

for (const requiredLeadHandoffControl of [
  "notifyOwnerOfLead(env, saved)",
  "notifyOwnerOfLead(env, savedLead)",
  "saved.booked_call || saved.quote_requested || saved.purchase_intent",
  "savedLead.booked_call || savedLead.quote_requested || savedLead.purchase_intent",
  "follow_up_status = ?, updated_at = ?",
  '"owner_notified"',
  '"New strategy call request from GPTMarketPlus"',
  '"New quote request from GPTMarketPlus"',
  '"New purchase inquiry from GPTMarketPlus"',
]) {
  if (!siteSource.includes(requiredLeadHandoffControl)) {
    failures.push(`sales-ready lead handoff is missing ${requiredLeadHandoffControl}`);
  }
}

if (!/"name"\s*:\s*"FORM_RATE_LIMITER"[\s\S]{0,180}?"limit"\s*:\s*5[\s\S]{0,80}?"period"\s*:\s*60/.test(raw)) {
  failures.push("FORM_RATE_LIMITER native binding is missing or has the wrong limit");
}

if (!/"name"\s*:\s*"EVENT_RATE_LIMITER"[\s\S]{0,180}?"limit"\s*:\s*60[\s\S]{0,80}?"period"\s*:\s*60/.test(raw)) {
  failures.push("EVENT_RATE_LIMITER native binding is missing or has the wrong limit");
}

const routePatterns = [...raw.matchAll(/"pattern"\s*:\s*"([^"]+)"/g)].map((match) => match[1]);
for (const requiredPattern of [
  "gptmarketplus.com",
  "www.gptmarketplus.com",
  "agentid.life",
  "www.agentid.life",
  "agentid.solutions",
  "www.agentid.solutions",
  "agentid.website",
  "www.agentid.website",
  "agentid.world",
  "www.agentid.world",
  "agentid.services/*",
  "www.agentid.services/*",
]) {
  if (!routePatterns.includes(requiredPattern)) failures.push(`missing production route: ${requiredPattern}`);
}
for (const [hostname, targetPath] of [
  ["agentid.life", "/use-cases"],
  ["agentid.solutions", "/services"],
  ["agentid.website", "/ai-agents"],
  ["agentid.world", "/resources"],
]) {
  if (!workerSource.includes(`["${hostname}", "${targetPath}"]`)) {
    failures.push(`${hostname} must retain its campaign redirect to ${targetPath}`);
  }
}
if (!workerSource.includes('url.searchParams.set("utm_medium", "domain_redirect")')) {
  failures.push("campaign domains must retain first-party redirect attribution");
}
if (!workerSource.includes("LEGACY_WEBHOOK_HOSTS.has(requestHost) && LEGACY_WEBHOOK_PATHS.has(url.pathname)")) {
  failures.push("campaign domains must not inherit legacy payment-webhook routing");
}
if (!workerSource.includes('url.hostname = isAgentIdServicesHost ? "agentid.services" : CANONICAL_HOST')) {
  failures.push("agentid.services must remain on its own canonical host instead of redirecting to GPTMarketPlus");
}
if (!workerSource.includes('SITE_URL: "https://agentid.services"') || !workerSource.includes('ADSENSE_ENABLED: "false"')) {
  failures.push("agentid.services must receive a host-scoped brand and disabled AdSense configuration");
}
if (!/"SITE_URL"\s*:\s*"https:\/\/gptmarketplus\.com"/.test(raw)) failures.push("SITE_URL must use the .com canonical origin");
if (!/"STORAGE_SCOPE"\s*:\s*"agentid\.services"/.test(raw)) failures.push("STORAGE_SCOPE must preserve the existing production data namespace during migration");
if (!/function indexNowEnabled\(env\) \{[\s\S]{0,180}?new URL\(siteUrl\(env\)\)\.protocol === "https:"/.test(workerSource)) {
  failures.push("IndexNow must support the canonical HTTPS host instead of requiring the legacy agentid.services hostname");
}
if (/function indexNowEnabled\(env\) \{[\s\S]{0,120}?isAgentIdSite\(env\)/.test(workerSource)) {
  failures.push("IndexNow must not be restricted to the legacy agentid.services hostname");
}
if (!workerSource.includes('/contact?intent=sponsor&amp;package=${encodeURIComponent(item.id)}')) {
  failures.push("Sponsor review buttons must route to a package-specific application instead of looping back to /sponsor");
}
if (!siteSource.includes('trackEvent: isSponsorApplication ? "sponsor_application_submit" : "contact_submit"')) {
  failures.push("Sponsor applications must be recorded as a distinct conversion event");
}
if (!siteSource.includes("approved placements receive a PayPal invoice only after written terms are accepted")) {
  failures.push("Sponsor applications must disclose the review-before-PayPal-invoice workflow");
}
if (!siteSource.includes('rel="sponsored nofollow noopener"') || !siteSource.includes('window.agentidTrackEvent("sponsor_impression"')) {
  failures.push("Active sponsor placements must be clearly labeled and track viewable impressions without invalid clicks");
}
if (!workerSource.includes('record("sponsor_impression", { viewability_threshold: 0.5 })') || !workerSource.includes('data-sponsor-click=')) {
  failures.push("Worker buyer-intent pages must measure viewable sponsor impressions and real outbound clicks");
}
if (!workerSource.includes('showSponsorRail || activeSponsorPlacement(env) ? renderActiveSponsorInventory(env) : ""') || !workerSource.includes("renderActiveSponsorTrackingScript(env)")) {
  failures.push("Active sponsor inventory must render on buyer-intent pages with its measurement script");
}
for (const requiredSponsorTerm of [
  "$2.00 is earned only for each server-validated outbound click",
  "Impressions, known bots, off-site or missing-referrer requests, and repeat visitors within 24 hours do not consume credit",
  "Unused CPC funding remains unearned and is eligible for a written extension or refund of the undelivered balance",
  "A PayPal refund event immediately stops CPC delivery",
  "No traffic, lead, sale, ranking, or exclusivity guarantee is made",
]) {
  if (!workerSource.includes(requiredSponsorTerm)) failures.push(`Sponsor terms are missing: ${requiredSponsorTerm}`);
}
if (!workerSource.includes("30-day sponsor inventory requires approval")) {
  failures.push("Sponsor inventory must not describe fixed 30-day placements as monthly subscriptions");
}
if (!workerSource.includes('url.pathname === "/api/paypal/invoices/status"') || !workerSource.includes("paypalInvoiceStatus(env, url.searchParams.get(\"invoice_id\"))")) {
  failures.push("PayPal invoice settlement must have an administrator-only provider status route");
}
if (!workerSource.includes('url.pathname === "/api/agents/google-search-console"') || !workerSource.includes("googleSearchConsoleStatus(env)")) {
  failures.push("Google Search Console must have a privacy-safe public acquisition status route");
}
if (!workerSource.includes('url.pathname === "/api/agents/adsense"') || !workerSource.includes("adsensePublicStatus(env)")) {
  failures.push("AdSense must expose a public staged status that separates code installation from approval and settlement");
}
if (!/"ADSENSE_REVIEW_STATE"\s*:\s*"under_review"/.test(raw) || !/"ADSENSE_REVIEW_SUBMITTED_AT"\s*:\s*"2026-08-01T19:52:03\.000Z"/.test(raw)) {
  failures.push("AdSense provider-email review evidence must be recorded in production configuration");
}
for (const requiredAdSenseStage of ["accountApproved", "adsServingVerified", "validImpressionsVerified", "earningsVerified", "paymentSettled"]) {
  if (!workerSource.includes(requiredAdSenseStage)) failures.push(`AdSense staged status is missing ${requiredAdSenseStage}`);
}
if (!/"ACTIVE_SPONSOR_START_AT"\s*:\s*""[\s\S]{0,120}?"ACTIVE_SPONSOR_END_AT"\s*:\s*""/.test(raw)) {
  failures.push("Sponsor fulfillment must remain disabled by default and require an explicit bounded placement window");
}

if (!runtimeMigration.includes("CREATE TABLE IF NOT EXISTS agent_state") || !runtimeMigration.includes("CREATE TABLE IF NOT EXISTS agent_tasks")) {
  failures.push("0004_agent_runtime.sql must provision agent_state and agent_tasks");
}

if (/\b(?:d1SchemaPromise|schemaPromise)\b/.test(`${workerSource}\n${siteSource}`)) {
  failures.push("Worker source must not keep request-bound D1 promises in module scope");
}

if (!siteSource.includes('} else if (analyticsId.startsWith("G-")) {')) {
  failures.push("Google Analytics fallback must not load beside Google Tag Manager");
}
if (!workerSource.includes('if (!tagId && !analyticsId) return "";')) {
  failures.push("direct GA4 pages must still install the Google Ads conversion event helper");
}
if (!workerSource.includes('googleAdsConversionSendTo(env, "generate_lead")') || !workerSource.includes('googleAdsConversionSendTo(env, "purchase")')) {
  failures.push("lead and purchase events must use separate Google Ads conversion destinations");
}
if (!workerSource.includes('gtag("set", "linker", { domains: ${JSON.stringify(GOOGLE_CROSS_DOMAIN_HOSTS)} })')
    || !siteSource.includes('gtag("set", "linker", { domains: ${JSON.stringify(GOOGLE_CROSS_DOMAIN_HOSTS)} })')) {
  failures.push("Google measurement must link journeys across the owned production domains");
}
if ((workerSource.match(/purchase: paypalPurchaseMeasurementPayload\(/g) || []).length < 2) {
  failures.push("new and replayed completed PayPal captures must return the same GA4 purchase payload");
}
for (const eventName of ["view_item", "add_to_cart", "begin_checkout"]) {
  if (!siteSource.includes(`window.agentidTrackEvent("${eventName}"`)) {
    failures.push(`PayPal purchase journey must emit the GA4 ${eventName} ecommerce event`);
  }
}
if (!siteSource.includes('data-ecommerce-item-id=') || !siteSource.includes('items: [{')) {
  failures.push("PayPal purchase journey events must include consistent GA4 item data");
}
for (const requiredAnalyticsControl of [
  'window.agentidTrackEvent("engaged_visit"',
  'engagement_signal: "time_and_interaction"',
  "cta_location:",
  'trackEvent: "service_interest"',
  'trackEvent: "agent_interest"',
  'trackEvent: "use_case_interest"',
]) {
  if (!siteSource.includes(requiredAnalyticsControl)) {
    failures.push(`analytics-led conversion measurement is missing ${requiredAnalyticsControl}`);
  }
}

for (const requiredOutcomeControl of [
  'recommendedKeyEvents: ["generate_lead", "purchase"]',
  'eventsToUnmarkAsKeyEvents: ["conversion", "scroll_depth", "scroll", "chat_open", "checkout_click"]',
  'steps: ["session_start", "engaged_session", "form_start_or_view_item", "checkout_click", "begin_checkout_or_generate_lead", "purchase"]',
  'window.__agentidOutcomeEventSeen = function(eventName, properties)',
  'sessionStorage.setItem(storageKey, "1")',
  'capture_verified: true',
  'event_name: "purchase"',
  'provider_verified: true',
  'Verified purchase events are recorded by the server after payment capture.',
  'event: "google_ads_" + eventName',
  'event: "google_ads_purchase"',
]) {
  if (!`${workerSource}\n${siteSource}`.includes(requiredOutcomeControl)) {
    failures.push(`specific outcome measurement is missing ${requiredOutcomeControl}`);
  }
}
if (/dataLayer\.push\(Object\.assign\(\{\s*event: "conversion"/.test(`${workerSource}\n${siteSource}`)) {
  failures.push("generic conversion must not be pushed into the shared data layer");
}
for (const requiredInternalTrafficControl of [
  'source === "codex_release" && medium === "qa" ? "internal" : ""',
  'traffic_type: window.__agentidTrafficType || ""',
  "'$.traffic_type'",
]) {
  if (!`${workerSource}\n${siteSource}`.includes(requiredInternalTrafficControl)) {
    failures.push(`QA/internal traffic classification is missing ${requiredInternalTrafficControl}`);
  }
}
if (!siteSource.includes("AS hostname,") || !siteSource.includes("GROUP BY hostname, landing_page")) {
  failures.push("attribution report must break landing performance down by hostname and landing page");
}
for (const requiredLeadControl of [
  'eventName: "form_start"',
  'form.dataset.submissionId = form.dataset.submissionId || crypto.randomUUID()',
  'deduplicated: true',
  'lead_type: trackedEvent === "booking_submit" ? "consultation" : "contact_request"',
  'SUM(CASE WHEN event_name = \'generate_lead\' THEN 1 ELSE 0 END) AS lead_events',
  "SUM(CASE WHEN event_name = 'launch_kit_scenario_select' THEN 1 ELSE 0 END) AS launch_kit_scenario_selections",
  "launchKitScenarioSelections: Number(summaryRow?.launch_kit_scenario_selections || 0)",
]) {
  if (!siteSource.includes(requiredLeadControl)) {
    failures.push(`consultation measurement is missing ${requiredLeadControl}`);
  }
}

for (const requiredPurchaseControl of [
  'gtag("config", "${escapeJs(directTagId)}", { send_page_view: false })',
  "window.agentidTrackVerifiedPurchase = function(purchase)",
  'window.gtag("event", "purchase"',
  "transaction_id:",
  "items: [item]",
  'result.purchase',
  'purchaseConversionSendTo = googleAdsConversionSendTo(env, "purchase")',
]) {
  if (!workerSource.includes(requiredPurchaseControl)) {
    failures.push(`verified PayPal completion is missing ${requiredPurchaseControl}`);
  }
}
const purchaseTrackingMarker = 'if (typeof window.agentidTrackVerifiedPurchase === "function" && result.purchase)';
const emailFallbackMarker = 'if (!result.emailSent)';
if (workerSource.indexOf(purchaseTrackingMarker) === -1 || workerSource.indexOf(emailFallbackMarker) === -1) {
  failures.push("verified PayPal completion must include purchase tracking and email fallback controls");
} else if (workerSource.indexOf(purchaseTrackingMarker) > workerSource.indexOf(emailFallbackMarker)) {
  failures.push("verified PayPal purchase tracking must run before the email-delivery fallback branch");
}

for (const requiredCheckoutMeasurementControl of [
  "let responseStatus = 0;",
  "responseStatus = response.status;",
  'window.agentidTrackEvent("checkout_error"',
  'error_type: responseStatus ? "server_response" : "network_or_client"',
  "Checkout takes three steps:",
  "Access is not granted until PayPal reports the capture as completed.",
]) {
  if (!`${workerSource}\n${siteSource}`.includes(requiredCheckoutMeasurementControl)) {
    failures.push(`checkout path is missing explicit approval and failure measurement control ${requiredCheckoutMeasurementControl}`);
  }
}

for (const requiredLegacyLaunchKitRoutingControl of [
  'const legacySelfServeCampaigns = new Set(["agentid_social_bio", "agentid_newsletter"]);',
  'String(url.searchParams.get("utm_content") || "").toLowerCase() === "pricing"',
  'url.pathname = "/ai-agent-launch-kit";',
  'url.searchParams.set("utm_content", "launch_kit");',
  'const isLegacyLaunchKitPricingLink = !isAgentIdSite(env)',
]) {
  if (!workerSource.includes(requiredLegacyLaunchKitRoutingControl)) {
    failures.push(`legacy self-serve acquisition routing is missing ${requiredLegacyLaunchKitRoutingControl}`);
  }
}

const securityResponse = await handleAgentIdSiteRequest(
  new Request("https://gptmarketplus.com/.well-known/security.txt"),
  { SITE_URL: "https://gptmarketplus.com", SUPPORT_EMAIL: "admin@gptmarketplus.com", BRAND_NAME: "GPTMarketPlus" },
  { waitUntil() {} },
);
const securityBody = await securityResponse.text();
for (const header of ["strict-transport-security", "permissions-policy", "x-content-type-options", "x-frame-options", "referrer-policy"]) {
  if (!securityResponse.headers.get(header)) failures.push(`AgentID response is missing ${header}`);
}
if (!securityBody.includes("Canonical: https://gptmarketplus.com/.well-known/security.txt")) {
  failures.push("security.txt must use its well-known URL as Canonical");
}

const rejectedPublicPurchase = await handleAgentIdSiteRequest(
  new Request("https://gptmarketplus.com/api/events", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      eventName: "purchase",
      properties: { provider_verified: true, capture_verified: true },
    }),
  }),
  { SITE_URL: "https://gptmarketplus.com" },
  { waitUntil() {} },
);
const rejectedPublicPurchaseBody = await rejectedPublicPurchase.json();
if (rejectedPublicPurchase.status !== 403 || rejectedPublicPurchaseBody.recorded !== false) {
  failures.push("the public analytics collector must reject client-asserted purchase events");
}

const homeResponse = await handleAgentIdSiteRequest(
  new Request("https://gptmarketplus.com/"),
  {
    SITE_URL: "https://gptmarketplus.com",
    SUPPORT_EMAIL: "admin@gptmarketplus.com",
    BRAND_NAME: "GPTMarketPlus",
    ADSENSE_CLIENT_ID: "ca-pub-7354323580032872",
    ADSENSE_AD_SLOT: "3045151068",
    ADSENSE_ENABLED: "true",
  },
  { waitUntil() {} },
);
const homeBody = await homeResponse.text();
for (const requiredHomeCta of [
  'href="/book-a-consultation?source=homepage"',
  'href="/ai-agent-launch-kit"',
  "Get the $29 Launch Kit",
  'href="/ai-agent-launch-kit?source=opportunity-scanner"',
  'data-track-label="Scanner Launch Kit CTA"',
]) {
  if (!homeBody.includes(requiredHomeCta)) failures.push(`homepage is missing high-intent CTA ${requiredHomeCta}`);
}
if (!homeBody.includes('<meta name="google-site-verification" content="hxvcDl32V0BA5LSTQx-OfIUE6DAIR6TrRp2pUbE5XZo">')) {
  failures.push("homepage must expose the exact Google Search Console verification tag");
}
if (!homeBody.includes("<title>AI Agent Launch Kit for Small Business — $29 | GPTMarketPlus</title>")) {
  failures.push("homepage search title must make the $29 Launch Kit the primary offer");
}
if (!homeBody.includes("<h1>Build Your First AI Agent Starter System for $29</h1>")) {
  failures.push("homepage H1 must make the usable $29 starter system the primary offer");
}
if (!homeBody.includes('meta name="description" content="Start with a $29 AI Agent Launch Kit for a usable first workflow, or request a scoped custom AI agent plan for lead capture, follow-up, and operations."')) {
  failures.push("homepage search description must expose the truthful $29 self-serve and scoped-service paths");
}
for (const requiredHomepageMeasurementControl of [
  'const heroPrimaryTrackEvent = hero.primaryPath.startsWith("/ai-agent-launch-kit") ? "product_view" : "cta_click"',
  'data-track-event="${heroPrimaryTrackEvent}"',
]) {
  if (!siteSource.includes(requiredHomepageMeasurementControl)) {
    failures.push(`homepage measurement must distinguish Launch Kit product views from consultation CTA clicks: ${requiredHomepageMeasurementControl}`);
  }
}
if ((homeBody.match(/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/g) || []).length !== 1) {
  failures.push("eligible public pages must load the Google AdSense script exactly once");
}
if (!homeBody.includes('data-ad-client="ca-pub-7354323580032872"') || !homeBody.includes('data-ad-slot="3045151068"')) {
  failures.push("homepage must expose the configured Google AdSense responsive ad unit");
}

const pricingResponse = await handleAgentIdSiteRequest(
  new Request("https://gptmarketplus.com/pricing"),
  {
    SITE_URL: "https://gptmarketplus.com",
    SUPPORT_EMAIL: "admin@gptmarketplus.com",
    BRAND_NAME: "GPTMarketPlus",
    ADSENSE_CLIENT_ID: "ca-pub-7354323580032872",
    ADSENSE_AD_SLOT: "3045151068",
    ADSENSE_ENABLED: "true",
  },
  { waitUntil() {} },
);
const pricingBody = await pricingResponse.text();
if (pricingBody.includes("adsbygoogle") || pricingBody.includes('data-ad-slot="3045151068"')) {
  failures.push("high-conversion pricing page must remain free of publisher ads");
}
if (!pricingBody.includes('href="/book-a-consultation?source=pricing-hero"')) {
  failures.push("pricing consultation CTA must preserve its source attribution");
}

const faqResponse = await handleAgentIdSiteRequest(
  new Request("https://gptmarketplus.com/faq"),
  {
    SITE_URL: "https://gptmarketplus.com",
    SUPPORT_EMAIL: "admin@gptmarketplus.com",
    BRAND_NAME: "GPTMarketPlus",
  },
  { waitUntil() {} },
);
const faqBody = await faqResponse.text();
for (const requiredFaqControl of [
  "<title>AI Agent FAQ: Pricing, Security &amp; Setup | GPTMarketPlus</title>",
  'meta name="description" content="Answers about AI agents, the $29 Launch Kit, custom scope, PayPal delivery, privacy, human handoff, and setup."',
  'data-conversion-bridge="FAQ"',
  'href="/ai-agent-launch-kit?source=FAQ-bridge"',
]) {
  if (!faqBody.includes(requiredFaqControl)) failures.push(`FAQ acquisition path is missing ${requiredFaqControl}`);
}

const smallBusinessGuideResponse = await handleAgentIdSiteRequest(
  new Request("https://gptmarketplus.com/guides/ai-agent-for-small-business"),
  {
    SITE_URL: "https://gptmarketplus.com",
    SUPPORT_EMAIL: "admin@gptmarketplus.com",
    BRAND_NAME: "GPTMarketPlus",
  },
  { waitUntil() {} },
);
const smallBusinessGuideBody = await smallBusinessGuideResponse.text();
for (const requiredGuideControl of [
  "AI Agents for Small Business: Costs &amp; 30-Day Plan",
  'data-conversion-bridge="Small Business AI Guide"',
  "/book-a-consultation?source=Small%20Business%20AI%20Guide-bridge",
  'href="/pricing"',
]) {
  if (!smallBusinessGuideBody.includes(requiredGuideControl)) {
    failures.push(`highest-impression small-business guide is missing ${requiredGuideControl}`);
  }
}

for (const resourcePath of [
  "/guides/ai-receptionist-cost",
  "/guides/ai-lead-follow-up",
  "/compare/ai-agent-vs-chatbot",
  "/industries/contractors-ai-automation",
  "/templates/lead-follow-up-scripts",
]) {
  const resourceResponse = await handleAgentIdSiteRequest(
    new Request(`https://gptmarketplus.com${resourcePath}`),
    {
      SITE_URL: "https://gptmarketplus.com",
      SUPPORT_EMAIL: "admin@gptmarketplus.com",
      BRAND_NAME: "GPTMarketPlus",
    },
    { waitUntil() {} },
  );
  const resourceBody = await resourceResponse.text();
  if (
    resourceResponse.status !== 200
    || !resourceBody.includes('data-conversion-bridge=')
    || !resourceBody.includes('data-track-event="product_view"')
    || !resourceBody.includes('href="/ai-agent-launch-kit?source=')
    || !resourceBody.includes('href="/book-a-consultation?source=')
  ) {
    failures.push(`observed resource page ${resourcePath} must include a tracked Launch Kit-first conversion bridge`);
  }
}

for (const conversionPath of ["/services", "/ai-agents", "/use-cases"]) {
  const conversionResponse = await handleAgentIdSiteRequest(
    new Request(`https://gptmarketplus.com${conversionPath}`),
    {
      SITE_URL: "https://gptmarketplus.com",
      SUPPORT_EMAIL: "admin@gptmarketplus.com",
      BRAND_NAME: "GPTMarketPlus",
    },
    { waitUntil() {} },
  );
  const conversionBody = await conversionResponse.text();
  if (!conversionBody.includes("data-conversion-bridge=") || !conversionBody.includes("Book my strategy call")) {
    failures.push(`${conversionPath} must include the analytics-led consultation bridge`);
  }
  if (!conversionBody.includes('href="/ai-agent-launch-kit"')) {
    failures.push(`${conversionPath} must send qualified visitors to the high-engagement Launch Kit`);
  }
}

for (const [conversionPath, requiredPrimaryControl] of [
  ["/ai-agents", 'href="/ai-agent-launch-kit?source=ai-agents" data-track-event="product_view"'],
  ["/use-cases", 'href="/ai-agent-launch-kit?source=use-cases" data-track-event="product_view"'],
]) {
  const conversionResponse = await handleAgentIdSiteRequest(
    new Request(`https://gptmarketplus.com${conversionPath}`),
    {
      SITE_URL: "https://gptmarketplus.com",
      SUPPORT_EMAIL: "admin@gptmarketplus.com",
      BRAND_NAME: "GPTMarketPlus",
    },
    { waitUntil() {} },
  );
  const conversionBody = await conversionResponse.text();
  if (!conversionBody.includes(requiredPrimaryControl)) {
    failures.push(`${conversionPath} must put the attributed Launch Kit in the primary CTA position`);
  }
}

for (const [purchaseOrigin, purchaseBrand] of [
  ["https://gptmarketplus.com", "GPTMarketPlus"],
  ["https://agentid.services", "AgentID Services"],
]) {
  for (const purchasePath of ["/pricing", "/ai-agent-launch-kit"]) {
    const purchaseJourneyResponse = await handleAgentIdSiteRequest(
      new Request(`${purchaseOrigin}${purchasePath}`),
      {
        SITE_URL: purchaseOrigin,
        SUPPORT_EMAIL: "admin@gptmarketplus.com",
        BRAND_NAME: purchaseBrand,
        GOOGLE_ANALYTICS_ID: "G-TEST123456",
        PAYPAL_CLIENT_ID: "test-client-id",
        PAYPAL_CLIENT_SECRET: "test-client-secret",
      },
      { waitUntil() {} },
    );
    const purchaseJourneyBody = await purchaseJourneyResponse.text();
    for (const requiredControl of [
      'window.agentidTrackEvent("view_item"',
      'window.agentidTrackEvent("add_to_cart"',
      'window.agentidTrackEvent("begin_checkout"',
      'data-ecommerce-item-id="ai_agent_launch_kit"',
      '"item_id":"ai_agent_launch_kit"',
      '"price":29',
      '"quantity":1',
    ]) {
      if (!purchaseJourneyBody.includes(requiredControl)) {
        failures.push(`${purchaseOrigin}${purchasePath} is missing GA4 purchase journey control ${requiredControl}`);
      }
    }
  }
}

if (!siteSource.includes("function renderLaunchKitSamplePreview()")
  || !siteSource.includes("Illustrative sample")
  || !siteSource.includes("This is an illustrative product sample, not a customer result, testimonial, or performance guarantee.")) {
  failures.push("Launch Kit public page must show an honest fictional deliverable sample without fabricated proof");
}
for (const requiredLaunchKitSearchControl of [
  "AI Agent Launch Kit: Build Your First AI Workflow for $29",
  "Build a usable first AI workflow for $29: private PayPal-gated workspace",
  "function launchKitFaqSchema(env)",
  "What do I receive after I buy the $29 Launch Kit?",
  "Does the Launch Kit guarantee leads, revenue, or savings?",
]) {
  if (!siteSource.includes(requiredLaunchKitSearchControl)) {
    failures.push(`Launch Kit search and buyer-confidence content is missing ${requiredLaunchKitSearchControl}`);
  }
}
for (const requiredChatOfferControl of [
  'match: ["how much", "cost", "price"]',
  "the $29 AI Agent Launch Kit is the primary self-serve starting point",
  "$29 AI Agent Launch Kit is a low-risk way to turn it into a usable first workflow",
  "The $29 AI Agent Launch Kit helps you map one bounded workflow yourself",
  "custom work starts at the separately scoped service tiers",
  "requires a free strategy call before any payment is requested",
  "const incompleteQualification = !state.businessType || !state.painPoint || !state.urgency || !state.budgetRange",
  'href: "/ai-agent-launch-kit?source=chat"',
]) {
  if (!siteSource.includes(requiredChatOfferControl)) {
    failures.push(`chat pricing response is missing Launch Kit-first routing control ${requiredChatOfferControl}`);
  }
}

for (const [index, check] of [
  ["price", "How much does it cost?", "$29 AI Agent Launch Kit"],
  ["uncertainty", "I am not sure this is for me", "$29 AI Agent Launch Kit is a low-risk way"],
  ["chatbot", "Is this just a chatbot?", "$29 AI Agent Launch Kit helps you map one bounded workflow"],
].entries()) {
  const chatObjectionResponse = await handleAgentIdSiteRequest(
    new Request("https://gptmarketplus.com/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: check[1], conversationId: `validation-chat-${check[0]}-${index}` }),
    }),
    { SITE_URL: "https://gptmarketplus.com", BRAND_NAME: "GPTMarketPlus" },
    { waitUntil() {} },
  );
  const chatObjectionBody = await chatObjectionResponse.json();
  if (chatObjectionResponse.status !== 200
    || !String(chatObjectionBody.reply || "").includes(check[2])
    || chatObjectionBody.cta?.href !== "/ai-agent-launch-kit?source=chat") {
    failures.push(`initial chat ${check[0]} objection must answer with the Launch Kit-first offer and CTA`);
  }
}

const roiResponse = await handleAgentIdSiteRequest(
  new Request("https://gptmarketplus.com/tools/ai-automation-roi-calculator"),
  {
    SITE_URL: "https://gptmarketplus.com",
    SUPPORT_EMAIL: "admin@gptmarketplus.com",
    BRAND_NAME: "GPTMarketPlus",
  },
  { waitUntil() {} },
);
const roiBody = await roiResponse.text();
for (const requiredRoiConversionControl of [
  'href="/ai-agent-launch-kit?source=roi-calculator"',
  'data-track-label="ROI Calculator Launch Kit"',
  'href="/book-a-consultation?source=roi-calculator"',
  'data-track-label="ROI Calculator Scoped Review"',
  'const summary = render();',
  'source: "calculator_submit"',
]) {
  if (!roiBody.includes(requiredRoiConversionControl)) {
    failures.push(`ROI calculator is missing conversion or measurement control ${requiredRoiConversionControl}`);
  }
}
if (roiBody.includes('render();\n          window.agentidTrackEvent("roi_calculation"')) {
  failures.push("ROI calculator must not record a calculation on initial page render");
}

for (const requiredIntentAttributionControl of [
  'const trafficSource = `traffic-${trafficSlug}`',
  'data-launch-kit-cta=',
  'eventName: "product_view"',
  'fetch("/api/events"',
  'source: search.get("source") || ""',
  'source: cleanText(submittedAttribution.source || "", 160)',
  'source: cleanText(attribution.source || "", 160)',
]) {
  if (!`${workerSource}\n${siteSource}`.includes(requiredIntentAttributionControl)) {
    failures.push(`buyer-intent attribution is missing ${requiredIntentAttributionControl}`);
  }
}
for (const requiredAcquisitionRoutingControl of [
  'primaryCta: utmCampaignUrl(env, "/ai-agent-launch-kit"',
  'consultationCta: utmCampaignUrl(env, "/book-a-consultation"',
  'sponsorCta: utmCampaignUrl(env, "/advertise"',
  'const selfServeCta = utmCampaignUrl(env, "/ai-agent-launch-kit"',
  'selfServe: "Use the Launch Kit when the buyer wants a usable first workflow without implementation help."',
  'custom: "Use the consultation link when the buyer needs installation, integrations, or ongoing support; do not request payment before written scope."',
]) {
  if (!workerSource.includes(requiredAcquisitionRoutingControl)) {
    failures.push(`acquisition routing is missing ${requiredAcquisitionRoutingControl}`);
  }
}
if (!workerSource.includes("const PUBLIC_CACHE_KEY_VERSION =") || !workerSource.includes("url.searchParams.set(\"__cache_version\"")) {
  failures.push("public cache keys must be versioned so deployed funnel changes are served to visitors");
}

const campaignLinksResponse = await handleAgentIdSiteRequest(
  new Request("https://gptmarketplus.com/api/campaign-links"),
  { SITE_URL: "https://gptmarketplus.com", BRAND_NAME: "GPTMarketPlus" },
  { waitUntil() {} },
);
const campaignLinksBody = await campaignLinksResponse.json();
const campaignLinks = campaignLinksBody.links || {};
const launchKitCampaigns = [
  campaignLinks.email?.newsletter_pricing,
  ...(Object.values(campaignLinks.social_bios || {})),
  campaignLinks.partners?.community_post,
  campaignLinks.documents?.launch_kit_one_pager,
];
if (campaignLinksResponse.status !== 200 || launchKitCampaigns.some((value) => {
  try {
    const url = new URL(value);
    return url.pathname !== "/ai-agent-launch-kit"
      || url.searchParams.get("utm_campaign") === ""
      || url.searchParams.get("utm_content") === "";
  } catch {
    return true;
  }
})) {
  failures.push("external campaign links must send the primary self-serve distribution paths to the Launch Kit with attribution");
}

for (const socialSource of ["linkedin", "facebook", "instagram", "tiktok", "x", "newsletter"]) {
  const launchKitShareControl = `utmCampaignUrl(env, "/ai-agent-launch-kit", { source: "${socialSource}"`;
  if (!workerSource.includes(launchKitShareControl)) {
    failures.push(`social share hub must route ${socialSource} to the attributed Launch Kit page`);
  }
  if (workerSource.includes(`utmCampaignUrl(env, "/pricing", { source: "${socialSource}"`)) {
    failures.push(`social share hub must not route ${socialSource} to the old pricing path`);
  }
}
for (const requiredPartnerDistributionControl of [
  'partners: {',
  'community_post: campaignUrl(env, "/ai-agent-launch-kit"',
  'source: "partner"',
  'medium: "referral"',
  'campaign: "agentid_partner_distribution"',
  'content: "launch_kit"',
  '"Partner or community post"',
  "For owners who want to choose one practical AI workflow before paying for implementation",
  "It is not a performance guarantee",
]) {
  if (!`${workerSource}\n${siteSource}`.includes(requiredPartnerDistributionControl)) {
    failures.push(`partner distribution is missing attributed Launch Kit control ${requiredPartnerDistributionControl}`);
  }
}
for (const requiredProspectSafetyControl of [
  "function prospectCtaUrl(env, value)",
  "const fallback = `${siteUrl(env)}/advertise?source=lead-spider`",
  'const legacyProcessor = ["s", "t", "r", "i", "p", "e"].join("")',
  'host === "gptmarketplus.org"',
  "function prospectSalesText(env, value)",
  "billing remains disabled until relevance, placement, and fulfillment terms are approved.",
]) {
  if (!workerSource.includes(requiredProspectSafetyControl)) {
    failures.push(`prospect sales safety is missing legacy-payment routing control ${requiredProspectSafetyControl}`);
  }
}

for (const requiredSocialSalesControl of [
  'const primaryShareUrl = utmCampaignUrl(env, "/ai-agent-launch-kit",',
  '<span class="label">Primary product share URL</span>',
  'copy-share-button',
  'data-copy-value="${escapeHtml(primaryShareUrl)}"',
  "Use this attributed Launch Kit link for social bios, newsletters, and partner posts.",
  'class="share-post" readonly',
  'navigator.clipboard.writeText(value)',
  '<meta name="robots" content="noindex,nofollow,noarchive">',
  "First-sale activation",
  "Check the handoff before sending traffic",
  'href="${escapeHtml(primaryShareUrl)}"><strong>$29 AI Agent Launch Kit</strong>',
  'href="/free-ai-automation-audit-checklist?source=social-hub"',
  'href="/book-a-consultation?source=social-hub"',
  '<strong>Owner dashboard</strong>',
  "Internal control panel for the team; do not use this as a customer acquisition URL.",
]) {
  if (!workerSource.includes(requiredSocialSalesControl)) {
    failures.push(`social share hub is missing sales distribution control ${requiredSocialSalesControl}`);
  }
}

for (const requiredDiscoveryOfferControl of [
  'const SITE_CONTENT_LAST_MODIFIED = "2026-08-13"',
  'seoTitle: "AI Agent Launch Kit for Small Business — $29"',
  "Start with the $29 AI Agent Launch Kit: a guided workspace for building one usable first workflow.",
  "The $29 AI Agent Launch Kit is a one-time guided workspace",
  "Custom AI agent implementation, integrations, production testing, and ongoing support are separate services considered only after a written scope and fulfillment plan.",
  "Start with the [AI Agent Launch Kit]",
]) {
  if (!siteSource.includes(requiredDiscoveryOfferControl)) {
    failures.push(`machine-readable discovery copy is missing primary-offer control ${requiredDiscoveryOfferControl}`);
  }
}
if (workerSource.includes('<span class="label">Primary share URL</span>')) {
  failures.push("social share hub must not present the internal dashboard as its primary share URL");
}

const cancelledCheckoutResponse = await handleAgentIdSiteRequest(
  new Request("https://gptmarketplus.com/ai-agent-launch-kit?paypal=cancel&product=ai_agent_launch_kit"),
  {
    SITE_URL: "https://gptmarketplus.com",
    SUPPORT_EMAIL: "admin@gptmarketplus.com",
    BRAND_NAME: "GPTMarketPlus",
  },
  { waitUntil() {} },
);
const cancelledCheckoutBody = await cancelledCheckoutResponse.text();
if (!cancelledCheckoutBody.includes("PayPal checkout was canceled. No payment was captured")) {
  failures.push("canceled PayPal checkout must clearly confirm that no payment was captured");
}

const launchKitDeliveryResponse = await handleAgentIdSiteRequest(
  new Request("https://gptmarketplus.com/ai-agent-launch-kit"),
  {
    SITE_URL: "https://gptmarketplus.com",
    SUPPORT_EMAIL: "admin@gptmarketplus.com",
    BRAND_NAME: "GPTMarketPlus",
    GOOGLE_ANALYTICS_ID: "G-TEST123456",
    PAYPAL_CLIENT_ID: "test-client-id",
    PAYPAL_CLIENT_SECRET: "test-client-secret",
  },
  { waitUntil() {} },
);
const launchKitDeliveryBody = await launchKitDeliveryResponse.text();
for (const requiredLaunchKitDeliveryCopy of [
  "After checkout",
  "One guided build, seven practical deliverables",
  "Your private workspace opens after PayPal confirms the completed capture",
  "Separate written scope",
  "production testing",
  "Before you buy",
  "Clear answers about the $29 Launch Kit",
  'href="/book-a-consultation?source=launch-kit-page"',
  'href="/refund-policy"',
]) {
  if (!launchKitDeliveryBody.includes(requiredLaunchKitDeliveryCopy)) {
    failures.push(`Launch Kit product page is missing delivery or scope copy ${requiredLaunchKitDeliveryCopy}`);
  }
}

for (const requiredLaunchKitConsentControl of [
  "LEAD INTAKE AND CONSENT FIELDS",
  "contact_consent: required before non-urgent follow-up through the requested channel",
  "marketing_consent: separate optional permission; never infer it from contact consent",
  "consent_timestamp_and_source: record when and where permission was given",
  "opt_out_requested: stop the applicable follow-up sequence and record the request",
  "Marketing or reactivation: Send only when marketing_consent is separately true",
  "5. FOLLOW-UP MESSAGES TO ADAPT",
  "Acknowledgment (contact consent required):",
  "Qualified handoff:",
  "Marketing or reactivation (marketing consent required separately):",
  "7. 30-DAY SCORECARD",
  "async function copyStarterPack(value)",
  'document.execCommand("copy")',
  'id="launch-kit-download"',
  'id="launch-kit-starter-scenario"',
  'const starterScenarios =',
  'Object.entries(scenario).forEach',
  "Starter scenario added to empty fields",
  "New lead intake and human handoff",
  "Missed-call recovery",
  "FAQ and booking assistant",
  'id="launch-kit-scenario-picker"',
  'data-scenario-id="${escapeHtml(scenario.id)}"',
  "nothing is saved before purchase",
  'window.agentidTrackEvent("launch_kit_scenario_select"',
]) {
  if (!siteSource.includes(requiredLaunchKitConsentControl)) {
    failures.push(`Launch Kit starter pack is missing explicit consent control ${requiredLaunchKitConsentControl}`);
  }
}
if (siteSource.includes("One guided build, six usable outputs")) {
  failures.push("Launch Kit product copy must match the actual seven-deliverable starter pack");
}

for (const requiredRevenueGoalControl of [
  "const VERIFIED_REVENUE_GOAL_CENTS = 1_000_000",
  "verifiedRevenueGoalDollars",
  "verifiedRevenueGapDollars",
  "$10,000 verified-revenue goal",
]) {
  if (!workerSource.includes(requiredRevenueGoalControl)) {
    failures.push(`revenue reporting is missing the explicit $10,000 goal control ${requiredRevenueGoalControl}`);
  }
}
for (const requiredCustomerDeliveryStatusControl of [
  '"name": "CUSTOMER_EMAIL"',
  "async function sendCloudflareCustomerEmail(env, recipient, subject, text, html)",
  'provider: "cloudflare_customer_email"',
  "const cloudflareResult = await sendCloudflareCustomerEmail(env, recipient, subject, text, html)",
  "async function customerEmailDeliveryStatus(env)",
  "customerEmailDeliveryReady: customerEmailDelivery.ready",
  "customerEmailProviders: customerEmailDelivery.providers",
  "cloudflare: cloudflareReady",
  "gmailOAuth: gmailReady",
  "resend: resendReady",
]) {
  if (!`${raw}\n${workerSource}\n${siteSource}`.includes(requiredCustomerDeliveryStatusControl)) {
    failures.push(`PayPal status is missing customer delivery readiness control ${requiredCustomerDeliveryStatusControl}`);
  }
}

const agentIdEnv = {
  SITE_URL: "https://agentid.services",
  SUPPORT_EMAIL: "admin@gptmarketplus.com",
  BRAND_NAME: "AgentID Services",
  ADSENSE_CLIENT_ID: "ca-pub-7354323580032872",
  ADSENSE_AD_SLOT: "3045151068",
  ADSENSE_ENABLED: "false",
};
const agentIdHomeResponse = await handleAgentIdSiteRequest(
  new Request("https://agentid.services/"),
  agentIdEnv,
  { waitUntil() {} },
);
const agentIdHomeBody = await agentIdHomeResponse.text();
if (!agentIdHomeBody.includes("AgentID Services") || agentIdHomeBody.includes("pagead2.googlesyndication.com") || agentIdHomeBody.includes("adsbygoogle")) {
  failures.push("agentid.services homepage must retain AgentID branding without AdSense code");
}
const agentIdSitemapResponse = await handleAgentIdSiteRequest(
  new Request("https://agentid.services/sitemap.xml"),
  agentIdEnv,
  { waitUntil() {} },
);
const agentIdSitemapBody = await agentIdSitemapResponse.text();
if (!agentIdSitemapBody.includes("https://agentid.services/services")
  || agentIdSitemapBody.includes("https://agentid.services/software-builds")
  || agentIdSitemapBody.includes("https://agentid.services/sponsor")) {
  failures.push("agentid.services sitemap must keep core service pages and exclude operational or sponsor inventory");
}
const agentIdAdsResponse = await handleAgentIdSiteRequest(
  new Request("https://agentid.services/ads.txt"),
  agentIdEnv,
  { waitUntil() {} },
);
const agentIdAdsBody = await agentIdAdsResponse.text();
if (agentIdAdsBody.includes("google.com, pub-") || !agentIdAdsBody.includes("not active on this host")) {
  failures.push("agentid.services ads.txt must not authorize the GPTMarketPlus AdSense publisher");
}

const adsMeasurementResponse = await handleAgentIdSiteRequest(
  new Request("https://gptmarketplus.com/contact"),
  {
    SITE_URL: "https://gptmarketplus.com",
    SUPPORT_EMAIL: "admin@gptmarketplus.com",
    BRAND_NAME: "GPTMarketPlus",
    GOOGLE_ANALYTICS_ID: "G-TEST123456",
    GOOGLE_ADS_LEAD_CONVERSION_ID: "AW-123456789",
    GOOGLE_ADS_LEAD_CONVERSION_LABEL: "LeadLabel123",
    GOOGLE_ADS_PURCHASE_CONVERSION_ID: "AW-987654321",
    GOOGLE_ADS_PURCHASE_CONVERSION_LABEL: "PurchaseLabel456",
  },
  { waitUntil() {} },
);
const adsMeasurementBody = await adsMeasurementResponse.text();
for (const requiredMeasurementControl of [
  '"generate_lead":"AW-123456789/LeadLabel123"',
  '"purchase":"AW-987654321/PurchaseLabel456"',
  'window.agentidTrackGoogleAdsConversion = function(eventName, properties)',
  '["generate_lead", "purchase"].includes(eventName)',
  'window.agentidTrackEvent("generate_lead"',
]) {
  if (!adsMeasurementBody.includes(requiredMeasurementControl)) {
    failures.push(`Google Ads conversion-ready page is missing ${requiredMeasurementControl}`);
  }
}

const sponsorApplicationResponse = await handleAgentIdSiteRequest(
  new Request("https://gptmarketplus.com/contact?intent=sponsor&package=featured_tool_monthly"),
  {
    SITE_URL: "https://gptmarketplus.com",
    SUPPORT_EMAIL: "admin@gptmarketplus.com",
    BRAND_NAME: "GPTMarketPlus",
  },
  { waitUntil() {} },
);
const sponsorApplicationBody = await sponsorApplicationResponse.text();
for (const requiredControl of ['name="applicationType"', 'value="sponsor"', 'name="email"', 'name="businessName"', 'name="website"', 'name="whatDoYouWantToAutomate"', 'name="contactConsent"']) {
  if (!sponsorApplicationBody.includes(requiredControl)) failures.push(`sponsor application is missing ${requiredControl}`);
}
for (const excessRequiredControl of ['name="phone"', 'name="businessType"', 'name="budgetRange"', 'name="timeline"', 'name="preferredContactMethod"']) {
  if (sponsorApplicationBody.includes(excessRequiredControl)) failures.push(`sponsor application still includes high-friction control ${excessRequiredControl}`);
}
if (!sponsorApplicationBody.includes("$99.00 / 30 days") || !sponsorApplicationBody.includes("PayPal invoice only after written approval")) {
  failures.push("sponsor application must show the selected 30-day price and PayPal review workflow");
}

if (normalizePaypalInvoiceId("INV2-Z56S-5LLA-Q52L-CPZ5") !== "INV2-Z56S-5LLA-Q52L-CPZ5" || normalizePaypalInvoiceId("../private")) {
  failures.push("PayPal invoice IDs must be normalized and path-safe");
}
const invoiceSummary = summarizePaypalInvoice({
  id: "INV2-Z56S-5LLA-Q52L-CPZ5",
  status: "PAID",
  detail: { currency_code: "USD" },
  amount: { currency_code: "USD", value: "99.00" },
  due_amount: { currency_code: "USD", value: "0.00" },
  payments: {
    paid_amount: { currency_code: "USD", value: "99.00" },
    transactions: [{ type: "PAYPAL", payment_id: "sensitive-payment-id" }],
  },
  primary_recipients: [{ billing_info: { email_address: "customer@example.com", name: { full_name: "Private Customer" } } }],
}, { mode: "live", checkedAt: "2026-08-07T00:00:00.000Z" });
const invoiceSummaryText = JSON.stringify(invoiceSummary);
if (!invoiceSummary.providerPaid || invoiceSummary.totalCents !== 9900 || invoiceSummary.dueCents !== 0 || invoiceSummary.feeVerified || invoiceSummary.verifiedNetProfitReady) {
  failures.push("PayPal invoice summary must distinguish provider-paid status from fee-verified net profit");
}
for (const sensitiveInvoiceValue of ["customer@example.com", "Private Customer", "sensitive-payment-id"]) {
  if (invoiceSummaryText.includes(sensitiveInvoiceValue)) failures.push("PayPal invoice summary exposes private recipient or transaction data");
}

const propertyCandidates = googlePropertyCandidates("https://gptmarketplus.com");
if (!propertyCandidates.includes("sc-domain:gptmarketplus.com") || !propertyCandidates.includes("https://gptmarketplus.com/")) {
  failures.push("Search Console property matching must support domain and HTTPS URL-prefix properties");
}
const inspectionSummary = summarizeGoogleIndexInspection({
  inspectionResult: {
    indexStatusResult: {
      verdict: "PASS",
      coverageState: "Submitted and indexed",
      indexingState: "INDEXING_ALLOWED",
      pageFetchState: "SUCCESSFUL",
      robotsTxtState: "ALLOWED",
      lastCrawlTime: "2026-08-06T12:00:00Z",
      googleCanonical: "https://gptmarketplus.com/",
      userCanonical: "https://gptmarketplus.com/",
      referringUrls: ["https://private.example/customer-record"],
    },
  },
});
const searchSummary = summarizeGoogleSearchAnalytics({ rows: [{ clicks: 2, impressions: 40, ctr: 0.05, position: 8.123456 }] }, "2026-07-08", "2026-08-04");
if (inspectionSummary.verdict !== "PASS" || inspectionSummary.lastCrawlTime !== "2026-08-06T12:00:00.000Z" || searchSummary.clicks !== 2 || searchSummary.impressions !== 40 || searchSummary.position !== 8.1235) {
  failures.push("Search Console diagnostics must preserve index evidence and aggregate acquisition metrics");
}
if (JSON.stringify(inspectionSummary).includes("private.example")) {
  failures.push("Search Console diagnostics must not expose provider-only discovery URLs");
}
const searchPages = summarizeGoogleSearchPages({
  rows: [
    { keys: ["https://gptmarketplus.com/ai-agent-launch-kit"], clicks: 2, impressions: 40, ctr: 0.05, position: 8.123456 },
    { keys: ["https://gptmarketplus.com/ai-sales-funnel"], clicks: 0, impressions: 60, ctr: 0, position: 32 },
    { keys: ["https://private.example/customer-record"], clicks: 20, impressions: 40, ctr: 0.5, position: 1 },
    { keys: ["not-a-url"], clicks: 10, impressions: 30, ctr: 0.3, position: 2 },
  ],
}, "https://gptmarketplus.com");
if (
  searchPages.length !== 2
  || searchPages[0].page !== "/ai-sales-funnel"
  || searchPages[0].impressions !== 60
  || searchPages[1].page !== "/ai-agent-launch-kit"
  || JSON.stringify(searchPages).includes("private.example")
) {
  failures.push("Search Console page diagnostics must rank canonical public pages by aggregate impressions");
}
const searchIntents = summarizeGoogleSearchIntents({
  rows: [
    { keys: ["private small business workflow phrase", "https://gptmarketplus.com/services"], clicks: 1, impressions: 20, ctr: 0.05, position: 12 },
    { keys: ["private receptionist pricing phrase", "https://gptmarketplus.com/ai-agents"], clicks: 0, impressions: 10, ctr: 0, position: 30 },
    { keys: ["private unmatched automation phrase", "https://gptmarketplus.com/resources"], clicks: 0, impressions: 5, ctr: 0, position: 40 },
    { keys: ["private small business workflow phrase", "https://www.gptmarketplus.com/services"], clicks: 50, impressions: 500, ctr: 0.1, position: 1 },
    { keys: ["private receptionist pricing phrase", "https://other.example/"], clicks: 50, impressions: 500, ctr: 0.1, position: 1 },
  ],
}, "https://gptmarketplus.com");
if (
  searchIntents.length !== 3
  || searchIntents[0].intent !== "small_business_ai"
  || searchIntents[0].impressions !== 20
  || searchIntents[0].position !== 12
  || !searchIntents.some((entry) => entry.intent === "ai_receptionist" && entry.impressions === 10)
  || !searchIntents.some((entry) => entry.intent === "other" && entry.impressions === 5)
  || JSON.stringify(searchIntents).includes("private")
) {
  failures.push("Search Console intent diagnostics must aggregate demand without exposing raw queries");
}

for (const requiredSearchIntentControl of [
  'dimensions: ["query", "page"]',
  "rowLimit = 25_000",
  "startRow += rowLimit",
  "summarizeGoogleSearchIntents(intentsResponse.payload, origin)",
]) {
  if (!searchConsoleSource.includes(requiredSearchIntentControl)) {
    failures.push(`Search Console intent collection is missing ${requiredSearchIntentControl}`);
  }
}

const ownerMessages = [];
const emailTestEnv = {
  SITE_URL: "https://gptmarketplus.com",
  BRAND_NAME: "GPTMarketPlus",
  SUPPORT_EMAIL: "admin@gptmarketplus.com",
  OWNER_NOTIFICATION_EMAIL: "nrk8286@gmail.com",
  TRANSACTIONAL_EMAIL: {
    async send(message) {
      ownerMessages.push(message);
    },
  },
};
const internalLeadClassification = classifyLeadRecord(emailTestEnv, { email: "nrk8286@gmail.com" });
const syntheticLeadClassification = classifyLeadRecord(emailTestEnv, { email: "fixture@example.com" });
const customerLeadClassification = classifyLeadRecord(emailTestEnv, { email: "buyer@customer-business.com" });
if (
  !internalLeadClassification.excluded
  || internalLeadClassification.reason !== "internal_email"
  || !syntheticLeadClassification.excluded
  || syntheticLeadClassification.reason !== "synthetic_email_domain"
  || customerLeadClassification.excluded
) {
  failures.push("lead classification must exclude internal and synthetic records without excluding real customer domains");
}
const ownerDelivery = await sendOwnerTransactionalEmail(
  emailTestEnv,
  "Owner notification test",
  "A test owner notification.",
  "<p>A test owner notification.</p>",
  "customer@example.com",
);
if (!ownerDelivery.delivered || ownerDelivery.provider !== "cloudflare_send_email" || ownerMessages.length !== 1) {
  failures.push("owner transactional email must deliver through the restricted Cloudflare binding");
} else {
  const [ownerMessage] = ownerMessages;
  if (ownerMessage.from?.email !== "admin@gptmarketplus.com" || ownerMessage.to !== "nrk8286@gmail.com") {
    failures.push("owner transactional email envelope does not match the restricted binding");
  }
}

const customerDelivery = await sendCustomerTransactionalEmail(
  emailTestEnv,
  "customer@example.com",
  "Customer notification test",
  "A test customer notification.",
  "<p>A test customer notification.</p>",
);
if (customerDelivery.delivered || customerDelivery.code !== "provider_not_configured" || ownerMessages.length !== 1) {
  failures.push("owner-only Cloudflare email must never report or perform customer transactional delivery");
}

const backlogUpdates = [];
const backlogLead = {
  id: "consented-booking-test",
  created_at: "2026-08-08T18:15:25.902Z",
  updated_at: "2026-08-08T18:15:25.902Z",
  contact_consent: 1,
  follow_up_status: "queued",
  booked_call: 1,
  quote_requested: 0,
  purchase_intent: "",
  lead_status: "WARM",
  lead_score: 60,
  name: "Release Test",
  email: "buyer@customer-business.com",
  business_name: "Example Business",
};
const backlogResult = await notifyQueuedSalesReadyLeads({
  ...emailTestEnv,
  GMP_DB: {
    prepare(sql) {
      return {
        bind(...args) {
          return {
            async all() {
              return { success: true, results: [backlogLead] };
            },
            async run() {
              backlogUpdates.push({ sql, args });
              return { success: true, meta: { changes: 1 } };
            },
          };
        },
      };
    },
  },
});
if (
  !backlogResult.ok
  || backlogResult.eligible !== 1
  || backlogResult.claimed !== 1
  || backlogResult.notified !== 1
  || backlogResult.failed !== 0
  || ownerMessages.length !== 2
  || !backlogUpdates.some((update) => update.args[0] === "owner_notified")
) {
  failures.push("consented queued sales-ready leads must be claimed once, delivered to the owner, and recorded");
}

const oauthKeyBytes = crypto.getRandomValues(new Uint8Array(32));
const oauthIv = crypto.getRandomValues(new Uint8Array(12));
const oauthKey = await crypto.subtle.importKey("raw", oauthKeyBytes, { name: "AES-GCM" }, false, ["encrypt"]);
const encryptedRefreshToken = await crypto.subtle.encrypt(
  { name: "AES-GCM", iv: oauthIv },
  oauthKey,
  new TextEncoder().encode("test-refresh-token"),
);
const encodeBase64Url = (bytes) => Buffer.from(bytes).toString("base64url");
const gmailRequests = [];
const originalFetch = globalThis.fetch;
globalThis.fetch = async (url, options = {}) => {
  gmailRequests.push({ url: String(url), options });
  if (String(url) === "https://oauth2.googleapis.com/token") {
    return Response.json({ access_token: "test-access-token", expires_in: 3600 });
  }
  if (String(url) === "https://gmail.googleapis.com/gmail/v1/users/me/messages/send") {
    return Response.json({ id: "gmail-message-id", threadId: "gmail-thread-id" });
  }
  return new Response("unexpected test URL", { status: 500 });
};
try {
  const gmailDelivery = await sendCustomerTransactionalEmail(
    {
      ...emailTestEnv,
      TRANSACTIONAL_EMAIL: undefined,
      GMAIL_SENDER_EMAIL: "nrk8286@gmail.com",
      GOOGLE_OAUTH_CLIENT_ID: "test-client-id",
      GOOGLE_OAUTH_CLIENT_SECRET: "test-client-secret",
      GOOGLE_OAUTH_TOKEN_KEY: encodeBase64Url(oauthKeyBytes),
      GMP_KV: {
        async get(key, type) {
          if (key !== "google-oauth:gmail-connection" || type !== "json") return null;
          return {
            version: 1,
            iv: encodeBase64Url(oauthIv),
            ciphertext: encodeBase64Url(new Uint8Array(encryptedRefreshToken)),
            scopes: ["https://www.googleapis.com/auth/gmail.send"],
          };
        },
      },
    },
    "customer@example.com",
    "Your GPTMarketPlus purchase",
    "Your purchase is ready.",
    "<p>Your purchase is ready.</p>",
  );
  const gmailRequest = gmailRequests.find((entry) => entry.url.includes("/gmail/v1/users/me/messages/send"));
  const gmailPayload = gmailRequest ? JSON.parse(String(gmailRequest.options.body || "{}")) : {};
  if (
    !gmailDelivery.delivered
    || gmailDelivery.provider !== "gmail_oauth"
    || gmailDelivery.messageId !== "gmail-message-id"
    || !gmailPayload.raw
  ) {
    failures.push("connected Gmail OAuth adapter must perform arbitrary-recipient customer delivery");
  }
} finally {
  globalThis.fetch = originalFetch;
}

if (failures.length) {
  for (const failure of failures) console.error(`binding validation: ${failure}`);
  process.exit(1);
}

console.log("Cloudflare bindings are provisioned and internally consistent.");
