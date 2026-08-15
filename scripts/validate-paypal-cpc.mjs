import assert from "node:assert/strict";
import {
  CPC_TERMS_VERSION,
  advertiserCpcCampaign,
  buildCpcInvoicePayload,
  cpcInvoiceFullyFunded,
  cpcRefundDisposition,
  cpcVisitorHash,
  inspectCpcAdvertiserAccess,
  issueCpcAdvertiserAccess,
  likelyAutomatedClick,
  normalizeCpcCampaignInput,
  publicCpcCampaign,
  revokeCpcAdvertiserAccess,
} from "../src/cpc-campaign.js";
import { paypalInvoiceRecipientViewUrl } from "../src/paypal-invoice.js";

const valid = normalizeCpcCampaignInput({
  advertiserEmail: "buyer@example.com",
  sponsorName: "Useful AI Tool",
  sponsorCopy: "A practical automation tool for small businesses.",
  destinationUrl: "https://example.com/product#offer",
  approvalReference: "signed-order-2026-08-14",
});
assert.equal(valid.ok, true);
assert.equal(valid.value.cpcCents, 200);
assert.equal(valid.value.clickCap, 25);
assert.equal(valid.value.budgetCents, 5000);
assert.equal(valid.value.durationDays, 30);
assert.equal(valid.value.destinationUrl, "https://example.com/product");
assert.equal(valid.value.termsVersion, CPC_TERMS_VERSION);
assert.equal(valid.value.approvalReference, "signed-order-2026-08-14");

assert.equal(normalizeCpcCampaignInput({ ...valid.value, advertiserEmail: "bad" }).ok, false);
assert.equal(normalizeCpcCampaignInput({ ...valid.value, destinationUrl: "http://example.com" }).ok, false);
assert.equal(normalizeCpcCampaignInput({ ...valid.value, clickCap: 9 }).ok, false);
assert.equal(normalizeCpcCampaignInput({ ...valid.value, cpcCents: 10 }).ok, false);
assert.equal(normalizeCpcCampaignInput({ ...valid.value, durationDays: 91 }).ok, false);
assert.equal(normalizeCpcCampaignInput({ ...valid.value, approvalReference: "" }).ok, false);

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

assert.equal(
  paypalInvoiceRecipientViewUrl({ detail: { metadata: { recipient_view_url: "https://www.paypal.com/invoice/p/#INV2-TEST" } } }),
  "https://www.paypal.com/invoice/p/",
);
assert.equal(paypalInvoiceRecipientViewUrl({ detail: { metadata: { recipient_view_url: "https://paypal.example.com/invoice" } } }), "");
assert.equal(paypalInvoiceRecipientViewUrl({ detail: { metadata: { recipient_view_url: "javascript:alert(1)" } } }), "");

class CpcAccessTestDatabase {
  constructor(row) {
    this.row = { ...row };
  }

  prepare(sql) {
    const database = this;
    return {
      bind(...args) {
        return {
          async first() {
            if (sql.includes("WHERE id = ?")) return database.row.id === args[0] ? database.row : null;
            if (sql.includes("WHERE advertiser_access_token_hash = ?")) {
              return database.row.advertiser_access_token_hash === args[0] ? database.row : null;
            }
            throw new Error(`Unhandled CPC access SELECT: ${sql}`);
          },
          async run() {
            if (sql.includes("SET advertiser_access_token_hash = ?")) {
              if (database.row.id !== args[3]) return { meta: { changes: 0 } };
              database.row.advertiser_access_token_hash = args[0];
              database.row.advertiser_access_expires_at = args[1];
              database.row.advertiser_access_revoked_at = null;
              database.row.updated_at = args[2];
              return { meta: { changes: 1 } };
            }
            if (sql.includes("SET advertiser_access_revoked_at = ?")) {
              if (database.row.id !== args[2] || !database.row.advertiser_access_token_hash) return { meta: { changes: 0 } };
              database.row.advertiser_access_revoked_at = args[0];
              database.row.advertiser_access_token_hash = null;
              database.row.updated_at = args[1];
              return { meta: { changes: 1 } };
            }
            throw new Error(`Unhandled CPC access UPDATE: ${sql}`);
          },
        };
      },
    };
  }
}

const accessDb = new CpcAccessTestDatabase({
  id: campaign.id,
  advertiser_email: valid.value.advertiserEmail,
  sponsor_name: valid.value.sponsorName,
  sponsor_copy: valid.value.sponsorCopy,
  destination_url: valid.value.destinationUrl,
  status: "invoice_sent",
  cpc_cents: valid.value.cpcCents,
  click_cap: valid.value.clickCap,
  validated_clicks: 0,
  budget_cents: valid.value.budgetCents,
  invoice_status: "SENT",
  approval_reference: valid.value.approvalReference,
  approved_at: "2026-08-14T12:00:00.000Z",
  terms_version: CPC_TERMS_VERSION,
});
const access = await issueCpcAdvertiserAccess(accessDb, campaign.id, {
  baseUrl: "https://agentid.services",
  now: "2026-08-14T12:00:00.000Z",
});
assert.equal(access.ok, true);
assert.match(access.accessUrl, /^https:\/\/agentid\.services\/sponsor\/campaign#[A-Za-z0-9_-]{43}$/);
const accessToken = new URL(access.accessUrl).hash.slice(1);
assert.equal(JSON.stringify(accessDb.row).includes(accessToken), false, "raw advertiser portal token must never be stored");
assert.equal((await inspectCpcAdvertiserAccess(accessDb, {
  token: accessToken,
  advertiserEmail: "other@example.com",
  now: "2026-08-14T12:01:00.000Z",
})).status, 403);
const inspectedAccess = await inspectCpcAdvertiserAccess(accessDb, {
  token: accessToken,
  advertiserEmail: valid.value.advertiserEmail,
  now: "2026-08-14T12:01:00.000Z",
});
assert.equal(inspectedAccess.ok, true);
assert.equal(advertiserCpcCampaign(inspectedAccess.record).unearnedCents, 5000);
const rotatedAccess = await issueCpcAdvertiserAccess(accessDb, campaign.id, {
  baseUrl: "https://agentid.services",
  now: "2026-08-14T12:02:00.000Z",
});
assert.equal(rotatedAccess.ok, true);
assert.equal((await inspectCpcAdvertiserAccess(accessDb, {
  token: accessToken,
  advertiserEmail: valid.value.advertiserEmail,
  now: "2026-08-14T12:03:00.000Z",
})).status, 404, "rotating access must invalidate the old token");
const rotatedToken = new URL(rotatedAccess.accessUrl).hash.slice(1);
assert.equal((await revokeCpcAdvertiserAccess(accessDb, campaign.id, "2026-08-14T12:04:00.000Z")).ok, true);
assert.equal((await inspectCpcAdvertiserAccess(accessDb, {
  token: rotatedToken,
  advertiserEmail: valid.value.advertiserEmail,
  now: "2026-08-14T12:05:00.000Z",
})).status, 404);

console.log("PayPal CPC validation passed.");
