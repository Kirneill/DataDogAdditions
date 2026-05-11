---
name: datadog-monitors
description: Create, manage, and mute Datadog monitors (alerts) via the pup CLI. Use when setting up alerts, managing notification routing, muting during deploys, or configuring SLO-based alerts.
---

# Datadog Monitors

## Prerequisites

- **`pup` CLI** installed and on PATH (`pip install pup` or via Datadog installer)
- **Authentication**: `DD_API_KEY` and `DD_APP_KEY` environment variables set, or configured via `pup config set`
- **Site config**: If not using `datadoghq.com`, set `DD_SITE` (e.g., `datadoghq.eu`, `us3.datadoghq.com`)

Verify setup:

```bash
pup config show          # confirm keys and site
pup monitors list --limit 5   # quick smoke test
```

## Commands

### Create Monitors

Create a new monitor with a query, thresholds, and notification targets.

```bash
# Metric alert: CPU usage above 90% for 5 minutes
pup monitors create \
  --type "metric alert" \
  --name "High CPU on {{host.name}}" \
  --query "avg(last_5m):avg:system.cpu.user{env:production} by {host} > 90" \
  --message "CPU is above 90% on {{host.name}}. @slack-infra-alerts @pagerduty-oncall" \
  --tags "team:platform,env:production"

# Log alert: more than 50 errors per 5-minute window
pup monitors create \
  --type "log alert" \
  --name "Error spike in payments service" \
  --query "logs(\"service:payments status:error\").index(\"main\").rollup(\"count\").last(\"5m\") > 50" \
  --message "Payments service error rate spiked above 50/5min. @slack-payments-team" \
  --tags "service:payments,team:payments"

# Query alert: anomaly detection on request latency
pup monitors create \
  --type "query alert" \
  --name "Anomalous API latency" \
  --query "avg(last_1h):anomalies(avg:http.request.duration{service:api,env:prod}, 'agile', 3) >= 1" \
  --message "API latency is anomalous (3 deviations). @slack-api-team" \
  --tags "service:api,env:production"

# Composite monitor: alert only when BOTH CPU is high AND error rate is elevated
pup monitors create \
  --type "composite" \
  --name "High CPU + elevated errors" \
  --query "123 && 456" \
  --message "Both CPU and error monitors are triggering. Likely capacity issue. @pagerduty-oncall" \
  --tags "team:platform"

# Forecast monitor: disk will be full within 48 hours
pup monitors create \
  --type "metric alert" \
  --name "Disk forecast: full in 48h on {{host.name}}" \
  --query "max(next_48h):forecast(avg:system.disk.used{env:production} by {host}, 'linear', 1) > 90" \
  --message "Disk on {{host.name}} predicted to exceed 90% within 48h. @slack-infra-alerts" \
  --tags "team:platform"
```

### List Monitors

```bash
# List all monitors (default: 100)
pup monitors list

# List with pagination
pup monitors list --limit 50 --page 0

# Filter by tag
pup monitors list --tags "team:platform"

# Filter by monitor name search
pup monitors list --name "CPU"
```

### Get Monitor Details

```bash
# Get full details for a specific monitor
pup monitors get 12345678

# Get monitor with group states (which hosts/groups are alerting)
pup monitors get 12345678 --group-states "alert,warn"
```

### Update Monitors

```bash
# Update monitor thresholds
pup monitors update 12345678 \
  --query "avg(last_5m):avg:system.cpu.user{env:production} by {host} > 95" \
  --message "CPU above 95% on {{host.name}}. @slack-infra-alerts"

# Update notification targets
pup monitors update 12345678 \
  --message "Updated alert. @slack-infra-alerts @pagerduty-critical"

# Update tags
pup monitors update 12345678 --tags "team:platform,env:production,severity:high"
```

### Delete Monitors

```bash
# Delete a monitor by ID
pup monitors delete 12345678
```

### Mute and Unmute

Silence monitors temporarily — essential during deploys, maintenance, and known-noisy windows.

```bash
# Mute a specific monitor indefinitely
pup monitors mute 12345678

# Mute with an expiration (ISO 8601 timestamp)
pup monitors mute 12345678 --end "2025-01-15T06:00:00Z"

# Mute a specific scope within a multi-alert monitor
pup monitors mute 12345678 --scope "host:web-03"

# Unmute a monitor
pup monitors unmute 12345678

# Unmute a specific scope
pup monitors unmute 12345678 --scope "host:web-03"
```

### Search Monitors

```bash
# Search monitors by query text
pup monitors search "service:api"

# Search by monitor status
pup monitors search --status "Alert"

# Search by tag
pup monitors search --tags "team:platform"

# Search by type
pup monitors search --type "metric alert"
```

### Downtime Scheduling

Schedule planned downtime to suppress alerts during maintenance windows.

```bash
# Schedule downtime for all monitors matching a scope
pup monitors downtime create \
  --scope "env:staging" \
  --start "2025-01-15T02:00:00Z" \
  --end "2025-01-15T04:00:00Z" \
  --message "Staging maintenance window"

# Schedule recurring weekly downtime
pup monitors downtime create \
  --scope "service:batch-jobs" \
  --start "2025-01-15T00:00:00Z" \
  --end "2025-01-15T06:00:00Z" \
  --recurrence-type "weeks" \
  --recurrence-period 1 \
  --recurrence-days "Mon" \
  --message "Weekly batch job maintenance"

# List active downtimes
pup monitors downtime list

# Cancel a downtime
pup monitors downtime delete <downtime-id>
```

