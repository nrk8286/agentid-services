import {
  claimPaypalSubscriptionApproval,
  completePaypalSubscriptionApproval,
  createPaypalSubscriptionApproval,
  failPaypalSubscriptionApproval,
  inspectPaypalSubscriptionApproval,
  recordPaypalSubscriptionApprovalEvent,
  revokePaypalSubscriptionApproval,
} from "../src/paypal-subscription-approval.js";

class ApprovalTestDatabase {
  constructor() {
    this.rows = new Map();
  }

  prepare(sql) {
    const database = this;
    return {
      bind(...args) {
        return {
          async run() {
            if (sql.includes("INSERT INTO paypal_subscription_approvals")) {
              const row = {
                id: args[0], token_hash: args[1], package_id: args[2], package_name: args[3], paypal_plan_id: args[4],
                amount_cents: args[5], currency: args[6], price_label: args[7], advertiser_email: args[8],
                business_name: args[9], approval_reference: args[10], approved_by: args[11], status: "approved",
                approved_at: args[12], expires_at: args[13], paypal_request_id: args[14], attempt_count: 0,
                created_at: args[15], updated_at: args[16], provisioning_started_at: null, paypal_subscription_id: null,
                paypal_approval_url: null, issued_at: null, last_error_code: null,
              };
              database.rows.set(row.id, row);
              return { success: true, meta: { changes: 1 } };
            }

            const id = sql.includes("WHERE paypal_subscription_id = ?")
              ? [...database.rows.values()].find((row) => row.paypal_subscription_id === args[3])?.id
              : sql.includes("WHERE id = ? AND advertiser_email") ? args[2]
                : sql.includes("WHERE id = ? AND status = 'provisioning'") ? args[args.length - 1]
                  : sql.includes("WHERE id = ?") ? args[args.length - 1]
                    : null;
            const row = database.rows.get(id);
            if (!row) return { success: true, meta: { changes: 0 } };

            if (sql.includes("SET status = 'expired'")) {
              if (!["approved", "failed", "provisioning"].includes(row.status)) return { success: true, meta: { changes: 0 } };
              row.status = "expired";
              row.updated_at = args[0];
            } else if (sql.includes("SET status = 'provisioning'")) {
              const eligibleStatus = ["approved", "failed"].includes(row.status)
                || (row.status === "provisioning" && row.provisioning_started_at <= args[5]);
              if (row.advertiser_email !== args[3] || row.expires_at <= args[4] || !eligibleStatus) {
                return { success: true, meta: { changes: 0 } };
              }
              row.status = "provisioning";
              row.provisioning_started_at = args[0];
              row.attempt_count += 1;
              row.last_error_code = null;
              row.updated_at = args[1];
            } else if (sql.includes("SET status = 'issued'")) {
              if (row.status !== "provisioning") return { success: true, meta: { changes: 0 } };
              row.status = "issued";
              row.paypal_subscription_id = args[0];
              row.paypal_approval_url = args[1];
              row.issued_at = args[2];
              row.updated_at = args[3];
              row.provisioning_started_at = null;
            } else if (sql.includes("SET status = 'failed'")) {
              if (row.status !== "provisioning") return { success: true, meta: { changes: 0 } };
              row.status = "failed";
              row.last_error_code = args[0];
              row.updated_at = args[1];
              row.provisioning_started_at = null;
            } else if (sql.includes("SET status = 'revoked'")) {
              if (!["approved", "failed"].includes(row.status)) return { success: true, meta: { changes: 0 } };
              row.status = "revoked";
              row.updated_at = args[0];
            } else if (sql.includes("SET status = ?, webhook_event_id")) {
              row.status = args[0];
              row.webhook_event_id = args[1];
              row.updated_at = args[2];
            } else {
              throw new Error(`Unhandled test UPDATE: ${sql}`);
            }
            return { success: true, meta: { changes: 1 } };
          },
          async first() {
            if (sql.includes("WHERE token_hash = ?")) {
              return [...database.rows.values()].find((row) => row.token_hash === args[0]) || null;
            }
            if (sql.includes("WHERE id = ?")) return database.rows.get(args[0]) || null;
            throw new Error(`Unhandled test SELECT: ${sql}`);
          },
          async all() {
            return { success: true, results: [...database.rows.values()].slice(0, Number(args[0] || 50)) };
          },
        };
      },
    };
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const db = new ApprovalTestDatabase();
const now = "2026-08-14T12:00:00.000Z";
const issued = await createPaypalSubscriptionApproval(db, {
  packageId: "featured_tool_monthly",
  packageName: "Featured AI Tool",
  planId: "P-TESTFEATUREDTOOL123456789",
  amountCents: 9900,
  currency: "USD",
  priceLabel: "$99 / 30 days",
  advertiserEmail: "buyer@example.com",
  businessName: "Example Company",
  approvalReference: "signed-order-2026-08-14",
  approvedBy: "test_admin",
  expiresInHours: 48,
  baseUrl: "https://agentid.services",
  now,
});
assert(issued.ok && issued.status === 201, "approval issuance must succeed");
const token = new URL(issued.checkoutLink).hash.slice(1);
assert(token.length === 43, "approval link must contain a 256-bit base64url fragment token");
assert(!JSON.stringify([...db.rows.values()]).includes(token), "raw approval tokens must never be stored");
assert(issued.checkoutLink.startsWith("https://agentid.services/sponsor/subscribe#"), "approval token must stay in the URL fragment");

const inspected = await inspectPaypalSubscriptionApproval(db, token, now);
assert(inspected.ok && inspected.approval.packageId === "featured_tool_monthly", "valid token must resolve its exact package");
assert(inspected.approval.advertiserEmailMasked !== "buyer@example.com", "public inspection must mask the approved email");
assert(!(await inspectPaypalSubscriptionApproval(db, "invalid", now)).ok, "malformed tokens must fail closed");

const wrongEmail = await claimPaypalSubscriptionApproval(db, { token, advertiserEmail: "other@example.com", now });
assert(!wrongEmail.ok && wrongEmail.status === 403, "wrong recipient email must be denied");
const firstClaim = await claimPaypalSubscriptionApproval(db, { token, advertiserEmail: "buyer@example.com", now });
assert(firstClaim.ok && !firstClaim.replay && firstClaim.record.status === "provisioning", "approved token must claim one provisioning attempt");
const concurrentClaim = await claimPaypalSubscriptionApproval(db, { token, advertiserEmail: "buyer@example.com", now });
assert(!concurrentClaim.ok && concurrentClaim.status === 409, "concurrent token use must not create a second provider attempt");

await failPaypalSubscriptionApproval(db, { id: firstClaim.record.id, errorCode: "test_retry", now });
const retryClaim = await claimPaypalSubscriptionApproval(db, { token, advertiserEmail: "buyer@example.com", now: "2026-08-14T12:00:01.000Z" });
assert(retryClaim.ok && retryClaim.record.paypal_request_id === firstClaim.record.paypal_request_id, "retry must preserve the PayPal idempotency key");
const approvalUrl = "https://www.paypal.com/webapps/billing/subscriptions?ba_token=test";
const completed = await completePaypalSubscriptionApproval(db, {
  id: retryClaim.record.id,
  subscriptionId: "I-TESTSUBSCRIPTION",
  checkoutUrl: approvalUrl,
  now: "2026-08-14T12:00:02.000Z",
});
assert(completed.ok, "provider handoff must finalize the audit record");
const replay = await claimPaypalSubscriptionApproval(db, { token, advertiserEmail: "buyer@example.com", now: "2026-08-14T12:00:03.000Z" });
assert(replay.ok && replay.replay && replay.checkoutUrl === approvalUrl, "replay must return the same PayPal approval URL without a new provider call");
const expiredIssuedReplay = await claimPaypalSubscriptionApproval(db, { token, advertiserEmail: "buyer@example.com", now: "2026-08-16T12:00:01.000Z" });
assert(!expiredIssuedReplay.ok && expiredIssuedReplay.status === 410, "issued checkout links must remain inaccessible after the approval token expires");

await recordPaypalSubscriptionApprovalEvent(db, {
  subscriptionId: "I-TESTSUBSCRIPTION",
  eventId: "WH-TEST-ACTIVE",
  eventType: "BILLING.SUBSCRIPTION.ACTIVATED",
  now: "2026-08-14T12:05:00.000Z",
});
assert(db.rows.get(retryClaim.record.id).status === "active", "verified activation webhook must update the approval audit state");

const revocable = await createPaypalSubscriptionApproval(db, {
  packageId: "sponsor_starter_monthly", packageName: "Sponsor Starter", planId: "P-TESTSTARTER1234567890123",
  amountCents: 4900, currency: "USD", priceLabel: "$49 / 30 days", advertiserEmail: "starter@example.com",
  businessName: "Starter Company", approvalReference: "signed-order-starter", baseUrl: "https://agentid.services", now,
});
const revoked = await revokePaypalSubscriptionApproval(db, revocable.approval.id, now);
assert(revoked.ok && db.rows.get(revocable.approval.id).status === "revoked", "unused approvals must be revocable");

const expiring = await createPaypalSubscriptionApproval(db, {
  packageId: "growth_partner_monthly", packageName: "Growth Partner", planId: "P-TESTGROWTH12345678901234",
  amountCents: 14900, currency: "USD", priceLabel: "$149 / 30 days", advertiserEmail: "growth@example.com",
  businessName: "Growth Company", approvalReference: "signed-order-growth", expiresInHours: 1,
  baseUrl: "https://agentid.services", now,
});
const expiredToken = new URL(expiring.checkoutLink).hash.slice(1);
const expired = await inspectPaypalSubscriptionApproval(db, expiredToken, "2026-08-14T13:00:01.000Z");
assert(!expired.ok && expired.status === 410, "expired approvals must fail closed");

console.log("PayPal approval-scoped subscription validation passed.");
