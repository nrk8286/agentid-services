# AgentID Services / GPT Market Plus PayPal Sales Funnel Audit

Date: 2026-08-14
Scope: `agentid.services` and `gptmarketplus.com` paid-ad inventory, PayPal invoices, and PayPal subscriptions
Payment constraint: PayPal only. Stripe was excluded from research, implementation, and validation.
Production mutation: Cloudflare Worker version `21e5e2a3-b1bb-4090-a847-e76c307f2ce6` and D1 migration `0010_paypal_subscription_approvals.sql` were deployed after authorization. No charge, subscription, invoice, refund, customer, campaign, or paid-ad spend was created.

## Executive outcome

The PayPal foundation is substantially built and live: credentials, product catalog, webhook, all three recurring plan IDs, one-time Orders, CPC invoicing, customer email delivery, and the CPC invoice webhook report ready. The first broken commercial link is not provider configuration. It is the transition from offer selection to approved billing.

Before the patch, the live pricing page made a buyer choose a sponsor plan, opened `/advertise?package=...`, then discarded the selected package and required the buyer to choose again. The deployed funnel now preserves that selection through the reviewed application. Recurring plans are available in PayPal, and subscription creation is now restricted to private, short-lived links tied to an approved recipient and exact plan. Public subscription checkout remains disabled. Verified revenue remains `$0` with `0` paid checkouts.

The deployed patch removes the duplicate selection, preserves the exact plan through the application and lead record, explains PayPal invoice versus subscription billing, adds plan-level analytics, and redirects old package-qualified advertising links to the matching application. It does not bypass sponsor review or expose public recurring charges.

## Verified live funnel

| Stage | Status | Evidence | Bottleneck or mismatch |
|---|---|---|---|
| Public offer | PASS | `/pricing`, `/advertise`, `/ad-network`, and the selected sponsor application returned HTTP 200 on both domains. | Advertising inventory is below the Launch Kit, custom services, and support sections on the general pricing page. |
| Plan clarity | PASS | CPC Pilot `$50` cap; recurring placements `$49`, `$99`, and `$149` per 30-day placement. Live cards and applications distinguish PayPal invoice billing from approval-scoped PayPal subscription billing. | Public subscription checkout remains disabled by design. |
| Plan selection | PASS | Pricing cards link directly to the matching application; old package-qualified advertising routes return a UTM-preserving 302. | Monitor plan-selection-to-application conversion after real traffic arrives. |
| Sponsor application | PASS | Package-specific `/contact?intent=sponsor&package=...` renders a reviewed application with no charge and persists the selected plan as structured `requestedPackageId`. | No real advertiser application was submitted during validation. |
| PayPal credentials | PASS | Public status reported live mode and configured credentials. | Configuration does not prove payment. |
| PayPal catalog | PASS | Product, webhook, and all three recurring plan IDs reported available. | Catalog readiness was hidden from the buyer journey. |
| Recurring checkout | PASS for approval-scoped readiness | `sponsorCheckoutEnabled:true`; `approvalScopedSubscriptionsEnabled:true`; `publicSubscriptionCheckoutEnabled:false`; access mode is `private_approval_link`. | A legitimate buyer approval and paid webhook remain required before claiming a paid subscription or revenue. |
| CPC funding | PASS for readiness | CPC model, invoice webhook, required events, server validation, and `$2 x 25 = $50` default offer reported configured. | No active campaign existed. Readiness is not revenue. |
| Webhook | PASS for configuration | PayPal webhook and CPC invoice webhook reported ready. | No legitimate paid event was available for end-to-end reconciliation. |
| Fulfillment | PASS for configured email / NOT TESTED for a real buyer | Customer email delivery reported ready. | No real paid subscription or CPC campaign was created in this audit. |
| Analytics | PASS for instrumentation | Page view, product view, site view, form, checkout, provider-verified purchase, and `advertiser_plan_select` controls exist. | No real-traffic conversion baseline exists yet. |
| Verified revenue | FAIL | Live revenue API reported `$0`, `0` paid checkouts, and `$0/hour`. | No verified purchase or settled advertising revenue. |

## Buyer-experience findings

### P0 - Deployed the validated plan-selection fix

The live patch changes each pricing card to link directly to its matching sponsor application. It also preserves older `/advertise?package=...`, `/sponsor?package=...`, and `/ad-network?package=...` links through a 302 redirect that retains UTM/source parameters.

Expected effect: one fewer decision and page transition between plan interest and application start, with reliable plan-level attribution.

### P0 - Recurring charges are approval-scoped

The PayPal plans exist and the subscription system is enabled only behind the private approval-link gate. The generic public endpoint requires a valid expiring token and matching approved recipient email. The activation sequence is:

1. Review the advertiser, destination, creative, inventory, dates, and delivery capacity.
2. Record the approved plan and written renewal/cancellation terms.
3. Issue a short-lived, package-bound approval link.
4. Create the PayPal subscription only from that approved handoff.
5. Activate placement only after the signed webhook confirms the required subscription/payment state.
6. Stop or expire placement on cancellation, suspension, expiration, refund, or delivery exhaustion.

