# 10-Minute Demo Script: LLM Hallucination Detection

> **Scenario:** A Fortune 500 retailer deployed an AI customer service agent. It's hallucinating product prices and return policies. Support tickets are spiking. The ML team can't reproduce the issue because they have zero production trace visibility.
>
> **Datadog Products Featured:** LLM Observability, Evaluation Framework, Token Usage Dashboard, AI Agents Console, Bits AI
>
> **Target Audience:** VP of Customer Experience, VP of Engineering, Head of ML/AI
>
> **Demo Environment:** Datadog LLM Observability page with pre-configured service `customer-support-copilot`

---

## [0:00 - 1:00] Problem Statement

**[Stand. Make eye contact. No slides yet -- just you and the audience.]**

> "Imagine you're the VP of Customer Experience at a Fortune 500 retailer headquartered in Austin. Three months ago, your team deployed an AI customer service agent -- it handles returns, order tracking, product questions. First month, incredible results: 40% ticket deflection, CSAT scores up 12 points, your CEO mentioned it on the earnings call.
>
> Then three weeks ago, customers start posting on Twitter that your chatbot told them a $899 laptop is $299. Another customer was told your return policy is 365 days -- it's 30. Support tickets spike 25% in a week. Your brand is taking hits on social media.
>
> The worst part? Your ML team can't reproduce it. They pull up Jupyter notebooks, run the same prompts, get correct answers every time. The hallucinations are intermittent, context-dependent, and only happen in production under real load. You're flying blind."

**[Pause 2 seconds. Let the pain land.]**

**Transition:** "So how is this being solved today? Let me show you what I typically see."

---

## [1:00 - 2:00] Brute Force -- How They Solve It Today

> "Here's what the ML team is doing right now. They have a Jupyter notebook where an engineer manually spot-checks 50 chatbot conversations a day out of 10,000. That's a 0.5% sample rate. They're looking at responses and eyeballing whether they seem right.
>
> For the ones that look wrong, they copy the prompt into a playground, re-run it, and try to figure out what went wrong. But the production context is gone -- the retrieval results, the conversation history, the specific model parameters at that moment.
>
> Meanwhile, the ops team has a Grafana dashboard showing request counts and latency. They can tell you the chatbot is responding, but not whether it's responding correctly. Quality is invisible.
>
> Three tools, three teams, zero correlation between 'the chatbot is slow' and 'the chatbot is lying.' That gap is where brand damage happens."

**Transition:** "Let me show you what this looks like when you have end-to-end LLM observability. I'm going to walk through exactly how Datadog solves this."

---

## [2:00 - 7:00] Live Demo -- Datadog Walkthrough

### [2:00 - 2:45] Service Catalog Entry Point

**[Open Datadog. Navigate to Service Catalog.]**

> "First thing -- I start in Service Catalog. This is the single pane of glass for every service in your environment."

**[Click on `customer-support-copilot` service.]**

> "Here's our AI customer service agent. Notice it's tagged as an LLM-powered service. You can see ownership, dependencies, on-call, documentation links -- all in one place. But what I want to show you is this."

**[Point to the LLM Observability tab in the service detail view.]**

> "This LLM Observability tab is unique to Datadog. It gives you production-level visibility into what your AI is actually doing."

**Transition:** "Let's drill into the traces."

### [2:45 - 4:00] LLM Observability -- Traces

**[Navigate to LLM Observability page. Filter by service: `customer-support-copilot`, time range: last 1 hour.]**

> "This is the LLM Observability page. Every single interaction your AI agent has in production is traced end-to-end. Not sampled -- every one."

**[Click on a specific trace that shows a hallucination.]**

> "Let me open this trace. Watch what you see here."

**[Point to the trace waterfall showing spans: `workflow` > `retrieval` > `llm` > `tool` > `llm`.]**

> "This is a single customer interaction broken into spans. You can see the workflow span wrapping everything. Inside it: a retrieval step where the agent searched your product catalog via RAG, then an LLM call to GPT-4o that generated the response, then a tool call to your inventory API, then a second LLM call that synthesized the final answer.
>
> Now look at the retrieval span."

**[Click on the retrieval span. Point to the retrieved documents panel.]**

> "The retrieval pulled back 5 documents from the vector store. But look at document 3 -- it's a pricing page from 8 months ago. The laptop was $299 during a flash sale. That stale document is what the model grounded its answer on. The hallucination isn't random -- it's a retrieval problem."

**[Point to the input/output panel on the LLM span.]**

> "And here's the full prompt that went to GPT-4o, the exact response, token counts, latency -- everything. No more guessing in Jupyter notebooks. This is production truth."

**Transition:** "But finding one bad trace manually doesn't scale. Let me show you how Datadog catches these automatically."

