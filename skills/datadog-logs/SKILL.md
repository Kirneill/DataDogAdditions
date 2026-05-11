---
name: datadog-logs
description: Search, analyze, and manage Datadog logs via the pup CLI. Use when investigating errors, analyzing log patterns, or exploring logs during incident response.
---

# Datadog Logs

## Prerequisites

- **`pup` CLI** installed and on PATH (`pip install pup` or via Datadog installer)
- **Authentication**: `DD_API_KEY` and `DD_APP_KEY` environment variables set, or configured via `pup config set`
- **Site config**: If not using `datadoghq.com`, set `DD_SITE` (e.g., `datadoghq.eu`, `us3.datadoghq.com`)
- **Logs must be enabled** in the Datadog organization and at least one log index must exist

Verify setup:

```bash
pup config show              # confirm keys and site
pup logs indexes list        # verify log indexes are accessible
```

## Commands

### Search Logs

Query logs using Datadog's log search syntax. Results return matching log events with timestamp, host, service, status, and message.

```bash
# Search for error logs across all services, last hour
pup logs search "status:error" --from 1h

# Search for a specific service's errors in production
pup logs search "service:api-gateway status:error env:production" --from 30m

# Search for a specific error message pattern
pup logs search "service:payments \"timeout exceeded\"" --from 4h

# Search with attribute filters (structured log fields)
pup logs search "@http.status_code:>=500 service:web" --from 1h

# Search for logs from a specific host
pup logs search "host:web-03 status:warn OR status:error" --from 2h

# Search with exclusion (find non-200 responses)
pup logs search "service:api -@http.status_code:200" --from 1h

# Limit result count
pup logs search "status:error" --from 1h --limit 50

# Search with a specific index
pup logs search "service:payments" --from 1h --index "main"

# Search with sort order
pup logs search "status:error" --from 1h --sort "timestamp" --order "desc"
```

### Aggregate Logs

Compute analytics over log data — counts, unique counts, and statistical aggregations.

```bash
# Count errors by service over the last hour
pup logs aggregate --compute "count" --group-by "service" --query "status:error" --from 1h

# Count unique users hitting 5xx errors
pup logs aggregate --compute "count_unique(@usr.id)" --query "@http.status_code:>=500" --from 1h

# Average response time by endpoint
pup logs aggregate --compute "avg(@http.response_time)" --group-by "@http.url_path" --query "service:api" --from 1h

# Error count over time (timeseries buckets)
pup logs aggregate --compute "count" --query "status:error" --from 24h --timeseries "1h"

# Top error messages by frequency
pup logs aggregate --compute "count" --group-by "@error.message" --query "status:error" --from 4h --limit 10
```

### Get Log Details

Retrieve a specific log event by its ID.

```bash
# Get full log event details (all attributes, tags, message)
pup logs get <log-id>

# Example with a real log ID
pup logs get "AQAAAYxyz123abc456"
```

### List and Inspect Indexes

```bash
# List all log indexes (name, filter, retention, daily quota)
pup logs indexes list

# Get details for a specific index
pup logs indexes get "main"
```

### Log Pipelines (read-only inspection)

```bash
# List processing pipelines
pup logs pipelines list

# Get a specific pipeline's processors
pup logs pipelines get <pipeline-id>
```

## When to Use

- **Error investigation**: searching for error logs by service, status, message, or structured attributes during an incident
- **Log pattern analysis**: aggregating logs to find the most frequent error types, noisy services, or unusual spikes
- **Incident response**: correlating log events with a time window around an alert or outage
- **Service debugging**: filtering logs for a specific trace ID, user ID, or request ID to follow a single request
- **Index management**: checking which indexes exist, their retention policies, and daily quotas
- **Audit trails**: searching for specific user actions or system events in logs

## When NOT to Use

- **Metrics queries** (CPU, memory, custom gauges, SLIs) — use `datadog-metrics`
- **Distributed tracing** (trace search, service maps, flame graphs) — use `datadog-apm`
- **Creating or managing alerts** — use `datadog-monitors`
- **Synthetic monitoring** (API tests, browser checks) — use `datadog-synthetics`

## Key Concepts

### The Log Pipeline

Logs flow through four stages in Datadog:

1. **Collect** — Agents, libraries, or API send raw log events to Datadog
2. **Process** — Pipelines parse, enrich, and transform logs (grok parser, attribute remapper, category processor, sensitive data scanner)
3. **Index** — Processed logs are stored in indexes with retention and quota policies. Index filters control which logs are stored.
4. **Archive** — Logs can be archived to cloud storage (S3, GCS, Azure Blob) for long-term compliance retention beyond index TTL

### Search Syntax

Datadog log search uses a query language with these operators:

| Syntax | Meaning | Example |
|---|---|---|
| `key:value` | Exact match on reserved attribute | `service:api-gateway` |
| `@key:value` | Match on custom attribute (facet) | `@http.status_code:500` |
| `@key:>=N` | Numeric comparison | `@http.response_time:>=2000` |
| `"exact phrase"` | Exact phrase in message | `"connection refused"` |
| `key:val*` | Wildcard match | `service:api-*` |
| `AND` / `OR` | Boolean operators (AND is implicit) | `status:error OR status:warn` |
| `-key:value` | Exclusion | `-service:healthcheck` |
| `key:(v1 OR v2)` | Group match | `status:(error OR critical)` |

### Log Levels / Status

Datadog normalizes log levels into these statuses:

- `status:debug` — Diagnostic detail
- `status:info` — Normal operations
- `status:warn` — Potential issues, degraded but functional
- `status:error` — Failures, exceptions, 5xx responses
- `status:critical` — Severe failures, service down
- `status:emergency` — System-wide catastrophic failure

### Facets

Facets are indexed attributes that enable fast filtering and aggregation. Two types:

- **Reserved facets**: Built-in — `host`, `service`, `status`, `source`, `timestamp`
- **Custom facets**: User-defined from structured log attributes — `@http.status_code`, `@usr.id`, `@error.kind`, `@duration`

Use `@` prefix for custom facets in queries. Reserved facets need no prefix.

### Common Search Patterns

```bash
# All errors for a service in production
"service:payments status:error env:production"

# Trace correlation — find logs for a specific trace
"@trace_id:abc123def456"

# User session investigation
"@usr.id:user-12345"

# Slow requests (response time over 2 seconds)
"@http.response_time:>2000 service:api"

# Specific error class in Java/Python services
"@error.kind:TimeoutException"

# Logs from a deploy window
"service:api @version:2.4.1"
```

### Time Ranges

- Relative: `--from 5m`, `--from 1h`, `--from 1d`, `--from 1w`
- Absolute: `--from "2025-01-15T00:00:00Z" --to "2025-01-15T06:00:00Z"`
- If `--to` is omitted, defaults to now.

### Sensitive Data Scanner

Datadog's Sensitive Data Scanner automatically detects and redacts PII, credentials, and other sensitive patterns in logs before indexing. Be aware that:

- Redacted fields show `[REDACTED]` in search results
- Original values are not recoverable after redaction
- Scanner rules are configured in the Datadog UI, not via CLI
