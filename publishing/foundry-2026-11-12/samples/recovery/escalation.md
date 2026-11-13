# Incident evidence packet: production-api-redacted

> Operator-reviewed draft. This packet may contain incomplete evidence.
> It is evidence synthesis, not a confirmed root-cause analysis or recovery confirmation.

## Reported impact

> Customers reported API errors while the project state appeared inconsistent.

## Evidence-linked timeline

- `2026-08-28T23:10:00Z` — **billing / invoice**: `PAID` (source `billing-1`; method: dashboard screenshot)
- `2026-08-28T23:15:00Z` — **control_plane / project-main**: `PAUSED` (source `control-1`; method: dashboard observation)
- `2026-08-28T23:18:00Z` — **control_plane / project-main**: `RUNNING` (source `control-2`; method: dashboard observation)
- `2026-08-28T23:20:00Z` — **service_health / rest-api**: `UNHEALTHY` (source `health-1`; method: redacted client observation)

### Unknown-time observations

- **dns / api-host**: `RESOLVING` (source `dns-1`)

## Contradictions

- **project-main**: PAUSED, RUNNING; sources control-1, control-2. Incompatible observed states were recorded within the configured 15-minute window.

## Attempted actions

- `2026-08-28T23:12:00Z` — Operator selected the dashboard unpause control.; outcome: Dashboard later showed differing states. (source `control-1`)

## Current observations

- None supplied.

## Missing evidence

- `current_project_state` — No explicit current project-state observation was supplied.
- `impact_end_time` — No impact end time was supplied.
- `support_case_identifier` — No support case identifier was supplied.

## Conservative recovery checklist

- **completed** — Review supplied billing evidence and record a timestamped confirmation.
- **completed** — Record the current control-plane project state with source and time.
- **completed** — Record current service-health observations without changing infrastructure.
- **completed** — Check DNS resolution from a safe client and preserve the observed result.
- **pending** — Preserve representative application errors with timestamps and sensitive data removed.
- **pending** — After operator review, manually escalate to support if observed states remain inconsistent.

## Requested support clarifications

- Please reconcile any source-linked contradictory project states.
- Please clarify the current control-plane state and any remaining restriction visible to support.
- Please identify which additional redacted timestamps or observations would help review this incident.

---
Generated at `2026-08-29T01:00:00Z` for incident alias `INC-DEMO-001`. Review and redact again before sharing.