### [4:00 - 5:15] Evaluation Framework

**[Navigate to the Evaluation tab within LLM Observability.]**

> "This is the Evaluation framework. Datadog runs automated quality checks on every LLM response in real-time."

**[Point to the faithfulness score distribution chart.]**

> "Two key metrics here. Faithfulness: does the response stay grounded in the retrieved context? Relevance: does it actually answer the customer's question?
>
> Look at this faithfulness distribution. 92% of responses score above 0.8 -- that's good. But see this tail below 0.5?"

**[Click to filter: faithfulness < 0.5, last 24 hours.]**

> "47 responses in the last 24 hours scored below 0.5 on faithfulness. Those are your hallucinations. Not 50 manual spot-checks -- 47 confirmed, automatically flagged, with full trace context attached.
>
> Each one links back to the trace I just showed you. You click it, you see the retrieval, you see the stale document, you see the generated response. Root cause in seconds."

**[Point to the trend line showing faithfulness over time.]**

> "And look at this trend line. Three weeks ago -- right when the tweets started -- faithfulness started degrading. Why? Someone pushed a vector store update that included stale product pages. This chart would have caught it on day one."

**Transition:** "Now let me show you the cost side of this."

### [5:15 - 5:45] Token Usage Dashboard

**[Navigate to Token Usage view or a pre-built notebook.]**

> "Here's token usage by model and by conversation. Notice these spikes?"

**[Point to the cost-per-conversation outliers.]**

> "These are failure loops. The chatbot hallucinates, the customer pushes back, the agent retries with more context stuffed into the prompt, tokens spiral. These 12 conversations cost more than the other 500 combined. That's your cost leak, and it's directly tied to the hallucination problem."

**Transition:** "One more thing I want to show you -- how Datadog monitors the agent itself."

### [5:45 - 6:30] AI Agents Console

**[Navigate to AI Agents Console.]**

> "This is the AI Agents Console. It monitors your agent's autonomous behavior -- not just individual LLM calls, but the decisions the agent makes.
>
> You can see tool call success rates, autonomy ratio -- how often the agent acts on its own versus escalating to a human -- and quality trends over time.
>
> This is critical for enterprise AI governance. Your CISO wants to know: what is this agent doing autonomously? Which actions does it take without human approval? This console gives you that audit trail."

### [6:30 - 7:00] Bits AI -- Auto-Remediation

> "And one final piece. Bits AI -- Datadog's built-in AI agent for SREs and developers. When it detects the faithfulness degradation pattern, it can automatically investigate the root cause, correlate it with the vector store deployment, and open a pull request to remove the stale documents from the retrieval pipeline.
>
> Your ML engineer gets a PR in GitHub with a clear explanation: 'These 14 documents in the product-catalog index are outdated and causing faithfulness scores below 0.5. Recommended action: re-index with current product data.' One click to approve."

**Transition:** "So let me pull this together -- why Datadog specifically?"

---

## [7:00 - 8:00] Differentiator

**[Step back from the screen slightly. This is your conviction moment.]**

> "What I just showed you is something no other platform can do end-to-end.
>
> New Relic has basic LLM monitoring -- they can show you latency and error rates. But they can't show you the retrieval documents, they can't run automated faithfulness evaluations, and they don't have an AI agents console.
>
> Dynatrace is strong on auto-discovery for traditional applications, but they have no production LLM tracing at all. It's a gap in their platform.
>
> Splunk can ingest your LLM logs, but logs aren't traces. You get the response text but not the retrieval context, not the prompt, not the span-level latency breakdown.
>
> Datadog is the only platform where you can trace every LLM interaction from prompt to response, automatically evaluate quality with faithfulness and relevance scores, monitor autonomous agent behavior, and have Bits AI auto-remediate -- all in one platform, correlated with your existing APM, infrastructure, and security data.
>
> That correlation is the unlock. When your AI agent hallucinates, you don't just see the bad response. You see the stale vector store, the deployment that caused it, the cost spike, and the PR to fix it."

---

## [8:00 - 9:00] Business Outcome

> "Let me quantify this for the Austin retailer scenario.
>
> **Hallucination rate:** Dropped from 8% to 0.3%. That's the difference between 800 bad responses a day and 30.
>
> **CSAT:** Up 15 points. Customers trust the chatbot again.
>
> **AI agent cost:** Down 40%. Those failure loops I showed you -- the retry spirals that burn tokens -- they're eliminated because you catch the root cause before it compounds.
>
> **Mean time to detect a quality regression:** From 2 weeks (when customers complain on Twitter) to 15 minutes (when the evaluation framework fires an alert).
>
> **Engineering time:** Your ML team was spending 20 hours a week manually reviewing chatbot output. Now evaluations run automatically and they get a prioritized list of the worst interactions with full context attached. They spend 2 hours a week instead.
>
> This isn't just observability -- it's AI governance at enterprise scale."

