# Shared UI components

The storefront is server-rendered by a Cloudflare Worker. It uses reusable HTML renderer functions rather than a client framework or component library. All shared primitives live in `src/agentid-site.js`.

## SectionHeading

- Source: `src/agentid-site.js`
- Purpose: Eyebrow, heading, and optional explanatory copy shared across product, pricing, resource, and dashboard sections.

```js
function renderSectionTitle(eyebrow, title, description = "") {
  return `
    <div class="section-heading">
      <p class="eyebrow">${escapeHtml(eyebrow)}</p>
      <h2>${escapeHtml(title)}</h2>
      ${description ? `<p>${escapeHtml(description)}</p>` : ""}
    </div>`;
}
```

## PageTitle

- Source: `src/agentid-site.js`
- Purpose: Accessible H1 version of the shared heading pattern.

```js
function renderPageTitle(eyebrow, title, description = "") {
  return `
    <div class="section-heading page-heading">
      <p class="eyebrow">${escapeHtml(eyebrow)}</p>
      <h1>${escapeHtml(title)}</h1>
      ${description ? `<p>${escapeHtml(description)}</p>` : ""}
    </div>`;
}
```

## CardGrid

- Source: `src/agentid-site.js`
- Purpose: Reusable product, resource, service, and use-case card grid.

```js
function renderCardGrid(items, ctaLabel = "") {
  return `
    <div class="card-grid">
      ${items.map((item) => `
        <article class="info-card">
          <p class="card-kicker">${escapeHtml(item.kicker || "")}</p>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.description || item.summary || "")}</p>
          ${item.points ? `<ul>${item.points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ul>` : ""}
          ${ctaLabel && item.href ? `<a class="card-link" href="${escapeHtml(item.href)}" data-track-event="${escapeHtml(item.trackEvent || "resource_click")}" data-track-label="${escapeHtml(item.title)}">${escapeHtml(ctaLabel)}</a>` : ""}
        </article>
      `).join("")}
    </div>`;
}
```

## StatCards

- Source: `src/agentid-site.js`
- Purpose: Compact operational metrics used by dashboards.

```js
function renderStatCards(stats) {
  const cards = [
    ["Total leads", stats.totalLeads],
    ["Hot leads", stats.hotLeads],
    ["Booked calls", stats.bookedCalls],
    ["Quote requests", stats.quoteRequests],
    ["Deposits received", stats.depositsReceived],
    ["Estimated pipeline", moneyWithCents(stats.estimatedPipelineCents)],
  ];
  return cards
    .map(([label, value]) => `
      <article class="stat-card">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(String(value))}</strong>
      </article>
    `)
    .join("");
}
```

## LeadForm

- Source: `src/agentid-site.js`
- Purpose: Shared honeypot-protected form renderer supporting inputs, selects, textareas, checkboxes, Turnstile, and live status.

```js
function renderLeadForm({ action, formId, fields, cta, note, turnstileHtml = "", successId = "form-status", dataAttrs = "" }) {
  const fieldMarkup = fields.map((field) => {
    const inferredAutocomplete = {
      name: "name",
      email: "email",
      business: "organization",
      businessName: "organization",
      phone: "tel",
    }[field.name] || "";
    const autocomplete = field.autocomplete || inferredAutocomplete;
    const autocompleteAttr = autocomplete ? ` autocomplete="${escapeHtml(autocomplete)}"` : "";
    if (field.type === "hidden") {
      return `<input type="hidden" name="${escapeHtml(field.name)}" value="${escapeHtml(field.value || "")}">`;
    }
    if (field.type === "select") {
      return `
        <label class="field">
          <span>${escapeHtml(field.label)}</span>
          <select name="${escapeHtml(field.name)}"${autocompleteAttr} ${field.required ? "required" : ""}>
            ${field.options.map((option) => `<option value="${escapeHtml(option)}" ${option === field.value ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}
          </select>
        </label>`;
    }
    if (field.type === "textarea") {
      return `
        <label class="field full">
          <span>${escapeHtml(field.label)}</span>
          <textarea name="${escapeHtml(field.name)}"${autocompleteAttr} rows="${field.rows || 4}" placeholder="${escapeHtml(field.placeholder || "")}" ${field.required ? "required" : ""}>${escapeHtml(field.value || "")}</textarea>
        </label>`;
    }
    if (field.type === "checkbox") {
      return `
        <label class="checkbox full">
          <input type="checkbox" name="${escapeHtml(field.name)}" value="1" ${field.required ? "required" : ""}>
          <span>${escapeHtml(field.label)}</span>
        </label>`;
    }
    return `
      <label class="field">
        <span>${escapeHtml(field.label)}</span>
        <input type="${escapeHtml(field.type || "text")}" name="${escapeHtml(field.name)}"${autocompleteAttr} value="${escapeHtml(field.value || "")}" placeholder="${escapeHtml(field.placeholder || "")}" ${field.required ? "required" : ""}>
      </label>`;
  }).join("");

  return `
    <form class="lead-form" id="${escapeHtml(formId)}" data-agentid-form="1" data-endpoint="${escapeHtml(action)}" data-success-target="#${escapeHtml(successId)}" ${dataAttrs}>
      <input type="hidden" name="sourcePage" value="">
      <input type="hidden" name="leadSource" value="">
      <input type="text" name="websiteCheck" tabindex="-1" autocomplete="off" class="honeypot" aria-hidden="true">
      ${fieldMarkup}
      ${turnstileHtml}
      <button class="button-primary" type="submit">${escapeHtml(cta)}</button>
      <p class="form-note">${escapeHtml(note || "")}</p>
      <p class="form-status" id="${escapeHtml(successId)}" aria-live="polite"></p>
    </form>`;
}
```
