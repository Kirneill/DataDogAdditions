---
name: datadog-se-demo
description: Structures Sales Engineering demos and presentations using Datadog's SE demo
  framework. Use when preparing for a demo round, structuring a customer presentation, choosing
  a demo topic, or practicing delivery of a Datadog product narrative.
---

# Datadog SE Demo Framework

## Overview

This skill encodes the structure, timing, and delivery principles for Datadog SE demos. A demo is not a feature walkthrough -- it is a customer pitch. Every minute should tie a technical capability to a business outcome the customer cares about.

## The Six-Stage Framework

### 1. Problem Statement (1 minute)

State the customer's pain in **business terms**, not technical terms. Revenue at risk, compliance exposure, operational cost, customer churn -- the audience must feel the pain before you show the solution.

- Bad: "Their microservices have high p99 latency."
- Good: "During Black Friday, checkout latency spiked to 4 seconds. At $50K per minute in lost revenue, three teams spent 45 minutes war-rooming with separate tools before they found the root cause."

### 2. Brute Force (1 minute)

Describe how they solve it today. This makes the Datadog solution feel inevitable, not imposed.

- What tools are they cobbling together? (Grafana + Splunk + pgAdmin, manual log review, quarterly audits)
- What is the human cost? (Correlation time, context switching, alert fatigue, manual runbooks)
- What falls through the cracks? (Gradual drift, cross-service issues, compliance gaps)

### 3. Datadog Solution (5 minutes)

This is the live walkthrough. Walk through the investigation step by step, using specific Datadog products. Name each product as you use it -- this demonstrates platform breadth.

Structure as a **narrative investigation**, not a product tour:
1. Start with how the alert fires (Monitors, Watchdog, Anomaly Detection)
2. Show the first pivot (Service Map, APM trace, log search)
3. Drill into the root cause (Database Monitoring, Continuous Profiler, code-level visibility)
4. Show the remediation workflow (Notebooks for RCA, Workflow Automation, CI Visibility for deploy correlation)

Tips for this section:
- Click through a real flow, not a slide deck
- Name each product transition: "Now I'll pivot from APM into Database Monitoring..."
- Keep transitions under 5 seconds -- dead air kills momentum
- If something breaks, acknowledge it and move on. Recovering gracefully impresses more than a perfect run.

### 4. Differentiator (1 minute)

Answer: "Why Datadog specifically, and not any observability tool?"

Pick **one or two** differentiators that are unique and verifiable:
- "One distributed trace across 47 microservices -- Splunk can't trace, Dynatrace can't show the DB explain plan inline"
- "Real-time Sensitive Data Scanner -- not a batch job that finds PHI two weeks later"
- "LLM Observability with production eval framework -- no competitor has this"

Do not list 10 differentiators. Pick the ones that matter for this scenario and deliver them with conviction.

### 5. Business Outcome (1 minute)

Quantify the impact. Use real numbers tied to the scenario:
- Time: "MTTR dropped from 45 minutes to 8 minutes"
- Money: "At $50K/min, that's $1.85M saved per incident"
- Risk: "PHI exposure window went from 2 weeks to 15 minutes"
- Efficiency: "Audit prep from 3 weeks to 2 days"

End on the outcome, not the feature. The last thing the audience should remember is the business impact.

### 6. Handle Questions (2-3 minutes)

Expect and welcome questions. Preparation matters more than answers:
- If you know the answer: state it directly, then offer to show it live if possible
- If you do not know: say "I don't have that detail right now, but I'll follow up with the exact answer by [time]." Never guess.
- If the question is a curveball: bridge back to the scenario. "That's a great area to explore -- in this customer's case, they handled it by..."

## Demo Delivery Tips

### Topic Selection Strategy

**Pick a topic you know deeply but niche enough the panel cannot nitpick.** Internal SEs know APM cold. If you demo basic APM, every panelist has an opinion. If you demo LLM Observability, you are the expert in the room.

### Preparation Checklist