---

## [9:00 - 10:00] Q&A Buffer

**[Open posture. Hands visible. Slight forward lean.]**

> "I want to leave time for questions. What stood out? What would you want to drill deeper on?"

**[If no immediate questions:]**

> "One thing I'd highlight -- everything I showed you works the same whether you're using OpenAI, Anthropic, Cohere, or a self-hosted model. Datadog is model-agnostic. And the evaluation framework supports custom evaluators, so you can define quality metrics specific to your business -- like 'does the price match our current catalog?' as a custom check."

---

## Fallback Plans

| Situation | Fallback |
|---|---|
| **LLM Observability page is slow to load** | "While that loads, let me show you the pre-built notebook I put together that captures the same data." Switch to a Notebook with saved snapshots. |
| **Trace doesn't show the hallucination clearly** | "Let me show you a different trace I bookmarked earlier that illustrates the retrieval issue more clearly." Navigate to a saved trace URL. |
| **Evaluation tab has no data** | "The evaluation framework needs instrumentation with ddtrace. Let me show you what this looks like in the documentation, and I have screenshots from a customer POC." Switch to a prepared slide. |
| **Demo environment is completely down** | "Let me walk you through this using the architecture diagram and these production screenshots from a similar deployment." Pull up the prepared backup slides. Always have a PDF backup on your laptop -- not on the network. |
| **Interviewer wants to see the checkout-latency scenario instead** | "Absolutely -- let me switch to that. Same Datadog platform, different vertical." Navigate to APM > Service Map. You should have this scenario ready as a backup. |

---

## Curveball Questions and How to Handle Them

### 1. "What about prompt injection attacks? Can Datadog detect those?"

> "Great callout. Yes -- Sensitive Data Scanner can be configured to detect prompt injection patterns in the input spans. And the evaluation framework can flag responses where the model's behavior deviates from expected patterns -- for example, if a customer's message causes the model to ignore its system prompt. The security team can set up Cloud SIEM rules that correlate these patterns with the user session. It's the intersection of LLM Observability and Application Security Monitoring."

### 2. "We're evaluating running our own open-source models. Does this work with self-hosted LLMs?"

> "Yes, fully. The tracing is done via ddtrace instrumentation at the application level, not at the model API level. Whether you're calling OpenAI's API, running Llama on your own GPUs, or using Amazon Bedrock, the trace captures the same data: input, output, latency, token counts. The evaluation framework is also model-agnostic -- it runs against the response content, not the model provider."

### 3. "How does this compare to LangSmith or Weights & Biases for LLM monitoring?"

> "LangSmith and W&B are excellent development-time tools. They're great for prototyping, prompt engineering, and experiment tracking. But they're not production observability platforms. They don't correlate LLM traces with your infrastructure metrics, APM data, logs, or security signals. When your AI agent hallucinates at 2 AM and your on-call engineer gets paged, they need to see the LLM trace, the infrastructure state, and the deployment history in one place. That's what Datadog does -- it puts LLM observability in the same platform where your entire production environment already lives."

---

## Pacing and Delivery Notes

- **[0:00 - 1:00]** Storytelling pace. Slow, deliberate. Make them feel the pain. No clicking.
- **[1:00 - 2:00]** Slightly faster. You're describing a bad situation they should want to escape.
- **[2:00 - 7:00]** Medium pace. Click deliberately. Pause after each major reveal (the stale document, the faithfulness score, the cost spike). Let them absorb.
- **[7:00 - 8:00]** Conviction pace. You believe this. Eye contact. No hedging language ("I think," "kind of," "sort of").
- **[8:00 - 9:00]** Slow again. Numbers land better when delivered slowly. Pause between each metric.
- **[9:00 - 10:00]** Relaxed. You're done performing. Be conversational.

**Things to avoid:**
- Don't say "as you can see" -- they can see. Just narrate what matters.
- Don't apologize for anything during the demo ("Sorry, let me find that..."). Navigate with confidence or use a fallback.
- Don't read from notes. Know the five numbers cold: 8% to 0.3%, +15 CSAT, -40% cost, 2 weeks to 15 minutes, 20 hours to 2 hours.
- Don't rush the retrieval span reveal. That's your "aha" moment. Let them connect the dots.

**Physical presence:**
- Stand if possible. SEs who stand during demos project more authority.
- Use your hand to point at specific UI elements. Don't just wave generally at the screen.
- When you say a number, pause and make eye contact with the most senior person in the room.
