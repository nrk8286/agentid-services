import assert from "node:assert/strict";
import {
  CPC_TERMS_VERSION,
  buildCpcInvoicePayload,
  cpcInvoiceFullyFunded,
  cpcRefundDisposition,
  cpcVisitorHash,
  likelyAutomatedClick,
  normalizeCpcCampaignInput,
  publicCpcCampaign,
} from "../src/cpc-campaign.js";

const valid = normalizeCpcCampaignInput({
  advertiserEmail: "buyer@example.com",
  sponsorName: "Useful AI Tool",
  sponsorCopy: "A practical automation tool for small businesses.",
  destinationUrl: "https://example.com/product#offer",
});
assert.equal(valid.ok, true);
assert.equal(valid.value.cpcCents, 200);
assert.equal(valid.value.clickCap, 25);
assert.equal(valid.value.budgetCents, 5000);
assert.equal(valid.value.durationDays, 30);
assert.equal(valid.value.destinationUrl, "https://example.com/product");
assert.equal(valid.value.termsVersion, CPC_TERMS_VERSION);

assert.equal(normalizeCpcCampaignInput({ ...valid.value, advertiserEmail: "bad" }).ok, false);
assert.equal(normalizeCpcCampaignInput({ ...valid.value, destinationUrl: "http://example.com" }).ok, false);
assert.equal(normalizeCpcCampaignInput({ ...valid.value, clickCap: 9 }).ok, false);
assert.equal(normalizeCpcCampaignInput({ ...valid.value, cpcCents: 10 }).ok, false);
assert.equal(normalizeCpcCampaignInput({ ...valid.value, durationDays: 91 }).ok, false);

const campaign = {
  id: "cpc-20260808-1234abcd",
  ...valid.value,
};
const invoice = buildCpcInvoicePayload(campaign, { brandName: "GPTMarketPlus", invoiceDate: "2026-08-08" });
assert.equal(invoice.detail.currency_code, "USD");
assert.equal(invoice.detail.payment_term.term_type, "DUE_ON_RECEIPT");
assert.equal(invoice.primary_recipients[0].billing_info.email_address, "buyer@example.com");
assert.equal(invoice.items[0].quantity, "25");
assert.equal(invoice.items[0].unit_amount.value, "2.00");
assert.match(invoice.detail.terms_and_conditions, /Unused funding is not earned revenue/);

const publicCampaign = publicCpcCampaign({
  id: campaign.id,
  sponsor_name: campaign.sponsorName,
  status: "active",
  cpc_cents: 200,
  click_cap: 25,
  validated_clicks: 7,
  budget_cents: 5000,
  terms_version: CPC_TERMS_VERSION,
});
assert.equal(publicCampaign.remainingClicks, 18);
assert.equal(publicCampaign.earnedCents, 1400);
assert.equal(publicCampaign.fundedCents, 5000);

assert.equal(cpcInvoiceFullyFunded({
  providerPaid: true,
  currency: "USD",
  totalCents: 5000,
  paidCents: 5000,
  dueCents: 0,
  refunded: false,
  refundCount: 0,
}, { budget_cents: 5000 }), true);
assert.equal(cpcInvoiceFullyFunded({
  providerPaid: true,
  currency: "USD",
  totalCents: 5000,
  paidCents: 2000,
  dueCents: 3000,
  refunded: false,
  refundCount: 0,
}, { budget_cents: 5000 }), false);
assert.equal(cpcInvoiceFullyFunded({
  providerPaid: true,
  currency: "USD",
  totalCents: 5000,
  paidCents: 5000,
  dueCents: 0,
  refunded: true,
  refundCount: 1,
}, { budget_cents: 5000 }), false);
assert.equal(cpcRefundDisposition({ status: "REFUNDED" }), "refunded");
assert.equal(cpcRefundDisposition({ status: "PARTIALLY_REFUNDED" }), "refund_review");

assert.equal(likelyAutomatedClick({ userAgent: "Googlebot/2.1" }), true);
assert.equal(likelyAutomatedClick({ userAgent: "Mozilla/5.0", cf: { botManagement: { score: 12 } } }), true);
assert.equal(likelyAutomatedClick({ userAgent: "Mozilla/5.0", cf: { botManagement: { score: 82 } } }), false);

const firstHash = await cpcVisitorHash({
  secret: "test-secret",
  campaignId: campaign.id,
  ip: "192.0.2.10",
  userAgent: "Mozilla/5.0",
  dayBucket: "2026-08-08",
});
const nextDayHash = await cpcVisitorHash({
  secret: "test-secret",
  campaignId: campaign.id,
  ip: "192.0.2.10",
  userAgent: "Mozilla/5.0",
  dayBucket: "2026-08-09",
});
assert.equal(firstHash, nextDayHash, "The stable visitor hash supports a rolling 24-hour duplicate check.");
assert.equal(firstHash.length, 64);

console.log("PayPal CPC validation passed.");
