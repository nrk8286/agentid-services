import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";
import { pathToFileURL } from "node:url";

// The publisher's private production modules are not the legacy src/ runtime.
// Fetch and retain their exact bytes. This release adds/removes only the three
// reviewed presentation modules and never uploads configuration or bindings.
const WORKER = "agentid-services-agent-system";
const MODULE_TYPE = "application/javascript+module";
export const PUBLISHER_BASE_ENTRYPOINT = "portfolio-wrapper.mjs";
export const PUBLISHER_THEME_ENTRYPOINT = "theme-wrapper.mjs";
export const PUBLISHER_BASE_MODULES = Object.freeze([
  "foundry-promotion.mjs", "guide-discovery.mjs", "index.js", "portfolio-ui.mjs", PUBLISHER_BASE_ENTRYPOINT,
].sort());
export const PUBLISHER_THEME_FILES = Object.freeze({
  "theme-wrapper.mjs": new URL("../publishing/dark-water-2026-11-17/theme-wrapper.mjs", import.meta.url),
  "publisher-theme.mjs": new URL("../publishing/dark-water-2026-11-17/publisher-theme.mjs", import.meta.url),
  "publisher-water.mjs": new URL("../publishing/dark-water-2026-11-17/publisher-water.mjs", import.meta.url),
});
const TRACKED_BASE = {
  "foundry-promotion.mjs": new URL("../publishing/foundry-2026-11-08/foundry-promotion.mjs", import.meta.url),
  "guide-discovery.mjs": new URL("../publishing/foundry-2026-11-09/guide-discovery.mjs", import.meta.url),
};
const THEMED_MODULES = [...PUBLISHER_BASE_MODULES, ...Object.keys(PUBLISHER_THEME_FILES)].sort();
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
const check = (condition, message) => { if (!condition) throw new Error(message); };
const manifest = ({ entrypoint, modules }) => ({
  entrypoint,
  modules: modules.map(({ name, bytes, type }) => ({ name, type, sha256: digest(bytes) }))
    .sort((a, b) => a.name.localeCompare(b.name)),
});

export function identifyPublisherRuntime({ entrypoint, modules }) {
  const names = modules.map((module) => module.name).sort();
  if (entrypoint === PUBLISHER_BASE_ENTRYPOINT && isDeepStrictEqual(names, PUBLISHER_BASE_MODULES)) return "baseline";
  if (entrypoint === PUBLISHER_THEME_ENTRYPOINT && isDeepStrictEqual(names, THEMED_MODULES)) return "themed";
  throw new Error("Unexpected production entry point or module set; inspect the live release before proceeding");
}

async function readTrackedFiles(readFileImpl, includeTheme) {
  const entries = Object.entries({ ...TRACKED_BASE, ...(includeTheme ? PUBLISHER_THEME_FILES : {}) });
  return new Map(await Promise.all(entries.map(async ([name, path]) => {
    const bytes = Buffer.from(await readFileImpl(path));
    check(bytes.length > 0, `Tracked ${name} is empty; refusing to publish`);
    return [name, bytes];
  })));
}

function verifyTrackedBytes(code, local, state) {
  const names = [...Object.keys(TRACKED_BASE), ...(state === "themed" ? Object.keys(PUBLISHER_THEME_FILES) : [])];
  for (const name of names) {
    const module = code.modules.find((candidate) => candidate.name === name);
    check(digest(module.bytes) === digest(local.get(name)), `Live ${name} differs from this commit; prepare a reviewed content release first`);
    if (name in PUBLISHER_THEME_FILES) check(module.type === MODULE_TYPE, `Unexpected module type for ${name}; inspect the live release before proceeding`);
  }
}

// The existing no-op redeployer can reuse this guard to recognize both exact
// supported states without weakening its byte-preservation requirements.
export async function verifyPublisherRuntime(code, { readFileImpl = readFile } = {}) {
  const state = identifyPublisherRuntime(code);
  const local = await readTrackedFiles(readFileImpl, state === "themed");
  verifyTrackedBytes(code, local, state);
  return state;
}

function runtimeSettings(settings) {
  const copy = structuredClone(settings);
  // Only Cloudflare-managed annotations may change during publication.
  delete copy.annotations;
  if (Array.isArray(copy.bindings)) copy.bindings.sort((a, b) => a.name.localeCompare(b.name));
  return copy;
}

function activeDeployment(result) {
  const deployment = result?.deployments?.[0];
  check(typeof deployment?.id === "string" && deployment.id.length > 0, "Cloudflare did not return a canonical deployment ID");
  check(deployment.versions?.length === 1 && deployment.versions[0].percentage === 100, "Expected one fully deployed Worker version; inspect traffic allocation before proceeding");
  check(typeof deployment.versions[0].version_id === "string" && deployment.versions[0].version_id.length > 0, "Cloudflare did not return a canonical version ID");
  return { id: deployment.id, versionId: deployment.versions[0].version_id };
}

export function parsePublisherThemeAction(args) {
  check(args.length === 1 && ["apply", "rollback"].includes(args[0]), "Specify exactly one release action: apply or rollback");
  return args[0];
}

