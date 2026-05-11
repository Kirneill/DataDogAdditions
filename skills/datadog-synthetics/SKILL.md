---
name: datadog-synthetics
description: Create and run synthetic API tests, browser tests, and multi-step monitors via datadog-ci and pup CLI
---

# Datadog Synthetics

## Prerequisites

- `datadog-ci` installed globally (`npm install -g @datadog/datadog-ci`)
- `pup` CLI installed and authenticated (`pup auth login` or `DD_API_KEY` + `DD_APP_KEY` env vars)
- `DATADOG_API_KEY` and `DATADOG_APP_KEY` environment variables set (required by `datadog-ci synthetics`)
- For browser tests: test recordings created in the Datadog UI or imported as JSON definitions
- For private locations: at least one private location configured with a running agent

## Commands

### Run Tests in CI

```bash
# Run all tests matching a search query
datadog-ci synthetics run-tests --search "tag:team:checkout env:staging"

# Run specific tests by public ID
datadog-ci synthetics run-tests --public-id abc-def-ghi --public-id jkl-mno-pqr

# Run tests defined in a config file (CI pipeline pattern)
datadog-ci synthetics run-tests --config synthetics.ci.json

# Run with variable overrides (inject CI-specific values)
datadog-ci synthetics run-tests --public-id abc-def-ghi --variable "BASE_URL=https://staging.example.com" --variable "API_TOKEN=$CI_API_TOKEN"

# Block CI pipeline: fail the command if any test fails (default behavior)
datadog-ci synthetics run-tests --public-id abc-def-ghi --failOnCriticalErrors

# Run with custom polling timeout (milliseconds)
datadog-ci synthetics run-tests --public-id abc-def-ghi --pollingTimeout 120000

# Tunnel mode: test a local/preview environment through a secure tunnel
datadog-ci synthetics run-tests --tunnel --public-id abc-def-ghi --variable "BASE_URL=http://localhost:3000"
```

### CI Config File (`synthetics.ci.json`)

```json
{
  "tests": [
    {
      "id": "abc-def-ghi",
      "config": {
        "startUrl": "https://staging.example.com",
        "variables": { "USERNAME": "test-user" },
        "pollingTimeout": 60000
      }
    }
  ],
  "global": {
    "pollingTimeout": 120000,
    "failOnCriticalErrors": true,
    "failOnMissingTests": true
  }
}
```

### Create API Test

```bash
# Simple HTTP GET test
pup synthetics create-api-test \
  --name "Checkout API Health" \
  --type http \
  --method GET \
  --url "https://api.example.com/health" \
  --assertion "statusCode is 200" \
  --assertion "responseTime lessThan 2000" \
  --assertion "body contains \"status\":\"ok\"" \
  --locations "aws:us-east-1,aws:eu-west-1" \
  --frequency 60 \
  --tags "team:checkout,env:production"

# POST request with body and headers
pup synthetics create-api-test \
  --name "Create Order API" \
  --type http \
  --method POST \
  --url "https://api.example.com/orders" \
  --header "Content-Type:application/json" \
  --header "Authorization:Bearer {{API_TOKEN}}" \
  --body '{"item_id":"sku-123","quantity":1}' \
  --assertion "statusCode is 201" \
  --assertion "body jsonPath $.order_id isNot \"\"" \
  --frequency 300 \
  --locations "aws:us-east-1"

# SSL certificate check
pup synthetics create-api-test \
  --name "SSL Cert Expiry - example.com" \
  --type ssl \
  --host "example.com" \
  --port 443 \
  --assertion "certificate.expiresIn greaterThan 30" \
  --frequency 86400 \
  --tags "team:infra,type:ssl"

# DNS resolution test
pup synthetics create-api-test \
  --name "DNS Resolution - api.example.com" \
  --type dns \
  --host "api.example.com" \
  --assertion "record.A contains 10.0.1.50" \
  --assertion "responseTime lessThan 500" \
  --frequency 300

# TCP port connectivity
pup synthetics create-api-test \
  --name "Redis Connectivity" \
  --type tcp \
  --host "redis.internal.example.com" \
  --port 6379 \
  --assertion "responseTime lessThan 100" \
  --locations "private:datacenter-east" \
  --frequency 60

# gRPC health check
pup synthetics create-api-test \
  --name "Payment Service gRPC" \
  --type grpc \
  --host "payments.internal:50051" \
  --service "grpc.health.v1.Health" \
  --method "Check" \
  --assertion "grpc.status is 0" \
  --assertion "responseTime lessThan 500" \
  --locations "private:datacenter-east"
```

### Create Browser Test

