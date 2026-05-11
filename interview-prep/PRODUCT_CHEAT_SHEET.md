# Datadog Product Cheat Sheet — 70+ Products Quick Reference

Quick-reference card for interview rounds. Organized by category with one-line descriptions.

---

### 1. Infrastructure (~11 products)

| Product | One-Liner |
|---|---|
| Infrastructure Monitoring | Real-time metrics from hosts, containers, and cloud services with 800+ integrations |
| Container Monitoring | Visibility into Docker, Kubernetes, ECS, and orchestrated container environments |
| Network Performance Monitoring (NPM) | Flow-level network traffic analysis between hosts, services, containers, and cloud regions |
| Network Device Monitoring (NDM) | SNMP-based monitoring of routers, switches, firewalls, and other network hardware |
| Serverless Monitoring | End-to-end observability for AWS Lambda, Azure Functions, and Google Cloud Functions |
| Cloud Cost Management | Cloud spend tracking, allocation, and optimization recommendations across AWS/Azure/GCP |
| Universal Service Monitoring (USM) | Auto-discovered service-level metrics (throughput, latency, errors) without code instrumentation via eBPF |
| Orchestrator Explorer | Real-time Kubernetes cluster state: pods, nodes, deployments, replica sets, jobs |
| Database Monitoring (DBM) | Query-level performance metrics, explain plans, and wait event analysis for Postgres, MySQL, SQL Server, Oracle, MongoDB |
| Data Streams Monitoring | End-to-end latency tracking through Kafka, RabbitMQ, SQS, and Kinesis pipelines |
| Live Processes | Real-time process-level visibility: CPU, memory, I/O, open files, network connections per process |

### 2. APM & Applications (~9 products)

| Product | One-Liner |
|---|---|
| APM (Application Performance Monitoring) | Distributed tracing, service maps, and latency analysis across microservices |
| Continuous Profiler | Always-on, low-overhead code-level profiling (CPU, memory, locks) in production |
| Dynamic Instrumentation | Add logs, metrics, and span tags to running code without redeployment |
| Error Tracking | Automatic grouping, deduplication, and triage of application errors across services |
| Deployment Tracking | Correlate deployments with performance metrics to detect regressions immediately |
| Service Catalog | Centralized registry of services with ownership, documentation, SLOs, and scorecards |
| Data Jobs Monitoring | Performance monitoring for Spark, Databricks, and data pipeline workloads |
| Single Step Instrumentation | Auto-inject dd-trace libraries via Kubernetes admission controller — zero-code APM setup |
| Runtime Metrics | Language-level runtime metrics: JVM heap, GC pauses, Python GIL, Go goroutines, .NET CLR |

### 3. Log Management (~7 products)

| Product | One-Liner |
|---|---|
| Log Management | Ingest, process, search, and analyze logs from any source at any scale |
| Flex Logs | Cost-tier storage: ingest all logs, pay only for what you query (3-day default compute, extended archive) |
| Log Archives | Route logs to long-term storage (S3, Azure Blob, GCS) for compliance retention |
| Log Rehydration | Query archived logs on demand — bring historical data back into Log Explorer |
| Logging without Limits | Ingest all logs, index selectively with filters — decouple volume from cost |
| Log Pipelines | Processing pipelines to parse, enrich, filter, and route logs before indexing |
| Sensitive Data Scanner | Detect and redact PII, PHI, credit cards, and custom sensitive patterns in real-time |

### 4. Digital Experience (~8 products)

| Product | One-Liner |
|---|---|
| Real User Monitoring (RUM) | Browser and mobile session replay, performance metrics, and user journey analysis |
| Session Replay | Video-like recordings of user sessions with DOM snapshots (no actual screen recording) |
| Synthetic Monitoring | Proactive endpoint testing: API tests, browser tests, and multi-step workflows from global locations |
| Mobile RUM | Native SDKs for iOS and Android with crash reporting, ANR detection, and UI performance |
| Continuous Testing | Run Synthetic tests in CI/CD pipelines to catch regressions before deployment |
| Error Tracking (Frontend) | Automatic grouping and triage of JavaScript errors and mobile crashes |
| Feature Flags Tracking | Correlate feature flag changes (LaunchDarkly, Split, etc.) with RUM performance and errors |
| SLOs (Service Level Objectives) | Define, track, and alert on SLOs with burn rate alerts and error budget monitoring |

### 5. Security (~10 products)

| Product | One-Liner |
|---|---|
| Cloud SIEM | Security information and event management with 800+ detection rules and MITRE ATT&CK mapping |
| Cloud Security Posture Management (CSPM) | Continuous compliance assessment of cloud configurations against CIS, PCI, HIPAA, SOC 2, NIST |
| Cloud Workload Security (CWS) | Runtime threat detection in containers and hosts using eBPF: file integrity, process anomalies, network |
| Application Security Management (ASM) | In-app threat detection and blocking for SQLi, XSS, SSRF, and command injection via dd-trace |
| IAST (Interactive Application Security Testing) | Runtime vulnerability detection through taint tracking in production traffic |
| SCA (Software Composition Analysis) | Open-source dependency vulnerability scanning and license compliance |
| SAST (Static Application Security Testing) | Source code vulnerability scanning in CI/CD pipelines |
| Cloud Infrastructure Entitlement Management (CIEM) | IAM permission analysis, over-provisioned role detection, and least-privilege recommendations |
| Vulnerability Management | Container image and host vulnerability scanning with runtime-context prioritization |
| Identity Analytics | User behavior analytics and impossible travel detection across identity providers |

