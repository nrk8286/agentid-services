import assert from "node:assert/strict";
import test from "node:test";
import {
  identifyPublisherRuntime,
  parsePublisherThemeAction,
  PUBLISHER_BASE_ENTRYPOINT,
  PUBLISHER_BASE_MODULES,
  PUBLISHER_THEME_ENTRYPOINT,
  PUBLISHER_THEME_FILES,
  releasePublisherTheme,
  verifyPublisherRuntime,
} from "../scripts/release-publisher-theme.mjs";

const env = { CLOUDFLARE_ACCOUNT_ID: "a".repeat(32), CLOUDFLARE_API_TOKEN: "fixture-token", GITHUB_SHA: "reviewed-commit" };
const type = "application/javascript+module";
const themeNames = Object.keys(PUBLISHER_THEME_FILES);
const fixtureBytes = (name) => Buffer.from(`// fixture ${name}\nexport default { marker: "private-runtime-fixture" };\n`);
const fixtureSettings = {
  bindings: [
    { name: "SECRET", type: "secret_text", text: "private-settings-fixture" },
    { name: "DATABASE", type: "d1", id: "existing-database" },
  ],
  compatibility_date: "2026-08-08",
  annotations: { deployment: "original" },
};

function harness(options = {}) {
  const names = [...PUBLISHER_BASE_MODULES, ...(options.themed ? themeNames : [])];
  let live = {
    entrypoint: options.entrypoint || (options.themed ? PUBLISHER_THEME_ENTRYPOINT : PUBLISHER_BASE_ENTRYPOINT),
    modules: names.map((name) => ({ name, type, bytes: fixtureBytes(name) })),
    etag: '"original-etag"',
  };
  let deployment = { id: "original-deployment", versions: [{ version_id: "original-version", percentage: 100 }] };
  let contentReads = 0, settingsReads = 0, deploymentReads = 0, uploadAttempts = 0;
  const uploads = [], requests = [];
  const cloneCode = () => ({ ...live, modules: live.modules.map((module) => ({ ...module, bytes: Buffer.from(module.bytes) })) });
  async function fetchImpl(url, request) {
    assert.equal(new URL(url).origin, "https://api.cloudflare.com");
    assert.equal(request.redirect, "error");
    assert.equal(request.headers.authorization, "Bearer fixture-token");
    assert.ok(request.signal instanceof AbortSignal);
    const path = new URL(url).pathname.split("/agentid-services-agent-system")[1];
    const method = request.method || "GET";
    requests.push({ path, method });
    if (path === "/content/v2") {
      assert.equal(method, "GET");
      contentReads++;
      const code = cloneCode();
      if (contentReads === options.changeContentAt) code.modules.find((module) => module.name === "index.js").bytes = Buffer.from("concurrent private change");
      if (options.extraModule) code.modules.push({ name: "unknown-runtime.mjs", bytes: fixtureBytes("unknown-runtime.mjs"), type });
      if (options.missingModule) code.modules = code.modules.filter((module) => module.name !== options.missingModule);
      if (options.wrongThemeMime && options.themed) code.modules.find((module) => module.name === "publisher-theme.mjs").type = "text/plain";
      const form = new FormData();
      for (const { name, bytes, type: mime } of code.modules) form.append(name, new Blob([bytes], { type: mime }), name);
      if (options.duplicateModule) form.append("index.js", new Blob([fixtureBytes("index.js")], { type }), "index.js");
      const response = new Response(form);
      response.headers.set("cf-entrypoint", code.entrypoint);
      if (!options.missingEtag) response.headers.set("etag", options.weakEtag ? 'W/"weak"' : contentReads === options.changeEtagAt ? '"concurrent-etag"' : code.etag);
      return response;
    }
    if (path === "/settings") {
      assert.equal(method, "GET", "The release must never write runtime settings");
      settingsReads++;
      const settings = structuredClone(fixtureSettings);
      if (uploads.length > 0) {
        settings.annotations.deployment = "provider-managed-change";
        settings.bindings.reverse();
      }
      if (settingsReads === options.changeSettingsAt) settings.bindings = [];
      return Response.json({ success: true, result: settings });
    }
    if (path === "/deployments") {
      assert.equal(method, "GET");
      deploymentReads++;
      const current = structuredClone(deployment);
      if (deploymentReads === options.changeDeploymentAt) current.id = "concurrent-deployment";
      if (options.splitTraffic) current.versions = [{ version_id: "one", percentage: 90 }, { version_id: "two", percentage: 10 }];
      if (uploads.length && options.wrongPublishedVersion) current.versions[0].version_id = "another-version";
      return Response.json({ success: true, result: { deployments: [current] } });
    }
    assert.equal(path, "/content", "Only the content replacement endpoint may be mutated");
    assert.equal(method, "PUT");
    assert.equal(request.headers["If-Match"], '"original-etag"');
    uploadAttempts++;
    if (options.staleAtUpload) return new Response(null, { status: 412 });
    if (options.networkFailureAtUpload) throw new Error("network outcome uncertain");
    if (options.providerRejectsUpload) return Response.json({ success: false, errors: [{ code: 10023, message: "private-provider-message" }] });
    const form = request.body;
    uploads.push(form);
    const metadata = JSON.parse(form.get("metadata"));
    assert.deepEqual(Object.keys(metadata), ["main_module"], "Upload metadata must not contain bindings, secrets, routes or configuration");
    const modules = [];
    for (const [name, file] of form) {
      if (name !== "metadata") modules.push({ name, type: file.type, bytes: Buffer.from(await file.arrayBuffer()) });
    }
    live = { entrypoint: metadata.main_module, modules, etag: '"published-etag"' };
    deployment = { id: "new-deployment", versions: [{ version_id: "new-version", percentage: 100 }] };
    return Response.json({ success: true, result: { deployment_id: options.omitUploadVersion ? undefined : "newversion", modified_on: "2026-11-17T23:00:00Z" } });
  }
  const readFileImpl = async (url) => {
    const name = url.pathname.split("/").at(-1);
    if (name === options.localMismatch) return Buffer.from("different local revision");
    if (name === options.emptyLocalFile) return Buffer.alloc(0);
    return fixtureBytes(name);
  };
  return {
    uploads, requests, readFileImpl, cloneCode,
    get uploadAttempts() { return uploadAttempts; },
    run: (action = "apply") => releasePublisherTheme({ action, env, fetchImpl, readFileImpl }),
  };
}

