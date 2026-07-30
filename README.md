# AgentID Services

Cloudflare Worker agent layer for `agentid.services` with lead capture, site-health checks, lead scoring, marketing-task generation, playbook history, and a persistent task queue.

[![CI](https://github.com/nrk8286/agentid-services/actions/workflows/ci.yml/badge.svg)](https://github.com/nrk8286/agentid-services/actions/workflows/ci.yml)
[![CodeQL](https://github.com/nrk8286/agentid-services/actions/workflows/codeql.yml/badge.svg)](https://github.com/nrk8286/agentid-services/actions/workflows/codeql.yml)
[![Live site](https://img.shields.io/website?url=https%3A%2F%2Fagentid.services&label=agentid.services)](https://agentid.services)

[Live site](https://agentid.services) · [Pricing](https://agentid.services/pricing) · [Agent status](https://agentid.services/api/agents/health) · [AI search status](https://agentid.services/api/genai/status) · [Security policy](SECURITY.md) · [Report an issue](https://github.com/nrk8286/agentid-services/issues/new/choose)

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

The Cloudflare account is currently at its free-plan cron trigger limit. To make the system run anyway, the existing `apex` Worker's `0 */6 * * *` cron now dispatches `POST https://agentid.services/api/agents/run` after its normal full orchestrator cycle.

Cloudflare routes are configured to send the full `agentid.services/*` site surface through this Worker, so the Worker owns the live site instead of only selected subpaths.

## Live endpoints

```bash
curl https://agentid.services/api/agents/health
curl https://agentid.services/api/agents/state
curl https://agentid.services/software-builds
curl https://agentid.services/llms.txt
```

Use `{"force":true}` only when you need to bypass the 30-minute duplicate-run guard.

## SEO and Ads

The agent Worker serves:

```bash
curl https://agentid.services/robots.txt
curl https://agentid.services/sitemap.xml
curl https://agentid.services/ads.txt
curl https://agentid.services/llms.txt
curl https://agentid.services/llms-full.txt
curl https://agentid.services/agents/feed.xml
curl https://agentid.services/agents/feed.json
curl https://agentid.services/.well-known/ai-crawler-policy.json
curl https://agentid.services/security.txt
curl https://agentid.services/social
curl https://agentid.services/pricing
```

`ads.txt` publishes the configured Google AdSense seller record. Ad serving remains
dependent on Google site approval, policy compliance, and valid traffic.

## AI crawler discovery

The Worker exposes crawler-friendly discovery files for AI search and retrieval systems:

```bash
curl https://agentid.services/robots.txt
curl https://agentid.services/llms.txt
curl https://agentid.services/llms-full.txt
curl https://agentid.services/.well-known/ai-crawler-policy.json
curl https://agentid.services/agents/feed.json
```

If Cloudflare Managed `robots.txt` is enabled for the zone, it can prepend `Disallow` rules for AI crawlers before the Worker response. Disable Cloudflare's managed AI crawler `robots.txt` setting when the goal is AI search, AI answer grounding, and AI crawler pickup.

Stripe Checkout for sponsor placements is implemented at the public pricing surface and API. The pricing page also exposes invoice, ACH, bank transfer, PayPal, and crypto request paths for buyers who cannot use Stripe.

Google Tag Manager and Google Analytics are wired through the Worker's first-party `/gtag` proxy path. `GTM-NVW28HCG` loads at the start of `<head>`, while `G-3BCSR51WHZ` is loaded directly so GA4 measurement does not depend on the current GTM container publishing a GA4 Configuration tag. Set the IDs and, if you want Ads conversion tracking, the conversion ID and label:

```bash
curl https://agentid.services/pricing
curl -X POST https://agentid.services/api/agents/ads/checkout \
  -H 'content-type: application/json' \
  --data '{"packageId":"sponsor_starter_monthly"}'
wrangler vars put GOOGLE_TAG_ID
wrangler vars put GOOGLE_ANALYTICS_ID
wrangler vars put GOOGLE_ADS_CONVERSION_ID
wrangler vars put GOOGLE_ADS_CONVERSION_LABEL
```

`STRIPE_SECRET_KEY` is configured on the `agentid-services-agent-system` Worker for live Checkout. Deposits/payouts are handled by the Stripe account payout settings. The $29 AI Agent Launch Kit uses the same hosted Checkout flow and serves its download only after the Worker retrieves the Checkout session from Stripe and confirms that it is complete and paid. For Google measurement, the site uses `GOOGLE_TAG_GATEWAY_PATH=/gtag` and serves that path from the Worker itself.

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
curl https://agentid.services/api/genai/status
curl -X POST https://agentid.services/api/chat \
  -H 'content-type: application/json' \
  --data '{"message":"What does an AI agent cost?","sourcePage":"/pricing"}'
```

### Resource-led traffic and digital product revenue

The primary site now contains an original resource hub, six buyer/operator
resources, a client-side ROI calculator, and a paid launch kit:

```text
https://agentid.services/resources
https://agentid.services/guides/ai-agent-for-small-business
https://agentid.services/guides/ai-receptionist-cost
https://agentid.services/guides/ai-lead-follow-up
https://agentid.services/compare/ai-agent-vs-chatbot
https://agentid.services/industries/contractors-ai-automation
https://agentid.services/templates/lead-follow-up-scripts
https://agentid.services/tools/ai-automation-roi-calculator
https://agentid.services/ai-agent-launch-kit
```

These URLs are included in the primary sitemap, the RSS/JSON discovery feeds,
`llms.txt`, `llms-full.txt`, and the automated IndexNow batch. The calculator
runs entirely in the browser and does not submit the user's inputs.

The digital product endpoints are:

```bash
# Public product page
curl https://agentid.services/ai-agent-launch-kit

# Secure post-purchase page (card checkout)
curl "https://agentid.services/downloads/ai-agent-launch-kit?session_id=cs_..."

# File delivery (card checkout)
curl -OJ "https://agentid.services/api/digital-products/ai-agent-launch-kit?session_id=cs_..."
```

### PayPal one-time payments and sponsor subscriptions

PayPal is a live alternative to Stripe across the $29 AI Agent Launch Kit, fixed-price builds, setup deposits, and recurring sponsor inventory. One-time purchases use PayPal Orders v2: the Worker creates the order from its server-owned product catalog, redirects the buyer to PayPal, captures the approved order on the server, checks the exact product/currency/amount, and only then records revenue or unlocks delivery. The sponsor inventory continues to support recurring PayPal subscriptions at $49, $99, and $149 per month.

The PayPal client secret is never sent to the browser. The secure Launch Kit URL requires the completed order ID plus a separate random access token stored in KV; a PayPal redirect alone cannot unlock the file.

Configure the live PayPal REST application credentials as Worker secrets:

```bash
wrangler secret put PAYPAL_CLIENT_ID
wrangler secret put PAYPAL_CLIENT_SECRET
```

### Google AdSense publisher ads

The public AgentID pages support Google AdSense Auto ads. Set `ADSENSE_CLIENT_ID`
to the public `ca-pub-0000000000000000` value from the approved AdSense account
and leave `ADSENSE_ENABLED` set to `true`. The Worker then adds Google's
unmodified asynchronous loader to eligible public pages, publishes the matching
Google seller record at `/ads.txt`, and reports readiness at
`/api/ads/status`. Private dashboards, onboarding, privacy, terms, pricing,
contact, booking, paid-product, and download pages do not load publisher ads.
Informational resource pages remain eligible so ads do not compete with the
highest-value consultation and checkout actions.

Ad serving and payment still depend on Google approving `agentid.services`,
enabling Auto ads in AdSense, valid human traffic, advertiser demand, and the
publisher completing Google's identity, tax, address, and payout requirements.
Never click the site's own ads, automate ad interactions, reward users for
clicks, or buy low-quality traffic.

Then create the live PayPal catalog product, three active monthly plans, and the verified webhook registration once:

```bash
curl -X POST "https://agentid.services/api/paypal/bootstrap" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Check readiness without exposing credentials:

```bash
curl "https://agentid.services/api/paypal/status"
```

Create a one-time PayPal order from an allow-listed server product:

```bash
curl -X POST "https://agentid.services/api/paypal/orders/create" \
  -H "Content-Type: application/json" \
  --data '{"productId":"ai_agent_launch_kit","sourcePage":"/ai-agent-launch-kit"}'
```

The response contains a PayPal approval URL. PayPal returns the approved buyer to `/paypal/complete`; that page calls `/api/paypal/orders/capture` and opens the correct secure download or onboarding path only after a verified `COMPLETED` capture.

The subscription catalog bootstrap is idempotent through the stored product and plan IDs plus PayPal request IDs. PayPal subscription events are received at `/api/paypal/webhook`; completed recurring payments and verified one-time captures are written into the existing revenue ledger and trigger fulfillment work.

The public pages emit `scroll_depth` at 25%, 50%, 75%, and 90%, retain first-touch UTM/referrer data for site events and lead source pages, and emit `chat_open` only when a visitor actually opens chat. `chat_open` is marked as a Key Event in GA4 property `514250564` (`clean-base-1`).

Each browser tab also receives an anonymous session ID in `sessionStorage`. Site events send that ID to D1 so the private admin dashboard can distinguish tagged sessions from direct or untagged sessions without storing cookies, names, email addresses, or other visitor identity in the attribution report.

Open `/admin-dashboard` with `ADMIN_TOKEN` to view the rolling seven-day attribution health panel, or retrieve the aggregate-only JSON report with a 1-to-90-day window:

```bash
curl "https://agentid.services/api/admin/attribution?days=7" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

The attribution API is private, non-cacheable, and `noindex`. Its response includes aggregate channel, landing-page, event, and daily counts; it excludes `utm_medium=qa` test traffic, raw session IDs, user agents, contact details, and raw event properties.

Use the generated campaign-link catalog for every external email, social bio, post, proposal, PDF, slide deck, or other digital document. Do not add UTM parameters to normal internal navigation because that overwrites the original source:

```bash
curl https://agentid.services/api/utm-links
curl https://agentid.services/social
```

Set these optional direct-payment vars if you want the pricing page to link straight to additional payment endpoints:

```bash
wrangler vars put PAYPAL_PAYMENT_LINK
wrangler vars put BANK_TRANSFER_URL
wrangler vars put CRYPTO_PAYMENT_LINK
```

## Cloudflare features

This Worker now uses:

- `Workers`
- `KV`
- `D1`
- `Queues`
- `Cron Triggers`
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
curl https://agentid.services/api/agents/playbook
```

Public sharing hub:

```bash
curl https://agentid.services/social
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
- Share https://agentid.services/social and https://agentid.services/agents/
- Use the Facebook Sharing Debugger to scrape the URL after deploy

TikTok
- Link the public site in the profile bio and use short video descriptions that point to /social
- Re-share the same URLs after any major page change

Google
- Verify ownership in Search Console
- Submit /sitemap.xml
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
https://agentid.services/ai-marketing-automation
https://agentid.services/ai-lead-generation
https://agentid.services/small-business-ai-tools
https://agentid.services/chatgpt-marketing
https://agentid.services/ai-sales-funnel
https://agentid.services/sponsor
https://agentid.services/advertise
https://agentid.services/ad-network
https://agentid.services/pricing
```

They are included in `sitemap.xml`, `llms.txt`, and `agents/feed.xml`.

## Lead Spider Agent

The Lead Spider Agent scans public prospect-source pages, extracts candidate public URLs, scores sponsor/listing/audit fit, stores a prospect board in KV, and queues sales tasks for the highest-fit targets.

```bash
curl https://agentid.services/agents/lead-spider
curl https://agentid.services/api/agents/lead-spider/prospects
curl -X POST https://agentid.services/api/agents/lead-spider/run \
  -H 'content-type: application/json' \
  --data '{}'
```

Custom crawl seeds are accepted only with `ADMIN_TOKEN`:

```bash
curl -X POST https://agentid.services/api/agents/lead-spider/run \
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

`ADMIN_TOKEN` protects `/api/agents/run` and `/api/agents/state`.
`LEAD_WEBHOOK_URL` receives new leads.
`AGENT_WEBHOOK_URL` receives the latest generated marketing plan every six hours.