- [ ] Sign up for Datadog free trial and complete relevant Learning Center courses
- [ ] Run the demo scenario at least 3 times in presentation mode (`--present` flag)
- [ ] Time yourself -- total demo should be under 10 minutes
- [ ] Rehearse handling 3 likely objections for your chosen scenario
- [ ] Prepare 2 curveball recovery phrases (e.g., "Let me park that and come back to it")
- [ ] Record yourself and listen back -- catch filler words, pacing, and dead air
- [ ] Practice daily in the week before. Comfort with the material is visible.

### Common Mistakes

| Mistake | Fix |
|---|---|
| Starting with features instead of pain | Lead with the business problem. Features are the answer, not the opening. |
| Showing every product you know | Constrain to the products that matter for this scenario. Breadth is shown by naming products, not by clicking through all 70. |
| Reading from notes | Know the narrative cold. Glancing at notes is fine; reading from them signals you don't understand the product. |
| No business outcome | End with a number. If you can't quantify the outcome, the demo lacks a punchline. |
| Panicking when something breaks | Demo environments break. Say "let me show you this another way" and pivot. Recovery is more impressive than perfection. |
| Using vendor jargon | Say "find the slow database query" not "leverage our continuous profiler's flame graph aggregation." The customer is not a Datadog employee. |

### Translating Features to Business Outcomes

This is the most important skill. Never describe a capability in isolation -- always connect it to what the customer gets.

| Do Not Say | Say Instead |
|---|---|
| "Datadog has distributed tracing" | "When checkout latency spikes during Black Friday, Datadog traces the request across 47 microservices and pinpoints the slow DB query in under a second" |
| "We offer LLM Observability" | "When your AI agent hallucinates a product price, Datadog catches it in real-time with automated eval scoring and traces the exact retrieval step that failed" |
| "CSPM maps to compliance frameworks" | "Instead of 3 weeks of manual audit prep with spreadsheets, your security team gets a real-time FedRAMP compliance dashboard with auto-generated evidence" |
| "Sensitive Data Scanner detects PII" | "When a deploy accidentally logs patient names, Datadog detects and redacts the PHI in 15 minutes -- not 2 weeks later during a manual audit" |
| "Anomaly Detection monitors metric drift" | "When pressure sensors on an offshore rig drift gradually -- too slow for static thresholds -- Datadog catches the anomaly before it becomes a $2M unplanned shutdown" |

## Recommended Demo Topics by Territory Vertical

| Vertical | Scenario | Why |
|---|---|---|
| **Retail** (Walmart, AT&T) | `checkout-latency-spike` | Universal pain. Every retailer has a Black Friday story. Safe, proven narrative. |
| **Energy** (ExxonMobil, Halliburton) | `oil-rig-iot-anomaly` | IoT at scale is underserved by traditional APM tools. Demonstrates infrastructure monitoring depth. |
| **Healthcare** (Texas Medical Center) | `hipaa-compliance-drift` | Compliance is existential for healthcare. Sensitive Data Scanner is a genuine differentiator. |
| **Technology** (Austin corridor) | `llm-hallucination-detection` | **RECOMMENDED.** Niche, strategic, forward-looking. Aligned with Datadog's AI bet. You become the expert in the room. |
| **Defense** (Lockheed, Raytheon) | `fedramp-security-posture` | Continuous compliance is a growing mandate. GovCloud support is table stakes. |

### Why `llm-hallucination-detection` Is the Recommended Lead

- **Niche expertise** -- LLM Observability is new; even internal SEs are still learning it. You will not be nitpicked.
- **Strategic alignment** -- Bits AI, AI Agents Console, MCP Server. Shows you understand where Datadog is headed.
- **Territory fit** -- Austin tech corridor is building AI-native products. Real customer pain.
- **Personal credibility** -- you built an agent skills system. You speak from experience, not product docs.
- **Memorable** -- "the candidate who demoed LLM hallucination detection" sticks.

**Fallback:** `checkout-latency-spike` -- universally relatable, hard to get wrong.

## Running Demo Scenarios

Practice with pre-built scenarios via the `datadog-demo` skill:

```bash
node {baseDir}/../demos/llm-hallucination-detection.js --present   # presentation mode
node {baseDir}/../demos/checkout-latency-spike.js                  # fast review
```
