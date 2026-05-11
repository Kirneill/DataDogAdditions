---
name: datadog-apm
description: Distributed tracing, service maps, latency analysis, and production profiling via pup CLI and Datadog APM API
---

# Datadog APM & Tracing

## Prerequisites

- `pup` CLI installed and authenticated (`pup auth login` or `DD_API_KEY` + `DD_APP_KEY` env vars)
- `datadog-ci` installed globally (`npm install -g @datadog/datadog-ci`) for CI-specific trace operations
- Datadog APM enabled in the target org with services actively reporting traces
- For profiling commands: Continuous Profiler enabled on target services

## Commands

### List Services

```bash
# All traced services in the org
pup apm services list

# Filter by environment and service type
pup apm services list --env production --type web

# Output as JSON for scripting
pup apm services list --env production --format json
```

### Get Service Dependencies

```bash
# Show upstream and downstream dependencies for a service
pup apm services dependencies --service web-api --env production

# Full service map as adjacency list
pup apm service-map --env production --format json
```

### Search Traces

```bash
# Search traces by service and status
pup apm traces search --query "service:web-api status:error" --from "1h" --limit 50

# Search by resource name (endpoint) with minimum duration
pup apm traces search --query "service:web-api resource_name:/api/checkout" --duration-min 2s --from "4h"

# Search by custom tag
pup apm traces search --query "service:payment-service @merchant_id:12345 status:error" --from "24h"

# Search with trace ID correlation
pup apm traces search --query "trace_id:abc123def456" --from "7d"

# Complex query: slow database calls from a specific service
pup apm traces search --query "service:postgres @db.statement:*SELECT* duration:>500ms" --from "2h" --limit 100
```

### Get Trace Details

```bash
# Full trace with all spans
pup apm traces get --trace-id abc123def456

# Specific span within a trace
pup apm traces get --trace-id abc123def456 --span-id 789xyz

# Include resource metadata and tags
pup apm traces get --trace-id abc123def456 --format json --include-tags
```

### List Endpoints and Latency Stats

```bash
# Top endpoints by request count
pup apm endpoints list --service web-api --env production --sort hits --from "1h"

# Endpoints sorted by p99 latency
pup apm endpoints list --service web-api --env production --sort p99 --from "1h"

# Get latency percentile breakdown for a specific endpoint
pup apm endpoints stats --service web-api --resource "GET /api/users" --env production --from "1h"
# Returns: p50, p75, p90, p95, p99, max, avg, requests/s, error_rate, apdex

# Compare latency across time windows
pup apm endpoints stats --service web-api --resource "GET /api/users" --env production --from "1h" --compare "1d"
```

### Continuous Profiler

```bash
# List available profiles for a service
pup apm profiles list --service web-api --env production --from "1h"

# Get CPU profile (flame graph data)
pup apm profiles get --service web-api --env production --type cpu --from "30m" --format json

# Get memory allocation profile
pup apm profiles get --service web-api --env production --type memory --from "30m"
```

### Dynamic Instrumentation

```bash
# Add a log probe to a function (no restart required)
pup apm instrumentation create-probe --service web-api --type log --file "src/handlers/checkout.py" --line 42 --template "{userId} checkout total: {cart.total}"

# Add a metric probe to track function execution time
pup apm instrumentation create-probe --service web-api --type metric --method "CheckoutHandler.process" --metric-name "checkout.process_time" --metric-type histogram

# List active probes
pup apm instrumentation list-probes --service web-api

# Remove a probe
pup apm instrumentation delete-probe --probe-id abc123
```

## When to Use

- Investigating slow requests: search traces by duration, drill into spans to find the bottleneck
- Mapping service dependencies: understand how microservices connect before making changes
- Profiling CPU/memory hotspots: pull flame graphs from Continuous Profiler to find inefficient code paths
- Understanding request flow across microservices: trace a single request end-to-end through all services
- Debugging intermittent errors: search traces with error status filtered by custom tags
- Comparing latency before/after a deploy: use `--compare` flag on endpoint stats
- Inspecting production state without restarting: Dynamic Instrumentation probes for live debugging

## When NOT to Use

- **Infrastructure metrics** (CPU, memory, disk, network on hosts/containers) -- use `datadog-metrics` skill
- **Log analysis** (searching log lines, log patterns, log pipelines) -- use `datadog-logs` skill
- **Synthetic testing** (API health checks, browser tests, uptime monitoring) -- use `datadog-synthetics` skill
- **Monitor/alert creation** (threshold alerts, anomaly detection) -- use `datadog-monitors` skill
- **Incident management** (declaring/managing incidents) -- use `datadog-incidents` skill

## Key Concepts

- **Traces and Spans**: A trace represents a single request flowing through the system. Each trace contains spans -- units of work within a service (e.g., HTTP handler, database query, cache lookup). Spans form a tree: the root span is the entry point, child spans are downstream calls.
- **Service Map**: A directed graph of service-to-service communication derived from trace data. Edges represent calls; nodes represent services typed as `web`, `db`, `cache`, `queue`, or `custom`.
- **Instrumentation**: Automatic instrumentation via `dd-trace` libraries (Python, Node, Java, Go, Ruby, .NET, PHP) patches common frameworks and libraries. Manual instrumentation uses `tracer.start_span()` for custom business logic spans.
- **Trace Search Syntax**: Queries use `field:value` pairs. Reserved fields: `service`, `resource_name`, `status` (`ok`/`error`), `duration`, `trace_id`, `span_id`, `type`. Custom tags use `@` prefix: `@user_id:123`. Duration supports units: `100ms`, `2s`, `1m`.
- **Latency Percentiles**: p50 (median), p75, p90, p95, p99. A p99 of 2s means 1% of requests take longer than 2 seconds. Focus on p95/p99 for SLA compliance; p50 for typical user experience.
- **Apdex Score**: Satisfaction metric from 0-1. Calculated as `(satisfied + tolerating/2) / total`. Threshold is configurable per service. Score > 0.94 is excellent; < 0.85 needs investigation.
- **Error Rate**: Percentage of traces with `status:error`. Baseline varies by service; sudden spikes matter more than absolute value.
- **Continuous Profiler**: Always-on, low-overhead sampling profiler running in production. Produces CPU flame graphs (where time is spent), memory allocation profiles (what allocates), wall-time profiles (where threads block). Links profiles to specific traces for correlated debugging.
- **Dynamic Instrumentation**: Inject log lines, metrics, or snapshots into running production code at specific file/line or method locations without restarting the service. Probes are temporary and removable. No code change or deploy required.