### P1 - Create a dedicated paid-ad landing page

The general pricing page is optimized first for the `$29` Launch Kit and custom AI-agent services. Paid-traffic buyers should land on a dedicated `/advertise` experience whose first viewport contains:

- audience and page categories;
- current inventory and capacity;
- CPC versus recurring-plan comparison;
- placement examples with clear sponsored labeling;
- server-validated click rules;
- reporting deliverables;
- approval, PayPal billing, renewal, cancellation, and refund sequence;
- one primary package-specific application action.

The current `/advertise` page contains useful terms, but package-qualified visits previously lost selection and the first viewport still reads like a general growth-system page.

### P1 - Implemented an approved-sponsor checkout link feature

The administrator-only API now generates a short-lived, package-bound approval link after written terms are accepted. D1 stores only the token hash and durable approval audit data. The subscription endpoint requires the token plus matching approved email, enforces the exact plan and price, uses a stable PayPal idempotency key, blocks concurrent provisioning, supports safe retry, and records verified webhook lifecycle changes. Public recurring checkout remains unavailable.

### P1 - Add advertiser reporting

Provide a private advertiser view with:

- campaign/placement status and dates;
- funded, earned, refunded, and unearned balances;
- validated clicks, cap, and remaining clicks;
- invalid/bot/duplicate counts as aggregates;
- renewal or cancellation state;
- support/escalation contact.

The CPC ledger already has the core accounting concepts. Exposing a privacy-safe buyer view would increase trust and reduce manual status requests.

### P2 - Add plan-level funnel reporting

Track and reconcile this sequence by package:

`advertising_page_view -> advertiser_plan_select -> sponsor_application_submit -> sponsor_approved -> paypal_checkout_created -> subscription_activated or invoice_paid -> placement_activated -> placement_delivered -> renewed or cancelled`

Do not use page views, applications, checkout URLs, or webhook receipt as revenue. Only provider-verified paid events should increment revenue.

### P2 - Add inventory and response-time signals

Show a truthful capacity state such as `available`, `review queue`, or `sold out`, plus an operational response target only if it can be met. Avoid fake scarcity, countdowns, testimonials, traffic guarantees, or unverified audience figures.

### P2 - Reduce mobile distraction on advertising landings

The fixed chat prompt overlapped the lower mobile viewport during the pricing audit. On dedicated advertising pages, delay the prompt until meaningful scroll/interaction or reduce it to a compact control so it does not compete with the package CTA.

## Performance and accessibility

Mobile lab trace used Fast 4G and 4x CPU slowdown:

| Metric | Observed | Rating |
|---|---:|---|
| LCP | 407 ms | Good |
| CLS | 0.02 | Good |
| Accessibility | 100 | Pass |
| Best practices | 100 | Pass |
| SEO | 100 | Pass |
| Agentic browsing | 100 | Pass |

No console errors were observed. Third-party execution had no estimated metric savings, and render-blocking/cache insights also estimated `0 ms` savings. Performance is not the current conversion bottleneck. No CrUX field data was available for the page, so these results are lab evidence only.

## Implemented repository changes

- Direct package-specific sponsor application links from pricing.
- Backward-compatible redirects for package-qualified advertising/media-kit URLs.
- UTM and source preservation across those redirects.
- Structured `requestedPackageId` on sponsor applications.
- Server-side catalog validation before persisting the selected plan.
- Plan-level `recommended_package` storage for sponsor leads.
- Separate PayPal invoice and PayPal subscription disclosures.
- Distinct `advertiser_plan_select` analytics event.
- Regression checks for rendered pricing links, subscription disclosure, structured plan persistence, and redirect behavior.

## Validation

- `npm test` passed.
- `npm run validate:paypal-cpc` passed.
- `npm run validate:bindings` passed.
- 17 canonical public links passed.
- Two paused Google Ads campaign drafts, three ad groups, and 18 keywords passed their existing safety validator; no ad campaign was started.
- Wrangler 4.123.0 production bundle dry run passed at 933.86 KiB upload / 225.80 KiB gzip.
- `git diff --check` passed.
- Cloudflare Worker version `21e5e2a3-b1bb-4090-a847-e76c307f2ce6` deployed successfully.
- Live validation passed on `agentid.services` and `gptmarketplus.com`: direct pricing CTA, structured recurring/CPC plan selection, separate billing disclosure, UTM-preserving redirect, health, PayPal readiness, and all 17 canonical links.
- Approval-scoped PayPal readiness reported true while `publicSubscriptionCheckoutEnabled` remained false.
- Tokenless subscription creation returned HTTP 403, malformed approval tokens returned HTTP 404, and unauthenticated administration returned HTTP 403 on both primary domains.
- Remote D1 migration `0010_paypal_subscription_approvals.sql` applied successfully and the approval table remained empty after QA.
- Live revenue remained `$0` with `0` paid checkouts; deployment is not revenue evidence.

## External research limitation

Four live competitive-research queries were attempted through the configured research connector. Every query returned `You're out of MCP credits`, so competitor pricing, market claims, and external benchmarks are intentionally omitted rather than inferred from stale knowledge.