test("apply adds exactly three modules and preserves all five live modules and settings", async () => {
  const h = harness();
  const result = await h.run();
  assert.equal(result.action, "apply");
  assert.equal(result.changed, true);
  assert.equal(result.sourceCommit, "reviewed-commit");
  assert.equal(result.previousDeploymentId, "original-deployment");
  assert.equal(result.previousVersionId, "original-version");
  assert.equal(result.deploymentId, "new-deployment");
  assert.equal(result.versionId, "new-version");
  assert.equal(result.etag, '"published-etag"');
  assert.equal(result.privateModulesPreserved, true);
  assert.equal(result.runtimeSettingsPreserved, true);
  assert.equal(h.uploadAttempts, 1);
  const upload = h.uploads[0];
  assert.deepEqual(JSON.parse(upload.get("metadata")), { main_module: PUBLISHER_THEME_ENTRYPOINT });
  assert.deepEqual([...upload.keys()].sort(), ["metadata", ...PUBLISHER_BASE_MODULES, ...themeNames].sort());
  for (const name of [...PUBLISHER_BASE_MODULES, ...themeNames]) {
    assert.deepEqual(Buffer.from(await upload.get(name).arrayBuffer()), fixtureBytes(name));
    assert.equal(upload.get(name).type, type);
  }
  assert.deepEqual(h.requests.filter((request) => request.method !== "GET"), [{ path: "/content", method: "PUT" }]);
  assert.doesNotMatch(JSON.stringify(result), /private-runtime-fixture|private-settings-fixture|fixture-token/);
});

test("rollback removes only the three reviewed modules and restores the original entrypoint", async () => {
  const h = harness({ themed: true });
  const result = await h.run("rollback");
  assert.equal(result.action, "rollback");
  assert.equal(result.changed, true);
  assert.equal(result.content.entrypoint, PUBLISHER_BASE_ENTRYPOINT);
  const upload = h.uploads[0];
  assert.deepEqual(JSON.parse(upload.get("metadata")), { main_module: PUBLISHER_BASE_ENTRYPOINT });
  assert.deepEqual([...upload.keys()].sort(), ["metadata", ...PUBLISHER_BASE_MODULES].sort());
  for (const name of PUBLISHER_BASE_MODULES) assert.deepEqual(Buffer.from(await upload.get(name).arrayBuffer()), fixtureBytes(name));
  assert.deepEqual(h.requests.filter((request) => request.method !== "GET"), [{ path: "/content", method: "PUT" }]);
});

test("an exact already-desired runtime is a verified no-op for apply and rollback", async () => {
  for (const [themed, action] of [[true, "apply"], [false, "rollback"]]) {
    const h = harness({ themed });
    const result = await h.run(action);
    assert.equal(result.changed, false);
    assert.equal(result.deploymentId, "original-deployment");
    assert.equal(result.versionId, "original-version");
    assert.equal(h.uploadAttempts, 0);
    assert.ok(h.requests.every((request) => request.method === "GET"));
    assert.equal(h.requests.filter((request) => request.path === "/content/v2").length, 2);
  }
});

