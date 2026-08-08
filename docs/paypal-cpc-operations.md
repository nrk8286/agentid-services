# PayPal CPC sponsor operations

GPTMarketPlus CPC campaigns are reviewed before payment. An approved advertiser receives a PayPal invoice whose quantity is the click cap and whose unit price is the CPC rate. Paying the exact invoice amount activates the campaign through the verified PayPal webhook.

Default pilot terms:

- $2.00 USD per server-validated outbound click.
- 25-click cap and $50.00 prepaid funding.
- 30-day initial flight after verified payment.
- Impressions, known bots, off-site or missing-referrer requests, and the same visitor's repeat clicks within 24 hours are not billable.
- Prepaid funds are recognized as earned revenue only as validated clicks are delivered.
- Undelivered funding is eligible for a written extension or refund of the unearned balance.

## Approve and invoice a campaign

Use an administrator bearer token. This call creates and emails a live PayPal invoice, so make it only after the sponsor, creative, destination, dates, rate, cap, and refund terms have been approved in writing.

```sh
curl -X POST https://gptmarketplus.com/api/paypal/cpc/campaigns \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{
    "advertiserEmail": "buyer@example.com",
    "sponsorName": "Approved sponsor name",
    "sponsorCopy": "Approved sponsor copy shown to GPTMarketPlus visitors.",
    "destinationUrl": "https://example.com/approved-landing-page",
    "cpcCents": 200,
    "clickCap": 25,
    "durationDays": 30
  }'
```

Do not put a real administrator token into source control, shell history, documentation, tickets, or chat messages.

## Reconcile delivery

Public, non-sensitive status:

```sh
curl https://gptmarketplus.com/api/paypal/cpc/status
```

Administrator campaign ledger:

```sh
curl https://gptmarketplus.com/api/paypal/cpc/campaigns \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

The administrator ledger reports funded, earned, and unearned cents. PayPal funding is not treated as fully earned when the invoice is paid; each accepted click creates one CPC revenue event.

A PayPal refund event immediately removes the campaign from delivery. A fully refunded invoice is closed as `refunded`; a partial or ambiguous refund remains stopped in `refund_review` until the administrator reconciles the delivered and unearned balance.

## Pause, resume, or cancel

```sh
curl -X POST https://gptmarketplus.com/api/paypal/cpc/campaigns/CAMPAIGN_ID/status \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"action":"pause"}'
```

Allowed actions are `pause`, `resume`, and `cancel`. A refund must still be completed and verified through PayPal; changing local campaign status does not move money.
