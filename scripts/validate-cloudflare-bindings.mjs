import { readFileSync } from "node:fs";
import {
  handleAgentIdSiteRequest,
  sendCustomerTransactionalEmail,
  sendOwnerTransactionalEmail,
} from "../src/agentid-site.js";

const raw = readFileSync(new URL("../wrangler.jsonc", import.meta.url), "utf8");
const runtimeMigration = readFileSync(new URL("../migrations/0004_agent_runtime.sql", import.meta.url), "utf8");
const workerSource = readFileSync(new URL("../src/index.js", import.meta.url), "utf8");
const siteSource = readFileSync(new URL("../src/agentid-site.js", import.meta.url), "utf8");
const failures = [];

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

if (!/"GMAIL_SENDER_EMAIL"\s*:\s*"nrk8286@gmail\.com"/.test(raw)) {
  failures.push("GMAIL_SENDER_EMAIL must identify the account authorized by the Gmail OAuth adapter");
}

if (
  !workerSource.includes("deliverAndRecordPaypalCustomerEmail(env, paidOrder)")
  || !workerSource.includes("emailSent: Boolean(fulfilledOrder.emailDelivery?.delivered)")
) {
  failures.push("completed PayPal orders must invoke and report the customer transactional-email adapter");
}

if (!/"name"\s*:\s*"FORM_RATE_LIMITER"[\s\S]{0,180}?"limit"\s*:\s*5[\s\S]{0,80}?"period"\s*:\s*60/.test(raw)) {
  failures.push("FORM_RATE_LIMITER native binding is missing or has the wrong limit");
}

if (!/"name"\s*:\s*"EVENT_RATE_LIMITER"[\s\S]{0,180}?"limit"\s*:\s*60[\s\S]{0,80}?"period"\s*:\s*60/.test(raw)) {
  failures.push("EVENT_RATE_LIMITER native binding is missing or has the wrong limit");
}

const routePatterns = [...raw.matchAll(/"pattern"\s*:\s*"([^"]+)"/g)].map((match) => match[1]);
for (const requiredPattern of ["gptmarketplus.com", "www.gptmarketplus.com", "agentid.services/*", "www.agentid.services/*"]) {
  if (!routePatterns.includes(requiredPattern)) failures.push(`missing production route: ${requiredPattern}`);
}
if (!/"SITE_URL"\s*:\s*"https:\/\/gptmarketplus\.com"/.test(raw)) failures.push("SITE_URL must use the .com canonical origin");
if (!/"STORAGE_SCOPE"\s*:\s*"agentid\.services"/.test(raw)) failures.push("STORAGE_SCOPE must preserve the existing production data namespace during migration");

if (!runtimeMigration.includes("CREATE TABLE IF NOT EXISTS agent_state") || !runtimeMigration.includes("CREATE TABLE IF NOT EXISTS agent_tasks")) {
  failures.push("0004_agent_runtime.sql must provision agent_state and agent_tasks");
}

if (/\b(?:d1SchemaPromise|schemaPromise)\b/.test(`${workerSource}\n${siteSource}`)) {
  failures.push("Worker source must not keep request-bound D1 promises in module scope");
}

if (!siteSource.includes('} else if (analyticsId.startsWith("G-")) {')) {
  failures.push("Google Analytics fallback must not load beside Google Tag Manager");
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
  { SITE_URL: "https://gptmarketplus.com", SUPPORT_EMAIL: "admin@gptmarketplus.com", BRAND_NAME: "GPTMarketPlus" },
  { waitUntil() {} },
);
const homeBody = await homeResponse.text();
if (!homeBody.includes('<meta name="google-site-verification" content="hxvcDl32V0BA5LSTQx-OfIUE6DAIR6TrRp2pUbE5XZo">')) {
  failures.push("homepage must expose the exact Google Search Console verification tag");
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
