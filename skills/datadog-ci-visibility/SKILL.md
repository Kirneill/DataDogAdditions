---
name: datadog-ci-visibility
description: Upload test results, track deployments, enforce quality gates, analyze flaky tests, and monitor CI/CD pipelines via datadog-ci and pup CLIs.
---

# Datadog CI Visibility

## Prerequisites

- `datadog-ci` CLI installed (`npm install -g @datadog/datadog-ci`)
- `DD_API_KEY` environment variable set (some commands also need `DD_SITE`, defaults to `datadoghq.com`)
- Optional: `pup` CLI for querying pipeline/test data after upload
- CI environment detected automatically (GitHub Actions, GitLab CI, Jenkins, CircleCI, Azure DevOps) or set `DD_GIT_*` env vars manually

## Commands

### JUnit Test Result Upload

```bash
# Upload JUnit XML reports from a test run
datadog-ci junit upload --service my-api ./test-results/*.xml

# Upload with custom tags for filtering
datadog-ci junit upload --service my-api \
  --tags "team:payments,component:checkout,test.framework:pytest" \
  ./test-results/junit.xml

# Upload with minimum severity for test failures to report
datadog-ci junit upload --service my-api \
  --env staging \
  --logs \
  ./build/reports/TEST-*.xml
```

### Git Metadata Upload

```bash
# Upload git metadata (commit info, repo URL) -- run early in pipeline
datadog-ci git-metadata upload

# This enables linking pipeline executions to commits, PRs, and code owners.
# Most CI providers auto-detect git info, but run this explicitly if commits
# don't appear linked in the Datadog UI.
```

### DORA Metrics

```bash
# Record a deployment event (deployment frequency + lead time)
datadog-ci dora deployment --service my-api \
  --env production \
  --started-at "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --git-sha "$(git rev-parse HEAD)"

# Record a deployment with a named version
datadog-ci dora deployment --service my-api \
  --env production \
  --started-at "2026-05-10T14:30:00Z" \
  --finished-at "2026-05-10T14:35:00Z" \
  --git-sha abc123def \
  --version "v2.14.0"

# DORA computes four metrics automatically:
#   1. Deployment Frequency -- how often you deploy to production
#   2. Lead Time for Changes -- commit to production deploy duration
#   3. Change Failure Rate -- % of deployments causing incidents (links to Datadog Incidents)
#   4. Time to Restore Service -- incident open to resolved duration
```

### Quality Gates

```bash
# Evaluate quality gates before deploying (blocks if criteria not met)
datadog-ci gate evaluate

# Gate rules are configured in the Datadog UI (CI Visibility > Quality Gates).
# Common gate conditions:
#   - No new flaky tests introduced
#   - Test pass rate >= 99%
#   - No critical/high security vulnerabilities (links to Code Security)
#   - Performance regression < 5% on key endpoints
#   - Code coverage >= threshold

# The exit code tells you the result:
#   0 = all gates passed
#   1 = one or more gates failed (blocks deployment)
```

### Code Coverage Upload

```bash
# Upload code coverage reports (Cobertura, LCOV, or Jacoco format)
datadog-ci coverage upload --service my-api ./coverage/cobertura.xml

# Upload with branch info for diff coverage tracking
datadog-ci coverage upload --service my-api \
  --branch "feature/checkout-v2" \
  --git-sha "$(git rev-parse HEAD)" \
  ./coverage/lcov.info
```

### Source Maps Upload (Frontend)

```bash
# Upload JavaScript source maps for error tracking
datadog-ci sourcemaps upload ./dist \
  --service my-frontend \
  --release-version "v2.14.0" \
  --minified-path-prefix "https://app.example.com/static/"

# Upload React Native source maps
datadog-ci react-native sourcemaps upload \
  --service my-mobile-app \
  --bundle ./build/main.jsbundle \
  --sourcemap ./build/main.jsbundle.map \
  --release-version "3.1.0" \
  --build-version "412"
```

### SARIF Upload (Static Analysis Results)

