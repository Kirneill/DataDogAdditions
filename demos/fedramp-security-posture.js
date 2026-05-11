'use strict';

const {
  colors, header, subheader, metric, logLine, traceSpan, alert,
  table, separator, talkingPoint, pause, timestamp, timeRange,
  success, failure, warning, info, presentMode,
} = require('./demo-engine');

async function run() {
  console.log(colors.bold(colors.cyan('\n  Datadog Investigation — FedRAMP Continuous Compliance Monitoring')));
  console.log(colors.dim(`  Simulated ${timestamp(0)} | Environment: govcloud-us-west | Org: Aegis Defense Systems\n`));

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. CSPM OVERVIEW
  // ═══════════════════════════════════════════════════════════════════════════

  header('1. CSPM Overview — FedRAMP Moderate Baseline');

  console.log(colors.dim('  Datadog CSPM > Compliance > FedRAMP Moderate'));
  console.log('');
  console.log(`  ${colors.bold('Overall Compliance Score:')} ${colors.yellow('94.2%')} (312/331 controls)`);
  console.log('');
  console.log(`  ${'█'.repeat(47)}${colors.yellow('░░░')} 94.2%`);
  console.log('');
  table(
    ['Category', 'Passing', 'Warning', 'Failing', 'Score'],
    [
      ['Access Control (AC)', '18/20', '1', colors.red('1'), colors.yellow('90.0%')],
      ['Audit (AU)', '14/14', '0', '0', colors.green('100%')],
      ['Security Assessment (CA)', '8/9', '1', '0', colors.yellow('88.9%')],
      ['Config Management (CM)', '11/11', '0', '0', colors.green('100%')],
      ['Identification (IA)', '10/11', '0', colors.red('1'), colors.yellow('90.9%')],
      ['Incident Response (IR)', '8/8', '0', '0', colors.green('100%')],
      ['Risk Assessment (RA)', '6/6', '0', '0', colors.green('100%')],
      ['System & Comm (SC)', '23/25', '0', colors.red('2'), colors.yellow('92.0%')],
      ['System & Info (SI)', '14/15', colors.yellow('1'), '0', colors.yellow('93.3%')],
      ['Other families', '200/212', colors.yellow('11'), colors.red('1'), colors.yellow('94.3%')],
    ]
  );

  console.log('');
  warning('5 controls failing, 14 warnings — requires attention before next 3PAO assessment');
  info('Last 3PAO audit: 2026-03-15 | Next scheduled: 2026-06-15 (35 days)');

  talkingPoint('FedRAMP requires continuous monitoring, not just point-in-time audits. CSPM gives the ISSM a real-time compliance score against the FedRAMP Moderate baseline — 331 controls mapped automatically. The 94.2% score tells you exactly where you stand before the 3PAO walks in the door.');
  await pause(0, 'Failed Controls');

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. FAILED CONTROLS
  // ═══════════════════════════════════════════════════════════════════════════

  header('2. Failed Controls — Detailed Findings');

  console.log(colors.dim('  Datadog CSPM > FedRAMP Moderate > Status: FAIL'));
  console.log('');
  table(
    ['Control', 'Description', 'Finding', 'Resources'],
    [
      [colors.red('AC-2'), 'Account Management', '3 IAM users without MFA enabled', 'arn:aws-gov:iam::*:user/{svc-legacy-*}'],
      [colors.red('IA-5'), 'Authenticator Mgmt', '1 access key > 90 days old (not rotated)', 'arn:aws-gov:iam::*:user/deploy-bot'],
      [colors.red('SC-7'), 'Boundary Protection', '2 security groups with 0.0.0.0/0 ingress', 'sg-0a7f3c2e, sg-0b8d4e1f'],
      [colors.red('SC-8'), 'Transmission Confid.', '1 ALB listener on HTTP (not HTTPS)', 'alb-internal-legacy-api'],
      [colors.red('SC-28'), 'Protection at Rest', '1 S3 bucket without SSE-KMS encryption', 's3://aegis-proj-archive-2024'],
    ]
  );

  console.log('');
  subheader('AC-2: Account Management Detail');
  console.log('  Affected IAM users (no MFA):');
  console.log(`    ${colors.red('•')} svc-legacy-etl      — Last login: ${timestamp(4320)} (3 days ago)`);
  console.log(`    ${colors.red('•')} svc-legacy-report   — Last login: ${timestamp(43200)} (30 days ago)`);
  console.log(`    ${colors.red('•')} svc-legacy-migrate  — Last login: ${colors.dim('never')}`);
  console.log('');
  failure('svc-legacy-migrate has never been used — likely orphaned credential');
  warning('These are service accounts from a legacy migration — MFA was deferred and never enforced');

  talkingPoint('Every failed control maps to a specific AWS resource with ARN. The ISSM does not need to dig through AWS console — Datadog surfaces exactly which resources are non-compliant and why. For the auditor, this is gold: evidence-backed findings with remediation paths.');
  await pause(0, 'Cloud SIEM');

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. CLOUD SIEM SIGNAL
  // ═══════════════════════════════════════════════════════════════════════════

  header('3. Cloud SIEM — Unauthorized API Activity');

  alert('HIGH', 'cloud-siem.unauthorized-s3-access', 'Unauthorized API call to classified project bucket from unrecognized IP');
  console.log('');
  console.log(colors.bold('  Signal Details:'));
  console.log(`  ${colors.bold('Time:')}          ${timestamp(22)}`);
  console.log(`  ${colors.bold('Source IP:')}      ${colors.red('198.51.100.47')} (not in approved CIDR blocks)`);
  console.log(`  ${colors.bold('User Agent:')}     aws-cli/2.15.0 Python/3.11.6 Linux/5.15.0`);
  console.log(`  ${colors.bold('API Call:')}       s3:GetObject`);
  console.log(`  ${colors.bold('Bucket:')}         s3://aegis-classified-proj-delta`);
  console.log(`  ${colors.bold('Object:')}         /designs/radar-array-v4.2.dwg`);
  console.log(`  ${colors.bold('IAM Principal:')}  ${colors.red('svc-legacy-etl')}`);
  console.log(`  ${colors.bold('Result:')}         ${colors.green('AccessDenied')} (bucket policy blocked)`);
  console.log('');
  success('Access was DENIED by bucket policy — no data exfiltration');
  failure('Credential svc-legacy-etl used from unauthorized IP — possible credential compromise');
  warning('Same credential flagged in AC-2 finding (no MFA)');

  subheader('Correlated Signals');
  table(
    ['Time', 'Signal', 'Severity', 'Related'],
    [
      [timestamp(25), 'Impossible travel: svc-legacy-etl used from 2 geos in 5min', colors.yellow('MEDIUM'), 'Same IAM user'],
      [timestamp(22), 'S3 GetObject from unapproved IP', colors.red('HIGH'), 'Same IAM user'],
      [timestamp(21), 'S3 ListBuckets from unapproved IP (14 buckets enumerated)', colors.red('HIGH'), 'Same IAM user'],
      [timestamp(20), 'IAM GetUser reconnaissance activity', colors.yellow('MEDIUM'), 'Same IAM user'],
    ]
  );

  console.log('');
  failure('Signal chain indicates credential compromise with active reconnaissance');
  info('Cloud SIEM correlated 4 signals into 1 security incident automatically');

  talkingPoint('Cloud SIEM ties directly to CSPM findings. The svc-legacy-etl account that was flagged for missing MFA is now the attack vector. This is the story that makes compliance real: the AC-2 finding was not just a checkbox — it was an active risk that an attacker exploited.');
  await pause(0, 'Vulnerability Scan');

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. VULNERABILITY SCAN — RUNTIME CONTEXT
  // ═══════════════════════════════════════════════════════════════════════════

  header('4. Infrastructure Vulnerability Management');

  console.log(colors.dim('  Datadog Security > Vulnerabilities > GovCloud Environment'));
  console.log('');
  metric('hosts scanned', 247, '', ['env:govcloud-prod']);
  metric('total vulnerabilities', 1842, '', []);
  metric('critical (CVSS 9.0+)', 3, '', [colors.red('requires action')]);
  metric('high (CVSS 7.0-8.9)', 28, '', [colors.yellow('review')]);
  console.log('');
  subheader('Critical Vulnerabilities — Runtime Analysis');
  table(
    ['CVE', 'CVSS', 'Package', 'Host', 'Network Exposed', 'Exploitable', 'Priority'],
    [
      [colors.red('CVE-2026-1847'), '9.8', 'openssl 3.1.0', 'web-ext-01', colors.red('Yes'), colors.red('Yes'), colors.red('P0 — Fix Now')],
      ['CVE-2026-2103', '9.1', 'log4j 2.17.0', 'batch-proc-12', 'No', colors.green('No'), colors.green('P3 — Contained')],
      ['CVE-2026-0891', '9.4', 'curl 8.4.0', 'k8s-node-07', 'No (pod)', colors.green('No'), colors.green('P3 — Contained')],
    ]
  );

  console.log('');
  info('Runtime context reduces actionable criticals from 3 to 1');
  failure('CVE-2026-1847: openssl on internet-facing host with active network exposure — URGENT');
  success('CVE-2026-2103, CVE-2026-0891: in containers without network path — no exploitation route');

  talkingPoint('This is huge for defense contractors who get flooded with thousands of CVEs. Datadog adds runtime context: is the vulnerable package on a host with network exposure? Is there an actual exploitation path? 3 criticals become 1 actionable — that is triage at machine speed.');
  await pause(0, 'Compliance Report');

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. COMPLIANCE REPORT — AUDITOR VIEW
  // ═══════════════════════════════════════════════════════════════════════════

  header('5. Compliance Report — Auto-Generated for 3PAO');

  console.log(colors.dim('  Datadog CSPM > Reports > FedRAMP Moderate > Generated ' + timestamp(0)));
  console.log('');
  table(
    ['Control Family', 'Total', 'Pass', 'Warn', 'Fail', 'Score', '30d Trend'],
    [
      ['Access Control (AC)', '20', '18', '1', '1', colors.yellow('90.0%'), colors.yellow('↓ 5%')],
      ['Audit & Accountability (AU)', '14', '14', '0', '0', colors.green('100%'), colors.green('stable')],
      ['Security Assessment (CA)', '9', '8', '1', '0', colors.yellow('88.9%'), colors.green('↑ 2%')],
      ['Config Management (CM)', '11', '11', '0', '0', colors.green('100%'), colors.green('stable')],
      ['Contingency Planning (CP)', '12', '12', '0', '0', colors.green('100%'), colors.green('stable')],
      ['Identification & Auth (IA)', '11', '10', '0', '1', colors.yellow('90.9%'), colors.red('↓ 9%')],
      ['Incident Response (IR)', '8', '8', '0', '0', colors.green('100%'), colors.green('stable')],
      ['System & Comms (SC)', '25', '23', '0', '2', colors.yellow('92.0%'), colors.yellow('↓ 4%')],
      ['System & Info Integ. (SI)', '15', '14', '1', '0', colors.yellow('93.3%'), colors.green('stable')],
      [colors.bold('TOTAL'), colors.bold('331'), colors.bold('312'), colors.bold('14'), colors.bold('5'), colors.bold('94.2%'), '—'],
    ]
  );

  console.log('');
  info('Report exported as PDF + machine-readable OSCAL format');
  info('Evidence artifacts auto-attached: CloudTrail logs, config snapshots, scan results');
  success('Report generation time: 8 seconds (vs 3 weeks manual compilation)');

  talkingPoint('The compliance report is auto-generated in OSCAL format — the standard FedRAMP wants. Evidence is attached automatically. What used to take an ISSM 3 weeks of spreadsheet work is now an 8-second export. And because it is continuous, the 3PAO sees the real posture, not a point-in-time snapshot that is already stale.');
  await pause(0, 'Remediation');

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. REMEDIATION AUTOMATION
  // ═══════════════════════════════════════════════════════════════════════════

  header('6. Remediation Automation — Workflow Execution');

  console.log(colors.dim('  Datadog Workflows > Triggered: fedramp-remediation-auto'));
  console.log('');
  console.log(colors.bold('  Automated Remediation Steps:'));
  console.log('');
  success('AC-2: Disabled IAM user svc-legacy-migrate (never used — orphaned)');
  success('AC-2: Enforced MFA on svc-legacy-etl, svc-legacy-report');
  success('AC-2: Rotated access keys for svc-legacy-etl (compromised credential)');
  success('IA-5: Rotated access key for deploy-bot (>90 day old key)');
  success('SC-7: Restricted sg-0a7f3c2e ingress to 10.0.0.0/8 (internal only)');
  success('SC-7: Restricted sg-0b8d4e1f ingress to VPN CIDR 172.16.0.0/12');
  warning('SC-8: ALB listener change requires approval — ticket created (CHG-4891)');
  warning('SC-28: S3 encryption change requires data re-encryption — ticket created (CHG-4892)');
  console.log('');
  console.log(colors.dim('  Post-remediation compliance scan:'));
  console.log(`  ${colors.bold('Compliance Score:')} ${colors.yellow('94.2%')} → ${colors.green('97.6%')} (3 controls fixed, 2 pending approval)`);
  console.log('');
  info('Automated remediation completed in 47 seconds');
  info('2 controls require manual approval (change management policy)');

  talkingPoint('Automation with guardrails. The easy fixes — disabling orphaned accounts, restricting security groups, rotating keys — execute automatically. The risky changes — ALB protocol change, S3 re-encryption — create change tickets that require human approval. This respects the defense contractor change management process while still moving fast.');
  await pause(0, 'Business Impact');

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. BUSINESS IMPACT
  // ═══════════════════════════════════════════════════════════════════════════

  header('7. Business Impact Summary');

  table(
    ['Metric', 'Before Datadog', 'With Datadog', 'Improvement'],
    [
      ['Audit prep time', '3 weeks', colors.green('2 days'), '90% reduction'],
      ['Compliance visibility', 'Quarterly snapshot', colors.green('Continuous (real-time)'), 'Always current'],
      ['Control failure detection', 'Next audit (90+ days)', colors.green('< 5 minutes'), '99.99% faster'],
      ['Vulnerability triage', '3 criticals to fix', colors.green('1 actually exploitable'), '67% noise reduction'],
      ['Incident correlation', 'Manual (hours)', colors.green('Automatic (seconds)'), 'SIEM + CSPM linked'],
      ['Remediation execution', 'Days (tickets + calls)', colors.green('47 seconds (automated)'), 'Near-instant'],
      ['Audit documentation', 'Manual spreadsheets', colors.green('OSCAL auto-export'), 'Zero manual work'],
      ['3PAO confidence', 'Uncertain', colors.green('Evidence-backed'), 'Pass rate ↑'],
    ]
  );

  console.log('');
  success('Compliance score improved from 94.2% to 97.6% in under 1 hour');
  success('Credential compromise detected and remediated before data exfiltration');
  success('Audit prep reduced from 3 weeks to 2 days');
  success('Continuous monitoring satisfies FedRAMP CA-7 (Continuous Monitoring) requirement');
  console.log('');
  separator();
  console.log(colors.dim('\n  End of investigation simulation.\n'));
}

run().catch(console.error);
