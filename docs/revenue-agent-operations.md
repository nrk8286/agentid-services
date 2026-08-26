# Workers AI revenue agent operations

The revenue coordinator runs inside the existing Cloudflare Worker and its
SQLite-backed Durable Object alarm. Every six hours, the Worker builds a
bounded operational snapshot and sends it through the in-process Workers AI
binding to `@cf/zai-org/glm-4.7-flash`. The model may prioritize one allowlisted
task or hold. Application code—not model output—selects the exact task text and
continues to enforce spend, consent, payment-evidence, access, and idempotency
controls.

This replaces the retired Google Vertex AI Agent Runtime and Google Cloud
Scheduler deployment. Google Cloud Agent Search remains a separate public-site
retrieval feature and is not part of the revenue-agent runtime.

## Cost and configuration

According to [Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/),
Workers AI has a shared account allocation of 10,000 neurons per day at no
charge. The coordinator runs four scheduled cycles per day, sends bounded input,
and caps each response at 500 completion tokens. If the account's free daily
allocation is exhausted, the request fails closed with a `hold` decision and
the non-AI automation remains available.

No model-provider API key is required. The binding and non-secret defaults live
in `wrangler.jsonc`:

```text
AI binding: AI
REVENUE_AI_ENABLED=true
REVENUE_AI_MODEL=@cf/zai-org/glm-4.7-flash
```

## Validation

```bash
npm run test:revenue-agent
npm run validate
npm run test:revenue-agent:live
```

The normal test suite uses a mock binding and consumes no Workers AI allocation.
The live check verifies that production exposes the expected AI binding, model,
and Durable Object schedule.

After deployment, verify that `aiAgent.ready` is `true`:

```bash
curl https://gptmarketplus.com/api/agents/health
curl https://gptmarketplus.com/api/agents/scheduler
```

The first health request after a model-version change schedules a one-time
bootstrap cycle within roughly 15 seconds. The scheduler status records the
bounded provider outcome and sanitized provider error without exposing prompts
or private data. Degraded calls also emit a structured `revenue_ai_degraded` log.

## Failure and rollback behavior

If Workers AI is unavailable, times out, returns malformed JSON, or reaches its
account allocation, the agent records a bounded `hold` decision. Set
`REVENUE_AI_ENABLED=false` and redeploy to disable model calls without disabling
site health, lead intake, or the guarded automation loop.

The old Google runtime source and deployment workflows were removed from this
repository. Its external scheduler must remain paused so it cannot create a
duplicate cycle if Google billing is re-enabled.