```bash
# Create browser test from a JSON step definition
pup synthetics create-browser-test \
  --name "User Login Flow" \
  --start-url "https://app.example.com/login" \
  --steps-file ./tests/login-steps.json \
  --locations "aws:us-east-1,aws:us-west-2" \
  --frequency 300 \
  --tags "team:auth,flow:login" \
  --device "chrome.laptop_large"

# Available devices: chrome.laptop_large, chrome.tablet, chrome.mobile_small,
#   firefox.laptop_large, firefox.tablet, firefox.mobile_small,
#   edge.laptop_large
```

### List and Inspect Tests

```bash
# List all synthetic tests
pup synthetics list --format json

# Filter by tag
pup synthetics list --tag "team:checkout" --tag "env:production"

# Get test details and latest results
pup synthetics get --public-id abc-def-ghi

# Get recent results for a test
pup synthetics results --public-id abc-def-ghi --from "24h" --limit 10

# Get a specific result with full response details
pup synthetics results get --result-id xyz789 --public-id abc-def-ghi
```

### Upload Mobile App (for Mobile Synthetics)

```bash
# Upload an Android APK
datadog-ci synthetics upload-application --mobileApplicationId abc-def-ghi --mobileApplicationVersionFilePath ./app-release.apk --versionName "1.2.3" --latest

# Upload an iOS IPA
datadog-ci synthetics upload-application --mobileApplicationId jkl-mno-pqr --mobileApplicationVersionFilePath ./App.ipa --versionName "1.2.3" --latest
```

## When to Use

- Creating synthetic monitors to verify API endpoints return expected responses
- Running synthetic tests as CI/CD gates to block deploys on test failure
- Testing internal endpoints via private locations (services not exposed to the public internet)
- Verifying SSL certificate validity and expiration windows
- Checking DNS resolution correctness after infrastructure changes
- Testing browser-based user journeys (login, checkout, signup flows)
- Validating API contracts with assertions on status codes, response bodies, and headers
- Monitoring third-party API reliability from multiple geographic locations

## When NOT to Use

- **Real User Monitoring (RUM)**: Synthetics tests simulated traffic, not real users. RUM is a separate Datadog product not covered by this skill.
- **Load/performance testing**: Synthetic tests run single requests at fixed intervals. They are not load generators. Use dedicated tools (k6, Locust, Artillery) for load testing.
- **APM trace analysis**: If you need to investigate slow requests from real traffic, use the `datadog-apm` skill.
- **Monitor/alert creation on metrics**: Synthetics tests have built-in alerting, but threshold alerts on infrastructure or custom metrics use the `datadog-monitors` skill.

## Key Concepts

- **API Test Types**: HTTP (request/response validation), SSL (certificate checks), DNS (record resolution), TCP (port connectivity), WebSocket (connection and message exchange), gRPC (service health and method calls), ICMP (ping/packet loss). Each type has its own assertion vocabulary.
- **Browser Tests**: Recorded step-by-step user journeys executed in a real Chrome/Firefox/Edge browser. Steps include click, type, assert element present, assert text, navigate, upload file, run JavaScript. Tests capture screenshots and a full network waterfall on failure.
- **Multi-Step API Tests**: Chain multiple API requests where outputs of one step feed into the next. Example: POST to create a resource, extract the ID from the response, GET that resource, DELETE it. Variables pass between steps via `{{ steps.0.response.body.id }}`.
- **Private Locations**: Self-hosted agents that run synthetic tests against internal endpoints not reachable from Datadog's managed locations. Deployed as Docker containers or Kubernetes pods inside your network.
- **Assertions**: The core of every test. Types include: `is` / `isNot` (exact match), `contains` / `doesNotContain` (substring), `matches` (regex), `lessThan` / `greaterThan` (numeric comparison), `jsonPath` (extract and assert on JSON fields), `header` (response header values).
- **Global Variables**: Reusable variables (API tokens, base URLs, credentials) stored in Datadog and injected into tests at runtime. Referenced as `{{ VARIABLE_NAME }}`. Can be scoped to environments or set as secure (write-only, masked in results).
- **CI/CD Integration**: `datadog-ci synthetics run-tests` exits non-zero when tests fail, blocking the pipeline. The `--tunnel` flag creates a secure connection from Datadog's infrastructure to your local or preview environment, enabling tests against ephemeral deployments.
- **Test Frequency**: How often a test runs from each selected location. Common intervals: 60s (critical health checks), 300s (standard API monitoring), 3600s (SSL/DNS checks), 86400s (daily certificate expiry). More locations x higher frequency = more test runs consumed.
