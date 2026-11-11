import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

// Production has a newer private publisher runtime than src/index.js. This
// release only re-publishes verified existing content; it never uploads the
// legacy entry point, configuration, credentials, or database migrations.
const WORKER = "agentid-services-agent-system";
const ENTRYPOINT = "portfolio-wrapper.mjs";
const MODULES = ["foundry-promotion.mjs", "guide-discovery.mjs", "index.js", "portfolio-ui.mjs", ENTRYPOINT].sort();
const TRACKED = {
  "foundry-promotion.mjs": new URL("../publishing/foundry-2026-11-08/foundry-promotion.mjs", import.meta.url),
  "guide-discovery.mjs": new URL("../publishing/foundry-2026-11-09/guide-discovery.mjs", import.meta.url),
};
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
const manifest = ({ entrypoint, modules }) => ({
  entrypoint,
  modules: modules.map(({ name, bytes, type }) => ({ name, type, sha256: digest(bytes) })).sort((a, b) => a.name.localeCompare(b.name)),
});

function runtimeSettings(settings) {
  const copy = structuredClone(settings);
  // Cloudflare may update deployment annotations during content replacement.
  delete copy.annotations;
  if (copy.bindings) copy.bindings.sort((a, b) => a.name.localeCompare(b.name));
  return copy;
}

export async function redeployProduction({ env = process.env, fetchImpl = fetch, readFileImpl = readFile } = {}) {
  assert.match(env.CLOUDFLARE_ACCOUNT_ID || "", /^[a-f0-9]{32}$/, "A valid Cloudflare account ID is required");
  assert.ok(env.CLOUDFLARE_API_TOKEN, "CLOUDFLARE_API_TOKEN is required");
  const base = `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/workers/scripts/${WORKER}`;
  async function request(path, options = {}) {
    const response = await fetchImpl(base + path, {
      ...options,
      headers: { ...options.headers, authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}` },
      redirect: "error",
      signal: AbortSignal.timeout(60_000),
    });
    if (!response.ok) throw new Error(`Cloudflare ${options.method || "GET"} ${path} failed: HTTP ${response.status}`);
    return response;
  }
  async function json(path, options) {
    const body = await (await request(path, options)).json();
    if (body.success !== true) throw new Error(`Cloudflare ${path} rejected the request (codes: ${(body.errors || []).map((e) => e.code).join(",")})`);
    return body.result;
  }
  async function content() {
    const response = await request("/content/v2");
    const etag = response.headers.get("etag");
    assert.match(etag || "", /^"[^"\r\n]+"$/, "A strong live content ETag is required for conditional publication");
    assert.equal(response.headers.get("cf-entrypoint"), ENTRYPOINT, "Unexpected live entry point; refusing to overwrite production");
    assert.match(response.headers.get("content-type") || "", /^multipart\/form-data/i, "Expected a module Worker");
    const modules = [];
    for (const [name, file] of await response.formData()) {
      assert.ok(file instanceof Blob, "Expected a file for every Worker module");
      modules.push({ name, type: file.type, bytes: Buffer.from(await file.arrayBuffer()) });
    }
    assert.deepEqual(modules.map((m) => m.name).sort(), MODULES, "Unexpected module set; inspect the live release before proceeding");
    return { entrypoint: ENTRYPOINT, modules, etag };
  }
  async function snapshot() {
    const [code, settings] = await Promise.all([content(), json("/settings")]);
    return { ...code, settings };
  }
  const before = await snapshot();
  for (const [name, path] of Object.entries(TRACKED)) {
    assert.equal(digest(before.modules.find((m) => m.name === name).bytes), digest(await readFileImpl(path)), `Live ${name} differs from this commit; prepare a reviewed content release first`);
  }
  const expected = manifest(before);
  // Re-read immediately before upload. Never replay a stale captured release.
  const latest = await snapshot();
  assert.deepEqual(manifest(latest), expected, "Production content changed during verification; retry after review");
  assert.equal(latest.etag, before.etag, "Production ETag changed during verification; retry after review");
  assert.deepEqual(latest.settings, before.settings, "Production settings changed during verification; retry after review");
  const form = new FormData();
  form.set("metadata", JSON.stringify({ main_module: ENTRYPOINT }));
  for (const { name, bytes, type } of before.modules) form.set(name, new Blob([bytes], { type }), name);
  const release = await json("/content", { method: "PUT", headers: { "If-Match": before.etag }, body: form });
  assert.ok(typeof release.deployment_id === "string" && release.deployment_id.length > 0, "Upload response omitted the version ID; inspect production before any retry");
  const after = await snapshot();
  assert.deepEqual(manifest(after), expected, "Published content differs from the verified release; inspect production before any retry");
  assert.deepEqual(runtimeSettings(after.settings), runtimeSettings(before.settings), "Runtime settings changed; inspect production before any retry");
  const deployment = (await json("/deployments")).deployments?.[0];
  assert.ok(deployment?.id, "Cloudflare did not return a canonical deployment ID");
  assert.equal(deployment.versions?.length, 1, "Expected one fully deployed Worker version");
  assert.equal(deployment.versions[0].percentage, 100, "Expected the verified version to receive all traffic");
  assert.equal(deployment.versions[0].version_id.replaceAll("-", ""), release.deployment_id.replaceAll("-", ""), "The canonical version differs from the upload response");
  return {
    worker: WORKER,
    sourceCommit: env.GITHUB_SHA || null,
    deploymentId: deployment.id,
    versionId: deployment.versions[0].version_id,
    etag: release.etag || null,
    modifiedOn: release.modified_on || null,
    content: expected,
    runtimeSettingsPreserved: true,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    console.log(JSON.stringify(await redeployProduction(), null, 2));
  } catch (error) {
    // Assertion diffs can contain private settings. Emit only the message.
    console.error(error.message.split("\n")[0]);
    process.exitCode = 1;
  }
}
