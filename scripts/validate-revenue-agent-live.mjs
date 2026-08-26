const siteUrl = String(process.env.SITE_URL || "https://gptmarketplus.com").replace(/\/+$/, "");
const expectedModel = process.env.REVENUE_AI_MODEL || "@cf/zai-org/glm-4.7-flash";
const expectedVersion = process.env.REVENUE_AI_VERSION || "workers-ai-v4";

async function getJson(path) {
  const response = await fetch(`${siteUrl}${path}`, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`${path} returned HTTP ${response.status}`);
  return response.json();
}

const [health, scheduler] = await Promise.all([
  getJson("/api/agents/health"),
  getJson("/api/agents/scheduler"),
]);

for (const [label, status] of [["health", health.aiAgent], ["scheduler", scheduler.aiAgent]]) {
  if (!status?.ready) throw new Error(`${label} does not report a ready AI binding.`);
  if (status.provider !== "cloudflare-workers-ai") throw new Error(`${label} reports the wrong AI provider.`);
  if (status.model !== expectedModel) throw new Error(`${label} reports ${status.model || "no model"}, expected ${expectedModel}.`);
}
if (scheduler.revenueAiVersion !== expectedVersion) {
  throw new Error(`Scheduler reports ${scheduler.revenueAiVersion || "no AI version"}, expected ${expectedVersion}.`);
}
if (scheduler.revenueAiLastOutcome?.ok !== true) {
  throw new Error(`Latest Workers AI inference is not successful (${scheduler.revenueAiLastOutcome?.reason || "missing outcome"}).`);
}

console.log(JSON.stringify({
  ok: true,
  site: siteUrl,
  provider: health.aiAgent.provider,
  model: health.aiAgent.model,
  nextAlarmAt: scheduler.nextAlarmAt,
  lastAiOutcome: scheduler.revenueAiLastOutcome || null,
  expectedVersion,
}));
