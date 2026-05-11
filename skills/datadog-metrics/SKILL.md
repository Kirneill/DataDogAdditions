---
name: datadog-metrics
description: Query, submit, and manage Datadog metrics via the pup CLI. Use when working with infrastructure metrics, custom metrics, SLIs, or performance baselines.
---

# Datadog Metrics

## Prerequisites

- **`pup` CLI** installed and on PATH (`pip install pup` or via Datadog installer)
- **Authentication**: `DD_API_KEY` and `DD_APP_KEY` environment variables set, or configured via `pup config set`
- **Site config**: If not using `datadoghq.com`, set `DD_SITE` (e.g., `datadoghq.eu`, `us3.datadoghq.com`)

Verify setup:

```bash
pup config show          # confirm keys and site are set
pup metrics search "system.cpu"  # quick smoke test
```

## Commands

### Query Metrics

Retrieve metric values over a time window. The query follows Datadog's metric query syntax: `aggregator:metric{scope} by {grouping}`.

```bash
# Average CPU usage across all hosts, last hour
pup metrics query "avg:system.cpu.user{*}" --from 1h

# Sum of requests per service, last 30 minutes
pup metrics query "sum:http.requests{env:production} by {service}" --from 30m

# Max memory usage for a specific host, custom time range
pup metrics query "max:system.mem.used{host:web-01}" --from "2025-01-15T00:00:00Z" --to "2025-01-15T06:00:00Z"

# P95 latency for a service (distribution metric)
pup metrics query "p95:trace.http.request.duration{service:api-gateway,env:prod}" --from 1h

# Count of error responses grouped by endpoint
pup metrics query "count:http.responses{status_code:5xx} by {endpoint}" --from 4h
```

### Submit Custom Metrics

Push metric data points. Always specify metric type explicitly.

```bash
# Submit a gauge value (current snapshot — e.g., queue depth)
pup metrics submit --type gauge "app.queue.depth" 42 --tags "env:production,service:worker"

# Submit a count (number of events in the flush interval)
pup metrics submit --type count "app.jobs.completed" 15 --tags "env:staging,service:worker"

# Submit a rate (per-second normalized count)
pup metrics submit --type rate "app.requests.per_second" 120.5 --tags "env:production"

# Submit a distribution value (aggregated server-side — percentiles, avg, max)
pup metrics submit --type distribution "app.response_time" 0.235 --tags "service:api,env:prod"

# Submit a histogram value (client-side aggregation — avg, count, median, max, p95)
pup metrics submit --type histogram "app.payload_size" 4096 --tags "service:uploads"
```

### Search and Discover Metrics

```bash
# Search for metrics by name prefix
pup metrics search "system.cpu"

# Search for custom application metrics
pup metrics search "app."

# List all metrics matching a pattern with tag info
pup metrics search "aws.ec2" --details
```

### Metric Metadata

```bash
# Get metadata for a metric (type, unit, description)
pup metrics metadata get "system.cpu.user"

# Update metric metadata (set description and unit)
pup metrics metadata update "app.response_time" --description "API response time" --unit "millisecond" --type "gauge"
```

### Tag Management

```bash
# List tags for a specific host
pup tags list --host "web-01"

# Add tags to a host
pup tags add --host "web-01" "team:platform,tier:frontend"

# Remove a tag from a host
pup tags remove --host "web-01" "tier:frontend"

# List all tags in your environment
pup tags list
```

## When to Use

- **Infrastructure monitoring**: querying CPU, memory, disk, network metrics for capacity planning
- **Custom application metrics**: submitting business KPIs, queue depths, feature usage counters
- **SLI definition**: pulling latency percentiles, error rates, throughput numbers to define service level indicators
- **Performance baselines**: querying historical metric data to establish normal operating ranges before a deploy or load test
- **Tag hygiene**: auditing and managing host tags for consistent metric grouping
- **Incident investigation**: pulling targeted metric queries to correlate resource saturation with user-facing issues

## When NOT to Use

- **Log analysis** (searching error logs, log patterns, log indexes) — use `datadog-logs`
- **Distributed tracing** (trace search, flame graphs, service maps) — use `datadog-apm`
- **Synthetic tests** (API tests, browser tests, uptime checks) — use `datadog-synthetics`
- **Monitor/alert management** (creating or muting alerts) — use `datadog-monitors`
- **CI pipeline visibility** (test results, pipeline traces) — use `datadog-ci-visibility`

## Key Concepts

### Metric Types

| Type | Aggregation | Use Case | Example |
|---|---|---|---|
| **gauge** | Last value wins per interval | Current state snapshots | CPU %, memory used, queue depth |
| **count** | Summed per flush interval | Discrete events | Requests served, errors, jobs completed |
| **rate** | Count normalized to per-second | Throughput | Requests/sec, bytes/sec |
| **histogram** | Client-side: avg, count, median, max, p95 | Latency, sizes (agent-aggregated) | Response times, payload sizes |
| **distribution** | Server-side: p50, p75, p90, p95, p99, avg, max | Latency, sizes (globally accurate percentiles) | API latency, processing times |

### Query Syntax

```
aggregator:metric_name{tag_filter} by {grouping_tag}
```

- **Aggregators**: `avg`, `sum`, `min`, `max`, `count`
- **Scope (tag filter)**: comma-separated `key:value` pairs inside `{}`. Use `*` for all.
- **Grouping**: `by {tag}` splits results per unique tag value.

Examples:

```
avg:system.cpu.user{env:production} by {host}
sum:http.requests{service:api,env:prod} by {endpoint}
max:system.disk.used{*} by {device}
count:app.errors{env:prod,service:payments} by {error_type}
```

### Tag Format

Tags follow `key:value` format. Lowercase, alphanumeric, underscores, hyphens, and colons only. Common conventions:

- `env:production`, `env:staging`, `env:dev`
- `service:api-gateway`, `service:worker`
- `team:platform`, `team:payments`
- `region:us-east-1`, `availability_zone:us-east-1a`

Multiple tags on a submission are comma-separated: `"env:prod,service:api,team:platform"`.

### Time Ranges

- Relative: `--from 5m`, `--from 1h`, `--from 1d`, `--from 1w`
- Absolute: `--from "2025-01-15T00:00:00Z" --to "2025-01-15T12:00:00Z"`
- If `--to` is omitted, defaults to now.