```bash
# Upload SARIF files from SAST/linting tools
datadog-ci sarif upload --service my-api ./results/semgrep.sarif

# Upload with tags
datadog-ci sarif upload --service my-api \
  --tags "tool:semgrep,scan_type:sast" \
  ./results/*.sarif
```

### SBOM Upload (Software Bill of Materials)

```bash
# Upload SBOM for dependency tracking (CycloneDX or SPDX format)
datadog-ci sbom upload --service my-api ./sbom/cyclonedx.json

# Upload container SBOM
datadog-ci sbom upload --service my-api \
  --tags "image:my-api:v2.14.0" \
  ./sbom/container-sbom.json
```

### Querying CI Data (via pup)

```bash
# Search recent pipeline executions
pup ci pipeline search --query "service:my-api @ci.status:error" --from "24h"

# List flaky tests for a service
pup ci test search --query "service:my-api @test.is_flaky:true" --from "7d"

# Get test suite wall time trends
pup api GET "/api/v2/ci/tests/analytics" --data '{
  "filter": {"from": "now-30d", "to": "now", "query": "service:my-api"},
  "group_by": ["@test.suite"],
  "compute": [{"aggregation": "avg", "metric": "@duration"}]
}'

# Check intelligent test selection savings (tests skipped vs. total)
pup api GET "/api/v2/ci/tests/analytics" --data '{
  "filter": {"from": "now-7d", "to": "now", "query": "service:my-api"},
  "compute": [
    {"aggregation": "count", "metric": "@test.status", "type": "total"},
    {"aggregation": "count", "metric": "@test.is_skipped_by_itr:true", "type": "skipped_by_itr"}
  ]
}'
```

## When to Use

- Integrating Datadog into a CI/CD pipeline (GitHub Actions, GitLab CI, Jenkins, etc.)
- Uploading test results (JUnit XML) for test visibility and flaky test detection
- Recording deployments to track DORA metrics (deployment frequency, lead time, CFR, TTRS)
- Enforcing quality gates before production deployments
- Uploading code coverage to track per-branch and diff coverage
- Uploading source maps so frontend errors show original source in Datadog RUM/Error Tracking
- Uploading SARIF or SBOM files for security analysis integration
- Analyzing flaky tests, slow test suites, or intelligent test selection effectiveness
- Diagnosing CI pipeline failures (which job failed, how long did each stage take)

## When NOT to Use

- **Running synthetic tests** -- use `datadog-synthetics` skill (though it also uses `datadog-ci synthetics`)
- **Application monitoring** (traces, service maps) -- use `datadog-apm` skill
- **Security signal investigation** -- use `datadog-security` skill
- **Infrastructure or cloud resource monitoring** -- use `datadog-metrics` skill
- **LLM/AI application monitoring** -- use `datadog-ai-observability` skill

## Key Concepts

**CI Visibility** models every pipeline execution as a trace with spans:
- Pipeline -> Stage -> Job -> Step (each is a span with duration, status, git metadata)
- Failed jobs show error messages, logs, and linked infrastructure metrics from the runner

**Test Optimization** features:
- **Flaky Test Detection** -- a test that passes and fails on the same commit is marked flaky. Datadog tracks flaky tests over time and surfaces new flakes per branch.
- **Intelligent Test Selection (ITR)** -- analyzes code coverage to determine which tests are affected by a commit's changes. Unaffected tests are skipped, reducing wall time by 30-80% in typical repos.
- **Test Suite Wall Time** -- total clock time for the test suite. Tracks regressions over time.
- **Early Flake Detection** -- automatically re-runs new tests multiple times to detect flakiness before it reaches the default branch.

**DORA Metrics** require two data sources:
1. `datadog-ci dora deployment` calls from your pipeline (deployment frequency, lead time)
2. Datadog Incidents linked to services (change failure rate, time to restore)

**Quality Gates** are evaluated at deploy time and can block releases based on:
- Test pass rate thresholds
- New flaky test introduction
- Security vulnerability counts (integrates with Code Security)
- Performance regression detection (integrates with APM)
- Custom metric conditions

**Coverage Tracking:**
- Total coverage per branch is tracked over time
- Diff coverage shows what percentage of changed lines are covered by tests
- Quality gates can enforce minimum diff coverage thresholds
