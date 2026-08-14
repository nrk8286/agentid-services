# Daily growth snapshot operations

The production Durable Object alarm invokes one growth snapshot per calendar day in
`America/Chicago`. The collector reads business evidence, stores a bounded D1 history,
and alerts the owner only when a tracked outcome changes.

## Metrics

- Search Console final-data impressions and clicks for the current 28-day window.
- Genuine leads across the generic and AgentID lead tables.
- Provider-verified PayPal checkouts.
- Settled PayPal revenue, including earned delivery from prepaid CPC funds.
- Reply state for the seven recorded founding-sponsor campaigns.

The lead and revenue queries exclude records marked as QA, internal, synthetic, test,
or sandbox. The known bounced WithConnect address remains inactive and is never treated
as follow-up eligible. Gmail checks use message metadata only; message bodies are not
requested or stored.

## Alert policy

The first successful run establishes a baseline and sends no alert. Later runs alert
only when impressions, clicks, genuine leads, verified PayPal checkouts, settled revenue,
or the set of replied/bounced sponsor campaigns changes. Provider readiness and routine
health changes do not trigger growth alerts.

Failed alerts remain visible in D1 and are retried by a later Durable Object alarm. The
collector never sends sponsor outreach, creates payments, changes leads, or mutates Gmail.

## Required setup

1. Apply D1 migrations with `npm run migrate:d1`.
2. Deploy the Worker after normal validation.
3. Reconnect Google OAuth through the existing administrator flow. The connection must
   grant both `gmail.send` and `gmail.readonly`; the latter is required only for sponsor
   reply metadata.
4. Confirm `gmailReadReady: true` in the private Google OAuth status.
5. Confirm the next Durable Object alarm and inspect the private snapshot endpoint:

   `GET /api/agents/growth-snapshot?limit=14`

   The request requires `Authorization: Bearer <ADMIN_TOKEN>`.

## Safe degraded modes

- Without Search Console access, the snapshot records `searchConsoleReady: false`.
- Without Gmail read-only access, sponsor campaigns record `unavailable`; that readiness
  transition alone never produces an alert.
- Outside PayPal live mode, settled revenue and paid checkouts are forced to zero and
  `paypalLiveMode` is false.
- Without D1, collection stops with `storage_unavailable`; no alert is attempted.

## Kill switch

Disable the `AGENT_SCHEDULER` binding or stop its Durable Object alarm to stop new runs.
Existing D1 snapshots remain available for audit. Revoking Google OAuth immediately
stops sponsor reply checks and Gmail-based alert fallback without deleting snapshots.