export async function releasePublisherTheme({ action, env = process.env, fetchImpl = fetch, readFileImpl = readFile } = {}) {
  check(["apply", "rollback"].includes(action), "An explicit release action is required: apply or rollback");
  check(/^[a-f0-9]{32}$/.test(env.CLOUDFLARE_ACCOUNT_ID || ""), "A valid Cloudflare account ID is required");
  check(typeof env.CLOUDFLARE_API_TOKEN === "string" && env.CLOUDFLARE_API_TOKEN.length > 0, "CLOUDFLARE_API_TOKEN is required");
  const base = `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/workers/scripts/${WORKER}`;
  async function request(path, options = {}) {
    const response = await fetchImpl(base + path, {
      ...options,
      headers: { ...options.headers, authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}` },
      redirect: "error",
      signal: AbortSignal.timeout(60_000),
    });
    check(response.ok, `Cloudflare ${options.method || "GET"} ${path} failed: HTTP ${response.status}; inspect production before any retry`);
    return response;
  }
  async function json(path, options) {
    let body;
    try { body = await (await request(path, options)).json(); }
    catch (error) {
      if (error instanceof SyntaxError) throw new Error(`Cloudflare ${path} returned invalid JSON; inspect production before any retry`);
      throw error;
    }
    check(body.success === true, `Cloudflare ${path} rejected the request; inspect production before any retry`);
    return body.result;
  }
  async function content() {
    const response = await request("/content/v2");
    const etag = response.headers.get("etag");
    check(/^"[^"\r\n]+"$/.test(etag || ""), "A strong live content ETag is required for conditional publication");
    check(/^multipart\/form-data/i.test(response.headers.get("content-type") || ""), "Expected a module Worker");
    const modules = [];
    for (const [name, file] of await response.formData()) {
      check(file instanceof Blob, "Expected a file for every Worker module");
      modules.push({ name, type: file.type, bytes: Buffer.from(await file.arrayBuffer()) });
    }
    const code = { entrypoint: response.headers.get("cf-entrypoint"), modules, etag };
    identifyPublisherRuntime(code);
    return code;
  }
  async function snapshot() {
    const [code, settings, deployments] = await Promise.all([content(), json("/settings"), json("/deployments")]);
    check(settings && typeof settings === "object" && !Array.isArray(settings), "Expected runtime settings for preservation verification");
    return { ...code, settings, deployment: activeDeployment(deployments) };
  }

  const before = await snapshot();
  const state = identifyPublisherRuntime(before);
  const local = await readTrackedFiles(readFileImpl, action === "apply" || state === "themed");
  verifyTrackedBytes(before, local, state);
  const originalManifest = manifest(before);
  const desiredState = action === "apply" ? "themed" : "baseline";
  const changed = state !== desiredState;
  const target = action === "apply"
    ? { entrypoint: PUBLISHER_THEME_ENTRYPOINT, modules: state === "themed" ? before.modules : [
      ...before.modules,
      ...Object.keys(PUBLISHER_THEME_FILES).map((name) => ({ name, bytes: local.get(name), type: MODULE_TYPE })),
    ] }
    : { entrypoint: PUBLISHER_BASE_ENTRYPOINT, modules: before.modules.filter(({ name }) => !Object.hasOwn(PUBLISHER_THEME_FILES, name)) };
  identifyPublisherRuntime(target);
  const expected = manifest(target);

  // An exact second snapshot catches updates made while local files were read.
  const latest = await snapshot();
  check(isDeepStrictEqual(manifest(latest), originalManifest), "Production content changed during verification; inspect before retrying");
  check(latest.etag === before.etag, "Production ETag changed during verification; inspect before retrying");
  check(isDeepStrictEqual(latest.settings, before.settings), "Production settings changed during verification; inspect before retrying");
  check(isDeepStrictEqual(latest.deployment, before.deployment), "Production deployment changed during verification; inspect before retrying");

  let after = latest;
  let release = null;
  if (changed) {
    const form = new FormData();
    form.set("metadata", JSON.stringify({ main_module: target.entrypoint }));
    for (const { name, bytes, type } of target.modules) form.set(name, new Blob([bytes], { type }), name);
    // Never retry this write automatically. A 412 or an uncertain network
    // outcome requires a fresh inspection, not an unconditional replacement.
    release = await json("/content", { method: "PUT", headers: { "If-Match": before.etag }, body: form });
    check(typeof release?.deployment_id === "string" && release.deployment_id.length > 0, "Upload response omitted the version ID; inspect production before any retry");
    after = await snapshot();
    check(isDeepStrictEqual(manifest(after), expected), "Published content differs from the verified release; inspect production before any retry");
    check(isDeepStrictEqual(runtimeSettings(after.settings), runtimeSettings(before.settings)), "Runtime settings changed; inspect production before any retry");
    check(after.deployment.versionId.replaceAll("-", "") === release.deployment_id.replaceAll("-", ""), "The canonical version differs from this upload; inspect production before any retry");
  }

  return {
    worker: WORKER,
    action,
    changed,
    sourceCommit: env.GITHUB_SHA || null,
    previousDeploymentId: before.deployment.id,
    previousVersionId: before.deployment.versionId,
    deploymentId: after.deployment.id,
    versionId: after.deployment.versionId,
    etag: after.etag,
    modifiedOn: release?.modified_on || null,
    content: expected,
    privateModulesPreserved: true,
    runtimeSettingsPreserved: true,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const action = parsePublisherThemeAction(process.argv.slice(2));
    console.log(JSON.stringify(await releasePublisherTheme({ action }), null, 2));
  } catch (error) {
    // Do not include stack traces, provider bodies, private source, or settings.
    console.error(error.message.split("\n")[0]);
    process.exitCode = 1;
  }
}