test("requires an explicit action before accessing credentials, local files or the network", async () => {
  assert.equal(parsePublisherThemeAction(["apply"]), "apply");
  assert.equal(parsePublisherThemeAction(["rollback"]), "rollback");
  for (const args of [[], ["deploy"], ["apply", "rollback"], ["apply", "--force"]]) {
    assert.throws(() => parsePublisherThemeAction(args), /exactly one release action/);
  }
  for (const action of [undefined, "", "deploy"]) {
    await assert.rejects(releasePublisherTheme({ action, env: null, fetchImpl: () => assert.fail("network must not run"), readFileImpl: () => assert.fail("files must not be read") }), /explicit release action/);
  }
});

test("unknown, partial, duplicate and wrong-entrypoint module sets are refused", async () => {
  for (const options of [
    { extraModule: true },
    { missingModule: "portfolio-ui.mjs" },
    { duplicateModule: true },
    { entrypoint: "unknown.mjs" },
    { entrypoint: PUBLISHER_THEME_ENTRYPOINT },
    { themed: true, entrypoint: PUBLISHER_BASE_ENTRYPOINT },
    { themed: true, missingModule: "publisher-water.mjs" },
  ]) {
    const h = harness(options);
    await assert.rejects(h.run(), /Unexpected production entry point or module set/);
    assert.equal(h.uploadAttempts, 0);
  }
});

test("tracked baseline content and active theme digests must match the reviewed commit", async () => {
  for (const options of [
    { localMismatch: "foundry-promotion.mjs" },
    { localMismatch: "guide-discovery.mjs" },
    ...themeNames.map((name) => ({ themed: true, localMismatch: name })),
    { themed: true, wrongThemeMime: true },
    { emptyLocalFile: "publisher-theme.mjs" },
  ]) {
    const h = harness(options);
    await assert.rejects(h.run(), /differs from this commit|Unexpected module type|is empty/);
    assert.equal(h.uploadAttempts, 0);
  }
  const rollback = harness({ themed: true, localMismatch: "publisher-water.mjs" });
  await assert.rejects(rollback.run("rollback"), /differs from this commit/);
  assert.equal(rollback.uploadAttempts, 0);
});

test("content, ETag, settings or deployment changes between snapshots prevent publication", async () => {
  for (const options of [
    { changeContentAt: 2 }, { changeEtagAt: 2 }, { changeSettingsAt: 2 }, { changeDeploymentAt: 2 },
  ]) {
    const h = harness(options);
    await assert.rejects(h.run(), /changed during verification/);
    assert.equal(h.uploadAttempts, 0);
  }
});

test("missing or weak ETags and split traffic allocations fail closed", async () => {
  for (const options of [{ missingEtag: true }, { weakEtag: true }, { splitTraffic: true }]) {
    const h = harness(options);
    await assert.rejects(h.run(), /strong live content ETag|one fully deployed Worker version/);
    assert.equal(h.uploadAttempts, 0);
  }
});

test("a stale conditional upload or uncertain transport result is never automatically retried", async () => {
  for (const options of [{ staleAtUpload: true }, { networkFailureAtUpload: true }]) {
    const h = harness(options);
    await assert.rejects(h.run(), /HTTP 412|network outcome uncertain/);
    assert.equal(h.uploadAttempts, 1);
    assert.equal(h.uploads.length, 0);
  }
});

test("provider rejection cannot become a success or expose provider details", async () => {
  const h = harness({ providerRejectsUpload: true });
  await assert.rejects(h.run(), (error) => {
    assert.match(error.message, /rejected the request/);
    assert.doesNotMatch(error.message, /private-provider-message|private-settings-fixture|fixture-token/);
    return true;
  });
  assert.equal(h.uploadAttempts, 1);
});

test("post-upload content, settings or version mismatches abort without automatic rollback", async () => {
  for (const options of [
    { changeContentAt: 3 }, { changeSettingsAt: 3 }, { wrongPublishedVersion: true }, { omitUploadVersion: true },
  ]) {
    const h = harness(options);
    await assert.rejects(h.run(), (error) => {
      assert.match(error.message, /Published content differs|Runtime settings changed|canonical version differs|omitted the version ID/);
      assert.doesNotMatch(error.message, /private-settings-fixture|private-runtime-fixture/);
      return true;
    });
    assert.equal(h.uploadAttempts, 1);
    assert.equal(h.uploads.length, 1);
  }
});

test("reusable recognition and digest guard accepts only the exact baseline or themed runtime", async () => {
  for (const themed of [false, true]) {
    const h = harness({ themed });
    const code = h.cloneCode();
    assert.equal(identifyPublisherRuntime(code), themed ? "themed" : "baseline");
    assert.equal(await verifyPublisherRuntime(code, { readFileImpl: h.readFileImpl }), themed ? "themed" : "baseline");
  }
  const bad = harness({ themed: true, localMismatch: "theme-wrapper.mjs" });
  await assert.rejects(verifyPublisherRuntime(bad.cloneCode(), { readFileImpl: bad.readFileImpl }), /differs from this commit/);
});
