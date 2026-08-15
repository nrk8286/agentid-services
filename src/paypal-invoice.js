function moneyToCents(value) {
  const parsed = Number(value?.value ?? value ?? 0);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
}

function paymentTransactions(invoice) {
  return Array.isArray(invoice?.payments?.transactions) ? invoice.payments.transactions : [];
}

function refundTransactions(invoice) {
  return Array.isArray(invoice?.refunds?.transactions) ? invoice.refunds.transactions : [];
}

export function normalizePaypalInvoiceId(value) {
  const invoiceId = String(value || "").trim().toUpperCase();
  return /^[A-Z0-9][A-Z0-9-]{5,29}$/.test(invoiceId) ? invoiceId : "";
}

export function paypalInvoiceRecipientViewUrl(invoice) {
  const rawUrl = String(invoice?.detail?.metadata?.recipient_view_url || "").trim();
  if (!rawUrl) return "";
  try {
    const parsed = new URL(rawUrl);
    const hostname = parsed.hostname.toLowerCase();
    if (parsed.protocol !== "https:" || parsed.username || parsed.password) return "";
    if (hostname !== "paypal.com" && !hostname.endsWith(".paypal.com")) return "";
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return "";
  }
}

export function summarizePaypalInvoice(invoice, { mode = "unknown", checkedAt = new Date().toISOString() } = {}) {
  const status = String(invoice?.status || "UNKNOWN").trim().toUpperCase();
  const total = invoice?.effective_invoice_total || invoice?.amount || {};
  const due = invoice?.effective_due_amount || invoice?.due_amount || {};
  const paid = invoice?.payments?.paid_amount || {};
  const payments = paymentTransactions(invoice);
  const refunds = refundTransactions(invoice);
  const providerPaymentCount = payments.filter((payment) => {
    const type = String(payment?.type || payment?.payment_type || payment?.method || "").toUpperCase();
    return type === "PAYPAL" || Boolean(payment?.payment_id);
  }).length;
  const totalCents = moneyToCents(total);
  const dueCents = moneyToCents(due);
  const paidCents = moneyToCents(paid) || Math.max(totalCents - dueCents, 0);
  const providerPaid = status === "PAID" && providerPaymentCount > 0 && dueCents === 0;
  const pending = status === "PAYMENT_PENDING";
  const refunded = ["REFUNDED", "PARTIALLY_REFUNDED", "MARKED_AS_REFUNDED", "REFUNDED_EXTERNAL"].includes(status);
  const externallyMarked = ["MARKED_AS_PAID", "PAID_EXTERNAL"].includes(status);

  let collectibleStatus = "not_paid";
  if (providerPaid) collectibleStatus = "provider_paid_fee_unverified";
  else if (pending) collectibleStatus = "pending_review";
  else if (status === "PARTIALLY_PAID") collectibleStatus = "partially_paid";
  else if (refunded) collectibleStatus = "refunded_or_partially_refunded";
  else if (externallyMarked) collectibleStatus = "external_mark_not_provider_settlement";

  return {
    ok: true,
    provider: "paypal",
    mode,
    invoiceId: normalizePaypalInvoiceId(invoice?.id) || null,
    status,
    currency: String(total?.currency_code || due?.currency_code || paid?.currency_code || invoice?.detail?.currency_code || "").toUpperCase() || null,
    totalCents,
    paidCents,
    dueCents,
    providerPaymentCount,
    refundCount: refunds.length,
    providerPaid,
    pending,
    refunded,
    externallyMarked,
    collectibleStatus,
    feeVerified: false,
    verifiedNetProfitReady: false,
    checkedAt,
    note: providerPaid
      ? "PayPal reports the invoice paid with no amount due. Verify the actual processing fee and account settlement before recording net profit."
      : "This invoice does not yet prove settled PayPal revenue.",
  };
}
