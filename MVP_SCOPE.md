# DAY 1 — PRODUCT SCOPE FREEZE (MOST IMPORTANT DAY)

## Goal

Define exactly what exists in the MVP and explicitly what does not. This document is the single source of truth for Day 1 scope: immutable decisions, exact behavior, acceptance criteria, and examples for implementers and testers.

## Why this matters

- Prevents scope creep on the most critical day.
- Keeps the product buildable, testable, and launchable.
- Removes ambiguous requirements that cause rework and indecision.

## MVP PRINCIPLE (ONE SENTENCE)

Alerts-first. No complexity. Only what is required to reliably detect and notify about basic HTTP uptime and a minimal performance metric.

## MUST-HAVE FEATURES (ONLY THESE)

1. Monitor Type

- Support: HTTP and HTTPS endpoints only.
- HTTP Method: GET only.
- Authentication: none (no basic auth, no bearer tokens, no custom auth flows).
- Headers: no custom request headers supported in MVP.
- Body validation: not supported.

Rationale: every extra HTTP feature increases complexity (credential storage, handling, test matrix). Keep it to the smallest surface that gives value.

2. Monitor Configuration (Exact Fields)

Each monitor record exposed by the API/UI must contain exactly the following fields and constraints:

- `name` — string, required.
- `url` — must be a valid HTTP or HTTPS URL (scheme required). No IP-only URLs without scheme.
- `check_interval` — limited to one of these values (seconds): 60, 300, 600. (1 min, 5 min, 10 min)
- `timeout` — request-level timeout in seconds; default 5s; maximum allowed 10s.
- `expected_status` — fixed to `200` (no customization allowed in MVP).

Strict exclusions for MVP: no custom status codes, no regex body checks, no JSON assertions, no custom headers, no request bodies. These are explicitly out.

3. Uptime Logic (Precisely Defined)

Failure conditions (a single check-run is considered failed if any of the following occurs):

- Request times out (request takes longer than `timeout`).
- DNS resolution failure.
- TCP connection failure.
- HTTP response status is not `200`.

State transition rules (global and immutable):

- Monitor is considered `UP` by default until failures are observed.
- `UP` → `DOWN` occurs only after **2 consecutive failed check-runs**.
- `DOWN` → `UP` occurs only after **2 consecutive successful check-runs**.

Notes about checks and retries:

- There are no additional verification retries beyond the single request that constitutes a check-run. The "2 consecutive" rule uses naturally scheduled check runs (e.g., two 60s checks for a 60s interval). Do not implement any immediate extra re-checks, except what the HTTP client itself does internally (but client retries should be disabled/configured to 0 where possible).

4. Alerts (Minimal, Correct)

Alert types supported in MVP:

- `DOWN` — emitted when the monitor transitions from UP → DOWN.
- `RECOVERED` — emitted when the monitor transitions from DOWN → UP.

Channels supported in MVP:

- Email (one or more addresses per project/user as allowed by the product UX).
- Slack (incoming webhook URL per project or user).

Alert rules (immutable for MVP):

- Alerts are sent only on state change (i.e., on the transition moment when the 2nd consecutive failure or success occurs).
- No repeated alerts while the monitor remains in the same state. That means: once DOWN, no further DOWN alerts until a RECOVERED alert then another DOWN transition.

Payloads and minimal content:

- Each alert must include: `monitor_name`, `monitor_url`, `monitor_id`, `old_state`, `new_state`, `timestamp`, `last_response_time_ms` (if available), and `last_http_status`.

5. Dashboard (Read-only Focus)

UI capabilities allowed in MVP:

- Create a monitor (simple form with exactly the configuration fields above).
- View a list of monitors with columns: `name`, `url`, `current_status` (UP/DOWN), `last_check_time` (UTC ISO timestamp), `avg_response_time_last_24h`.
- `avg_response_time_last_24h` definition: arithmetic mean of response times from successful checks only, for the last 24 hours; if no successful checks in 24h, show `—` or `N/A`.
- Minimal graph: one simple line graph (sparkline) of response times (last 24h) per monitor. No dashboards, zooming, or deep metrics exploration.

