# Shared layouts

All public pages use the same server-rendered navigation, main content wrapper, sponsor placement slot, measurement hooks, forms bootstrap, chat bootstrap, and footer.

## Navigation

Source: `src/agentid-site.js`

```js
function renderNav(activePath) {
  const items = NAV_LINKS.map((item) => `
    <a class="${normalizePath(activePath) === item.path ? "active " : ""}${item.optional ? "nav-optional" : ""}" href="${item.path}" data-track-event="nav_click" data-track-label="${escapeHtml(item.label)}">${escapeHtml(item.label)}</a>
  `).join("");

  return `
    <header class="site-nav">
      <div class="nav-brand">
        <a href="/" class="brand-mark" aria-label="${escapeHtml(brandName({}))}">${escapeHtml(brandName({}))}</a>
        <span class="brand-sub">Custom AI agents for business</span>
      </div>
      <nav class="nav-links">${items}</nav>
      <a class="nav-cta" href="/ai-agent-launch-kit?source=nav" data-track-event="product_view" data-track-label="Build the $29 Launch Kit">Build the $29 Launch Kit</a>
    </header>`;
}
```

## Footer

Source: `src/agentid-site.js`

```js
function renderFooter(env) {
  const currentYear = new Date().getFullYear();
  return `
    <footer class="site-footer">
      <div>
        <strong>${escapeHtml(brandName(env))}</strong>
        <p>Custom AI agents that answer, organize, sell, schedule, follow up, and automate work for your business.</p>
      </div>
      <div>
        <strong>Contact</strong>
        <p><a href="mailto:${escapeHtml(contactEmail(env))}">${escapeHtml(contactEmail(env))}</a></p>
        <p><a href="/contact">Request your AI agent plan</a></p>
      </div>
      <div>
        <strong>Resources</strong>
        <p><a href="/resources">Guides &amp; tools</a></p>
        <p><a href="/tools/ai-automation-roi-calculator">ROI calculator</a></p>
        <p><a href="/ai-agent-launch-kit">Launch kit</a></p>
      </div>
      <div>
        <strong>Company</strong>
        <p><a href="/privacy">Privacy Policy</a></p>
        <p><a href="/terms">Terms of Service</a></p>
        <p><a href="/refund-policy">Refund Policy</a></p>
      </div>
      <small>© ${currentYear} ${escapeHtml(brandName(env))}. All rights reserved.</small>
    </footer>`;
}
```

## Public shell

Source: `src/agentid-site.js`

```js
function renderShell(env, { path, title, description, body, schema = [], extraHead = "", bodyClass = "", robots = "index,follow,max-image-preview:large", privatePage = false }) {
  const canonical = `${siteUrl(env)}${path}`;
  const ogTitle = `${title} | ${brandName(env)}`;
  const ogDescription = description;
  const ogImage = `${siteUrl(env)}/og-image.svg?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(description)}`;
  const schemas = schema.filter(Boolean).map((entry) => `<script type="application/ld+json">${JSON.stringify(entry)}</script>`).join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  ${privatePage ? "" : renderMeasurementHead(env)}
  ${privatePage ? "" : renderAdSenseHead(env, path)}
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} | ${escapeHtml(brandName(env))}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="${escapeHtml(robots)}">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${escapeHtml(brandName(env))}">
  <meta property="og:title" content="${escapeHtml(ogTitle)}">
  <meta property="og:description" content="${escapeHtml(ogDescription)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta property="og:image" content="${escapeHtml(ogImage)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#06111d">
  <link rel="stylesheet" href="/styles.css">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  ${schemas}
  ${extraHead}
</head>
<body class="${escapeHtml(bodyClass)}">
  ${privatePage ? "" : renderMeasurementBody(env)}
  ${renderNav(path)}
  <main>
    ${body}
    ${privatePage ? "" : renderAdSenseUnit(env, path)}
    ${renderSponsorHouseAd(env, path)}
  </main>
  ${renderFooter(env)}
  ${privatePage ? "" : renderAnalyticsBootstrap(env)}
  ${renderFormsBootstrap(env)}
  ${privatePage ? "" : renderChatBootstrap(env)}
</body>
</html>`;
}
```
