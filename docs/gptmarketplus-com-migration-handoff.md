# GPTMarketPlus.com production migration handoff

Status date: 2026-08-01 America/Chicago

## Executive status

`https://gptmarketplus.com` is the canonical production origin. The apex and `www` host resolve through Cloudflare, present valid HTTPS, and the `www` host permanently redirects to the apex. The legacy `agentid.services` application surface permanently redirects to the matching `.com` path, except the existing payment-webhook paths that remain available for provider continuity.

The commercially safe launch offer is the **AI Agent Launch Kit**, a one-time $29 PayPal purchase with payment-gated download access. A live PayPal approval order was created during verification without completing or charging the order. Custom implementation, software-build, and sponsor-payment endpoints are deliberately disabled until their written scope and automated fulfillment are ready. Their public pages now collect an application or quote request instead of presenting a broken checkout.

This migration is production-live but not unconditionally complete. The old `.org` domain is currently `pendingDelete` and returns NXDOMAIN, so it cannot provide the required search-preserving redirect unless the owner takes an urgent registrar action that may involve a fee. A real payment capture and provider receipt were not performed because they require authority to make a financial transaction.

## Production customer journey

1. Discover public guides, resources, sitemap URLs, or the landing page at `https://gptmarketplus.com`.
2. Review transparent service starting prices and the fulfilled $29 digital offer.
3. Open PayPal Checkout from `/ai-agent-launch-kit`.
4. PayPal returns to `/paypal/complete`; the Worker captures and verifies the provider order.
5. The Worker stores an idempotent paid-order record and returns an access-tokenized delivery URL.
6. `/paypal/download/ai-agent-launch-kit` verifies the completed order and token before exposing the download.
7. The purchaser receives PayPal's provider receipt and can use the published support mailbox and refund policy.

Observed production evidence: live mode, PayPal credentials configured, PayPal webhook configured, `digitalProductReady: true`, a real no-charge approval URL created for `USD 29.00`, and anonymous/unpaid download access rejected. The post-capture steps are implemented but need one owner-authorized real purchase for full financial-lifecycle acceptance.

## Domain and infrastructure changes

- Added Cloudflare custom domains for `gptmarketplus.com` and `www.gptmarketplus.com`.
- Made `.com` the canonical `SITE_URL`, brand, structured-data origin, sitemap origin, robots host, social-preview origin, public-link registry, agent base URL, and documentation URL.
- Preserved the existing KV/D1 customer and operational namespace with `STORAGE_SCOPE=agentid.services`; this avoids orphaning pre-migration state.
- Added same-path HTTP 301 redirects from `agentid.services` and its `www` host, while preserving legacy Stripe and PayPal webhook paths.
- Added a permanent `www.gptmarketplus.com` to apex redirect.
- Retained `.org` compatibility recognition in the Worker for a future redirect if DNS is restored; no domain ownership, registrar, or zone was deleted.
- Deployed Cloudflare Turnstile for the apex and `www`, stored the secret as a Worker secret, rendered the public widget, and verified a complete form payload without a token is rejected with HTTP 403.
- Kept D1, KV, R2, Queue, Durable Object scheduler, Analytics Engine, AI Search, rate limiting, and Flagship bindings attached.

Current Worker deployment version: `bbb31100-0857-4919-8e70-1f48676722cc`.

## Commercial model

Target customer: small service businesses and operators planning a practical first AI workflow.

- Self-service: AI Agent Launch Kit, $29 one-time, secure download after verified PayPal payment.
- Custom implementation: starting-price guidance plus strategy/quote intake; no online charge before written scope.
- Software builds: proposal starting points; checkout disabled until delivery terms are accepted.
- Sponsorship: reviewed applications; recurring billing disabled until inventory and placement fulfillment are verified.

Removed or gated: unsupported card readiness, public sponsor subscriptions, unfulfilled build checkout, public prospect controls, estimated-pipeline marketing figures, stale brand claims, and public task/payment/customer details.

## Security and privacy status

