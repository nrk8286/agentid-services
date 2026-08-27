# Route map

Framework: custom Cloudflare Worker router. Public requests enter `src/index.js`, which delegates site routes to `handleAgentIdSiteRequest()` in `src/agentid-site.js`. There is no React Router or file-system router.

| Route | Renderer | Layout |
|---|---|---|
| `/` | `renderHomePage` | `renderShell` |
| `/services` | `renderServicesPage` | `renderShell` |
| `/ai-agents` | `renderAgentsPage` | `renderShell` |
| `/pricing` | `renderPricingPage` | `renderShell` |
| `/use-cases` | `renderUseCasesPage` | `renderShell` |
| `/resources` | `renderResourcesPage` | `renderShell` |
| `/tools/ai-automation-roi-calculator` | `renderRoiCalculatorPage` | `renderShell` |
| `/ai-agent-launch-kit` | `renderLaunchKitPage` | `renderShell` |
| `/about` | `renderAboutPage` | `renderShell` |
| `/contact` | `renderContactPage` | `renderShell` |
| `/book-a-consultation` | `renderBookingPage` | `renderShell` |
| `/faq` | `renderFaqPage` | `renderShell` |
| `/privacy` | `renderPrivacyPage` | `renderShell` |
| `/terms` | `renderTermsPage` | `renderShell` |
| `/refund-policy` | `renderRefundPolicyPage` | `renderShell` |
| `/onboarding` | gated `renderOnboardingPage` | private `renderShell` |
| `/customer-dashboard` | `renderCustomerDashboardPage` | private `renderShell` |
| `/admin-dashboard` | `renderAdminDashboardPage` | private `renderShell` |

Relevant router source:

```js
if (path === "/") return respondHtml(renderHomePage(env, await publicAgentState(env)));
if (path === "/services") return respondHtml(renderServicesPage(env));
if (path === "/ai-agents") return respondHtml(renderAgentsPage(env));
if (path === "/pricing") return respondHtml(renderPricingPage(env));
if (path === "/use-cases") return respondHtml(renderUseCasesPage(env));
if (path === "/resources") return respondHtml(renderResourcesPage(env));
if (path === "/tools/ai-automation-roi-calculator") return respondHtml(renderRoiCalculatorPage(env));
if (path === "/ai-agent-launch-kit") return respondHtml(renderLaunchKitPage(env, url));
if (path === "/about") return respondHtml(renderAboutPage(env));
if (path === "/contact") return respondHtml(renderContactPage(env, url));
if (path === "/book-a-consultation" || path === "/consultation") return respondHtml(renderBookingPage(env, url));
if (path === "/faq") return respondHtml(renderFaqPage(env));
if (path === "/privacy") return respondHtml(renderPrivacyPage(env));
if (path === "/terms") return respondHtml(renderTermsPage(env));
if (path === "/refund-policy") return respondHtml(renderRefundPolicyPage(env));
```

API endpoints supporting the storefront include `/api/paypal/orders/create`, `/api/paypal/orders/capture`, `/api/paypal/webhook`, `/api/events`, `/api/contact`, `/api/book-consultation`, `/api/onboarding`, and product-specific private workspace/download endpoints.
