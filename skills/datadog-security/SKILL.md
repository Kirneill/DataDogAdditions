---
name: datadog-security
description: Search security signals, list findings, check compliance posture, triage vulnerabilities, and audit cloud configurations via pup and Datadog Security APIs.
---

# Datadog Security

## Prerequisites

- `pup` CLI installed and authenticated (`pup login` or `DD_API_KEY` + `DD_APP_KEY` env vars)
- Datadog org with Security products enabled (Cloud SIEM, CSPM, or Code Security)
- API/App key pair with `security_monitoring_signals_read`, `security_monitoring_findings_read`, and `vulnerability_management_read` scopes

## Commands

### Security Signals (Cloud SIEM / Threat Management)

```bash
# Search recent security signals (last 1 hour, high+ severity)
pup security signal search --query "status:high OR status:critical" --from "1h"

# Get a specific signal by ID
pup security signal get --signal-id "AAAA-BBBBBBBB"

# Filter signals by source (e.g., AWS CloudTrail, Kubernetes audit logs)
pup security signal search --query "source:cloudtrail @userIdentity.arn:*admin*" --from "24h"

# List signals with MITRE ATT&CK tactic
pup security signal search --query "@workflow.tactic.name:persistence" --from "7d" --limit 50
```

### Security Findings (CSPM / CIEM)

```bash
# List all failing findings for a compliance framework
pup security finding list --filter-status "failed" --filter-framework "pci-dss"

# Check CSPM posture for a specific AWS account
pup security finding list --filter-status "failed" --filter-cloud-provider "aws" \
  --filter-account-id "123456789012"

# Get findings for a specific rule
pup security finding list --filter-rule-id "cis-aws-1.4.0-2.1.1"

# List CIEM findings (over-privileged identities)
pup security finding list --filter-type "identity_risk" --filter-status "failed"
```

### Compliance Status

```bash
# Get compliance posture summary by framework
pup api GET "/api/v2/csm/posture/frameworks" | jq '.data[] | {name: .attributes.name, score: .attributes.score}'

# List available compliance frameworks
pup api GET "/api/v2/csm/posture/frameworks" | jq '.data[].attributes.name'

# Get rule-level compliance for SOC2
pup security finding list --filter-framework "soc2" --filter-status "failed" --limit 100
```

### Vulnerability Management

```bash
# Search container image vulnerabilities (critical only)
pup security vulnerability search --query "severity:critical type:container_image" --limit 25

# Search host vulnerabilities for a specific service
pup security vulnerability search --query "service:payments severity:high" --from "7d"

# Get vulnerability details by CVE
pup security vulnerability search --query "vulnerability_id:CVE-2024-3094"

# List vulnerabilities with available fixes
pup security vulnerability search --query "has_fix:true severity:critical" --limit 50
```

### Code Security (SAST / SCA / Secrets)

```bash
# List code security findings by repository
pup api GET "/api/v2/code_security/findings?filter[repo_name]=myorg/myrepo"

# Search for secret scanning detections
pup api GET "/api/v2/code_security/findings?filter[category]=secret&filter[status]=open"

# Get SCA (dependency) vulnerabilities for a service
pup api GET "/api/v2/code_security/findings?filter[category]=sca&filter[service]=checkout-api"
```

### Detection Rules

```bash
# List all enabled detection rules
pup security rule list --filter-enabled true

# Search rules by name or tag
pup security rule list --filter-query "tag:compliance-pci"

# Get a specific rule definition
pup security rule get --rule-id "abc-def-123"
```

## When to Use

- Investigating a security alert or SIEM signal (who, what, when, which resource)
- Checking compliance posture before an audit (HIPAA, PCI-DSS, SOC2, FedRAMP, CIS)
- Triaging vulnerability scan results from container images or hosts
- Reviewing CIEM findings for over-privileged IAM roles or service accounts
- Auditing cloud misconfigurations (S3 buckets, security groups, encryption settings)
- Checking whether a specific CVE affects your infrastructure
- Listing or modifying detection rules for Cloud SIEM

## When NOT to Use

- **Application performance issues** -- use `datadog-apm` skill instead
- **Incident management workflows** (declare, update, resolve incidents) -- use `datadog-incidents` skill
- **Infrastructure metrics** (CPU, memory, disk) -- use `datadog-metrics` skill
- **Synthetic monitoring or uptime checks** -- use `datadog-synthetics` skill
- **CI/CD pipeline failures or test flakiness** -- use `datadog-ci-visibility` skill

## Key Concepts

**Three Pillars of Datadog Security:**

1. **Code Security** -- Shift-left scanning integrated into developer workflows:
   - SAST: static analysis of source code for vulnerabilities
   - SCA: dependency/library vulnerability scanning (CVEs in packages)
   - IAST: runtime instrumentation that detects vulnerabilities during test execution
   - IaC Security: Terraform/CloudFormation misconfiguration detection
   - Secret Scanning: leaked credentials, API keys, tokens in code and logs

2. **Cloud Security** -- Posture and entitlement management:
   - CSPM: continuous assessment of cloud resource configurations against compliance frameworks
   - CIEM: maps IAM permissions, flags over-privileged identities, recommends least-privilege policies
   - Vulnerability Management: aggregates CVEs across hosts, containers, and serverless
   - Compliance Frameworks: HIPAA, PCI-DSS, SOC2, FedRAMP, CIS Benchmarks -- each maps to specific rules

3. **Threat Management** -- Real-time detection and response:
   - Cloud SIEM: log-based threat detection with detection rules, correlation, and investigation notebooks
   - Workload Protection: runtime threat detection on hosts and containers (file integrity, process exec)
   - Application & API Protection: WAF-like protection integrated with APM traces (formerly ASM)

**Severity levels:** `info` < `low` < `medium` < `high` < `critical`. Filter on `high,critical` for triage.

**Finding statuses:** `passed`, `failed`, `muted`. Focus on `failed` for active issues.

**Signal statuses:** `open`, `under_review`, `archived`. Triage starts with `open`.
