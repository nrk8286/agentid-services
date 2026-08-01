# Security best-practices report

Status: production hardening applied and verified on 2026-07-31 America/Chicago.

## Fixed in this migration

- Removed public access to detailed tasks, prospect boards, customer/payment events, checkout sessions, and tokens.
- Removed email-, lead-, purchase-, and session-ID customer-dashboard lookups; access now requires a high-entropy dashboard token.
- Prevented caller-supplied onboarding data from creating a paid entitlement.
- Separated administrator and autonomous-runtime authorization and removed query-string admin tokens.
- Required payment-provider evidence before entitlement and made Stripe session fulfillment idempotent.
- Enabled Stripe card checkout only after creating the canonical `.com` webhook, installing its signing secret, and verifying a signed production probe. Sponsor and custom-service checkout remain disabled until their fulfillment requirements are met.
- Added rate limiting, request-size limits, Turnstile, private cache controls, and noindex controls.
- Added an enforced CSP plus HSTS, frame, MIME, referrer, and permissions protections.
- Restricted analytics/webhook relaying and suppressed analytics on private pages.
- Added provider-separated transactional email: a destination-restricted Cloudflare binding for owner alerts and an encrypted Gmail OAuth grant for customer recipients. Provider failures are checked and never reported as delivered.

## Residual findings

### Medium: inline scripts require `unsafe-inline`

The Worker renders several inline scripts, so CSP cannot yet remove `unsafe-inline`. Migrate scripts into static assets or use response-specific nonces/hashes, then tighten `script-src`.

### Medium: customer mail uses a verified Gmail sender

Application-originated purchase, fulfillment, and support messages are active. Owner alerts use `admin@gptmarketplus.com`; customer mail currently uses the verified owner Gmail address with a GPTMarketPlus display name. Fully branded arbitrary-recipient mail requires onboarding `gptmarketplus.com` to an outbound service such as Cloudflare Email Sending or a separately verified provider. Do not change the sender address until the provider verifies it.

### Medium: full paid lifecycle needs an authorized charge

The live provider created an approval order and unpaid access was denied, but capture, provider receipt, tokenized delivery, and refund have not been exercised with a real charge.

### Medium: Cloudflare zone controls require a broader scoped token

The current Wrangler OAuth grant cannot read or write DNS, Zone Settings, Cache Rules, Bot Management, or Zone WAF resources. Public probes show DNSSEC and CAA are absent and the edge still negotiates TLS 1.0/1.1. The Worker rejects application requests negotiated below TLS 1.2 with HTTP 426, but the stronger fix is a Cloudflare zone setting. Create a token restricted to `gptmarketplus.com`, apply minimum TLS 1.2, DNSSEC, CAA, cache-bypass rules for private/API paths, and compatible WAF/rate-limit rules. Do not enable Free Bot Fight Mode because it cannot exempt payment webhooks and may challenge API traffic.

### Low: legacy resource names remain internal

Cloudflare D1, KV, queue, AI Search, analytics dataset, and Worker names retain `agentid-services` identifiers. They are not customer-facing and preserve data continuity. Rename only through a planned data migration.

## Verification

- Worker test suite passed.
- ADK suite: 19 passed, 4 upstream deprecation warnings.
- `npm audit`: zero vulnerabilities during the migration audit.
- Production private routes return `no-store` and `noindex`.
- Unauthorized runtime, prospect, and sponsor actions return 403/503.
- Complete contact payload without Turnstile proof returns 403.
- Playwright home/pricing/launch-kit checks reported zero application console errors after CSP tuning.
