/**
 * Tenant-specific Lead Capture & Follow-Up Agent UI renderers.
 * This module deliberately accepts display-safe data only; authorization and
 * private delivery credentials belong to the request handler, never the page.
 */

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeApiPath(apiPath) {
  const path = String(apiPath ?? "").trim();
  if (!path.startsWith("/") || path.startsWith("//")) {
    return "";
  }
  return path;
}

function renderServiceSummary(services) {
  const items = Array.isArray(services) ? services.filter(Boolean).slice(0, 6) : [];
  if (!items.length) return "";

  return `
    <section class="customer-agent__services" aria-labelledby="customer-agent-services-title">
      <h2 id="customer-agent-services-title">How we can help</h2>
      <ul>${items.map((service) => `<li>${escapeHtml(service)}</li>`).join("")}</ul>
    </section>`;
}

function renderLeadForm({ apiPath, consentLabel, serviceOptions, turnstileHtml = "" }) {
  const safePath = normalizeApiPath(apiPath);
  const options = Array.isArray(serviceOptions)
    ? serviceOptions.filter(Boolean).slice(0, 12)
    : [];
  const serviceField = options.length
    ? `<label>Service needed
        <select name="service" required>
          <option value="">Select a service</option>
          ${options.map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`).join("")}
        </select>
      </label>`
    : "";

  return `
    <form class="customer-agent__form" data-lead-form data-api-path="${escapeHtml(safePath)}" novalidate>
      <div class="customer-agent__status" data-form-status role="status" aria-live="polite" hidden></div>
      <input name="website" type="text" tabindex="-1" autocomplete="off" aria-hidden="true" class="customer-agent__honeypot">
      <label>Name <span aria-hidden="true">*</span><input name="name" autocomplete="name" required></label>
      <label>Email <span aria-hidden="true">*</span><input name="email" type="email" autocomplete="email" required></label>
      <label>Phone <input name="phone" type="tel" autocomplete="tel"></label>
      ${serviceField}
      <label>Tell us what you need <span aria-hidden="true">*</span><textarea name="message" rows="5" required></textarea></label>
      <label class="customer-agent__consent"><input name="consent" type="checkbox" value="yes" required> ${escapeHtml(consentLabel || "I agree that this business may contact me about my request.")}</label>
      <p class="customer-agent__privacy">We use your information only to respond to this inquiry and manage follow-up related to it. Lead records are automatically removed after 90 days. Do not send passwords, payment details, or other sensitive information through this form.</p>
      ${turnstileHtml}
      <button type="submit">Send inquiry</button>
    </form>
    ${safePath ? renderLeadFormScript(safePath) : ""}`;
}

/** Render the public, visitor-facing lead-capture application. */
export function renderCustomerLeadCaptureApp({
  apiPath,
  businessName = "Our team",
  brandTagline = "Tell us how we can help.",
  serviceSummary = [],
  serviceOptions = [],
  consentLabel,
  turnstileHtml = "",
  responseTime = "We’ll be in touch as soon as possible.",
} = {}) {
  const name = escapeHtml(businessName);
  return `
    <main class="customer-agent" data-customer-lead-capture-app>
      <header class="customer-agent__header">
        <p class="customer-agent__eyebrow">${name}</p>
        <h1>Start your inquiry</h1>
        <p>${escapeHtml(brandTagline)}</p>
      </header>
      ${renderServiceSummary(serviceSummary)}
      <section class="customer-agent__inquiry" aria-labelledby="customer-agent-inquiry-title">
        <h2 id="customer-agent-inquiry-title">Tell us about your needs</h2>
        <p>${escapeHtml(responseTime)}</p>
        ${renderLeadForm({ apiPath, consentLabel, serviceOptions, turnstileHtml })}
      </section>
    </main>`;
}

/** Render an owner-only status page from already-sanitized operational data. */
export function renderCustomerLeadOwnerView({
  businessName = "Customer app",
  appStatus = "Unknown",
  statusDetail = "",
  recentLeads = [],
} = {}) {
  const leads = Array.isArray(recentLeads) ? recentLeads.slice(0, 25) : [];
  const rows = leads.length
    ? leads.map((lead) => `
        <tr>
          <td>${escapeHtml(lead.createdAt || "—")}</td>
          <td>${escapeHtml(lead.name || "—")}</td>
          <td>${escapeHtml(lead.service || "—")}</td>
          <td>${escapeHtml(lead.status || "New")}</td>
        </tr>`).join("")
    : `<tr><td colspan="4">No recent leads are available.</td></tr>`;

  return `
    <main class="customer-agent customer-agent--owner" data-customer-lead-owner-view>
      <header class="customer-agent__header">
        <p class="customer-agent__eyebrow">Private owner view</p>
        <h1>${escapeHtml(businessName)}</h1>
      </header>
      <section class="customer-agent__app-status" aria-labelledby="customer-agent-status-title">
        <h2 id="customer-agent-status-title">App status</h2>
        <p><strong>${escapeHtml(appStatus)}</strong>${statusDetail ? ` — ${escapeHtml(statusDetail)}` : ""}</p>
      </section>
      <section class="customer-agent__recent-leads" aria-labelledby="customer-agent-leads-title">
        <h2 id="customer-agent-leads-title">Recent leads</h2>
        <table>
          <thead><tr><th scope="col">Received</th><th scope="col">Name</th><th scope="col">Service</th><th scope="col">Status</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </section>
    </main>`;
}

/** Render the browser-side submit behavior. It contains a public API path only. */
export function renderLeadFormScript(apiPath) {
  const safePath = normalizeApiPath(apiPath);
  if (!safePath) return "";

  return `<script>
(() => {
  const form = document.querySelector('[data-lead-form]');
  if (!form) return;
  const apiPath = ${JSON.stringify(safePath)};
  const status = form.querySelector('[data-form-status]');
  const button = form.querySelector('button[type="submit"]');
  const show = (message, state) => {
    status.textContent = message;
    status.dataset.state = state;
    status.hidden = false;
  };
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const fields = new FormData(form);
    if (fields.get('website')) return;
    const payload = Object.fromEntries(fields.entries());
    delete payload.website;
    button.disabled = true;
    show('Sending your inquiry…', 'pending');
    try {
      const response = await fetch(apiPath, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Request failed');
      form.reset();
      show('Thanks — your inquiry has been received. We’ll be in touch soon.', 'success');
    } catch {
      show('We could not send your inquiry just now. Please try again or contact us directly.', 'error');
    } finally {
      button.disabled = false;
    }
  });
})();
</script>`;
}
