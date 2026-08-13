# GPTMarketPlus Sales and Product Improvement Brief

Use this brief as the operating instruction for future work on `gptmarketplus.com`.

## Mission

Improve GPTMarketPlus as a real business, not only as a marketing site:

1. Increase qualified traffic, buyer confidence, checkout starts, leads, and verified purchases.
2. Make the $29 AI Agent Launch Kit a useful product a customer can use immediately after buying.
3. Keep custom AI-agent services honest, scoped, and fulfilable.
4. Keep the production repository and Cloudflare deployment synchronized with work done on other computers.

Never claim that a copy change guarantees a sale. Use the live funnel metrics to identify whether the constraint is traffic, message, checkout, fulfillment, or follow-up.

## Required first steps

Work from the `agentid-services` repository, not the legacy Pages repository.

```powershell
Set-Location C:\Users\LincolnJones\agentid-services
git fetch origin
git status --short --branch
git log --oneline --decorate -8
git diff origin/main
```

If another computer has pushed work, integrate or build on the latest `origin/main` before editing. Preserve unrelated local changes and do not reset or overwrite them.

Check the live production state before deciding what to fix:

- `https://gptmarketplus.com/`
- `/pricing`
- `/ai-agent-launch-kit`
- `/api/paypal/status`
- `/api/agents/state`
- `/api/agents/health`

Inspect aggregate counts only. Do not expose customer PII, payment secrets, access tokens, or private dashboard records.

## Product contract: the AI Agent Launch Kit

The verified one-time product is the `$29 AI Agent Launch Kit`.

After a completed PayPal capture, the customer must receive:

- A private purchase-gated workspace.
- A guided form that asks about the business, offer, best-fit customer, first workflow, approved knowledge, boundaries, handoff, tools, and tone.
- A tailored first-workflow brief.
- A usable starter system prompt.
- Customer lead-intake fields and consent/handoff rules.
- A practical follow-up sequence.
- A launch QA checklist.
- A 30-day measurement scorecard.
- Copy and download actions for the generated starter pack.
- A path to optional implementation help.

The product may use deterministic templates and structured generation. It must not pretend that a generated plan is a fully integrated production agent. Say clearly what the buyer can use now and what requires implementation, credentials, testing, or human approval.

The workspace must remain locked behind the verified PayPal order ID and access token. Do not make customer content public or indexable. Store only the minimum data needed to let the buyer return to the workspace and download their pack.

## Conversion rules

- Put the verified $29 product in the primary CTA position on pages where the visitor is researching or planning.
- Keep the free strategy call as the secondary path for custom implementation.
- Explain the product in terms of the customer’s result: a usable first-agent starter system, not a vague PDF or “AI ideas.”
- Show what the customer receives, what they can do immediately, and what requires implementation help.
- Use source parameters on external or high-value CTA links so attribution can distinguish homepage, resources, chat, pricing, and campaign traffic.
- Keep pricing, fulfillment, privacy, refund, and no-guarantee language consistent across product pages and legal pages.
- Do not enable custom-service checkout without an approved written scope and a fulfillment path.
- Do not run a real PayPal capture or refund without the owner’s explicit authorization.

## Acquisition rules

The site cannot make a sale without qualified visitors. When leads and paid checkouts are zero, inspect both the funnel and acquisition system:

- Search visibility and buyer-intent pages.
- Internal links into the Launch Kit.
- Campaign links and UTM attribution.
- Partner, directory, and outreach targets.
- Chat and resource-page CTAs.
- Analytics events: `view_item`, `add_to_cart`, `begin_checkout`, `purchase`, and `generate_lead`.
- PayPal approval-order creation and verified capture.

Never manufacture traffic, fake leads, fake purchases, synthetic conversions, or fabricated testimonials.

## Engineering and security rules

- Use Cloudflare Worker, KV, D1, R2, Queue, and Turnstile patterns already established in the repository.
- Keep PayPal product ID, amount, currency, capture status, and delivery access verified server-side.
- Escape user-provided values in HTML and generated output.
- Use parameterized D1 queries.
- Keep access-controlled pages `noindex`, private, and uncached.
- Do not log secrets, full payment tokens, or unnecessary customer content.
- Run syntax, binding, link, PayPal, dependency, security, and Wrangler dry-run checks before deployment.

## Required handoff

At the end of each improvement cycle, report:

- Repository branch and commit.
- Whether the branch matches `origin/main`.
- Files changed and why.
- Tests and audits passed.
- Cloudflare Worker version deployed, if deployed.
- Live URLs verified.
- Current live counts for traffic/lead/purchase metrics.
- Remaining owner actions, especially real purchase acceptance testing, calendar configuration, support, and traffic distribution.

