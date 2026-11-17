import upstream from "./portfolio-wrapper.mjs";
export * from "./portfolio-wrapper.mjs";
import { THEME_CSS, THEME_VERSION } from "./publisher-theme.mjs";
import { WATER_SCRIPT } from "./publisher-water.mjs";

const HOSTS = new Set(["gptmarketplus.com", "www.gptmarketplus.com"]);
const CSS_PATH = "/__gmp/dark-water.css";
const SCRIPT_PATH = "/__gmp/water.js";

function themeAsset(request, content, type) {
  if (!["GET", "HEAD"].includes(request.method)) return new Response(null, { status: 405, headers: { Allow: "GET, HEAD" } });
  return new Response(request.method === "HEAD" ? null : content, {
    headers: {
      "Content-Type": type,
      "Cache-Control": "public, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export function isThemePage(request, response) {
  const url = new URL(request.url);
  return HOSTS.has(url.hostname)
    && request.method === "GET"
    && response.status === 200
    && /\btext\/html\b/i.test(response.headers.get("content-type") || "")
    && !/^(?:\/api(?:\/|$)|\/admin(?:\/|$)|\/dashboard(?:\/|$)|\/launch-kit\/workspace(?:\/|$)|\/customer(?:\/|$)|\/workspace(?:\/|$)|\/checkout(?:\/|$))/.test(url.pathname)
    && !/\bprivate\b/i.test(response.headers.get("cache-control") || "")
    && !/\battachment\b/i.test(response.headers.get("content-disposition") || "");
}

export function applyTheme(response, Rewriter = HTMLRewriter) {
  const headers = new Headers(response.headers);
  // The HTML representation changes; retain all CSP/privacy/cache semantics.
  for (const name of ["content-length", "etag", "content-md5", "digest"]) headers.delete(name);
  headers.set("X-GPTMarketPlus-Theme", THEME_VERSION);
  const themed = new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  return new Rewriter()
    .on("html", { element(element) { element.setAttribute("data-gmp-theme", "dark-water"); } })
    .on('meta[name="color-scheme"],meta[name="theme-color"]', { element(element) { element.remove(); } })
    .on("head", { element(element) {
      element.append(`<meta name="color-scheme" content="dark"><meta name="theme-color" content="#080f16"><link rel="stylesheet" href="${CSS_PATH}?v=${THEME_VERSION}">`, { html: true });
    } })
    .on("body", { element(element) {
      element.append(`<script src="${SCRIPT_PATH}?v=${THEME_VERSION}" defer></script>`, { html: true });
    } })
    .transform(themed);
}

// Keep queue/scheduled handlers and named Durable Object exports from the live
// publisher. Other hosts and all API/payment responses pass through untouched.
export default {
  ...upstream,
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (HOSTS.has(url.hostname)) {
      if (url.pathname === CSS_PATH) return themeAsset(request, THEME_CSS, "text/css; charset=utf-8");
      if (url.pathname === SCRIPT_PATH) return themeAsset(request, WATER_SCRIPT, "text/javascript; charset=utf-8");
    }
    const response = await upstream.fetch.call(upstream, request, env, ctx);
    return isThemePage(request, response) ? applyTheme(response) : response;
  },
};
