import assert from "node:assert/strict";
import test from "node:test";

import {
  prioritizeRevenueDecision,
  revenueAgentStatus,
  runRevenueAgent,
} from "../src/revenue-agent.js";
import {
  agentTeamWorkspacePack,
  agentTeamWorkspaceProduct,
  agentIdOneTimeProducts,
  buildAgentTeamWorkspace,
  buildDropshippingWorkspace,
  CLOUDFLARE_GROUNDED_LOOKUP_TIMEOUT_MS,
  dropshippingWorkspacePack,
  GOOGLE_GROUNDED_LOOKUP_TIMEOUT_MS,
  handleAgentIdSiteRequest,
  isValidGroundedAnswer,
  parseCloudflareChatCompletionsResponse,
  renderDropshippingWorkspaceOutput,
  renderAgentTeamWorkspaceOutput,
  runGroundedProviderAttempt,
} from "../src/agentid-site.js";

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

test("accepts the exact Cloudflare AI Search chatCompletions response shape", async () => {
  let requestBody;
  const dataPoints = [];
  const response = await handleAgentIdSiteRequest(
    new Request("https://gptmarketplus.com/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        message: "What is the difference between an AI agent and a chatbot?",
        conversationId: "cloudflare-grounding-shape-test",
      }),
    }),
    {
      SITE_URL: "https://gptmarketplus.com",
      BRAND_NAME: "GPTMarketPlus",
      GROUNDED_PROVIDER_ANALYTICS: {
        writeDataPoint(point) {
          dataPoints.push(point);
        },
      },
      AGENTID_AI_SEARCH: {
        async chatCompletions(input) {
          requestBody = input;
          return {
            id: "aisearch-test",
            object: "chat.completion",
            model: "@cf/zai-org/glm-4.7-flash",
            choices: [{
              index: 0,
              message: {
                role: "assistant",
                content: "An AI agent follows a bounded workflow, while a basic chatbot primarily answers messages.",
              },
            }],
            chunks: [{
              id: "faq-agent-vs-chatbot",
              type: "text",
              score: 0.93,
              text: "A basic chatbot only talks. A properly built AI agent follows a workflow.",
              item: {
                key: "https://gptmarketplus.com/faq",
                metadata: { title: "GPTMarketPlus FAQ" },
              },
            }],
          };
        },
      },
    },
    { waitUntil() {} },
  );

  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.grounded, true);
  assert.equal(body.groundingProvider, "Cloudflare AI Search");
  assert.deepEqual(body.sources, [{ title: "GPTMarketPlus FAQ", uri: "https://gptmarketplus.com/faq" }]);
  assert.equal(requestBody.messages[0].role, "system");
  assert.equal(requestBody.messages[1].role, "user");
  assert.equal(requestBody.ai_search_options.retrieval.retrieval_type, "hybrid");
  assert.equal(dataPoints.length, 1);
  assert.deepEqual(dataPoints[0].blobs, [
    "grounded_provider_attempt",
    "cloudflare_ai_search",
    "success",
    "ok",
    "none",
  ]);
  assert.equal(dataPoints[0].doubles[0], 1);
  assert.equal(dataPoints[0].doubles[4], 1);
  assert.deepEqual(dataPoints[0].indexes, ["cloudflare_ai_search"]);
});

test("rejects malformed Cloudflare responses and logs only privacy-safe shape telemetry", async () => {
  const privateMarker = "PRIVATE_PROMPT_MARKER_9f87";
  const generatedMarker = "PRIVATE_GENERATED_MARKER_1c42";
  const warnings = [];
  const dataPoints = [];
  const originalWarn = console.warn;
  console.warn = (...args) => warnings.push(args.map(String).join(" "));
  try {
    const response = await handleAgentIdSiteRequest(
      new Request("https://gptmarketplus.com/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: `What agent services are available ${privateMarker}?`,
          conversationId: "private-conversation-marker",
        }),
      }),
      {
        SITE_URL: "https://gptmarketplus.com",
        BRAND_NAME: "GPTMarketPlus",
        GROUNDED_PROVIDER_ANALYTICS: {
          writeDataPoint(point) {
            dataPoints.push(point);
          },
        },
        AGENTID_AI_SEARCH: {
          async chatCompletions() {
            return {
              response: {
                choices: [{ message: { role: "assistant", content: generatedMarker } }],
                chunks: [],
              },
            };
          },
        },
      },
      { waitUntil() {} },
    );

    const body = await response.json();
    assert.equal(body.grounded, false);
    assert.equal(body.groundingProvider, null);
    assert.deepEqual(body.sources, []);
  } finally {
    console.warn = originalWarn;
  }

  assert.equal(warnings.length, 1);
  const telemetry = JSON.parse(warnings[0]);
  assert.equal(telemetry.event, "grounded_provider_attempt");
  assert.equal(telemetry.provider, "cloudflare_ai_search");
  assert.equal(telemetry.outcome, "failure");
  assert.equal(telemetry.code, "invalid_response_shape");
  assert.equal(telemetry.choicesArray, false);
  assert.doesNotMatch(warnings[0], new RegExp(privateMarker));
  assert.doesNotMatch(warnings[0], new RegExp(generatedMarker));
  assert.doesNotMatch(warnings[0], /private-conversation-marker/);
  assert.equal(dataPoints.length, 1);
  assert.deepEqual(dataPoints[0].blobs, [
    "grounded_provider_attempt",
    "cloudflare_ai_search",
    "failure",
    "invalid_response_shape",
    "none",
  ]);
  assert.deepEqual(dataPoints[0].indexes, ["cloudflare_ai_search"]);
  assert.doesNotMatch(JSON.stringify(dataPoints[0]), new RegExp(privateMarker));
  assert.doesNotMatch(JSON.stringify(dataPoints[0]), new RegExp(generatedMarker));
});

