import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { copyFile, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import vm from "node:vm";
import { Log, LogLevel, Miniflare } from "miniflare";
import { THEME_CSS, THEME_VERSION } from "../publishing/dark-water-2026-11-17/publisher-theme.mjs";
import { WATER_SCRIPT } from "../publishing/dark-water-2026-11-17/publisher-water.mjs";

const html = '<!doctype html><html lang="en"><head><title>Existing publisher</title></head><body><main><h1>Keep the content</h1><form action="/api/paypal/order" method="post"><button>Continue</button></form><script nonce="existing-nonce">window.existing = true;</script></main></body></html>';
const csp = "default-src 'self'; script-src 'self' 'nonce-existing-nonce'; style-src 'self'; object-src 'none'";
let directory;
let worker;
let themeModule;
let originalModule;

before(async () => {
  directory = await mkdtemp(join(tmpdir(), "gmp-theme-test-"));
  await Promise.all(["theme-wrapper.mjs", "publisher-theme.mjs", "publisher-water.mjs"].map((name) => copyFile(new URL(`../publishing/dark-water-2026-11-17/${name}`, import.meta.url), join(directory, name))));
  // This independent upstream fixture never imports private production code.
  await writeFile(join(directory, "portfolio-wrapper.mjs"), `
    export class AgentScheduler { marker() { return "original durable object"; } }
    export function originalExport() { return "retained"; }
    export default {
      marker: "original worker",
      scheduled(controller, env) { env.events.push("scheduled"); },
      queue(batch, env) { env.events.push("queue"); },
      async fetch(request) {
        const url = new URL(request.url);
        const headers = new Headers({
          "content-type": "text/html; charset=utf-8",
          "cache-control": url.pathname === "/private" ? "private, no-store" : "no-store",
          "content-security-policy": ${JSON.stringify(csp)},
          "referrer-policy": "no-referrer",
          "x-upstream-this": this.marker,
          "etag": '"original-etag"',
          "content-length": ${JSON.stringify(String(Buffer.byteLength(html)))},
          "content-md5": "original-digest",
          "digest": "sha-256=original-digest"
        });
        let body = ${JSON.stringify(html)};
        if (url.pathname === "/data") { body = '{"ok":true}'; headers.set("content-type", "application/json"); headers.delete("content-length"); }
        if (url.pathname === "/download") headers.set("content-disposition", "attachment; filename=report.html");
        const status = url.pathname === "/missing" ? 404 : url.pathname === "/redirect" ? 302 : 200;
        if (status === 302) headers.set("location", "/guides");
        return new Response(request.method === "HEAD" ? null : body, { status, headers });
      }
    };
  `);
  themeModule = await import(pathToFileURL(join(directory, "theme-wrapper.mjs")).href);
  originalModule = await import(pathToFileURL(join(directory, "portfolio-wrapper.mjs")).href);
  const modules = Object.fromEntries(await Promise.all(["theme-wrapper.mjs", "publisher-theme.mjs", "publisher-water.mjs", "portfolio-wrapper.mjs"].map(async (name) => [name, { type: "esm", contents: await readFile(join(directory, name), "utf8") }])));
  worker = new Miniflare({
    workers: [{ config: { name: "publisher-theme-test", compatibilityDate: "2026-08-08", manifest: { mainModule: "theme-wrapper.mjs", modulesRoot: directory, modules } } }],
    cf: false,
    telemetry: { enabled: false },
    log: new Log(LogLevel.ERROR),
  });
  await worker.ready;
});

after(async () => {
  await worker?.dispose();
  if (directory) await rm(directory, { recursive: true, force: true });
});

test("real Worker HTMLRewriter themes public pages while preserving content, CSP, and no-store", async () => {
  for (const host of ["gptmarketplus.com", "www.gptmarketplus.com"]) {
    const response = await worker.dispatchFetch(`https://${host}/guides/example`);
    const text = await response.text();
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("x-gptmarketplus-theme"), THEME_VERSION);
    assert.equal(response.headers.get("content-security-policy"), csp);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(response.headers.get("referrer-policy"), "no-referrer");
    assert.equal(response.headers.get("x-upstream-this"), "original worker");
    for (const name of ["etag", "content-md5", "digest"]) assert.equal(response.headers.get(name), null);
    assert.match(text, /<html lang="en" data-gmp-theme="dark-water">/);
    assert.match(text, /<h1>Keep the content<\/h1>/);
    assert.match(text, /<form action="\/api\/paypal\/order" method="post"><button>Continue<\/button><\/form>/);
    assert.match(text, /<script nonce="existing-nonce">window\.existing = true;<\/script>/);
    assert.equal(text.match(/<link rel="stylesheet" href="\/__gmp\/dark-water\.css\?v=/g)?.length, 1);
    assert.equal(text.match(/<script src="\/__gmp\/water\.js\?v=/g)?.length, 1);
    assert.match(text, /water\.js\?v=[^"]+" defer><\/script>/);
    assert.match(text, /<meta name="color-scheme" content="dark">/);
  }
});

test("private, payment, API, error, download, and other-domain responses pass through", async () => {
  const cases = [
    ["https://agentid.services/", {}],
    ["https://agentid.life/", {}],
    ["https://gptmarketplus.com/api/paypal/orders", {}],
    ["https://gptmarketplus.com/api", {}],
    ["https://gptmarketplus.com/launch-kit/workspace", {}],
    ["https://gptmarketplus.com/launch-kit/workspace/example", {}],
    ["https://gptmarketplus.com/checkout", {}],
    ["https://gptmarketplus.com/checkout/success", {}],
    ["https://gptmarketplus.com/admin", {}],
    ["https://gptmarketplus.com/dashboard", {}],
    ["https://gptmarketplus.com/customer/example", {}],
    ["https://gptmarketplus.com/workspace/example", {}],
    ["https://gptmarketplus.com/private", {}],
    ["https://gptmarketplus.com/download", {}],
    ["https://gptmarketplus.com/missing", {}],
    ["https://gptmarketplus.com/redirect", { redirect: "manual" }],
    ["https://gptmarketplus.com/guides/example", { method: "POST" }],
  ];
  for (const [url, options] of cases) {
    const actual = await worker.dispatchFetch(url, options);
    const expected = await originalModule.default.fetch(new Request(url, options));
    assert.equal(actual.status, expected.status, url);
    assert.equal(actual.headers.get("x-gptmarketplus-theme"), null, url);
    assert.equal(actual.headers.get("etag"), '"original-etag"', url);
    assert.equal(actual.headers.get("cache-control"), expected.headers.get("cache-control"), url);
    assert.equal(await actual.text(), await expected.text(), url);
  }
  const json = await worker.dispatchFetch("https://gptmarketplus.com/data");
  assert.equal(json.headers.get("x-gptmarketplus-theme"), null);
  assert.deepEqual(await json.json(), { ok: true });
  const head = await worker.dispatchFetch("https://gptmarketplus.com/guides/example", { method: "HEAD" });
  assert.equal(head.headers.get("x-gptmarketplus-theme"), null);
  assert.equal(await head.text(), "");
});

test("theme assets support GET and HEAD on the publisher hosts only", async () => {
  for (const host of ["gptmarketplus.com", "www.gptmarketplus.com"]) {
    for (const [path, type, content] of [["dark-water.css", "text/css", THEME_CSS], ["water.js", "text/javascript", WATER_SCRIPT]]) {
      const url = `https://${host}/__gmp/${path}?v=${THEME_VERSION}`;
      const get = await worker.dispatchFetch(url);
      assert.equal(get.status, 200);
      assert.ok(get.headers.get("content-type").startsWith(type));
      assert.equal(get.headers.get("x-content-type-options"), "nosniff");
      assert.equal(await get.text(), content);
      const head = await worker.dispatchFetch(url, { method: "HEAD" });
      assert.equal(head.status, 200);
      assert.equal(head.headers.get("content-type"), get.headers.get("content-type"));
      assert.equal(await head.text(), "");
      const post = await worker.dispatchFetch(url, { method: "POST" });
      assert.equal(post.status, 405);
      assert.equal(post.headers.get("allow"), "GET, HEAD");
    }
  }
  const other = await worker.dispatchFetch("https://agentid.services/__gmp/water.js");
  assert.match(other.headers.get("content-type"), /^text\/html/);
  assert.equal(await other.text(), html);
});

test("queue, scheduled handlers, and named Durable Object exports retain their identities", () => {
  assert.equal(themeModule.default.queue, originalModule.default.queue);
  assert.equal(themeModule.default.scheduled, originalModule.default.scheduled);
  assert.equal(themeModule.AgentScheduler, originalModule.AgentScheduler);
  assert.equal(themeModule.originalExport, originalModule.originalExport);
  assert.equal(themeModule.originalExport(), "retained");
  const env = { events: [] };
  themeModule.default.queue({}, env, {});
  themeModule.default.scheduled({}, env, {});
  assert.deepEqual(env.events, ["queue", "scheduled"]);
});

function luminance(hex) {
  const rgb = hex.slice(1).match(/../g).map((channel) => parseInt(channel, 16) / 255).map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}

test("the actual primary palette meets normal-text contrast on every reading surface", () => {
  const tokens = Object.fromEntries([...THEME_CSS.matchAll(/(--gmp-[\w-]+):\s*(#[\da-f]{6});/gi)].map((match) => [match[1], match[2]]));
  const pairs = ["--gmp-text", "--gmp-muted", "--gmp-accent"].flatMap((ink) => ["--gmp-bg", "--gmp-panel", "--gmp-raised"].map((surface) => [ink, surface]));
  pairs.push(["--gmp-button-ink", "--gmp-accent"]);
  for (const [ink, surface] of pairs) {
    assert.ok(tokens[ink] && tokens[surface], `Missing palette token ${ink} or ${surface}`);
    const values = [luminance(tokens[ink]), luminance(tokens[surface])].sort((a, b) => b - a);
    const ratio = (values[0] + 0.05) / (values[1] + 0.05);
    assert.ok(ratio >= 4.5, `${ink} on ${surface}: ${ratio.toFixed(2)}:1 is below 4.5:1`);
  }
});

function waterHarness({ reduced = false, fine = true } = {}) {
  let now = 0;
  let nextFrame = 1;
  let strokes = 0;
  const frames = new Map();
  const events = new Map();
  const documentEvents = new Map();
  const media = new Map();
  const children = [];
  const attributes = new Map();
  const gradient = { addColorStop() {} };
  const drawing = { setTransform() {}, clearRect() {}, createRadialGradient: () => gradient, createLinearGradient: () => gradient, fillRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, closePath() {}, stroke() { strokes++; } };
  const document = {
    hidden: false,
    documentElement: { hasAttribute: (key) => attributes.has(key), setAttribute: (key, value) => attributes.set(key, value) },
    body: { prepend(node) { children.push(node); } },
    createElement() { return { style: {}, setAttribute() {}, getContext: () => drawing, remove() { children.splice(children.indexOf(this), 1); } }; },
    addEventListener: (type, listener) => documentEvents.set(type, listener),
    removeEventListener: (type) => documentEvents.delete(type),
  };
  const window = {
    innerWidth: 1920, innerHeight: 1080, devicePixelRatio: 3,
    matchMedia(query) { const value = { matches: query.includes("reduced") ? reduced : fine, addEventListener(type, handler) { this.change = handler; } }; media.set(query, value); return value; },
    addEventListener: (type, listener) => events.set(type, listener),
    removeEventListener: (type) => events.delete(type),
    requestAnimationFrame(callback) { const id = nextFrame++; frames.set(id, callback); return id; },
    cancelAnimationFrame: (id) => frames.delete(id),
  };
  const context = vm.createContext({ document, window, performance: { now: () => now } });
  vm.runInContext(WATER_SCRIPT, context);
  return {
    document, events, documentEvents, media, children, frames,
    get strokes() { return strokes; },
    move(time = now, type = "mouse") { now = time; events.get("pointermove")?.({ clientX: 300, clientY: 300, pointerType: type }); },
    tick(time) { now = time; for (const [id, callback] of [...frames]) { frames.delete(id); callback(time); } },
    repeat() { vm.runInContext(WATER_SCRIPT, context); },
  };
}

test("water wakes on a fine pointer, renders, and completely stops after fading", () => {
  const water = waterHarness();
  assert.equal(water.children.length, 1);
  assert.match(water.children[0].style.cssText, /pointer-events:none/);
  assert.ok(water.children[0].width * water.children[0].height < 2404000);
  assert.equal(water.frames.size, 0);
  water.move(0, "touch");
  assert.equal(water.frames.size, 0);
  water.move();
  assert.equal(water.frames.size, 1);
  for (let time = 17; time <= 1800; time += 17) water.tick(time);
  assert.ok(water.strokes > 0);
  assert.equal(water.frames.size, 0);
  water.repeat();
  assert.equal(water.children.length, 1);
});

test("water honors reduced motion, coarse pointers, and tab visibility at runtime", () => {
  assert.equal(waterHarness({ reduced: true }).children.length, 0);
  assert.equal(waterHarness({ fine: false }).children.length, 0);
  const water = waterHarness();
  water.move();
  water.document.hidden = true;
  water.documentEvents.get("visibilitychange")();
  assert.equal(water.frames.size, 0);
  water.move(100);
  assert.equal(water.frames.size, 0);
  const motion = water.media.get("(prefers-reduced-motion: reduce)");
  motion.matches = true;
  motion.change();
  assert.equal(water.children.length, 0);
  assert.equal(water.events.has("pointermove"), false);
  motion.matches = false;
  motion.change();
  assert.equal(water.children.length, 1);
  const pointer = water.media.get("(hover: hover) and (pointer: fine)");
  pointer.matches = false;
  pointer.change();
  assert.equal(water.children.length, 0);
  assert.equal(water.frames.size, 0);
});
