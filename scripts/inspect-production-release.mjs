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
// This request cannot publish: it deliberately has no required main_module or
// files. A rejected precondition can establish whether If-Match is honored
// before body validation without uploading or replacing production content.
const response = await request("/content", {
  method: "PUT",
  headers: { "If-Match": '"definitely-not-the-current-worker-etag"', "Content-Type": "application/json" },
  body: "{}",
});
const body = await response.text();
let result;
try { result = JSON.parse(body); } catch { result = {}; }
console.log(JSON.stringify({ invalidPreconditionStatus: response.status, success: result.success, errorCodes: result.errors?.map((error) => error.code) }, null, 2));
if (response.ok) throw new Error("Unexpected acceptance of invalid upload body");
