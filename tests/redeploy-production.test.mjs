import assert from "node:assert/strict";
import test from "node:test";
import { redeployProduction } from "../scripts/redeploy-production.mjs";

const env = { CLOUDFLARE_ACCOUNT_ID: "a".repeat(32), CLOUDFLARE_API_TOKEN: "test-token", GITHUB_SHA: "test-commit" };
const names = ["portfolio-wrapper.mjs", "index.js", "portfolio-ui.mjs", "foundry-promotion.mjs", "guide-discovery.mjs"];
const bytes = (name) => Buffer.from(`// fixture ${name}\nexport default {};\n`);
const settings = { bindings: [{ name: "FLAGSHIP", type: "flagship", app_id: "existing-app" }], compatibility_date: "2026-08-08", annotations: { deployment: "before" } };

function harness({ changeContentAt, changeSettingsAt, entrypoint = "portfolio-wrapper.mjs", trackedMismatch = false, extraModule = false, failUpload = false, staleAtUpload = false, missingEtag = false, uploadVersion } = {}) {
  let contentReads = 0, settingsReads = 0, uploadAttempts = 0;
  const uploads = [];
  async function fetchImpl(url, options) {
    assert.equal(new URL(url).origin, "https://api.cloudflare.com");
    assert.equal(options.redirect, "error");
    assert.equal(options.headers.authorization, "Bearer test-token");
    if (url.endsWith("/content/v2")) {
      contentReads++;
      const form = new FormData();
      for (const name of [...names, ...(extraModule ? ["newer-runtime.mjs"] : [])]) {
        const data = name === "index.js" && contentReads === changeContentAt ? Buffer.from("// concurrent update") : bytes(name);
        form.set(name, new Blob([data], { type: "application/javascript+module" }), name);
      }
      const response = new Response(form);
      response.headers.set("cf-entrypoint", entrypoint);
      if (!missingEtag) response.headers.set("etag", '"verified-content-etag"');
      return response;
    }
    if (url.endsWith("/settings")) {
      settingsReads++;
      const result = structuredClone(settings);
      if (settingsReads === changeSettingsAt) result.bindings = [];
      if (settingsReads === 3) result.annotations.deployment = "after";
      return Response.json({ success: true, result });
    }
    if (url.endsWith("/deployments")) {
      return Response.json({ success: true, result: { deployments: [{ id: "release-123", versions: [{ version_id: "version-123", percentage: 100 }] }] } });
    }
    assert.ok(url.endsWith("/content"));
    assert.equal(options.method, "PUT");
    assert.equal(options.headers["If-Match"], '"verified-content-etag"');
    uploadAttempts++;
    if (staleAtUpload) return new Response(null, { status: 412 });
    uploads.push(options.body);
    return Response.json({ success: !failUpload, result: { etag: "verified-content-etag", deployment_id: uploadVersion }, errors: failUpload ? [{ code: 10023 }] : [] });
  }
  return {
    uploads,
    get uploadAttempts() { return uploadAttempts; },
    run: () => redeployProduction({ env, fetchImpl, readFileImpl: async (url) => trackedMismatch ? Buffer.from("changed locally") : bytes(url.pathname.split("/").at(-1)) }),
  };
}

test("releases every verified module through content-only replacement and preserves runtime settings", async () => {
  const h = harness();
  const result = await h.run();
  assert.equal(result.deploymentId, "release-123");
  assert.equal(result.versionId, "version-123");
  assert.equal(result.sourceCommit, "test-commit");
  assert.equal(result.runtimeSettingsPreserved, true);
  assert.equal(h.uploads.length, 1);
  const upload = h.uploads[0];
  assert.deepEqual(JSON.parse(upload.get("metadata")), { main_module: "portfolio-wrapper.mjs" });
  assert.deepEqual([...upload.keys()].sort(), ["metadata", ...names].sort());
  for (const name of names) assert.deepEqual(Buffer.from(await upload.get(name).arrayBuffer()), bytes(name));
});

test("a concurrent content or settings change aborts before upload", async () => {
  for (const options of [{ changeContentAt: 2 }, { changeSettingsAt: 2 }]) {
    const h = harness(options);
    await assert.rejects(h.run(), /changed during verification/);
    assert.equal(h.uploads.length, 0);
  }
});

test("unknown entrypoints, new modules, and mismatched tracked content are never overwritten", async () => {
  for (const options of [{ entrypoint: "new-worker.js" }, { extraModule: true }, { trackedMismatch: true }]) {
    const h = harness(options);
    await assert.rejects(h.run(), /Unexpected|differs from this commit/);
    assert.equal(h.uploads.length, 0);
  }
});

test("verification detects changed content and bindings after upload without an unsafe automatic rollback", async () => {
  for (const options of [{ changeContentAt: 3 }, { changeSettingsAt: 3 }]) {
    const h = harness(options);
    await assert.rejects(h.run(), /Published content differs|Runtime settings changed/);
    assert.equal(h.uploads.length, 1);
  }
});

test("a rejected Cloudflare upload cannot report a successful release", async () => {
  const h = harness({ failUpload: true });
  await assert.rejects(h.run(), /rejected the request.*10023/);
  assert.equal(h.uploads.length, 1);
});

test("a change after preflight is rejected by the conditional upload without retry", async () => {
  const h = harness({ staleAtUpload: true });
  await assert.rejects(h.run(), /HTTP 412/);
  assert.equal(h.uploads.length, 0);
  assert.equal(h.uploadAttempts, 1);
});

test("missing ETag aborts instead of falling back to an unconditional write", async () => {
  const h = harness({ missingEtag: true });
  await assert.rejects(h.run(), /strong live content ETag/);
  assert.equal(h.uploads.length, 0);
});

test("maps the upload's compact version ID to the canonical deployment and version", async () => {
  const result = await harness({ uploadVersion: "version123" }).run();
  assert.equal(result.deploymentId, "release-123");
  assert.equal(result.versionId, "version-123");
});

test("a different latest version cannot be reported as this upload's deployment", async () => {
  await assert.rejects(harness({ uploadVersion: "other-version" }).run(), /canonical version differs/);
});
