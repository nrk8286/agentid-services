import { readFileSync } from "node:fs";
import {
  classifyLeadRecord,
  handleAgentIdSiteRequest,
  notifyQueuedSalesReadyLeads,
  sendCustomerTransactionalEmail,
  sendOwnerTransactionalEmail,
} from "../src/agentid-site.js";
import {
  googlePropertyCandidates,
  summarizeGoogleIndexInspection,
  summarizeGoogleSearchAnalytics,
  summarizeGoogleSearchPages,
} from "../src/google-search-console.js";
import { normalizePaypalInvoiceId, summarizePaypalInvoice } from "../src/paypal-invoice.js";

const raw = readFileSync(new URL("../wrangler.jsonc", import.meta.url), "utf8");
const runtimeMigration = readFileSync(new URL("../migrations/0004_agent_runtime.sql", import.meta.url), "utf8");
const genericLeadNotificationMigration = readFileSync(new URL("../migrations/0008_generic_lead_notifications.sql", import.meta.url), "utf8");
const workerSource = readFileSync(new URL("../src/index.js", import.meta.url), "utf8");
const siteSource = readFileSync(new URL("../src/agentid-site.js", import.meta.url), "utf8");
const failures = [];

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
if (siteSource.includes('data-endpoint="/api/checkout"') || siteSource.includes("Pay by card")) {
  failures.push("public product pages must not expose a non-PayPal checkout path");
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
if (!homeBody.includes('<meta name="google-site-verification" content="hxvcDl32V0BA5LSTQx-OfIUE6DAIR6TrRp2pUbE5XZo">')) {
  failures.push("homepage must expose the exact Google Search Console verification tag");
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