### 6. Software Delivery (~7 products)

| Product | One-Liner |
|---|---|
| CI Visibility | Pipeline performance monitoring: build times, failure rates, flaky tests across CI providers |
| Test Visibility | Test-level analytics: duration, flakiness, failure clustering, and intelligent test selection |
| Test Impact Analysis | Auto-skip tests unaffected by code changes to reduce CI runtime |
| Intelligent Test Runner | ML-based test selection that runs only tests likely impacted by the diff |
| Pipeline Visibility | Cross-pipeline dependency mapping and bottleneck identification |
| Deployment Tracking | Tag traces and metrics with deployment versions to correlate releases with performance |
| Source Code Integration | Link telemetry to source code: click a stack trace to open the exact line in GitHub/GitLab |

### 7. Service Management (~7 products)

| Product | One-Liner |
|---|---|
| Incidents | Incident lifecycle management: declare, triage, communicate, resolve, and run postmortems |
| On-Call | Scheduling, escalation policies, and alert routing for on-call teams |
| Case Management | Track and triage lower-severity issues that don't warrant full incident response |
| Event Management | Aggregate, deduplicate, and correlate events from any source into actionable alerts |
| Monitors | Metric, log, trace, and composite alerting with anomaly, outlier, and forecast detection |
| Dashboards | Customizable visualization: time series, heatmaps, top lists, geo maps, SLO widgets, 40+ widget types |
| Notebooks | Collaborative investigation documents combining live queries, graphs, markdown, and snapshot data |

### 8. AI (~10 products)

| Product | One-Liner |
|---|---|
| LLM Observability | End-to-end tracing of LLM calls: prompts, completions, tokens, latency, cost, and quality evaluations |
| AI Agents Console | Monitor autonomous AI agent workflows: tool calls, decision trees, loop detection, cost tracking |
| LLM Experiments | A/B test prompts against versioned datasets with automated quality scoring |
| Bits AI (SRE Agent) | AI-powered auto-investigation of incidents: queries metrics, traces, logs, and suggests root cause |
| Bits AI (Dev Agent) | AI-powered code analysis and pull request generation from error tracking data |
| Bits AI (Security Analyst) | Automated security signal triage, investigation, and blast radius assessment |
| Datadog MCP Server | Model Context Protocol server exposing Datadog data to external AI agents (Claude, Cursor, etc.) |
| AI Integrations | Native tracing for OpenAI, Anthropic, Bedrock, LangChain, LlamaIndex, Haystack, and more |
| Evaluation Framework | Built-in + custom evaluators for LLM output quality: faithfulness, relevance, toxicity, sentiment |
| Token Cost Tracking | Per-model, per-service, per-feature LLM cost attribution and budget alerting |

### 9. Platform (~10 capabilities)

| Capability | One-Liner |
|---|---|
| Unified Tagging | Consistent tag schema across all products — `service`, `env`, `version`, `team` propagate everywhere |
| Watchdog (AI/ML Engine) | Automatic anomaly detection, root cause analysis, and alert correlation across all telemetry types |
| Workflow Automation | No-code automation: trigger remediation actions, create tickets, post Slack messages from any alert |
| Terraform Provider | Infrastructure-as-code for Datadog: monitors, dashboards, SLOs, and security rules in HCL |
| API (v1 + v2) | Comprehensive REST API for every platform capability — 500+ endpoints |
| SSO/SAML/SCIM | Enterprise identity integration: Okta, Azure AD, OneLogin, Google Workspace with SCIM provisioning |
| Role-Based Access Control (RBAC) | Granular permissions: restrict access to data, dashboards, and configurations by role |
| Audit Trail | Full audit logging of user and API actions within Datadog for compliance and governance |
| Usage Attribution | Map Datadog usage and cost to teams, services, and environments for chargeback |
| 800+ Integrations | Pre-built integrations for AWS, Azure, GCP, Kubernetes, databases, CI/CD, and SaaS tools |

---

### Quick Stats for Conversation

| Stat | Value |
|---|---|
| Total products | **70+** |
| Total integrations | **800+** |
| OOTB detection rules (SIEM) | **800+** |
| CSPM compliance rules | **1,500+** |
| Supported languages (APM) | **Java, Python, Node.js, Go, Ruby, .NET, PHP, C++** |
| Cloud providers supported | **AWS, Azure, GCP (all three, parity)** |
| Data centers | **US (us1, us3, us5), EU (eu1), AP (ap1), GovCloud (us1-fed)** |
| FedRAMP status | **Moderate Authorized (us1-fed)** |
| Gartner APM MQ position | **Leader (highest in Execution + Vision, 2024)** |
| Customers | **28,000+** |

**Total: 70+ products, 800+ integrations, one unified platform.**