## EXPLICITLY NOT IN MVP (WRITE THIS DOWN — SACRED LIST)

- No SMS notifications.
- No support for custom auth headers or request headers.
- No private or customer-hosted agents / on-prem probes.
- No SSL/TLS certificate checks (expiry, chain validation beyond standard TLS handshake).
- No public status pages (you may later add, not in MVP).
- No performance thresholds (p95/p99 or complex SLIs); only a simple avg_response_time metric as described.
- No teams, roles, or multi-user permissions.
- No geographic regions or multi-region probe network. Checks run from a single region only.
- No retries beyond request-level (i.e., do not implement verification re-checks or escalation-based rechecks).

This list is sacred: do not add any of these items to the MVP.

## END-OF-DAY DELIVERABLE

Commit a file named `MVP_SCOPE.md` at repository root containing this exact scope freeze and insist that any change must be approved by the Day 1 product owner.

## IMPLEMENTATION NOTES

API surface (examples)

- Create monitor (POST `/api/monitors`)

  Request body (JSON):

  {
  "name": "Homepage",
  "url": "https://example.com/",
  "check_interval": 60,
  "timeout": 5
  }

- List monitors (GET `/api/monitors`) → returns list with `current_status`, `last_check_time`, `avg_response_time_last_24h`.

Data model (minimal)

- `monitors` table/schema:

  - id (uuid)
  - name (string)
  - url (string)
  - check_interval (int)
  - timeout (int)
  - expected_status (int, default 200)
  - current_state (enum: UP/DOWN)
  - consecutive_successes (int)
  - consecutive_failures (int)
  - last_check_time (timestamp)

- `check_runs` table (optional simplified retention):

  - id, monitor_id, timestamp, duration_ms, http_status, error_code (nullable)
  - retention: keep 24–30 days (configurable); average uses last 24h window only.

- `alerts` table: id, monitor_id, alert_type (DOWN/RECOVERED), timestamp, payload_json

Scheduler and worker behavior

- Scheduler enqueues a single check job per monitor according to `check_interval`.
- Worker picks job, performs one HTTP GET with the configured `timeout` and records result.
- Based on result: increment `consecutive_successes` or `consecutive_failures`, reset the other to 0.
- After updating counters, evaluate the state transition rules and create/send an alert only if state changed.

Acceptance tests (must pass for Day 1)

1. UP → DOWN transition

Sequence: success, failure, failure

- After first failure: monitor remains UP (no alert created).
- After second consecutive failure: monitor becomes DOWN and one `DOWN` alert is emitted.

2. DOWN → UP transition

Sequence: failure, success, success

- After first success while DOWN: remains DOWN (no alert).
- After second consecutive success: monitor becomes UP and one `RECOVERED` alert is emitted.

3. No repeat alerts while state unchanged

- Once DOWN, subsequent failed check-runs must not produce additional DOWN alerts.

4. Timeout respects configured value

- If response takes longer than `timeout`, the check-run is a failure.

Edge cases & clarifications

- Client-level automatic retries must be disabled to respect "no retries beyond request-level". If the HTTP client library retries by default, configure it to 0.
- DNS caching: a transient DNS issue will count as a failed check. Two consecutive DNS failures are required to declare DOWN.
- Clock skew: store and display times in UTC to avoid ambiguity.
- Partial failures: if HTTP returns 200 but body is empty/slow, this is still success (MVP does not inspect body or opacity beyond status and response time).

Operational notes

- Keep infrastructure simple to control cost: single-region worker fleet, one Postgres, one Redis (if using queue), and minimal external services for email/Slack.
- Enforce per-account limits to avoid abuse and cost spikes (e.g., maximum monitors per free user).

Change control

- Any change to the items above must be documented, justified, and approved by the Day 1 product owner. Treat this file and its lists as contractual for MVP work.

## Questions you should not ask on Day 1

- "What about custom headers?" — Not in MVP.
- "Can we add SMS?" — Not in MVP.
- For any feature not listed above: add to backlog and do not implement during MVP phase.

---

Signed-off: Day 1 Product Owner
