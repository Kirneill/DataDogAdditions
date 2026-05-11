'use strict';

const {
  colors, header, subheader, metric, logLine, traceSpan, alert,
  table, separator, talkingPoint, pause, timestamp, timeRange,
  success, failure, warning, info, presentMode,
} = require('./demo-engine');

async function run() {
  console.log(colors.bold(colors.cyan('\n  Datadog Investigation — HIPAA Compliance Drift: PHI in Logs')));
  console.log(colors.dim(`  Simulated ${timestamp(0)} | Environment: prod-us-east-2 | Org: MedConnect Health\n`));

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. SENSITIVE DATA SCANNER ALERT
  // ═══════════════════════════════════════════════════════════════════════════

  header('1. Sensitive Data Scanner — PHI Pattern Detected');

  alert('P1', 'sensitive-data-scanner.phi-detected', 'Patient PII pattern detected in log stream: patient-portal-service (env:prod)');
  console.log('');
  console.log(colors.bold('  Scanner Rule: ') + 'HIPAA — Patient Full Name (first + last name in URL params)');
  console.log(colors.bold('  Scan Group:  ') + 'healthcare-phi-patterns');
  console.log(colors.bold('  Source:      ') + 'patient-portal-service / access logs');
  console.log('');
  metric('matches detected', 847, '', ['rule:phi-patient-name', 'service:patient-portal']);
  metric('unique patients affected', 312, '', ['env:prod']);
  metric('time since first match', '4 min', '', []);
  console.log('');
  failure('PHI (Protected Health Information) detected in application logs');
  warning('HIPAA §164.312(e) — Transmission Security: PHI must not be logged in cleartext');

  talkingPoint('Sensitive Data Scanner runs continuously on all log ingestion. It detected patient names appearing in URL parameters within 4 minutes of the first occurrence. Without this, PHI could sit in logs for weeks or months until the next compliance audit.');
  await pause(0, 'Log Samples');

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. LOG SAMPLES — BEFORE/AFTER REDACTION
  // ═══════════════════════════════════════════════════════════════════════════

  header('2. Log Samples — PHI Before & After Auto-Redaction');

  subheader('Raw Logs (as ingested)');
  logLine('INFO', 'patient-portal', 'GET /appointments/book?patient_name=Maria+Rodriguez&dob=1985-03-14&appt_type=cardiology HTTP/1.1 200', timestamp(6));
  logLine('INFO', 'patient-portal', 'GET /appointments/book?patient_name=James+Chen&dob=1972-11-28&appt_type=orthopedic HTTP/1.1 200', timestamp(5));
  logLine('INFO', 'patient-portal', 'GET /appointments/book?patient_name=Sarah+Williams&dob=1990-06-02&appt_type=neurology HTTP/1.1 200', timestamp(4));
  console.log('');
  failure('Patient names and dates of birth in URL query parameters — cleartext PHI');

  subheader('After Sensitive Data Scanner Auto-Redaction');
  logLine('INFO', 'patient-portal', 'GET /appointments/book?patient_name=' + colors.green('[REDACTED]') + '&dob=' + colors.green('[REDACTED]') + '&appt_type=cardiology HTTP/1.1 200', timestamp(6));
  logLine('INFO', 'patient-portal', 'GET /appointments/book?patient_name=' + colors.green('[REDACTED]') + '&dob=' + colors.green('[REDACTED]') + '&appt_type=orthopedic HTTP/1.1 200', timestamp(5));
  logLine('INFO', 'patient-portal', 'GET /appointments/book?patient_name=' + colors.green('[REDACTED]') + '&dob=' + colors.green('[REDACTED]') + '&appt_type=neurology HTTP/1.1 200', timestamp(4));
  console.log('');
  success('Sensitive Data Scanner auto-redacted patient_name and dob fields');
  info('Redacted logs retained for operational debugging — PHI stripped before storage');

  talkingPoint('The before/after is a powerful visual. Show that Datadog does not just detect — it redacts in-line so the logs are still useful for debugging but PHI never hits long-term storage. This is the difference between a detection tool and a compliance platform.');
  await pause(0, 'CI Visibility');

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. CI VISIBILITY — TRACE TO DEPLOY
  // ═══════════════════════════════════════════════════════════════════════════

  header('3. CI Visibility — Tracing PHI to Source Deployment');

  console.log(colors.dim('  Datadog CI Visibility > Deployments > patient-portal-service'));
  console.log('');
  console.log(colors.bold('  Root Cause Deployment:'));
  console.log(`  ${colors.bold('Service:')}     patient-portal-service`);
  console.log(`  ${colors.bold('Deploy:')}      v2.14.7 → v2.15.0  |  ${timestamp(8)}`);
  console.log(`  ${colors.bold('Pipeline:')}    #48291  |  main  |  ${colors.green('PASSED')} (all 247 tests)`);
  console.log(`  ${colors.bold('Commit:')}      a7f3c2e "Add appointment booking deep links"`);
  console.log(`  ${colors.bold('PR:')}          ${colors.cyan('#847')} "feat: deep link appointment URLs for mobile app"`);
  console.log(`  ${colors.bold('Author:')}      dev-jpark@medconnect.io`);
  console.log('');
  separator();
  console.log('');
  console.log(colors.dim('  Diff from PR #847 (relevant change):'));
  console.log(colors.red('  - logger.info(`GET ${req.path} ${res.statusCode}`);'));
  console.log(colors.green('  + logger.info(`GET ${req.originalUrl} ${res.statusCode}`);'));
  console.log('');
  failure('req.originalUrl includes query string — req.path does not');
  info('One-line change introduced PHI logging — query params now included in access log');

  talkingPoint('CI Visibility connects the dots: specific commit, specific PR, specific developer. The change was innocent — switching from req.path to req.originalUrl to debug mobile deep links. But it accidentally started logging query parameters that contained patient data. This is exactly the kind of mistake that slips through code review.');
  await pause(0, 'CSPM Dashboard');

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. CSPM DASHBOARD
  // ═══════════════════════════════════════════════════════════════════════════

  header('4. CSPM — HIPAA Compliance Score Impact');

  console.log(colors.dim('  Datadog CSPM > Compliance > HIPAA Framework'));
  console.log('');
  console.log(`  ${colors.bold('Overall HIPAA Score:')} ${colors.yellow('89%')} ${colors.red('↓ 8%')} (was ${colors.green('97%')} before deploy)`);
  console.log('');
  table(
    ['Control ID', 'Control Name', 'Status', 'Affected Resource'],
    [
      [colors.red('AC-4'), 'Information Flow Enforcement', colors.red('FAIL'), 'patient-portal log pipeline'],
      [colors.red('AU-3'), 'Content of Audit Records', colors.red('FAIL'), 'patient-portal access logs'],
      [colors.red('SC-28'), 'Protection of Information at Rest', colors.red('FAIL'), 'log storage (PHI present)'],
      [colors.yellow('SI-4'), 'Information System Monitoring', colors.yellow('WARN'), 'Scanner took 4min to detect'],
      [colors.green('AC-2'), 'Account Management', colors.green('PASS'), '—'],
      [colors.green('IA-2'), 'Identification and Authentication', colors.green('PASS'), '—'],
      [colors.green('SC-7'), 'Boundary Protection', colors.green('PASS'), '—'],
    ]
  );

  console.log('');
  failure('3 controls failed, 1 warning — all traced to PHI in logs');
  info('Compliance score will auto-recover once remediation is confirmed');

  talkingPoint('CSPM ties the technical finding to the compliance framework. When the compliance officer asks "what is our HIPAA posture?", you do not need a spreadsheet — you have a real-time score with drill-down. The 89% score immediately tells leadership there is a problem, and the control IDs tell the team exactly what to fix.');
  await pause(0, 'Audit Trail');

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. AUDIT TRAIL
  // ═══════════════════════════════════════════════════════════════════════════

  header('5. Audit Trail — Incident Timeline');

  table(
    ['Timestamp', 'Event', 'Actor'],
    [
      [timestamp(8), 'v2.15.0 deployed to prod', 'CI/CD pipeline #48291'],
      [timestamp(6), 'First PHI log line ingested', 'patient-portal-service'],
      [timestamp(4), colors.magenta('Sensitive Data Scanner alert fires'), 'Datadog'],
      [timestamp(4), 'Auto-redaction enabled on matching logs', 'Datadog'],
      [timestamp(3), 'Incident INC-1247 created', 'Datadog Workflow'],
      [timestamp(3), 'Security team notified via Slack + PagerDuty', 'Datadog Workflow'],
      [timestamp(2), 'PR #847 identified as root cause', 'Security analyst'],
      [timestamp(1), 'Hotfix PR #852 merged — reverts to req.path', 'dev-jpark'],
      [timestamp(0), 'v2.15.1 deployed, PHI logging stopped', 'CI/CD pipeline #48294'],
    ]
  );

  console.log('');
  success('Total PHI exposure window: 4 minutes (deploy to redaction)');
  success('Total time to code fix: 8 minutes (deploy to hotfix deploy)');
  info('Full audit trail auto-generated — no manual documentation required');

  talkingPoint('The 4-minute exposure window is the headline number. In healthcare, PHI breaches that go undetected for 60+ days require HHS notification. Datadog compressed that to 4 minutes with auto-redaction, and 8 minutes to full code remediation. That is the difference between a near-miss and a reportable breach.');
  await pause(0, 'Remediation');

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. REMEDIATION
  // ═══════════════════════════════════════════════════════════════════════════

  header('6. Remediation — CI Gate for PHI Scanning');

  console.log(colors.dim('  Datadog CI Visibility > Pipeline Configuration > patient-portal'));
  console.log('');
  console.log(colors.bold('  New CI Gate Added (post-incident):'));
  console.log('');
  console.log(colors.cyan('  pipeline:'));
  console.log(colors.cyan('    stages:'));
  console.log(colors.cyan('      - build'));
  console.log(colors.cyan('      - test'));
  console.log(colors.cyan('      - phi-scan:'));
  console.log(colors.cyan('          script: dd-phi-scanner --strict'));
  console.log(colors.cyan('          allow_failure: false'));
  console.log(colors.cyan('      - deploy'));
  console.log('');
  success('CI gate blocks any deploy where log output contains PHI patterns');
  success('Tested against PR #847 — gate correctly blocks the deployment');
  info('Gate added to all 14 healthcare service pipelines');

  talkingPoint('Prevention is better than detection. The CI gate ensures this class of mistake cannot reach production again. Datadog CI Visibility integrates the scanning directly into the pipeline — the developer gets feedback before merge, not after a compliance alert.');
  await pause(0, 'Business Impact');

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. BUSINESS IMPACT
  // ═══════════════════════════════════════════════════════════════════════════

  header('7. Business Impact Summary');

  table(
    ['Metric', 'Without Datadog', 'With Datadog', 'Improvement'],
    [
      ['PHI exposure window', colors.red('2+ weeks (next audit)'), colors.green('4 minutes'), '99.96% reduction'],
      ['Detection method', 'Manual audit', colors.green('Auto (real-time)'), 'Continuous'],
      ['Breach classification', colors.red('Reportable (>500 records)'), colors.green('Near-miss'), 'No HHS filing'],
      ['Audit evidence', 'Manual spreadsheets', colors.green('Auto-generated'), 'Always current'],
      ['Remediation time', '2-5 days', colors.green('8 minutes'), '99.9% faster'],
      ['Estimated fine risk', colors.red('$100K - $1.5M'), colors.green('$0'), 'Risk eliminated'],
      ['HIPAA score recovery', 'Weeks', colors.green('Same day'), 'Real-time posture'],
    ]
  );

  console.log('');
  success('PHI exposure compressed from weeks to 4 minutes');
  success('Auto-redaction prevented PHI from reaching long-term storage');
  success('CI gate prevents recurrence across all healthcare services');
  success('Audit-ready evidence generated automatically');
  console.log('');
  separator();
  console.log(colors.dim('\n  End of investigation simulation.\n'));
}

run().catch(console.error);