test("requires a recognized provider and at least one valid HTTPS source", () => {
  const base = {
    answer: "A grounded answer.",
    provider: "Cloudflare AI Search",
    sources: [{ title: "FAQ", uri: "https://gptmarketplus.com/faq" }],
  };
  assert.equal(isValidGroundedAnswer(base), true);
  assert.equal(isValidGroundedAnswer({ ...base, provider: "" }), false);
  assert.equal(isValidGroundedAnswer({ ...base, provider: "Unrecognized Search" }), false);
  assert.equal(isValidGroundedAnswer({ ...base, sources: [] }), false);
  assert.equal(isValidGroundedAnswer({
    ...base,
    sources: [{ title: "Untrusted", uri: "https://example.com/faq" }],
  }), false);
  assert.equal(isValidGroundedAnswer({
    ...base,
    sources: [{ title: "Insecure", uri: "http://gptmarketplus.com/faq" }],
  }), false);
});

test("rejects a Cloudflare answer without a valid source", () => {
  assert.throws(
    () => parseCloudflareChatCompletionsResponse(
      { SITE_URL: "https://gptmarketplus.com" },
      {
        choices: [{ message: { role: "assistant", content: "Unsupported answer text." } }],
        chunks: [{
          id: "external",
          type: "text",
          score: 0.8,
          text: "External content",
          item: { key: "https://example.com/private", metadata: { title: "External" } },
        }],
      },
    ),
    /missing_valid_source/,
  );
});

test("bounds both grounded providers and redacts thrown error details from telemetry", async () => {
  assert.equal(GOOGLE_GROUNDED_LOOKUP_TIMEOUT_MS, 4_000);
  assert.equal(CLOUDFLARE_GROUNDED_LOOKUP_TIMEOUT_MS, 6_000);
  const warnings = [];
  const originalWarn = console.warn;
  console.warn = (...args) => warnings.push(args.map(String).join(" "));
  let observedSignal;
  try {
    const result = await runGroundedProviderAttempt(
      "google_cloud_agent_search",
      (signal) => {
        observedSignal = signal;
        return new Promise(() => {});
      },
      { timeoutMs: 15 },
    );
    assert.equal(result, null);
  } finally {
    console.warn = originalWarn;
  }

  assert.equal(observedSignal.aborted, true);
  assert.equal(warnings.length, 1);
  const telemetry = JSON.parse(warnings[0]);
  assert.equal(telemetry.provider, "google_cloud_agent_search");
  assert.equal(telemetry.code, "timeout");

  warnings.length = 0;
  console.warn = (...args) => warnings.push(args.map(String).join(" "));
  let cloudflareSignal;
  try {
    const result = await runGroundedProviderAttempt(
      "cloudflare_ai_search",
      (signal) => {
        cloudflareSignal = signal;
        return new Promise(() => {});
      },
      { timeoutMs: 15 },
    );
    assert.equal(result, null);
  } finally {
    console.warn = originalWarn;
  }
  assert.equal(cloudflareSignal.aborted, true);
  assert.equal(JSON.parse(warnings[0]).provider, "cloudflare_ai_search");
  assert.equal(JSON.parse(warnings[0]).code, "timeout");

  warnings.length = 0;
  console.warn = (...args) => warnings.push(args.map(String).join(" "));
  try {
    await runGroundedProviderAttempt(
      "cloudflare_ai_search",
      async () => { throw new Error("SECRET_TOKEN_AND_PRIVATE_PROMPT"); },
    );
  } finally {
    console.warn = originalWarn;
  }
  assert.equal(JSON.parse(warnings[0]).code, "provider_error");
  assert.doesNotMatch(warnings[0], /SECRET_TOKEN_AND_PRIVATE_PROMPT/);
});