## When to Use

- **Creating alerts**: setting up metric, log, or anomaly-based monitors for new services or infrastructure
- **Notification routing**: configuring `@slack-channel`, `@pagerduty-service`, `@email` targets on monitors
- **Deploy safety**: muting monitors during deploy windows to suppress expected noise, then unmuting after
- **Incident response**: searching for related monitors, checking which monitors are firing, understanding alert thresholds
- **SLO-based alerts**: creating monitors that fire when an SLO error budget is burning too fast
- **Maintenance windows**: scheduling downtimes for planned infrastructure work
- **Alert tuning**: updating thresholds, evaluation windows, or notification targets on existing monitors

## When NOT to Use

- **SLO definitions** (creating/managing SLOs themselves) — use `pup slos` commands directly
- **Incident management** (declaring incidents, updating status pages, postmortems) — use `datadog-incidents`
- **Metric queries** (exploring metric data, submitting custom metrics) — use `datadog-metrics`
- **Log search** (investigating errors in logs) — use `datadog-logs`
- **Synthetic tests** (creating API/browser uptime checks) — use `datadog-synthetics`

## Key Concepts

### Monitor Types

| Type | Query Prefix | Use Case |
|---|---|---|
| **metric alert** | `avg(last_Xm):metric{scope}` | Threshold on any metric — CPU, memory, custom counters |
| **query alert** | `avg(last_Xm):function(metric{scope})` | Advanced: anomaly detection, outlier, forecast |
| **log alert** | `logs("query").index("idx").rollup("count").last("Xm")` | Alert on log volume or patterns |
| **composite** | `A && B`, `A \|\| B` | Combine existing monitors with boolean logic |
| **apm** | `avg(last_Xm):trace.metric{scope}` | APM trace metrics (latency, error rate, throughput) |
| **synthetics** | N/A (configured via synthetics) | Synthetic test failures |
| **slo** | N/A (configured via SLO) | SLO error budget burn rate |

### Monitor Query Syntax

The general form:

```
aggregator(last_Xm):space_aggregator:metric{scope} [by {group}] operator threshold
```

- **Time aggregator**: `avg`, `sum`, `min`, `max`, `count` — how values are combined over the evaluation window
- **Evaluation window**: `last_1m`, `last_5m`, `last_15m`, `last_30m`, `last_1h`, `last_4h`
- **Space aggregator**: `avg`, `sum`, `min`, `max` — how values across groups are combined
- **Scope**: Tag filters — `{env:production,service:api}`
- **Grouping**: `by {host}`, `by {service}` — creates multi-alert (one alert per group)
- **Operator**: `>`, `>=`, `<`, `<=`
- **Threshold**: Numeric value

### Multi-Alert vs. Simple Alert

- **Simple alert**: One alert status for the entire monitor. Triggers when the aggregate crosses the threshold.
- **Multi-alert**: Uses `by {tag}` grouping. Each unique tag value (e.g., each host, each service) gets its own alert status. A monitor on `avg:system.cpu{*} by {host} > 90` fires independently per host.

Always prefer multi-alert when monitoring per-host or per-service metrics — otherwise a single hot host gets averaged away.

### Notification Routing

Use `@` handles in the monitor message to route alerts:

| Target | Syntax | Example |
|---|---|---|
| Slack channel | `@slack-<channel>` | `@slack-infra-alerts` |
| PagerDuty service | `@pagerduty-<service>` | `@pagerduty-oncall` |
| Email | `@<email>` | `@oncall@company.com` |
| Opsgenie | `@opsgenie-<team>` | `@opsgenie-platform` |
| Webhook | `@webhook-<name>` | `@webhook-deploy-tracker` |
| Team | `@team-<name>` | `@team-platform` |

Combine multiple targets: `"CPU critical on {{host.name}}. @slack-infra-alerts @pagerduty-oncall"`

### Template Variables

Use template variables in monitor names and messages to include dynamic context:

- `{{host.name}}` — alerting host
- `{{service.name}}` — alerting service
- `{{value}}` — metric value that crossed the threshold
- `{{threshold}}` — configured threshold value
- `{{last_triggered_at}}` — when the monitor last triggered
- `{{comparator}}` — the comparison operator (`>`, `<`, etc.)

### Alert Conditions and Recovery

Monitors support two thresholds:

- **Alert threshold**: the value that triggers the alert (required)
- **Warning threshold**: a softer threshold that triggers a warning state (optional)
- **Recovery thresholds**: values below which the monitor returns to OK. Set explicitly to prevent flapping on metrics that hover near the threshold.

```bash
# Create with warning and recovery thresholds
pup monitors create \
  --type "metric alert" \
  --name "High CPU on {{host.name}}" \
  --query "avg(last_5m):avg:system.cpu.user{env:production} by {host} > 90" \
  --thresholds '{"critical": 90, "warning": 80, "critical_recovery": 75, "warning_recovery": 70}' \
  --message "@slack-infra-alerts"
```
