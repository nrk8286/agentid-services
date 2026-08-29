# Analytics Engine schema

The Worker uses separate Analytics Engine datasets because Cloudflare columns are positional. Never reuse a dataset with a different meaning for the same `blobN`, `doubleN`, or `index1` column.

## `agentid_attribution_events`

This dataset stores browser and server attribution events.

| Column | Meaning |
| --- | --- |
| `index1` | Session, conversation, lead, or event key |
| `blob1` | Event name |
| `blob2` | Source page |
| `blob3` | Traffic source |
| `blob4` | Traffic medium |
| `blob5` | Campaign |
| `blob6` | Referrer |
| `double1` | Event count (`1`) |
| `double2` | Numeric event value |

## `agentid_business_events`

This dataset stores operational and verified-revenue events emitted by the Worker.

| Column | Meaning |
| --- | --- |
| `index1` | Event, session, package, or build key |
| `blob1` | Event type |
| `blob2` | Source |
| `blob3` | Campaign |
| `blob4` | Status |
| `blob5` | Currency |
| `blob6` | Service or package |
| `double1` | Event count (`1`) |
| `double2` | Amount in minor currency units |

## `agentid_grounded_provider_events`

This dataset stores one privacy-safe row for every grounded-provider attempt, including successful attempts. It must not contain a prompt, answer, source URL, conversation or session identifier, exception message, stack, IP address, or user-agent.

| Column | Meaning | Values |
| --- | --- | --- |
| `index1` | Sampling key | Provider code |
| `blob1` | Event | `grounded_provider_attempt` |
| `blob2` | Provider | `google_cloud_agent_search` or `cloudflare_ai_search` |
| `blob3` | Outcome | `success` or `failure` |
| `blob4` | Result code | `ok` or an allow-listed failure code |
| `blob5` | HTTP status | `400`-`599`, otherwise `none` |
| `double1` | Attempt count | `1` |
| `double2` | Duration | Milliseconds |
| `double3` | Parsed choices | Bounded count, otherwise `0` |
| `double4` | Retrieved chunks | Bounded count, otherwise `0` |
| `double5` | Valid sources | Bounded count, otherwise `0` |

Cloudflare may sample Analytics Engine rows. Weight count and sum calculations by `_sample_interval`.

## Operational queries

Attempts, failures, failure rate, and average latency by provider over the last 24 hours:

```sql
SELECT
  blob2 AS provider,
  SUM(_sample_interval * double1) AS attempts,
  SUM(CASE WHEN blob3 = 'failure' THEN _sample_interval * double1 ELSE 0 END) AS failures,
  100 * SUM(CASE WHEN blob3 = 'failure' THEN _sample_interval * double1 ELSE 0 END)
    / SUM(_sample_interval * double1) AS failure_rate_percent,
  SUM(_sample_interval * double2)
    / SUM(_sample_interval * double1) AS average_duration_ms
FROM agentid_grounded_provider_events
WHERE timestamp >= NOW() - INTERVAL '24' HOUR
GROUP BY blob2
ORDER BY provider
```

Failure codes over the last seven days:

```sql
SELECT
  blob2 AS provider,
  blob4 AS failure_code,
  blob5 AS http_status,
  SUM(_sample_interval * double1) AS failures
FROM agentid_grounded_provider_events
WHERE blob3 = 'failure'
  AND timestamp >= NOW() - INTERVAL '7' DAY
GROUP BY blob2, blob4, blob5
ORDER BY failures DESC
```

Run queries with a Cloudflare API token that has `Account Analytics Read`:

```powershell
$headers = @{ Authorization = "Bearer $env:CLOUDFLARE_API_TOKEN" }
$query = Get-Content -Raw -LiteralPath .\query.sql
Invoke-RestMethod -Method Post -Uri "https://api.cloudflare.com/client/v4/accounts/<account-id>/analytics_engine/sql" -Headers $headers -ContentType "text/plain" -Body $query
```

The standard Wrangler OAuth session used to deploy this Worker may not include the analytics-read permission. Use a narrowly scoped read token for reporting; do not commit it.

Workers Logs and traces are independently head-sampled at 10% in `wrangler.jsonc`. Provider rate and latency reports must use the dedicated Analytics Engine dataset, not sampled log counts. Invocation records can include Cloudflare request metadata even though application telemetry omits prompts and response data; treat log access as privileged.

## Legacy dataset

`agentid_services_events` was retired from writes when these schemas were split. It contains historical attribution and business rows whose positional columns do not have one consistent meaning. Keep it only for bounded historical lookups keyed by a known event type; do not use it for cross-event column reports.
