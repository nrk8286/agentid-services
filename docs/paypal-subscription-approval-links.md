# Private PayPal Subscription Approval Links

This feature enables recurring PayPal sponsor billing without exposing unrestricted public subscription checkout.

## Security and billing contract

1. An administrator reviews the advertiser, inventory, placement dates, fulfillment capacity, and written renewal/cancellation terms.
2. The administrator issues a package-bound link through the authenticated API.
3. The API returns the raw 256-bit token once, in the URL fragment. HTTP requests and referrer headers do not contain that fragment.
4. D1 stores only the token's SHA-256 hash, the exact PayPal plan, price, approved email, business, approval reference, expiry, and audit status.
5. The buyer must possess the link and enter the approved email before a PayPal subscription approval object can be created.
6. A conditional D1 update permits one provisioning attempt at a time. Retries reuse the same `PayPal-Request-Id`.
7. PayPal presents the recurring terms and obtains buyer approval. Creating the private handoff is not recorded as paid revenue.
8. Signed PayPal webhook events update the durable approval lifecycle. Sponsor inventory is not automatically activated by link issuance.

The maximum link lifetime is 72 hours. The default is 48 hours. Expired or revoked links fail closed.

## Issue a link

Use the administrator bearer credential from a secure operator environment. Never place it in shell history, source control, screenshots, tickets, or customer messages.

```bash
curl --fail-with-body \
  --request POST \
  --header "authorization: Bearer $ADMIN_TOKEN" \
  --header "content-type: application/json" \
  --data '{
    "packageId": "featured_tool_monthly",
    "advertiserEmail": "approved-buyer@example.com",
    "businessName": "Approved Business",
    "approvalReference": "signed-order-or-contract-reference",
    "termsAccepted": true,
    "expiresInHours": 48
  }' \
  https://agentid.services/api/paypal/subscription-links
```

Supported recurring package IDs are:

- `sponsor_starter_monthly`
- `featured_tool_monthly`
- `growth_partner_monthly`

Send only the returned `checkoutLink` to the approved recipient through a private channel. Do not publish it or append analytics parameters after the fragment.

## List approval records

```bash
curl --fail-with-body \
  --header "authorization: Bearer $ADMIN_TOKEN" \
  "https://agentid.services/api/paypal/subscription-links?limit=50"
```

List responses mask advertiser email addresses and never return raw approval tokens.

## Revoke an unused link

```bash
curl --fail-with-body \
  --request POST \
  --header "authorization: Bearer $ADMIN_TOKEN" \
  "https://agentid.services/api/paypal/subscription-links/APPROVAL_UUID/revoke"
```

Only unused `approved` or retryable `failed` links can be revoked through this endpoint. If PayPal has already issued a subscription approval object, manage cancellation through the verified provider workflow rather than pretending the local link revocation cancels PayPal state.

## Customer flow

The buyer opens `https://agentid.services/sponsor/subscribe#TOKEN`, verifies the package, price, business, masked recipient, and expiry, then enters the approved email. The Worker creates or recovers one idempotent PayPal approval object and redirects only to an HTTPS `paypal.com` subdomain.

Public requests without a valid approval token and matching email remain blocked even while approval-scoped subscriptions are enabled.

## Evidence boundaries

- Link issued: written approval was recorded; no PayPal subscription or charge exists yet.
- PayPal approval object issued: the buyer can review the subscription; payment is not yet verified.
- Subscription activated: a signed PayPal webhook confirmed activation.
- Revenue verified: a signed paid event was recorded idempotently in the revenue ledger.
- Placement active: inventory was separately enabled after fulfillment checks.

Do not collapse these states into a single "sale" or "revenue" status.
