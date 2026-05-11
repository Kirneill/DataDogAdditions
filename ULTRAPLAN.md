# ULTRAPLAN — Datadog Agent Skills & SE Demo Kit

> **Purpose:** Build interview-ready portable agent skills + demo scenarios for Datadog that demonstrate SE-level product fluency, vertical storytelling, and AI-native thinking — for the **Sales Engineer, Key Accounts Southcentral** role.
>
> **Design philosophy:** Portable skills with `{baseDir}` placeholders (badlogic pattern). Works across Claude Code, Codex, pi, OpenCode, and Cursor. Wraps existing Datadog CLIs (`pup`, `datadog-ci`) rather than replacing them. Demo scenarios work offline with generated sample data.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Agent Skills System](#2-agent-skills-system)
3. [Demo Scenarios (Southcentral Verticals)](#3-demo-scenarios-southcentral-verticals)
4. [Interview Assets](#4-interview-assets)
5. [Implementation Phases](#5-implementation-phases)
6. [File Tree](#6-file-tree)

---

## 1. Architecture Overview

### What Exists (Don't Rebuild)

| Tool | What It Does | Install |
|---|---|---|
| `pup` | 200+ commands across 33+ Datadog products. Metrics, logs, monitors, incidents, etc. | `brew install datadog-labs/pack/pup` |
| `datadog-ci` | CI/CD integration. Synthetics, sourcemaps, Lambda, JUnit, DORA. | `npm i -g @datadog/datadog-ci` |
| Datadog MCP Server | Official remote MCP server for Claude Code, Cursor, Codex, etc. | Configure via MCP client settings |

### What We Build (The Gap)

| Component | Why It Doesn't Exist Yet | Value for Interview |
|---|---|---|
| **Agent Skills** | `pup` doesn't ship as SKILL.md files. AI agents can't discover or use it without manual prompting. | Shows you understand AI-native developer workflows — aligned with Datadog's Bits AI and MCP strategy |
| **Demo Scenarios** | No existing tool packages vertical-specific investigation narratives with sample data | Lets you run a killer demo in-terminal without a live account. Shows customer-first storytelling |
| **Interview Assets** | Territory-specific competitive intel and demo scripts don't exist as structured docs | Prepared, polished, shows you did homework on Southcentral verticals |

### Design Principles

| Principle | Source | Application |
|---|---|---|
| Portable skills with `{baseDir}` | badlogic (pi-skills) | Same skill folder works in Claude Code, Codex, pi, OpenCode, Cursor |
| CLI-over-MCP for skills | badlogic + steipete | Skills invoke `pup` / `datadog-ci` via bash. No protocol overhead. |
| Progressive disclosure | badlogic | Agents only read SKILL.md when the task matches. Frontmatter `description` is the routing hint. |
| Offline demo mode | Interview necessity | Demo scenarios generate realistic sample data. No API keys required for practice runs. |
| Customer-first framing | Datadog SE interview structure | Every scenario follows Pain → Brute Force → Solution → Differentiator → Outcome |

### Cross-Agent Compatibility

```bash
# Claude Code — symlink into .claude/skills/ (only looks 1 level deep)
ln -s /path/to/DataDogAdditions/skills/datadog-metrics ~/.claude/skills/datadog-metrics

# pi — reference in project AGENTS.md
echo "Skills: /path/to/DataDogAdditions/skills/" >> AGENTS.md

# Codex — add to codex instructions or project config
# OpenCode — symlink into .opencode/skills/
# Cursor — reference in .cursor/rules/ or use Datadog's official MCP Server directly
```

---

## 2. Agent Skills System

### Skill Architecture

Each skill is a self-contained folder following the badlogic pattern:

```
skill-name/
  SKILL.md          # Frontmatter + instructions (routing hint for the agent)
  [script].js       # Executable wrapper around pup/datadog-ci (optional)
```

The `SKILL.md` frontmatter `description` field is what the agent reads to decide relevance. The body contains usage examples, when-to-use rules, and command templates.

### Skill Inventory

| Skill | Purpose | Wraps | Agent Use Case |
|---|---|---|---|
| `datadog-metrics` | Submit, query, manage metrics | `pup metrics` | "Check CPU usage," "submit a custom metric" |
| `datadog-logs` | Search, tail, analyze logs | `pup logs` | "Find errors in checkout service," "show recent logs" |
| `datadog-monitors` | Create, manage, mute monitors | `pup monitors` | "Create an alert for high latency," "mute during deploy" |
| `datadog-apm` | Distributed tracing, service map, profiling | `pup` + API | "Trace a slow request," "show service dependencies" |
| `datadog-synthetics` | API/browser tests, CI triggers | `datadog-ci synthetics` | "Run synthetic tests," "check if API is healthy" |
| `datadog-incidents` | Create, manage, resolve incidents | `pup incidents` | "Open an incident," "list active incidents" |
| `datadog-security` | SIEM signals, CSPM, vulnerabilities | `pup` + API | "Check compliance status," "list security findings" |
| `datadog-ai-observability` | LLM traces, evals, agent monitoring | `pup` + API | "Check LLM latency," "run an eval," "monitor AI agent" |
| `datadog-ci-visibility` | Pipeline traces, test optimization, DORA | `datadog-ci` | "Show CI pipeline status," "get DORA metrics" |
| `datadog-demo` | Run pre-built demo scenarios | Demo engine | "Run the checkout latency demo," "practice my demo" |
| `datadog-competitive` | Competitive positioning reference (no script) | — | "How does DD compare to Splunk?", "objection handling" |
| `datadog-se-demo` | Structure SE demo presentations | — | "Help me structure a demo for healthcare," "demo tips" |

### SKILL.md Template

```markdown
---
name: datadog-metrics
description: Submit, query, and manage Datadog metrics via pup CLI. Use when tasks involve
  infrastructure monitoring, custom metrics, SLIs, or performance baselines.
---

# Datadog Metrics

## Prerequisites
- `pup` CLI installed and authenticated (`pup auth login`)
- Or: DD_API_KEY and DD_APP_KEY env vars set

## Commands

### Query metrics
  pup metrics query "avg:system.cpu.user{env:prod} by {host}" --from 1h

### Submit a custom metric
  pup metrics submit my.custom.metric 42.5 --tags env:prod,service:checkout

### List active metrics matching a pattern
  pup metrics search "system.cpu.*"

### Get metric metadata
  pup metrics metadata get system.cpu.user

## When to Use
- User asks about infrastructure metrics (CPU, memory, disk, network)
- User wants to define SLIs or performance baselines
- User needs to submit custom business metrics
- User is investigating a performance degradation

## When NOT to Use
- Log search → use datadog-logs
- Distributed tracing → use datadog-apm
- Synthetic testing → use datadog-synthetics
- Security findings → use datadog-security

## Key Concepts (for agent context)
- Metrics are time-series data points with tags
- Types: count, rate, gauge, histogram, distribution
- Tags follow format `key:value` (e.g., `env:prod`, `service:checkout`)
- Query syntax: `<aggregator>:<metric>{<scope>} by {<grouping>}`
- Aggregators: avg, sum, min, max, count
```

---

## 3. Demo Scenarios (Southcentral Verticals)

### How Demos Work

Each scenario is a markdown file + optional Node.js script that generates realistic sample output. The script simulates what you'd see in a Datadog investigation without requiring a live account.

**Presentation flow:**
1. Read the scenario markdown for narrative and talking points
2. Run the script to generate terminal output (metrics, traces, alerts, timelines)
3. Script supports `--present` mode: pauses between stages, shows talking points as comments

### Scenario Structure (every scenario follows this)

```
Problem Statement (customer pain, in business terms)
    ↓
Brute Force (how they solve it today — cobbled tools, manual processes)
    ↓
Datadog Solution (step-by-step investigation using specific products)
    ↓
Differentiator (why Datadog specifically, not any observability tool)
    ↓
Business Outcome (quantified: $, time, risk reduction)
```

### The Five Scenarios

#### 1. `checkout-latency-spike` — Retail (Walmart/AT&T corridor, AR/TX)

| Element | Content |
|---|---|
| **Pain** | Black Friday checkout latency 200ms → 4s. Revenue loss: $50K/min. Three teams war-rooming with separate tools. |
| **Brute Force** | Frontend uses Grafana, backend uses Splunk for logs, DB team uses pgAdmin. 45-min correlation time. |
| **DD Solution** | APM Service Map → Distributed Trace (pinpoints inventory-service span, p99=3.2s) → Database Monitoring (slow query + explain plan) → Watchdog (detected anomaly 8min before alert) → Notebook (RCA timeline shared to Slack) |
| **Differentiator** | One trace across 47 microservices. Splunk can't trace. Dynatrace can't show DB explain plan inline. New Relic lacks proactive anomaly detection. |
| **Outcome** | MTTR: 45min → 8min. At $50K/min = **$1.85M saved per incident**. |

#### 2. `oil-rig-iot-anomaly` — Energy (Houston corridor, TX/LA)

| Element | Content |
|---|---|
| **Pain** | 12,000 IoT sensors on offshore rig. Gradual pressure drift undetected 3 hours → $2M unplanned shutdown. |
| **Brute Force** | SCADA alerts noisy (500/day, operators ignore). Splunk log review takes hours. No sensor↔app correlation. |
| **DD Solution** | Infrastructure Monitoring (all 12K sensors as custom metrics) → Anomaly Detection Monitor (catches drift, not just threshold breach) → Log correlation (control system logs + metric anomaly) → Workflow Automation (pages field engineer, opens incident, starts safety checklist) → Mobile App (full context while offshore) |
| **Differentiator** | Watchdog anomaly detection beats static thresholds for gradual drift. 1,000+ integrations incl. OPC-UA/Modbus for SCADA. Workflow Automation replaces manual runbooks. |
| **Outcome** | Unplanned downtime reduced 60%. Safety compliance audit trail automated. |

#### 3. `hipaa-compliance-drift` — Healthcare (Texas Medical Center, TX)

| Element | Content |
|---|---|
| **Pain** | Patient portal logs PHI (patient names in URL params) after feature deploy. Discovered 2 weeks later → HIPAA breach notification triggered. |
| **Brute Force** | Quarterly manual log audits. SIEM disconnected from application logs. Security team reactive. |
| **DD Solution** | Sensitive Data Scanner (auto-detects PII patterns, real-time) → Automatic redaction + alert (within minutes) → Cloud SIEM (correlates with deployment via CI Visibility) → CSPM dashboard (real-time HIPAA control status) → Audit Trail (breach notification evidence) |
| **Differentiator** | Sensitive Data Scanner is real-time, not batch. CSPM maps to HIPAA controls directly. Deploy→log→alert→compliance chain is one tool, not four. |
| **Outcome** | PHI exposure window: 2 weeks → **15 minutes**. Audit evidence auto-generated. |

#### 4. `llm-hallucination-detection` — Technology (Austin corridor, TX)

| Element | Content |
|---|---|
| **Pain** | Enterprise AI customer service agent hallucinating product prices and return policies. Support tickets spike. ML team can't reproduce — no production trace visibility. |
| **Brute Force** | Manual spot-checking chatbot responses. Batch notebook analysis. No systematic eval. |
| **DD Solution** | LLM Observability (traces every interaction: prompt→retrieval→generation→response) → Evaluation framework (faithfulness + relevance scores flag hallucinations) → Token usage dashboard (cost per conversation, failure loop detection) → AI Agents Console (monitors autonomy decisions) → Bits AI Dev Agent (auto-creates PR to fix retrieval prompt) |
| **Differentiator** | No competitor has production LLM tracing + automated eval + agent monitoring in one platform. New Relic basic. Dynatrace absent. Splunk log-only. |
| **Outcome** | Hallucination rate: 8% → **0.3%**. CSAT +15 points. AI agent cost -40%. |

#### 5. `fedramp-security-posture` — Defense/Aerospace (Fort Worth corridor, TX)

| Element | Content |
|---|---|
| **Pain** | Defense contractor must demonstrate continuous FedRAMP compliance across hybrid cloud (AWS GovCloud + on-prem). Current: manual spreadsheets, quarterly updates. |
| **Brute Force** | Security team maintains 400+ control mappings in Excel. Evidence collection takes 3 weeks per audit. No real-time posture visibility. |
| **DD Solution** | CSPM (continuous FedRAMP control evaluation across AWS, Azure, on-prem) → Cloud SIEM (real-time unauthorized access detection) → Vulnerability Management (prioritizes by runtime exposure, not just CVSS) → Auto-generated compliance reports → GovCloud deployment (data sovereignty) |
| **Differentiator** | Real-time continuous compliance vs. quarterly snapshots. Runtime-aware vulnerability prioritization (not every Critical CVSS is actually exploitable). GovCloud support. |
| **Outcome** | Audit prep: 3 weeks → **2 days**. Continuous compliance posture. Zero manual spreadsheets. |

---

## 4. Interview Assets

### Document Set

| File | Purpose | When to Use |
|---|---|---|
| `DEMO_SCRIPT.md` | Step-by-step demo script with timing, transitions, and fallback plans | Practice before demo round. Memorize transitions. |
| `COMPETITIVE_MATRIX.md` | DD vs Splunk vs New Relic vs Dynatrace vs Grafana across 10 dimensions | When asked "why not X?" during demo or leadership round |
| `OBJECTION_HANDLING.md` | Top 15 objections + structured responses | Mock practice. Leadership round. |
| `SOUTHCENTRAL_INTEL.md` | Territory verticals, major accounts, pain points, Datadog penetration | Hiring manager round. "Why this territory?" question. |
| `TECHNICAL_DEEP_DIVES.md` | Deep dives on APM, LLM Observability, Security (3 products) | HackerRank prep + demo depth. Pick one for your demo topic. |
| `QUESTIONS_TO_ASK.md` | Smart questions for each interviewer type (HM, peer, leadership) | End of each round. Shows curiosity and research. |
| `PRODUCT_CHEAT_SHEET.md` | 70+ products organized by category with one-liner descriptions | Quick reference during any round. |

### Interview Round Mapping

| Round | What They Evaluate | Your Preparation |
|---|---|---|
| HR Screen | Culture fit, comp expectations, motivation | Why Datadog. Why SE. Why Southcentral. $115K+ range. |
| Hiring Manager | Territory knowledge, customer empathy, career trajectory | `SOUTHCENTRAL_INTEL.md` + your 7yr experience narrative |
| HackerRank | Practical technical ability (not leetcode) | `TECHNICAL_DEEP_DIVES.md` + hands-on `pup` CLI practice |
| Demo Round (make-or-break) | Can you tell a customer story and handle curveballs? | `DEMO_SCRIPT.md` + one scenario memorized cold |
| Peer Connect | Would they want to work with you? | Authentic. Ask about their deals. Share war stories. |
| Leadership 1:1 | Strategic thinking, competitive awareness, growth mindset | `COMPETITIVE_MATRIX.md` + `QUESTIONS_TO_ASK.md` |

### Demo Topic Recommendation

**Lead with: `llm-hallucination-detection`**

Why:
- Niche enough that the panel can't nitpick (LLM Observability is new, even to internal SEs)
- Perfectly aligned with Datadog's strategic bet (Bits AI, AI Agents Console, MCP Server)
- Shows you're forward-looking, not just selling the APM cash cow
- Austin tech corridor is in your territory — this is a real customer scenario
- You can tie it to your own experience building AI tools (your agent skills system is proof)

Fallback: `checkout-latency-spike` (safe, proven, universally relatable)

---

## 5. Implementation Phases

### Phase 1: Agent Skills (2-3 hours)

Write all 12 SKILL.md files. These are documentation + routing hints — no code yet.

| Task | Output |
|---|---|
| 1.1 Write `datadog-metrics/SKILL.md` | Metrics skill |
| 1.2 Write `datadog-logs/SKILL.md` | Logs skill |
| 1.3 Write `datadog-monitors/SKILL.md` | Monitors skill |
| 1.4 Write `datadog-apm/SKILL.md` | APM/tracing skill |
| 1.5 Write `datadog-synthetics/SKILL.md` | Synthetics skill |
| 1.6 Write `datadog-incidents/SKILL.md` | Incidents skill |
| 1.7 Write `datadog-security/SKILL.md` | Security skill |
| 1.8 Write `datadog-ai-observability/SKILL.md` | LLM Obs skill |
| 1.9 Write `datadog-ci-visibility/SKILL.md` | CI Visibility skill |
| 1.10 Write `datadog-demo/SKILL.md` | Demo runner skill |
| 1.11 Write `datadog-competitive/SKILL.md` | Competitive intel skill |
| 1.12 Write `datadog-se-demo/SKILL.md` | Demo structure skill |

### Phase 2: Demo Scenario Scripts (2-3 hours)

Node.js scripts that generate realistic terminal output simulating Datadog investigations.

| Task | Output |
|---|---|
| 2.1 Demo engine (`demo-engine.js`) | Shared utilities: colored output, pauses, sample data generators |
| 2.2 `checkout-latency-spike.js` | Retail demo scenario |
| 2.3 `oil-rig-iot-anomaly.js` | Energy demo scenario |
| 2.4 `hipaa-compliance-drift.js` | Healthcare demo scenario |
| 2.5 `llm-hallucination-detection.js` | AI/Tech demo scenario |
| 2.6 `fedramp-security-posture.js` | Defense demo scenario |

### Phase 3: Interview Assets (2-3 hours)

Write all 7 interview prep documents.

| Task | Output |
|---|---|
| 3.1 `DEMO_SCRIPT.md` | 10-min demo script with timing |
| 3.2 `COMPETITIVE_MATRIX.md` | 10-dimension comparison table |
| 3.3 `OBJECTION_HANDLING.md` | Top 15 objections + responses |
| 3.4 `SOUTHCENTRAL_INTEL.md` | Territory analysis |
| 3.5 `TECHNICAL_DEEP_DIVES.md` | APM, LLM Obs, Security deep dives |
| 3.6 `QUESTIONS_TO_ASK.md` | Per-round questions |
| 3.7 `PRODUCT_CHEAT_SHEET.md` | 70+ products quick reference |

### Phase 4: Cross-Agent Install + Polish (1 hour)

| Task | Output |
|---|---|
| 4.1 `scripts/install-skills.sh` | Install script for Linux/Mac |
| 4.2 `scripts/install-skills.ps1` | Install script for Windows |
| 4.3 `README.md` | Quick start + overview |
| 4.4 Verify skills load in Claude Code | Test symlinks |

**Total estimated time: 7-10 hours**

---

## 6. File Tree

```
DataDogAdditions/
├── ULTRAPLAN.md                              # This file
├── README.md                                 # Quick start
├── skills/
│   ├── datadog-metrics/
│   │   └── SKILL.md
│   ├── datadog-logs/
│   │   └── SKILL.md
│   ├── datadog-monitors/
│   │   └── SKILL.md
│   ├── datadog-apm/
│   │   └── SKILL.md
│   ├── datadog-synthetics/
│   │   └── SKILL.md
│   ├── datadog-incidents/
│   │   └── SKILL.md
│   ├── datadog-security/
│   │   └── SKILL.md
│   ├── datadog-ai-observability/
│   │   └── SKILL.md
│   ├── datadog-ci-visibility/
│   │   └── SKILL.md
│   ├── datadog-demo/
│   │   └── SKILL.md
│   ├── datadog-competitive/
│   │   └── SKILL.md
│   └── datadog-se-demo/
│       └── SKILL.md
├── demos/
│   ├── demo-engine.js                        # Shared demo utilities
│   ├── checkout-latency-spike.js
│   ├── oil-rig-iot-anomaly.js
│   ├── hipaa-compliance-drift.js
│   ├── llm-hallucination-detection.js
│   └── fedramp-security-posture.js
├── interview-prep/
│   ├── DEMO_SCRIPT.md
│   ├── COMPETITIVE_MATRIX.md
│   ├── OBJECTION_HANDLING.md
│   ├── SOUTHCENTRAL_INTEL.md
│   ├── TECHNICAL_DEEP_DIVES.md
│   ├── QUESTIONS_TO_ASK.md
│   └── PRODUCT_CHEAT_SHEET.md
└── scripts/
    ├── install-skills.sh
    └── install-skills.ps1
```

---

## Appendix: Datadog API Quick Reference (for skill scripts)

### Authentication
```
Headers: DD-API-KEY: <key>, DD-APPLICATION-KEY: <key>
Base: https://api.datadoghq.com (US1) | .eu (EU) | .us3. (US3) | .us5. (US5)
Env vars: DD_API_KEY, DD_APP_KEY, DD_SITE
```

### pup CLI Quick Reference
```bash
pup auth login                                    # OAuth2 login
pup metrics query "avg:system.cpu.user{*}" --from 1h
pup logs search "service:checkout status:error" --limit 50
pup monitors list --tag "team:payments"
pup monitors create --from-file monitor.yaml
pup incidents list --status active
pup incidents create --title "Checkout degraded" --severity SEV-2
```

### datadog-ci Quick Reference
```bash
datadog-ci synthetics run-tests --public-id abc-123
datadog-ci lambda instrument --function my-fn --region us-east-1
datadog-ci sourcemaps upload ./dist --service web-app --release-version 2.3.1
datadog-ci junit upload --service my-api ./test-results/
datadog-ci dora deployment --service checkout --env prod
datadog-ci gate evaluate --scope "service:checkout"
```

### Key API Endpoints
| Domain | Method | Path |
|---|---|---|
| Metrics | POST | `/api/v2/series` |
| Metrics | GET | `/api/v1/query` |
| Logs | POST | `/api/v2/logs/events/search` |
| Monitors | POST/GET | `/api/v1/monitor` |
| Dashboards | POST/GET | `/api/v1/dashboard` |
| Synthetics | POST | `/api/v1/synthetics/tests/trigger` |
| SLOs | POST/GET | `/api/v1/slo` |
| Incidents | POST/GET | `/api/v2/incidents` |
| Security | POST | `/api/v2/security_monitoring/signals/search` |
| Events | POST | `/api/v1/events` |
