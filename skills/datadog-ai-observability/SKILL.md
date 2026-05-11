---
name: datadog-ai-observability
description: Monitor LLM applications, trace AI agent chains, analyze token usage, run evaluations, and query AI observability data via pup and Datadog APIs.
---

# Datadog AI Observability

## Prerequisites

- `pup` CLI installed and authenticated (`pup login` or `DD_API_KEY` + `DD_APP_KEY` env vars)
- Datadog org with LLM Observability enabled
- For LLM tracing: application instrumented with `ddtrace` (Python) or Datadog LLM SDK
- API/App key pair with `apm_read`, `llm_observability_read` scopes
- Optional: Datadog MCP Server configured for native Claude/Cursor/Codex integration

## Commands

### LLM Traces and Spans

```bash
# List recent LLM traces (last 1 hour)
pup api GET "/api/v2/llm-obs/traces?filter[from]=now-1h&filter[to]=now&page[limit]=25"

# Search LLM spans by model name
pup api GET "/api/v2/llm-obs/spans?filter[query]=@ml_model.name:gpt-4o&filter[from]=now-6h"

# Search spans with high latency (> 5 seconds)
pup api GET "/api/v2/llm-obs/spans?filter[query]=@duration:>5000000000&filter[from]=now-1h"

# Get a specific trace by ID
pup api GET "/api/v2/llm-obs/traces/TRACE_ID_HERE"

# Filter spans by span kind (agent, tool, llm, retrieval, workflow)
pup api GET "/api/v2/llm-obs/spans?filter[query]=@span.kind:retrieval&filter[from]=now-1h"
```

### Token Usage and Cost Analysis

```bash
# Get token usage aggregated by model (last 24 hours)
pup api POST "/api/v2/llm-obs/analytics" --data '{
  "filter": {"from": "now-24h", "to": "now"},
  "group_by": ["@ml_model.name"],
  "compute": [
    {"aggregation": "sum", "metric": "@token.input_count"},
    {"aggregation": "sum", "metric": "@token.output_count"},
    {"aggregation": "sum", "metric": "@token.total_cost"}
  ]
}'

# Get token usage by service
pup api POST "/api/v2/llm-obs/analytics" --data '{
  "filter": {"from": "now-7d", "to": "now"},
  "group_by": ["service"],
  "compute": [{"aggregation": "sum", "metric": "@token.total_cost"}]
}'

# Check for unusually large prompts (potential prompt injection or bloat)
pup api GET "/api/v2/llm-obs/spans?filter[query]=@token.input_count:>4000&filter[from]=now-1h"
```

### Evaluations (Quality Checks)

```bash
# List evaluation results for a service
pup api GET "/api/v2/llm-obs/evaluations?filter[service]=chatbot-api&filter[from]=now-24h"

# Search for low-scoring faithfulness evaluations
pup api GET "/api/v2/llm-obs/evaluations?filter[query]=@evaluation.metric:faithfulness @evaluation.score:<0.5&filter[from]=now-6h"

# Search for flagged toxicity evaluations
pup api GET "/api/v2/llm-obs/evaluations?filter[query]=@evaluation.metric:toxicity @evaluation.label:fail&filter[from]=now-24h"

# Get evaluation summary by metric
pup api POST "/api/v2/llm-obs/analytics" --data '{
  "filter": {"from": "now-7d", "to": "now", "query": "service:chatbot-api"},
  "group_by": ["@evaluation.metric"],
  "compute": [{"aggregation": "avg", "metric": "@evaluation.score"}]
}'
```

### AI Agents Console

```bash
# List monitored AI agents and their status
pup api GET "/api/v2/llm-obs/agents?page[limit]=50"

# Get recent activity for a specific agent
pup api GET "/api/v2/llm-obs/spans?filter[query]=@agent.name:customer-support-copilot&filter[from]=now-1h"

# Monitor tool call patterns for an agent
pup api GET "/api/v2/llm-obs/spans?filter[query]=@span.kind:tool @agent.name:code-review-bot&filter[from]=now-6h"

# Check agent autonomy decisions (actions taken vs. deferred to human)
pup api GET "/api/v2/llm-obs/spans?filter[query]=@agent.name:sales-copilot @agent.decision_type:autonomous&filter[from]=now-24h"

# Search for agent errors or failures
pup api GET "/api/v2/llm-obs/spans?filter[query]=@agent.name:* status:error&filter[from]=now-1h"
```

