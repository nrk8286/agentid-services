const base = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/workers/scripts/agentid-services-agent-system`;
const headers = { authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}` };
async function request(path, options = {}) {
  return fetch(base + path, { ...options, headers: { ...headers, ...options.headers }, redirect: "error", signal: AbortSignal.timeout(15000) });
}
const content = await request("/content/v2");
if (!content.ok) throw new Error(`Content inspection failed: ${content.status}`);
const etag = content.headers.get("etag");
await content.body.cancel();
const deployments = await (await request("/deployments")).json();
if (!deployments.success) throw new Error("Deployment inspection failed");
const latest = deployments.result?.deployments?.[0];
console.log(JSON.stringify({ etag, latestDeployment: latest && { id: latest.id, created_on: latest.created_on, versions: latest.versions } }, null, 2));
// Valid multipart framing gets past media-type validation. The module has a
// deliberate syntax error, so it cannot become an executable Worker even if
// the provider ignores the stale If-Match condition.
const invalidUpload = new FormData();
invalidUpload.set("metadata", JSON.stringify({ main_module: "unpublishable-probe.mjs" }));
invalidUpload.set("unpublishable-probe.mjs", new Blob(["export default { fetch( };"], { type: "application/javascript+module" }), "unpublishable-probe.mjs");
const response = await request("/content", {
  method: "PUT",
  headers: { "If-Match": '"definitely-not-the-current-worker-etag"' },
  body: invalidUpload,
});
const body = await response.text();
let result;
try { result = JSON.parse(body); } catch { result = {}; }
console.log(JSON.stringify({ invalidPreconditionStatus: response.status, success: result.success, errorCodes: result.errors?.map((error) => error.code) }, null, 2));
if (response.ok) throw new Error("Unexpected acceptance of invalid upload body");
const afterContent = await request("/content/v2");
const afterEtag = afterContent.headers.get("etag");
await afterContent.body.cancel();
const afterDeployments = await (await request("/deployments")).json();
if (!afterContent.ok || !afterDeployments.success || afterEtag !== etag || afterDeployments.result?.deployments?.[0]?.id !== latest?.id) {
  throw new Error("Production changed during the conditional-request probe; inspect before continuing");
}
console.log("Verified the probe did not change production content or deployment");
if (response.status !== 412) throw new Error("Conditional publication support is unverified: expected HTTP 412");