test("moves only the selected allowlisted task to the front", () => {
  const prioritized = prioritizeRevenueDecision(plan, { decision: "prioritize", selectedAgent: "growth" });
  assert.deepEqual(prioritized.nextActions, ["Improve the offer page.", "Review consented leads."]);
});

test("publishes the Auto Dropshipping Agent Team as a bounded self-serve product", () => {
  const product = agentIdOneTimeProducts().find((item) => item.id === "auto_dropshipping_agent_team");
  assert.ok(product);
  assert.equal(product.name, "Auto Dropshipping Agent Team");
  assert.equal(product.price, 4900);
  assert.equal(product.delivery, "dropshipping_workspace");
});

test("publishes three additional PayPal-gated agent team workspaces", () => {
  const expected = [
    ["local_lead_follow_up_agent_team", "Local Lead Follow-Up Agent Team", 4900],
    ["content_seo_agent_team", "Content & SEO Agent Team", 3900],
    ["ecommerce_support_agent_team", "Ecommerce Support Agent Team", 3900],
  ];
  for (const [id, name, price] of expected) {
    const product = agentTeamWorkspaceProduct(id);
    assert.ok(product);
    assert.equal(product.name, name);
    assert.equal(product.price, price);
    assert.equal(product.delivery, "agent_team_workspace");
  }
});

test("builds truthful, product-specific operating packs for the new agent teams", () => {
  const cases = [
    {
      id: "local_lead_follow_up_agent_team",
      input: { businessName: "Northside Services", mainOffer: "Home maintenance visits", idealLead: "Local homeowners", qualificationCriteria: "Confirm service area and requested service", consentBasis: "Recorded email consent with timestamp and opt-out preference", approvalOwner: "Service manager" },
      expected: /CONSENT AND CONTACT CHECK/,
    },
    {
      id: "content_seo_agent_team",
      input: { brandName: "Northside Services", mainOffer: "Home maintenance visits", targetAudience: "Local homeowners", priorityTopics: "What a maintenance visit includes", proofSources: "Published service scope and technician-reviewed notes", approvalOwner: "Marketing manager" },
      expected: /TOPIC AND BRIEF QUEUE/,
    },
    {
      id: "ecommerce_support_agent_team",
      input: { storeName: "Organized Desk Store", commonIssues: "Order status and return request", orderStatusSources: "Store order record and current carrier event", returnPolicy: "Human-approved returns within 30 days under the published policy", approvalOwner: "Store owner" },
      expected: /VERIFIED ORDER-STATUS MACRO/,
    },
  ];
  for (const item of cases) {
    const workspace = buildAgentTeamWorkspace(item.id, item.input);
    const pack = agentTeamWorkspacePack(item.id, workspace);
    const output = renderAgentTeamWorkspaceOutput(item.id, workspace);
    assert.match(pack, item.expected);
    assert.match(pack, /does not verify facts or legal compliance/i);
    assert.match(pack, /Every external action remains paused/i);
    assert.match(output, /Human approval queue/);
  }
});

test("builds a six-agent dropshipping operating pack with transparent scenario math", () => {
  const workspace = buildDropshippingWorkspace({
    storeName: "Organized Desk Test Store",
    niche: "Desk organization",
    marketplace: "Shopify",
    productCandidates: "Adjustable desk cable tray | 5.90 | 2.50 | 24.90",
    feePercent: "15",
    targetMargin: "30",
    approvalOwner: "Store owner",
  });
  const pack = dropshippingWorkspacePack(workspace);
  const output = renderDropshippingWorkspaceOutput(workspace);

  assert.match(pack, /AGENT 1 — PRODUCT SCOUT/);
  assert.match(pack, /AGENT 6 — CUSTOMER SUPPORT DRAFT AGENT/);
  assert.match(pack, /Landed cost: \$8\.40/);
  assert.match(pack, /Scenario margin: 51\.3%/);
  assert.match(pack, /does not guarantee sales/i);
  assert.match(output, /51\.3%/);
  assert.match(output, /Human approval queue/);
});

