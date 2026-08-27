# Key page dependency trees

This application uses one server-rendered source file rather than imported page components. Each tree names the renderer and shared functions it calls.

## `/` — Home

Entry: `src/agentid-site.js` → `renderHomePage`

- `renderShell`
  - `renderNav`
  - `renderFooter`
  - `renderSponsorHouseAd`
  - measurement, analytics, form, and chat bootstraps
- `renderHeroVisual`
- `renderSectionTitle`
- `renderCardGrid`
- `renderLeadForm`
- product catalog constants and public agent state

## `/pricing`

Entry: `src/agentid-site.js` → `renderPricingPage`

- `renderShell`
- `renderPageTitle`
- `renderSectionTitle`
- PayPal order/subscription forms
- pricing tier, support, sponsor, and digital product catalogs
- `renderViewItemTracking`

## `/ai-agent-launch-kit`

Entry: `src/agentid-site.js` → `renderLaunchKitPage`

- `renderShell`
- `renderSectionTitle`
- checkout form → `/api/paypal/orders/create`
- `renderLaunchKitSamplePreview`
- launch-kit FAQ and ecommerce tracking
- private workspace renderers after verified PayPal capture

## `/ai-agents`

Entry: `src/agentid-site.js` → `renderAgentsPage`

- `renderShell`
- `renderPageTitle`
- `renderCardGrid`
- `renderLeadForm`
- `AGENT_TYPES`

## `/resources`

Entry: `src/agentid-site.js` → `renderResourcesPage`

- `renderShell`
- `renderPageTitle`
- `renderCardGrid`
- resource catalog

## `/contact`

Entry: `src/agentid-site.js` → `renderContactPage`

- `renderShell`
- `renderPageTitle`
- `renderLeadForm`
- Turnstile, attribution, and submission bootstrap

## `/customer-dashboard`

Entry: `src/agentid-site.js` → `renderCustomerDashboardPage`

- private `renderShell`
- workspace lookup and PayPal entitlement checks
- status timeline, key/value, and table renderers

## Worker entry

- `src/index.js`
  - imports `handleAgentIdSiteRequest` and the one-time product catalog from `src/agentid-site.js`
  - owns PayPal order creation, capture, webhooks, entitlements, and product delivery
  - binds Workers AI, D1, KV, Queues, Durable Objects, R2, email, and analytics
