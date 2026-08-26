import assert from "node:assert/strict";
import test from "node:test";

import {
  prioritizeRevenueDecision,
  revenueAgentStatus,
  runRevenueAgent,
} from "../src/revenue-agent.js";

const plan = {
  trigger: "test",
  generatedAt: "2026-08-26T12:00:00.000Z",
  health: { status: "healthy" },
  metrics: { leads_total: 4, verified_revenue_cents: 0 },
  pendingTasks: 2,
  agents: [
    { id: "growth", name: "Growth", goal: "Grow", priority: 80, recommendation: "Improve offer", tasks: ["Improve the offer page."] },
    { id: "sales", name: "Sales", goal: "Close", priority: 60, recommendation: "Review leads", tasks: ["Review consented leads."] },
  ],
  nextActions: ["Review consented leads.", "Improve the offer page."],
};

test("reports an unconfigured Workers AI agent without requiring an API key", () => {
  assert.deepEqual(revenueAgentStatus({ REVENUE_AI_MODEL: "@cf/zai-org/glm-4.7-flash" }), {
    provider: "cloudflare-workers-ai",
    agent: "revenue-coordinator",
    model: "@cf/zai-org/glm-4.7-flash",
    enabled: true,
    configured: false,
    ready: false,
  });
});

test("uses the Workers AI binding and derives the executable task locally", async () => {
  let requestedModel;
  let requestBody;
  let requestOptions;
  const result = await runRevenueAgent(
    { REVENUE_AI_MODEL: "@cf/zai-org/glm-4.7-flash", AI: { run() {} } },
    plan,
    {
      ai: {
        async run(model, body, options) {
          requestedModel = model;
          requestBody = body;
          requestOptions = options;
          return {
            id: "cf_test",
            choices: [{ message: { content: JSON.stringify({
              decision: "prioritize",
              selectedAgent: "growth",
              rationale: "The site is healthy, so offer clarity is the best next step.",
              expectedImpact: "Better qualified conversion intent.",
              risks: ["Do not overstate results."],
            }) } }],
            usage: { prompt_tokens: 100, completion_tokens: 30, total_tokens: 130 },
          };
        },
      },
    },
  );

  assert.equal(requestedModel, "@cf/zai-org/glm-4.7-flash");
  assert.equal(requestBody.response_format.type, "json_schema");
  assert.equal(requestBody.max_completion_tokens, 500);
  assert.equal(requestBody.chat_template_kwargs.enable_thinking, false);
  assert.equal(requestOptions.tags[0], "agentid");
  assert.equal(result.ok, true);
  assert.equal(result.selectedAgent, "growth");
  assert.equal(result.selectedTask, "Improve the offer page.");
  assert.equal(result.usage.totalTokens, 130);
});

test("holds safely when the Workers AI binding is unavailable", async () => {
  const result = await runRevenueAgent({}, plan);
  assert.equal(result.ok, false);
  assert.equal(result.reason, "not_configured");
  assert.equal(result.decision, "hold");
});

test("moves only the selected allowlisted task to the front", () => {
  const prioritized = prioritizeRevenueDecision(plan, { decision: "prioritize", selectedAgent: "growth" });
  assert.deepEqual(prioritized.nextActions, ["Improve the offer page.", "Review consented leads."]);
});