test("renders the eight-product storefront with PayPal and labeled x402 checkout paths", async () => {
  const response = await handleAgentIdSiteRequest(
    new Request("https://gptmarketplus.com/products"),
    {
      SITE_URL: "https://gptmarketplus.com",
      BRAND_NAME: "GPTMarketPlus",
      PAYPAL_CLIENT_ID: "test-client",
      PAYPAL_CLIENT_SECRET: "test-secret",
      ADSENSE_CLIENT_ID: "ca-pub-1234567890123456",
      ADSENSE_AD_SLOT: "1234567890",
      ADSENSE_ENABLED: "true",
    },
    { waitUntil() {} },
  );
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Choose a ready-to-run <span>agent team<\/span>/);
  assert.match(html, /name="productId" value="auto_dropshipping_agent_team"/);
  assert.match(html, /name="productId" value="local_lead_follow_up_agent_team"/);
  assert.match(html, /name="productId" value="content_seo_agent_team"/);
  assert.match(html, /name="productId" value="ecommerce_support_agent_team"/);
  assert.match(html, /AI Software Opportunity Report/);
  assert.match(html, /<h3>CueKeeper<\/h3>/);
  assert.match(html, /<h3>Supabase Recovery Evidence Agent<\/h3>/);
  assert.match(html, /Eight one-time products/);
  assert.match(html, /score\.agentid\.life\/cuekeeper\?utm_source=gptmarketplus\.com/);
  assert.match(html, /score\.agentid\.life\/supabase-recovery\?utm_source=gptmarketplus\.com/);
  assert.match(html, /Base-compatible wallet with USDC/);
  assert.doesNotMatch(html, /name="productId" value="cuekeeper_agent_foundry_release"/);
  assert.doesNotMatch(html, /name="productId" value="supabase_recovery_agent_foundry_release"/);
  assert.match(html, /Sample (?:&middot;|·) not a live store/i);
  assert.match(html, /No outcome guarantees/);
  assert.match(html, /human approval/i);
  assert.match(html, /agent-network-visual/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.equal((html.match(/class="checkout-form paypal-checkout-form product-checkout-form"/g) || []).length, 6);
  const ids = [...html.matchAll(/(?<![-\w])id="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(ids.filter((id, index) => ids.indexOf(id) !== index), []);
  assert.doesNotMatch(html, /adsbygoogle|publisher-ad/);
});

test("publishes an evidence-first Supabase recovery launch guide with bounded x402 promotion", async () => {
  const env = {
    SITE_URL: "https://gptmarketplus.com",
    BRAND_NAME: "GPTMarketPlus",
  };
  const response = await handleAgentIdSiteRequest(
    new Request("https://gptmarketplus.com/guides/supabase-project-recovery-evidence"),
    env,
    { waitUntil() {} },
  );
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Supabase Project Paused or Stuck\?/);
  assert.match(html, /Build the packet locally for \$1/);
  assert.match(html, /score\.agentid\.life\/supabase-recovery\?utm_source=gptmarketplus\.com/);
  assert.match(html, /Evidence synthesis only; no Supabase access, repair, root-cause determination, or support contact/);
  assert.match(html, /Should I include API keys, passwords, tokens, or connection strings\?/);
  assert.match(html, /https:\/\/supabase\.com\/docs\/guides\/platform\/billing-faq/);
  assert.match(html, /https:\/\/supabase\.com\/docs\/guides\/troubleshooting\/http-status-codes/);
  assert.doesNotMatch(html, /name="productId" value="supabase_recovery_agent_foundry_release"/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);

  const sitemap = await handleAgentIdSiteRequest(
    new Request("https://gptmarketplus.com/sitemap.xml"),
    env,
    { waitUntil() {} },
  );
  assert.equal(sitemap.status, 200);
  assert.match(await sitemap.text(), /guides\/supabase-project-recovery-evidence/);

  const resources = await handleAgentIdSiteRequest(
    new Request("https://gptmarketplus.com/resources"),
    env,
    { waitUntil() {} },
  );
  assert.equal(resources.status, 200);
  assert.match(await resources.text(), /Supabase Project Paused or Stuck\?/);

  const llms = await handleAgentIdSiteRequest(
    new Request("https://gptmarketplus.com/llms.txt"),
    env,
    { waitUntil() {} },
  );
  assert.equal(llms.status, 200);
  assert.match(await llms.text(), /Supabase Recovery Evidence Agent guide/);
});

test("publishes visible focus styles and a reduced-motion fallback", async () => {
  const response = await handleAgentIdSiteRequest(
    new Request("https://gptmarketplus.com/styles.css"),
    { SITE_URL: "https://gptmarketplus.com", BRAND_NAME: "GPTMarketPlus" },
    { waitUntil() {} },
  );
  assert.equal(response.status, 200);
  const css = await response.text();
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /@keyframes networkFlow/);
});

test("redirects the legacy product alias to the canonical marketplace anchor", async () => {
  const response = await handleAgentIdSiteRequest(
    new Request("https://gptmarketplus.com/products/auto-dropshipping-agent-team"),
    { SITE_URL: "https://gptmarketplus.com", BRAND_NAME: "GPTMarketPlus" },
    { waitUntil() {} },
  );
  assert.equal(response.status, 301);
  assert.equal(response.headers.get("location"), "https://gptmarketplus.com/products#auto_dropshipping_agent_team");
});