- Enforced HSTS, CSP, `frame-ancestors`, `object-src 'none'`, MIME sniffing protection, same-origin framing, referrer policy, and restrictive permissions policy.
- Private onboarding, customer, and admin responses use `no-store`, `noindex`, and `no-referrer`.
- Admin access uses `ADMIN_TOKEN`; autonomous runtime actions accept the separate runtime credential. Query-string admin tokens are rejected.
- Lead-spider controls and prospect records require authorization.
- Public agent state exposes aggregates rather than customer, task-detail, checkout-session, or token records.
- Onboarding derives entitlement only from a verified paid Stripe session, paid purchase token, or completed PayPal order token.
- Stripe storage is idempotent and requires `payment_status=paid`. Card checkout is enabled with a signed production webhook at `https://gptmarketplus.com/api/stripe/webhook`; the signing secret is stored only as a Cloudflare Worker secret.
- Checkout and forms use rate limiting; forms additionally require Turnstile.
- `npm audit` reported zero dependency vulnerabilities during the migration audit.

Residual security constraint: inline application scripts require CSP `unsafe-inline`. Converting these scripts to nonce- or hash-based loading is a future hardening item.

## Analytics, search, and acquisition

- Direct GA4 tag `G-3BCSR51WHZ` loads through the first-party `/gtag` gateway.
- Browser verification observed a real GA4 `page_view` request returning HTTP 204.
- The empty GTM container is no longer treated as proof of measurement readiness.
- GA4 property `514250564` and web stream `13045958159` now identify GPTMarketPlus at `https://gptmarketplus.com`; the stream reports active data collection and Data flowing. Realtime showed four active users, four page views, and genuine `first_visit`, `page_view`, `session_start`, and `user_engagement` events during verification.
- GA4 Key Events were cleaned to exactly `generate_lead` and the default `purchase`. No synthetic lead or purchase event was fired; neither conversion had stream data at verification time.
- Sitemap, robots, canonical links, structured data, `llms.txt`, feeds, security policy, and 17 critical public links use `.com`.
- The sitemap contains the refund policy and excludes onboarding/customer/admin routes.
- Search Console URL-prefix property `https://gptmarketplus.com/` is ownership-verified through the exact production HTML tag. `https://gptmarketplus.com/sitemap.xml` was processed successfully on 2026-08-01 with 35 discovered pages and zero discovered videos.
- The optional Domain property remains pending because the Cloudflare MCP grant lacks `dns.write`; no apex DNS record was changed. Change of Address remains unavailable because the `.org` domain is NXDOMAIN.

## Support and transactional communication

Cloudflare Email Routing is enabled and ready for `gptmarketplus.com`. The enabled literal rule forwards `admin@gptmarketplus.com` to the verified owner destination; public and authoritative DNS expose Cloudflare MX, SPF, and DKIM records. A live Gmail message to the branded address was accepted for delivery. The branded address is the published support identity.

Application-originated email now has two verified adapters. The restricted Cloudflare binding sends only owner notifications from `admin@gptmarketplus.com`; a production diagnostic returned a Cloudflare message ID and the independent Gmail inbox showed the message as unread. The encrypted Gmail OAuth adapter is connected with `gmail.send` and sends arbitrary customer recipients; a production diagnostic returned Gmail message ID `19fbbba4d33bffcd`, which Gmail independently listed in Sent. Resend remains a non-required fallback when configured.

Completed PayPal captures now call the customer adapter, email the secure delivery URL to the PayPal payer address, persist a sanitized provider result, expose only an `emailSent` Boolean to checkout, and enforce a 15-minute failure-retry interval. PayPal still supplies the payment receipt. A real capture/email acceptance test remains owner-authorized because it requires a real $29 charge.

## Validation ledger

```text
npm test
# Worker syntax, Cloudflare binding validation, 17 canonical links: passed

.venv/bin/python -m pytest -q tests/unit tests/integration/test_server_e2e.py
# 19 passed; 4 upstream ADK deprecation warnings

npm run validate:links -- --live
# 17 canonical public links passed live

curl -sS 'https://gptmarketplus.com/api/agents/health?deep=1'
# ok=true; internal home, agents, and agent API probes healthy

curl -I https://www.gptmarketplus.com/pricing
# valid TLS and 301 to https://gptmarketplus.com/pricing

curl -X POST https://gptmarketplus.com/api/paypal/orders/create ...
# live $29 approval URL and order ID returned; no charge completed

curl -X POST https://gptmarketplus.com/api/contact ...
# complete form without Turnstile token rejected HTTP 403

curl https://gptmarketplus.com/api/agents/google/oauth/status
# connected=true; gmailSendReady=true; gmail.send grant encrypted in KV

curl https://gptmarketplus.com/
# exact Google Search Console verification tag present in <head>
```

