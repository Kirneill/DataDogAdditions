---
name: datadog-incidents
description: Declare, manage, and resolve incidents with timeline updates, responder coordination, and postmortems via pup CLI
---

# Datadog Incidents

## Prerequisites

- `pup` CLI installed and authenticated (`pup auth login` or `DD_API_KEY` + `DD_APP_KEY` env vars)
- Datadog Incidents product enabled in the target org
- For Slack integration: Datadog-Slack integration configured with an incidents channel
- For PagerDuty/Opsgenie: respective integrations configured in Datadog

## Commands

### Create an Incident

```bash
# Declare a new incident with severity and initial details
pup incidents create \
  --title "Checkout API returning 500s for 15% of requests" \
  --severity SEV-2 \
  --commander "@john.doe" \
  --customer-impact "Users unable to complete purchases" \
  --customer-impact-scope "Approximately 15% of checkout attempts" \
  --notification-handle "@slack-incidents-channel" \
  --tags "service:checkout-api,env:production,team:payments"

# Create from a monitor alert (links the triggering monitor)
pup incidents create \
  --title "Database connection pool exhausted - orders-db" \
  --severity SEV-1 \
  --commander "@oncall-infra" \
  --source monitor:12345678 \
  --tags "service:orders-db,env:production"

# Create with a detection method and root cause field
pup incidents create \
  --title "Elevated latency on search service" \
  --severity SEV-3 \
  --commander "@jane.smith" \
  --detection-method "monitor" \
  --fields "root_cause:resource_saturation" \
  --tags "service:search,env:production"
```

### List Incidents

```bash
# List active incidents
pup incidents list --status active

# List by severity
pup incidents list --status active --severity SEV-1

# List all incidents in a time range
pup incidents list --from "7d" --limit 50

# Filter by tag
pup incidents list --tag "service:checkout-api" --from "30d"

# List resolved incidents for postmortem review
pup incidents list --status resolved --from "30d" --format json
```

### Get Incident Details

```bash
# Full incident details including timeline
pup incidents get --id inc-12345

# Get just the timeline entries
pup incidents get --id inc-12345 --section timeline

# Get incident as JSON for scripting
pup incidents get --id inc-12345 --format json

# Get incident with responder list
pup incidents get --id inc-12345 --section responders
```

### Update Incident Status

```bash
# Move from active to stable (bleeding stopped, monitoring)
pup incidents update --id inc-12345 --status stable

# Move from stable to resolved
pup incidents update --id inc-12345 --status resolved \
  --resolved-at "2024-01-15T14:30:00Z"

# Update severity (escalation)
pup incidents update --id inc-12345 --severity SEV-1

# Update severity (de-escalation)
pup incidents update --id inc-12345 --severity SEV-3

# Update customer impact
pup incidents update --id inc-12345 \
  --customer-impact "Impact mitigated - fallback routing active" \
  --customer-impact-scope "No remaining user-facing impact"

# Change incident commander
pup incidents update --id inc-12345 --commander "@jane.smith"

# Update custom fields
pup incidents update --id inc-12345 \
  --fields "root_cause:configuration_change" \
  --fields "detection_method:monitor"
```

### Add Timeline Entries

```bash
# Add a status update note
pup incidents timeline add --id inc-12345 \
  --type "note" \
  --content "Identified root cause: bad config deploy at 14:02 UTC. Rolling back now."

# Add a responder action
pup incidents timeline add --id inc-12345 \
  --type "note" \
  --content "Rollback complete. Monitoring error rates - down to 0.1% from 15%." \
  --important

# Mark a key moment (shows prominently in timeline)
pup incidents timeline add --id inc-12345 \
  --type "note" \
  --content "Customer impact confirmed resolved. All metrics nominal for 10 minutes." \
  --important

# Add a graph/notebook reference to the timeline
pup incidents timeline add --id inc-12345 \
  --type "graph" \
  --widget-url "https://app.datadoghq.com/dashboard/abc-def?from_ts=1705312800000"
```

### Add Responders

```bash
# Add an individual responder
pup incidents responders add --id inc-12345 --handle "@alice.wong"

# Add with a specific role
pup incidents responders add --id inc-12345 --handle "@bob.chen" --role "communications_lead"

# Add a team as responder
pup incidents responders add --id inc-12345 --handle "@team-database"

# Page via PagerDuty
pup incidents responders add --id inc-12345 --handle "@pagerduty-infra-oncall"

# Page via Opsgenie
pup incidents responders add --id inc-12345 --handle "@opsgenie-payments-team"
```

