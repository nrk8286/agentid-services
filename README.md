# GPTMarketPlus

Cloudflare Worker agent layer for `gptmarketplus.com` with lead capture, site-health checks, lead scoring, marketing-task generation, playbook history, and a persistent task queue.

[![CI](https://github.com/nrk8286/agentid-services/actions/workflows/ci.yml/badge.svg)](https://github.com/nrk8286/agentid-services/actions/workflows/ci.yml)
[![CodeQL](https://github.com/nrk8286/agentid-services/actions/workflows/codeql.yml/badge.svg)](https://github.com/nrk8286/agentid-services/actions/workflows/codeql.yml)
[![Live site](https://img.shields.io/website?url=https%3A%2F%2Fgptmarketplus.com&label=gptmarketplus.com)](https://gptmarketplus.com)

[Live site](https://gptmarketplus.com) · [Pricing](https://gptmarketplus.com/pricing) · [Agent status](https://gptmarketplus.com/api/agents/health) · [AI search status](https://gptmarketplus.com/api/genai/status) · [Security policy](SECURITY.md) · [Report an issue](https://github.com/nrk8286/agentid-services/issues/new/choose)

## Architecture

- Cloudflare Worker: public pages, lead capture, checkout, measurement, API routes, and automation control.
- Cloudflare D1, KV, R2, Queues, Analytics Engine, AI Search, Flagship, and native rate limiting.
- Google Vertex AI Agent Runtime: scheduled multi-agent revenue operations with A2A support.
- Google Discovery Engine: grounded public-site retrieval for customer chat.
- Google Cloud Logging, Monitoring, Trace, Scheduler, BigQuery, and budget controls.

The canonical public-link registry is [deployment/public-links.json](deployment/public-links.json). Run `npm run validate:links:live` to verify those endpoints.

## Local checks

```bash
npm ci
npm run validate
```

## Run locally

```bash
npm run dev
```

Known local issue: the `wrangler dev --port 8787` interface is not a reliable proof for routed host behavior on this project. Use it for quick local execution checks, then verify the deployed Cloudflare routes with the smoke commands below.

## Deploy

```bash
npm install
npm run check
npx wrangler deploy --dry-run
npm run deploy
```

The shell needs `CLOUDFLARE_API_TOKEN` set for `wrangler deploy`.

The AgentID Worker uses a SQLite-backed Durable Object alarm to run its guarded agent cycle every six hours without consuming an account Cron Trigger. A health request idempotently initializes or repairs the alarm, and `GET /api/agents/scheduler` reports its next run and last outcome. The Worker also exposes the duplicate-run-guarded `POST /api/agents/run` endpoint for operational testing and recovery.

Cloudflare routes are configured to send the full `gptmarketplus.com/*` site surface through this Worker, so the Worker owns the live site instead of only selected subpaths.

### Campaign domains

`gptmarketplus.com` remains the only canonical, indexable production origin. The
following GoDaddy-registered brand domains use Cloudflare custom-domain routes
and permanent Worker redirects. Each root redirect lands on a distinct buyer
journey and adds first-party UTM attribution; non-root paths are preserved.

| Domain | Canonical destination |
| --- | --- |
| `agentid.solutions` | `https://gptmarketplus.com/services` |
| `agentid.website` | `https://gptmarketplus.com/ai-agents` |
| `agentid.life` | `https://gptmarketplus.com/use-cases` |
| `agentid.world` | `https://gptmarketplus.com/resources` |

Both apex and `www` hostnames are attached. Verify the public redirect contract
after DNS delegation changes finish propagating:

```bash
for domain in agentid.life agentid.solutions agentid.website agentid.world; do
  curl -fsSI "https://${domain}/" | sed -n '1p;/^location:/Ip'
  curl -fsSI "https://www.${domain}/" | sed -n '1p;/^location:/Ip'
done
```

## Live endpoints

```bash
curl https://gptmarketplus.com/api/agents/health
curl https://gptmarketplus.com/api/agents/scheduler
curl https://gptmarketplus.com/api/agents/state
curl https://gptmarketplus.com/software-builds
curl https://gptmarketplus.com/llms.txt
```

Use `{"force":true}` only when you need to bypass the 30-minute duplicate-run guard.

## SEO and Ads

The agent Worker serves:

```bash
curl https://gptmarketplus.com/robots.txt
curl https://gptmarketplus.com/sitemap.xml
curl https://gptmarketplus.com/ads.txt
curl https://gptmarketplus.com/llms.txt
curl https://gptmarketplus.com/llms-full.txt
curl https://gptmarketplus.com/agents/feed.xml
curl https://gptmarketplus.com/agents/feed.json
curl https://gptmarketplus.com/.well-known/ai-crawler-policy.json
curl https://gptmarketplus.com/security.txt
curl https://gptmarketplus.com/social
curl https://gptmarketplus.com/pricing
```

`ads.txt` publishes the configured Google AdSense seller record. Ad serving remains
dependent on Google site approval, policy compliance, and valid traffic.

## AI crawler discovery

The Worker exposes crawler-friendly discovery files for AI search and retrieval systems:

```bash
curl https://gptmarketplus.com/robots.txt
curl https://gptmarketplus.com/llms.txt
curl https://gptmarketplus.com/llms-full.txt
curl https://gptmarketplus.com/.well-known/ai-crawler-policy.json
curl https://gptmarketplus.com/agents/feed.json
```

If Cloudflare Managed `robots.txt` is enabled for the zone, it can prepend `Disallow` rules for AI crawlers before the Worker response. Disable Cloudflare's managed AI crawler `robots.txt` setting when the goal is AI search, AI answer grounding, and AI crawler pickup.

PayPal is the sole payment provider. Eligible self-service products use PayPal Orders, while approved services and sponsor placements use PayPal checkout, subscriptions, or invoices only after scope and fulfillment terms are accepted.

Google Analytics is wired through the Worker's first-party `/gtag` proxy path. `G-3BCSR51WHZ` loads directly, so measurement does not depend on a Tag Manager container. The verified GA4 stream identifies GPTMarketPlus at `https://gptmarketplus.com`; `generate_lead` and the default `purchase` are the only Key Events. Set a GTM or Ads identifier only when a real published container or conversion action exists:

```bash
curl https://gptmarketplus.com/pricing
curl -X POST https://gptmarketplus.com/api/agents/ads/checkout \
  -H 'content-type: application/json' \
  --data '{"packageId":"sponsor_starter_monthly"}'
wrangler vars put GOOGLE_TAG_ID
wrangler vars put GOOGLE_ANALYTICS_ID
wrangler vars put GOOGLE_ADS_CONVERSION_ID
wrangler vars put GOOGLE_ADS_CONVERSION_LABEL
```

For paid acquisition, use separate destinations in `wrangler.jsonc`: `GOOGLE_ADS_LEAD_CONVERSION_ID` and `GOOGLE_ADS_LEAD_CONVERSION_LABEL` for accepted lead actions, plus `GOOGLE_ADS_PURCHASE_CONVERSION_ID` and `GOOGLE_ADS_PURCHASE_CONVERSION_LABEL` for provider-verified purchases. The older generic pair is retained only as a lead fallback; never reuse one conversion label for both goals.

The $29 AI Agent Launch Kit uses a verified live PayPal order/capture flow and serves its download only after an exact completed capture. Completed captures return the secure delivery URL immediately, send it through the customer transactional-email adapter, and queue failed email delivery for retry without duplicating successful delivery. For Google measurement, the site uses `GOOGLE_TAG_GATEWAY_PATH=/gtag` and serves that path from the Worker itself.

### Google Cloud Agent Search

The public chat can answer AgentID product and pricing questions from a
Google Cloud Agent Search corpus containing public site pages only. Contact
details and ordinary lead-qualification messages stay in the existing
first-party chat flow. Grounded answers include links to their indexed source
pages, and a Google API failure falls back to the deterministic chat flow.

```text
Project: agentid-genai-app-2026
Location: global
Engine: agentid-answer-engine
Data store: agentid-public-knowledge
Runtime identity: agentid-search-runtime@agentid-genai-app-2026.iam.gserviceaccount.com
```

The Worker stores the service-account JSON as the
`GOOGLE_SERVICE_ACCOUNT_JSON` secret. Do not put it in `wrangler.jsonc` or the
repository. The public, non-secret configuration is in `wrangler.jsonc`.

```bash
curl https://gptmarketplus.com/api/genai/status
curl -X POST https://gptmarketplus.com/api/chat \
  -H 'content-type: application/json' \
  --data '{"message":"What does an AI agent cost?","sourcePage":"/pricing"}'
```

### Resource-led traffic and digital product revenue

The primary site now contains an original resource hub, six buyer/operator
resources, a client-side ROI calculator, and a paid launch kit:

```text
https://gptmarketplus.com/resources
https://gptmarketplus.com/guides/ai-agent-for-small-business
https://gptmarketplus.com/guides/ai-receptionist-cost
https://gptmarketplus.com/guides/ai-lead-follow-up
https://gptmarketplus.com/compare/ai-agent-vs-chatbot
https://gptmarketplus.com/industries/contractors-ai-automation
https://gptmarketplus.com/templates/lead-follow-up-scripts
https://gptmarketplus.com/tools/ai-automation-roi-calculator
https://gptmarketplus.com/ai-agent-launch-kit
```

These URLs are included in the primary sitemap, the RSS/JSON discovery feeds,
`llms.txt`, `llms-full.txt`, and the automated IndexNow batch. The calculator
runs entirely in the browser and does not submit the user's inputs.

The digital product endpoints are:

```bash
# Public product page
curl https://gptmarketplus.com/ai-agent-launch-kit

# Secure post-purchase page (completed PayPal order and random access token required)
curl "https://gptmarketplus.com/paypal/download/ai-agent-launch-kit?order_id=PAYPAL_ORDER_ID&access_token=PRIVATE_ACCESS_TOKEN"

# File delivery (same completed PayPal entitlement required)
curl -OJ "https://gptmarketplus.com/api/paypal/digital-products/ai-agent-launch-kit?order_id=PAYPAL_ORDER_ID&access_token=PRIVATE_ACCESS_TOKEN"
```

### PayPal one-time payments and sponsor subscriptions

PayPal is the only payment provider across the $29 AI Agent Launch Kit, fixed-price builds, setup deposits, and recurring sponsor inventory. One-time purchases use PayPal Orders v2: the Worker creates the order from its server-owned product catalog, redirects the buyer to PayPal, captures the approved order on the server, checks the exact product/currency/amount, and only then records revenue or unlocks delivery. Sponsor inventory supports recurring PayPal subscriptions at $49, $99, and $149 per month, but remains approval-gated until placement fulfillment is ready.

The PayPal client secret is never sent to the browser. The secure Launch Kit URL requires the completed order ID plus a separate random access token stored in KV; a PayPal redirect alone cannot unlock the file.

Configure the live PayPal REST application credentials as Worker secrets:

```bash
wrangler secret put PAYPAL_CLIENT_ID
wrangler secret put PAYPAL_CLIENT_SECRET
```

### Google AdSense publisher ads

The public AgentID pages support Google AdSense Auto ads and a responsive manual
ad unit. Set `ADSENSE_CLIENT_ID` to the public `ca-pub-0000000000000000` value
from the approved AdSense account, set `ADSENSE_AD_SLOT` to the 10-digit ad unit
slot, and leave `ADSENSE_ENABLED` set to `true`. The Worker then adds Google's
unmodified asynchronous loader and the configured responsive unit to eligible
public pages, publishes the matching Google seller record at `/ads.txt`, and
reports readiness at `/api/ads/status`. Private dashboards, onboarding, privacy,
terms, pricing, contact, booking, paid-product, and download pages do not load publisher ads.
Informational resource pages remain eligible so ads do not compete with the
highest-value consultation and checkout actions.

Ad serving and payment still depend on Google approving `gptmarketplus.com`,
enabling Auto ads in AdSense, valid human traffic, advertiser demand, and the
publisher completing Google's identity, tax, address, and payout requirements.
Never click the site's own ads, automate ad interactions, reward users for
clicks, or buy low-quality traffic.

Then create the live PayPal catalog product, three active monthly plans, and the verified webhook registration once:

```bash
curl -X POST "https://gptmarketplus.com/api/paypal/bootstrap" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Check readiness without exposing credentials:

```bash
curl "https://gptmarketplus.com/api/paypal/status"
```

Create a one-time PayPal order from an allow-listed server product:

```bash
curl -X POST "https://gptmarketplus.com/api/paypal/orders/create" \
  -H "Content-Type: application/json" \
  --data '{"productId":"ai_agent_launch_kit","sourcePage":"/ai-agent-launch-kit"}'
```

The response contains a PayPal approval URL. PayPal returns the approved buyer to `/paypal/complete`; that page calls `/api/paypal/orders/capture` and opens the correct secure download or onboarding path only after a verified `COMPLETED` capture.

The subscription catalog bootstrap is idempotent through the stored product and plan IDs plus PayPal request IDs. PayPal subscription events are received at `/api/paypal/webhook`; completed recurring payments and verified one-time captures are written into the existing revenue ledger and trigger fulfillment work.

The public pages emit `scroll_depth` at 25%, 50%, 75%, and 90%, retain first-touch UTM/referrer data for site events and lead source pages, and emit `chat_open` only when a visitor actually opens chat. GA4 property `514250564` uses exactly two Key Events: `generate_lead` and the default `purchase`; no synthetic conversion was fired during verification.

Each browser tab also receives an anonymous session ID in `sessionStorage`. Site events send that ID to D1 so the private admin dashboard can distinguish tagged sessions from direct or untagged sessions without storing cookies, names, email addresses, or other visitor identity in the attribution report.

Open `/admin-dashboard` with `ADMIN_TOKEN` to view the rolling seven-day attribution health panel, or retrieve the aggregate-only JSON report with a 1-to-90-day window:

```bash
curl "https://gptmarketplus.com/api/admin/attribution?days=7" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

The attribution API is private, non-cacheable, and `noindex`. Its response includes aggregate channel, landing-page, event, and daily counts; it excludes `utm_medium=qa` test traffic, raw session IDs, user agents, contact details, and raw event properties.

Use the generated campaign-link catalog for every external email, social bio, post, proposal, PDF, slide deck, or other digital document. Do not add UTM parameters to normal internal navigation because that overwrites the original source:

```bash
curl https://gptmarketplus.com/api/utm-links
curl https://gptmarketplus.com/social
```

Set the optional direct-payment variable only when the pricing page should link to an approved PayPal payment endpoint:

```bash
wrangler vars put PAYPAL_PAYMENT_LINK
```

## Cloudflare features

This Worker now uses:

- `Workers`
- `KV`
- `D1`
- `Queues`
- `Durable Objects and alarms`
- `Turnstile`
- `Observability`
- `caches.default`

### Required live setup

D1 and Queue resources are already provisioned in [`wrangler.jsonc`](./wrangler.jsonc). Validate the checked-in bindings before deploys, and apply schema migrations when they change:

```bash
npm run validate:bindings
npm run migrate:d1
```

Run the migration command before deploying Worker code that depends on new tables. It applies every pending file in `migrations/`, including the runtime-state migration, to the remote D1 database in order.

Set the Turnstile keys before enabling the protected lead form:

```bash
wrangler secret put TURNSTILE_SITE_KEY
wrangler secret put TURNSTILE_SECRET_KEY
```

Browse playbook history from:

```bash
curl https://gptmarketplus.com/api/agents/playbook
```

Public sharing hub:

```bash
curl https://gptmarketplus.com/social
```

Set these optional social profile URLs as vars to surface real follow links and `sameAs` schema:

```bash
wrangler vars put FACEBOOK_URL
wrangler vars put TIKTOK_URL
wrangler vars put LINKEDIN_URL
wrangler vars put X_URL
wrangler vars put YOUTUBE_URL
wrangler vars put INSTAGRAM_URL
```

Submission checklist:

```text
Facebook
- Share https://gptmarketplus.com/social and https://gptmarketplus.com/agents/
- Use the Facebook Sharing Debugger to scrape the URL after deploy

TikTok
- Link the public site in the profile bio and use short video descriptions that point to /social
- Re-share the same URLs after any major page change

Google
- URL-prefix ownership for https://gptmarketplus.com/ is verified in Search Console
- /sitemap.xml is processed successfully with 35 discovered pages as of 2026-08-01
- Inspect /agents/, /social, and /playbook for indexing

Bing
- Verify in Bing Webmaster Tools
- Submit /sitemap.xml
- Enable IndexNow key-file hosting and ping URLs after updates
```

If you want the Worker to use the D1-backed schema in production, keep the migration file in sync with any future table changes and run the migration against the live database before deploys.

## Traffic Pages

The Traffic Acquisition Agent publishes and tracks indexable landing pages:

```text
https://gptmarketplus.com/ai-marketing-automation
https://gptmarketplus.com/ai-lead-generation
https://gptmarketplus.com/small-business-ai-tools
https://gptmarketplus.com/chatgpt-marketing
https://gptmarketplus.com/ai-sales-funnel
https://gptmarketplus.com/sponsor
https://gptmarketplus.com/advertise
https://gptmarketplus.com/ad-network
https://gptmarketplus.com/pricing
```

They are included in `sitemap.xml`, `llms.txt`, and `agents/feed.xml`.

## Lead Spider Agent

The Lead Spider Agent scans public prospect-source pages, extracts candidate public URLs, scores sponsor/listing/audit fit, stores a prospect board in KV, and queues sales tasks for the highest-fit targets.

```bash
curl https://gptmarketplus.com/agents/lead-spider
curl https://gptmarketplus.com/api/agents/lead-spider/prospects
curl -X POST https://gptmarketplus.com/api/agents/lead-spider/run \
  -H 'content-type: application/json' \
  --data '{}'
```

Custom crawl seeds are accepted only with `ADMIN_TOKEN`:

```bash
curl -X POST https://gptmarketplus.com/api/agents/lead-spider/run \
  -H 'content-type: application/json' \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  --data '{"force":true,"urls":["https://example.com/partners"]}'
```

The spider is intentionally bounded: HTTPS public pages only, capped source count, capped response bytes, deduped domains, no private-network crawling, and no automated bulk outreach. Its job is to find and score sales opportunities, then queue reviewed sponsor checkout or AI revenue-audit follow-up tasks.

Set these optional secrets before production use:

```bash
wrangler secret put ADMIN_TOKEN
wrangler secret put LEAD_WEBHOOK_URL
wrangler secret put AGENT_WEBHOOK_URL
```

`ADMIN_TOKEN` protects forced `/api/agents/run` calls. Non-forced calls keep the 30-minute duplicate-run guard, while `/api/agents/state` remains a public read-only operational snapshot.
`LEAD_WEBHOOK_URL` receives new leads.
`AGENT_WEBHOOK_URL` receives the latest generated marketing plan every six hours.
