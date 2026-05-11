---
name: datadog-demo
description: Orchestrates pre-built demo scenarios that simulate Datadog investigations across
  Southcentral verticals. Use when the user wants to practice a demo, run a scenario, see what
  a Datadog investigation looks like end-to-end, or prepare for the SE demo round.
---

# Datadog Demo Scenarios

## Overview

Runs interactive demo scripts from the `demos/` directory. Each scenario simulates a real Datadog investigation using generated sample data -- no live account or API keys required. Every scenario follows the SE demo framework: Problem, Brute Force, Datadog Solution, Differentiator, Business Outcome.

## Available Scenarios

| Scenario | Vertical | Products Featured |
|---|---|---|
| `checkout-latency-spike` | Retail (Walmart, AT&T) | APM, DB Monitoring, Watchdog, Notebooks |
| `oil-rig-iot-anomaly` | Energy (ExxonMobil, Halliburton) | Infra Monitoring, Anomaly Detection, Workflow Automation |
| `hipaa-compliance-drift` | Healthcare (Texas Medical Center) | Sensitive Data Scanner, CSPM, CI Visibility, Cloud SIEM |
| `llm-hallucination-detection` | Technology (Austin corridor) | LLM Observability, Eval Framework, Bits AI, AI Agents Console |
| `fedramp-security-posture` | Defense (Lockheed, Raytheon) | CSPM, Cloud SIEM, Vulnerability Management |

## Commands

### Run a scenario (fast mode -- continuous output)
```bash
node {baseDir}/../demos/<scenario-name>.js
```

### Run in presentation mode (pauses between stages, shows talking points)
```bash
node {baseDir}/../demos/<scenario-name>.js --present
```

### Examples
```bash
# Practice the recommended demo topic
node {baseDir}/../demos/llm-hallucination-detection.js --present

# Quick run to review the retail scenario
node {baseDir}/../demos/checkout-latency-spike.js
```

## When to Use

- User says "run a demo," "practice my demo," or "show me a scenario"
- User asks "what does a Datadog investigation look like?"
- User wants to rehearse for the SE demo round
- User asks about a specific vertical (retail, energy, healthcare, tech, defense)

## When NOT to Use

- User wants to query live Datadog data -> use `datadog-metrics`, `datadog-logs`, `datadog-apm`
- User wants competitive positioning -> use `datadog-competitive`
- User wants to structure their own demo -> use `datadog-se-demo`

## Scenario Flow (All Scenarios)

Each demo follows this five-stage arc:

```
1. PROBLEM STATEMENT    -- Customer pain in business terms (revenue, risk, compliance)
2. BRUTE FORCE          -- How they solve it today (tool sprawl, manual processes)
3. DATADOG SOLUTION     -- Step-by-step investigation using specific products
4. DIFFERENTIATOR       -- Why Datadog specifically, not any observability tool
5. BUSINESS OUTCOME     -- Quantified impact ($, time saved, risk reduced)
```

Presentation mode (`--present`) inserts pauses and talking points between each stage so you can practice delivering the narrative naturally.

## Demo Topic Selection

**Recommended lead topic: `llm-hallucination-detection`**
- Niche enough that the panel cannot nitpick (LLM Observability is new, even to internal SEs)
- Aligned with Datadog's strategic bet (Bits AI, AI Agents Console, MCP Server)
- Forward-looking -- shows strategic thinking, not just selling the APM cash cow
- Austin tech corridor is in your territory -- this is a real customer scenario

**Safe fallback: `checkout-latency-spike`**
- Universally relatable, proven narrative, hard to go wrong

## Tips for Practice

1. Run the scenario in `--present` mode at least 3 times before demo day
2. Time yourself -- the Datadog Solution section should be 5 minutes, total demo under 10
3. Practice handling interruptions: pause the script, answer the question, resume
4. Know the differentiator cold -- this is what separates "feature walkthrough" from "customer pitch"
5. Record yourself and listen back -- catch filler words and pacing issues