Playwright evidence covered 1440px desktop and 390px mobile layouts, canonical redirect behavior, the PayPal CTA, quote-only service flows, absent sponsor subscription controls, direct GA4 delivery, and a clean application console on the home/pricing/launch-kit surfaces. Turnstile loaded successfully; headless Chromium emitted third-party WebGL diagnostics inside the Cloudflare challenge iframe, not application exceptions.

## Agent workstream ledger

- Lead/integration: repository inventory, architectural decisions, implementation, deployments, conflict resolution, production acceptance, and handoff.
- Domain/Cloudflare agent: zone, DNS, certificate, route, binding, scheduler, storage, and `.org` retirement audit.
- Commerce/customer-journey agent: checkout, webhook, entitlement, delivery, support, cancellation/refund, and failure-mode audit.
- Security agent: authorization, IDOR, cache, token, webhook, rate-limit, secret, and browser-security audit.
- SEO/Google agent: canonical metadata, crawl surfaces, GA4/GTM, Search Console, structured data, and acquisition audit.

## Blockers requiring owner or external authority

1. **Old domain retirement — owner/registrar, urgent.** `gptmarketplus.org` expired 2026-05-23, is `pendingDelete`, and returns NXDOMAIN. Decide immediately whether to attempt registrar recovery (which may be impossible or fee-bearing) so the domain can serve 301 redirects for at least a year. Otherwise accept loss of redirect/search continuity and the future impersonation risk after deletion. No domain ownership action was taken.
2. **Real purchase acceptance — owner/PayPal.** Authorize and complete one real $29 purchase, verify the provider receipt, gated download, refund/support path, and then refund it if desired.
3. **Card-payment acceptance — owner/Stripe.** The live `.com` webhook and signing secret are configured and signed delivery was verified. A real authorized charge, customer delivery, and refund still need acceptance testing before the full financial lifecycle can be claimed proven.
4. **Cloudflare zone hardening and Search Console Domain property — owner/Cloudflare.** The current Wrangler OAuth grant can deploy Workers but lacks DNS, Zone Settings, Cache Rules, and Zone WAF read/write permissions. Create a zone-scoped API token with `Zone Read`, `DNS Write`, `Zone Settings Write`, `Cache Purge`, `Cache Rules Edit`, `Transform Rules Edit`, `Zone WAF Edit`, and `Bot Management Edit` for `gptmarketplus.com`. Use it to set minimum TLS 1.2, enable DNSSEC, add CAA and Google verification TXT records, inspect/configure WAF and cache rules, and finish `sc-domain:gptmarketplus.com`. Until minimum TLS can be set at the zone, the Worker rejects TLS 1.0/1.1 application requests with HTTP 426. The production URL-prefix Search Console property and sitemap are already verified and operational.

## Rollback and recovery

- Application rollback: `npx wrangler rollback ecdca4cb-3875-4a8c-b860-5d4fbf6b0822` restores the last verified pre-email `.com` build if the current deployment causes a regression.
- Data recovery: current D1 Time Travel bookmark at handoff was `00000410-00000000-000050ba-0e86abe79b68e614a5e4c264eda1b4a8`; use `wrangler d1 time-travel restore agentid-services --bookmark=<bookmark>` only after confirming the restore target and impact.
- KV continuity: do not remove `STORAGE_SCOPE=agentid.services` until data is explicitly migrated and reconciled.
- Payment continuity: do not remove legacy webhook exceptions until PayPal/Stripe dashboards are confirmed on `.com` and delivery logs show no old-host traffic.
- Domain rollback: custom domains and the retained `agentid.services` routes allow a previous Worker version to be redeployed without changing storage.

## Data-driven 30/60/90-day plan

Current observed baseline: zero verified revenue and zero paid checkouts in the public revenue ledger at handoff. No revenue forecast is asserted.

- Days 1-30: complete one real purchase/refund acceptance test; publish weekly buyer-intent content; monitor the verified GA4 and Search Console baselines; measure visit-to-checkout-start, approval, paid delivery, refund, and support rates.
- Days 31-60: improve the Launch Kit from observed completion/support questions; test one landing-page message at a time; add an ethical referral mechanism; interview purchasers before enabling any higher-priced offer.
- Days 61-90: enable exactly one additional product only if the first offer has reliable fulfillment and measurable demand; use observed conversion, refund, support burden, and retention data to decide between a recurring toolkit, reviewed sponsor inventory, or a productized implementation service.