### Resolve an Incident

```bash
# Resolve with a summary
pup incidents update --id inc-12345 --status resolved \
  --resolved-at "now"

# Full resolution: update status, add final timeline note, set customer impact end
pup incidents timeline add --id inc-12345 \
  --type "note" \
  --content "Incident resolved. Root cause: misconfigured rate limiter deployed at 14:02. Fixed via rollback at 14:18. Total customer impact duration: 16 minutes." \
  --important
pup incidents update --id inc-12345 --status resolved
```

### Postmortems

```bash
# List postmortems
pup incidents postmortems list --from "90d"

# Get a specific postmortem
pup incidents postmortems get --id inc-12345

# Generate a postmortem from an incident (uses configured template)
pup incidents postmortems create --incident-id inc-12345 \
  --template "default"

# Generate postmortem with a specific template
pup incidents postmortems create --incident-id inc-12345 \
  --template "sev1-detailed"

# Update a postmortem with follow-up action items
pup incidents postmortems update --incident-id inc-12345 \
  --add-action "Add circuit breaker to checkout->payment call" \
  --add-action "Implement canary deploys for config changes" \
  --add-action "Add runbook for rate limiter misconfiguration"
```

## When to Use

- Declaring a new incident when a service degradation or outage is detected
- Managing an ongoing incident: updating status, adding timeline notes, tracking progress
- Escalating or de-escalating severity as impact becomes clearer
- Coordinating responders across teams, including PagerDuty/Opsgenie paging
- Updating customer impact scope as mitigation progresses
- Generating and managing postmortems after resolution
- Listing historical incidents for trend analysis or audit purposes
- Automating incident creation from CI/CD pipeline failures or custom detection scripts

## When NOT to Use

- **Creating monitors or alerts**: Monitors detect problems and can trigger incidents, but monitor CRUD uses the `datadog-monitors` skill.
- **Security signal investigation**: Security-related incidents originating from Datadog Security Monitoring use a different workflow -- use the `datadog-security` skill if available.
- **Querying metrics or logs during investigation**: While investigating an incident you will often need metrics and logs. Use `datadog-metrics` and `datadog-logs` skills for those queries. This skill handles the incident record itself.
- **Synthetic test management**: If an incident was triggered by a failing synthetic test, manage the test via `datadog-synthetics`. This skill manages the incident response, not the test.

## Key Concepts

- **Incident Lifecycle**: `active` (impact ongoing, responders working) -> `stable` (bleeding stopped, monitoring for recurrence, root cause may still be under investigation) -> `resolved` (incident fully mitigated, no remaining impact). Transitions are explicit and tracked in the timeline.
- **Severity Levels**: SEV-1 (critical, widespread customer impact, all-hands response), SEV-2 (significant impact, dedicated responders), SEV-3 (moderate impact, limited scope), SEV-4 (minor issue, single team handles), SEV-5 (cosmetic or informational, no urgency). Severity determines notification routing and escalation policies.
- **Incident Commander**: The single person responsible for coordinating the response. They delegate tasks, make decisions on mitigation strategy, and control communication. Only one commander per incident. Can be reassigned during handoffs.
- **Timeline**: The chronological record of everything that happened during the incident. Includes status changes, responder additions, notes, graphs, linked notebooks, and automated entries from integrations. Entries marked `--important` surface in summaries and postmortems.
- **Notification Rules**: Configurable rules that determine who gets notified for which incidents. Rules match on severity, tags, and services. Channels include Slack, PagerDuty, Opsgenie, email, Microsoft Teams, and webhooks.
- **Postmortem Templates**: Org-defined templates that auto-populate with incident data (timeline, duration, severity, impact). Standard sections: summary, impact, root cause, detection, mitigation, follow-up actions. Templates enforce consistent post-incident review across teams.
- **Incident Signals**: Automatic triggers that create incidents from other Datadog products. A monitor in ALERT state, a security signal, or a CI pipeline failure can auto-declare an incident with pre-filled fields based on the signal source.
- **Integrations**: Slack (dedicated incident channel per SEV-1/SEV-2, updates posted automatically), PagerDuty (page oncall responders directly from the incident), Opsgenie (same as PagerDuty), Jira/ServiceNow (create tracking tickets linked to the incident). Bidirectional sync keeps all systems consistent.
