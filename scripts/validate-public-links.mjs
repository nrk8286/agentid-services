import { readFileSync } from "node:fs";

const registry = JSON.parse(
  readFileSync(new URL("../deployment/public-links.json", import.meta.url), "utf8"),
);
const entries = Object.entries(registry.links || {});
const failures = [];
const seen = new Set();

if (registry.repository !== "https://github.com/nrk8286/agentid-services") {
  failures.push("repository must point to the canonical GitHub repository");
}
if (registry.site !== "https://gptmarketplus.com") {
  failures.push("site must point to the canonical production origin");
}
if (entries.length < 10) failures.push("public-link registry is unexpectedly small");

for (const [name, value] of entries) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    failures.push(`${name} is not a valid URL`);
    continue;
  }
  if (parsed.protocol !== "https:") failures.push(`${name} must use HTTPS`);
  if (parsed.hostname !== "gptmarketplus.com") {
    failures.push(`${name} must use the canonical gptmarketplus.com hostname`);
  }
  if (seen.has(value)) failures.push(`${name} duplicates another public URL`);
  seen.add(value);
}

if (process.argv.includes("--live")) {
  for (const [name, value] of entries) {
    try {
      const response = await fetch(value, {
        headers: { "user-agent": "agentid-services-link-check/1.0" },
        redirect: "follow",
        signal: AbortSignal.timeout(15_000),
      });
      if (response.status >= 400) {
        // A Cloudflare security rule can reject automated CI requests while
        // public routes remain reachable elsewhere. Keep the gate strict, but
        // expose enough safe response metadata to find the rejecting layer.
        const host = new URL(response.url).hostname;
        const server = response.headers.get("server") || "unknown";
        const ray = response.headers.get("cf-ray") || "none";
        const mitigation = response.headers.get("cf-mitigated") || "none";
        const type = response.headers.get("content-type") || "unknown";
        let title = "none";
        if (type.includes("text/html")) {
          const body = (await response.text()).slice(0, 4096);
          const match = body.match(/<title[^>]*>([^<]{1,120})<\/title>/i);
          if (match) title = match[1].replace(/\s+/g, " ").trim();
        }
        failures.push(
          `${name} returned HTTP ${response.status}` +
            ` (host=${host}, server=${server}, cf-ray=${ray},` +
            ` cf-mitigated=${mitigation}, content-type=${type}, title=${title})`,
        );
      }
    } catch (error) {
      failures.push(`${name} failed: ${error.message}`);
    }
  }
}

if (failures.length) {
  for (const failure of failures) console.error(`link validation: ${failure}`);
  process.exit(1);
}

console.log(`Validated ${entries.length} canonical public links${process.argv.includes("--live") ? " live" : ""}.`);