### Bits AI (SRE / Dev / Security Agents)

```bash
# Check Bits AI investigation status for an alert
pup api GET "/api/v2/bits-ai/investigations?filter[from]=now-1h"

# Get Bits AI suggested root cause for a monitor
pup api GET "/api/v2/bits-ai/investigations?filter[monitor_id]=12345678"
```

### Datadog MCP Server

```bash
# Verify MCP server is available (for Claude/Cursor/Codex integration)
# The MCP server lets AI coding tools query Datadog telemetry natively.
# Configuration is in the agent's MCP config (e.g., claude_desktop_config.json):
#   "datadog": { "command": "npx", "args": ["@anthropic/datadog-mcp-server"] }

# Once configured, the AI agent can query metrics, traces, logs, and LLM spans
# through the MCP protocol without explicit API calls.
```

## When to Use

- Monitoring LLM-powered applications for latency, errors, or cost spikes
- Investigating hallucination or low-quality responses (check faithfulness/relevance evals)
- Analyzing token usage to optimize costs (find expensive prompts, compare models)
- Tracing an AI agent's decision chain (prompt -> retrieval -> tool calls -> generation -> response)
- Detecting prompt injection attempts or anomalous input patterns
- Running or reviewing evaluation results (faithfulness, relevance, toxicity, sentiment)
- Monitoring enterprise AI agents (Copilot, Cursor, Salesforce Agentforce, custom agents)
- Checking Bits AI investigations for automated root cause analysis

## When NOT to Use

- **General APM tracing** (non-LLM services) -- use `datadog-apm` skill
- **Infrastructure metrics** (CPU, memory, network) -- use `datadog-metrics` skill
- **CI/CD pipeline monitoring** -- use `datadog-ci-visibility` skill
- **Security signal triage** (Cloud SIEM, CSPM) -- use `datadog-security` skill
- **Synthetic monitoring** -- use `datadog-synthetics` skill

## Key Concepts

**LLM Observability Span Kinds:**
- `llm` -- a call to a language model (contains model name, token counts, latency)
- `agent` -- an autonomous agent orchestrating multiple steps
- `tool` -- a tool/function call made by an agent (API call, DB query, code execution)
- `retrieval` -- a RAG retrieval step (vector search, document fetch)
- `workflow` -- a parent span grouping a multi-step pipeline
- `embedding` -- a text-to-vector embedding call

**Evaluation Metrics:**
- **Faithfulness** -- does the response stay grounded in the retrieved context? (0.0-1.0)
- **Relevance** -- does the response answer the user's question? (0.0-1.0)
- **Toxicity** -- does the response contain harmful or inappropriate content? (pass/fail)
- **Sentiment** -- emotional tone of the response (positive/neutral/negative)
- **Custom evaluators** -- user-defined metrics using LLM-as-judge or heuristic rules

**AI Agent Monitoring:**
Enterprise AI agents (coding assistants, customer support bots, sales copilots) are monitored for:
- Tool call frequency and success rate
- Autonomy ratio (autonomous actions vs. human-deferred decisions)
- Response quality over time (evaluation score trends)
- Error rates and failure patterns

**Bits AI Agents:**
- **SRE Agent** -- automatically investigates alerts, correlates signals, suggests root cause
- **Dev Agent** -- generates pull requests from telemetry insights (fix slow queries, patch vulnerabilities)
- **Security Analyst** -- auto-triages SIEM signals, enriches alerts with threat intelligence

**Cost Tracking:**
Token costs are computed using model-specific pricing. Group by `@ml_model.name` to compare costs across providers (OpenAI, Anthropic, Cohere, self-hosted). Watch for prompt bloat -- retrievals that stuff too much context into the prompt window.
