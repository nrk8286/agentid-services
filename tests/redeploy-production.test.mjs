import assert from "node:assert/strict";
import test from "node:test";
import { redeployProduction } from "../scripts/redeploy-production.mjs";

const env = { CLOUDFLARE_ACCOUNT_ID: "a".repeat(32), CLOUDFLARE_API_TOKEN: "test-token", GITHUB_SHA: "test-commit" };
const names = ["portfolio-wrapper.mjs", "index.js", "portfolio-ui.mjs", "foundry-promotion.mjs", "guide-discovery.mjs"];
const themeNames = ["theme-wrapper.mjs", "publisher-theme.mjs", "publisher-water.mjs"];
const bytes = (name) => Buffer.from(`// fixture ${name}\nexport default {};\n`);
const settings = { bindings: [{ name: "FLAGSHIP", type: "flagship", app_id: "existing-app" }], compatibility_date: "2026-08-08", annotations: { deployment: "before" } };

function harness({ changeContentAt, changeSettingsAt, changedModule = "index.js", themed = false, entrypoint, trackedMismatch = false, themeMismatch, wrongThemeMime = false, extraModule = false, failUpload = false, staleAtUpload = false, missingEtag = false, uploadVersion = "version123" } = {}) {
  let contentReads = 0, settingsReads = 0, uploadAttempts = 0;
  const uploads = [], requests = [];
  async function fetchImpl(url, options) {
    assert.equal(new URL(url).origin, "https://api.cloudflare.com");
    assert.equal(options.redirect, "error");
    assert.equal(options.headers.authorization, "Bearer test-token");
    requests.push({ path: new URL(url).pathname.split("/agentid-services-agent-system")[1], method: options.method || "GET" });
    if (url.endsWith("/content/v2")) {
      assert.equal(options.method || "GET", "GET");
      contentReads++;
      const form = new FormData();
      for (const name of [...names, ...(themed ? themeNames : []), ...(extraModule ? ["newer-runtime.mjs"] : [])]) {
        const data = name === changedModule && contentReads === changeContentAt ? Buffer.from("// concurrent update") : bytes(name);
        const type = wrongThemeMime && name === "publisher-theme.mjs" ? "text/plain" : "application/javascript+module";
        form.set(name, new Blob([data], { type }), name);
      }
      const response = new Response(form);
      response.headers.set("cf-entrypoint", entrypoint || (themed ? "theme-wrapper.mjs" : "portfolio-wrapper.mjs"));
      if (!missingEtag) response.headers.set("etag", '"verified-content-etag"');
      return response;
    }
    if (url.endsWith("/settings")) {
      assert.equal(options.method || "GET", "GET", "No-op redeployment must not write runtime settings");
      settingsReads++;
      const result = structuredClone(settings);
      if (settingsReads === changeSettingsAt) result.bindings = [];
      if (settingsReads === 3) result.annotations.deployment = "after";
      return Response.json({ success: true, result });
    }
    if (url.endsWith("/deployments")) {
      assert.equal(options.method || "GET", "GET");
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
    uploads, requests,
    get uploadAttempts() { return uploadAttempts; },
    run: () => redeployProduction({ env, fetchImpl, readFileImpl: async (url) => {
      const name = url.pathname.split("/").at(-1);
      return trackedMismatch || name === themeMismatch ? Buffer.from("changed locally") : bytes(name);
    } }),
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

test("no-op redeployment retains the themed entrypoint and all eight modules unchanged", async () => {
  const h = harness({ themed: true });
  const result = await h.run();
  assert.equal(result.content.entrypoint, "theme-wrapper.mjs");
  assert.equal(result.runtimeSettingsPreserved, true);
  assert.equal(h.uploadAttempts, 1);
  const upload = h.uploads[0];
  assert.deepEqual(JSON.parse(upload.get("metadata")), { main_module: "theme-wrapper.mjs" });
  assert.deepEqual([...upload.keys()].sort(), ["metadata", ...names, ...themeNames].sort());
  for (const name of [...names, ...themeNames]) {
    assert.deepEqual(Buffer.from(await upload.get(name).arrayBuffer()), bytes(name));
    assert.equal(upload.get(name).type, "application/javascript+module");
  }
  assert.deepEqual(h.requests.filter((request) => request.method !== "GET"), [{ path: "/content", method: "PUT" }]);
});

test("no-op redeployment refuses changed theme digests, MIME types and mismatched entrypoints", async () => {
  for (const options of [
    ...themeNames.map((themeMismatch) => ({ themed: true, themeMismatch })),
    { themed: true, wrongThemeMime: true },
    { themed: true, entrypoint: "portfolio-wrapper.mjs" },
    { entrypoint: "theme-wrapper.mjs" },
  ]) {
    const h = harness(options);
    await assert.rejects(h.run(), /differs from this commit|Unexpected/);
    assert.equal(h.uploadAttempts, 0);
  }
});

test("a concurrent theme module change is refused before re-publication", async () => {
  const h = harness({ themed: true, changedModule: "publisher-water.mjs", changeContentAt: 2 });
  await assert.rejects(h.run(), /Production content changed during verification/);
  assert.equal(h.uploadAttempts, 0);
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

test("a missing upload version ID cannot report an uncorrelated deployment", async () => {
  const h = harness({ uploadVersion: null });
  await assert.rejects(h.run(), /omitted the version ID/);
  assert.equal(h.uploadAttempts, 1);
});
