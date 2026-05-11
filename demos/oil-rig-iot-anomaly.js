'use strict';

const {
  colors, header, subheader, metric, logLine, traceSpan, alert,
  table, separator, talkingPoint, pause, timestamp, timeRange,
  success, failure, warning, info, presentMode,
} = require('./demo-engine');

async function run() {
  console.log(colors.bold(colors.cyan('\n  Datadog Investigation — Offshore Oil Rig Sensor Anomaly')));
  console.log(colors.dim(`  Simulated ${timestamp(0)} | Rig: Deepwater Horizon II | Gulf of Mexico\n`));

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. ANOMALY DETECTION
  // ═══════════════════════════════════════════════════════════════════════════

  header('1. Watchdog Anomaly — Gradual Pressure Drift Detected');

  console.log(colors.magenta('  🐕 Watchdog Anomaly Detection — IoT Metrics'));
  console.log('');
  alert('MEDIUM', 'iot.pressure.anomaly', 'Statistical anomaly on sensor PRESS-0847 — gradual drift outside 3-sigma band over 180 minutes');
  console.log('');
  console.log(`  ${colors.bold('Detection type:')} Gradual drift (not threshold breach)`);
  console.log(`  ${colors.bold('Sensor:')}          PRESS-0847 | Well Head #4 | Depth: 8,200ft`);
  console.log(`  ${colors.bold('Expected range:')}  2,400 – 2,520 PSI (seasonal baseline)`);
  console.log(`  ${colors.bold('Current value:')}   ${colors.red('2,890 PSI')} (+15.4% above upper bound)`);
  console.log(`  ${colors.bold('Drift rate:')}      ${colors.yellow('+2.4 PSI/min sustained for 183 minutes')}`);
  console.log('');
  warning('This is NOT a threshold breach — static alerts would not fire until 3,200 PSI');
  info('Watchdog baseline trained on 90 days of fleet sensor data');

  talkingPoint('Critical distinction: traditional monitoring uses static thresholds. A gradual drift like this would go unnoticed until the pressure hit 3,200 PSI and triggered an emergency shutdown. Watchdog sees the statistical anomaly 4 hours earlier.');
  await pause(0, 'Sensor Dashboard');

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. SENSOR DASHBOARD
  // ═══════════════════════════════════════════════════════════════════════════

  header('2. Sensor Dashboard — Well Head #4 Pressure Array');

  console.log(colors.dim('  Datadog IoT Dashboard > Rig DH-II > Well Head #4 > Pressure Sensors'));
  console.log('');
  table(
    ['Sensor', 'Current PSI', 'Baseline PSI', 'Deviation', 'Status'],
    [
      ['PRESS-0843', '2,485', '2,460', colors.green('+1.0%'), colors.green('NORMAL')],
      ['PRESS-0844', '2,472', '2,460', colors.green('+0.5%'), colors.green('NORMAL')],
      ['PRESS-0845', '2,491', '2,460', colors.green('+1.3%'), colors.green('NORMAL')],
      ['PRESS-0846', '2,468', '2,460', colors.green('+0.3%'), colors.green('NORMAL')],
      ['PRESS-0847', colors.red('2,890'), '2,460', colors.red('+17.5%'), colors.red('ANOMALY')],
    ]
  );

  console.log('');
  subheader('PRESS-0847 Trend (last 3 hours)');
  console.log(colors.dim('  PSI'));
  console.log(`  2900 │                                                      ${colors.red('▄▄██')}`);
  console.log(`  2800 │                                                ${colors.red('▄▄██████')}`);
  console.log(`  2700 │                                          ${colors.yellow('▄▄████')}      `);
  console.log(`  2600 │                                    ${colors.yellow('▄▄████')}              `);
  console.log(`  2500 │${colors.green('████████████████████████████████')}                        `);
  console.log(`  2400 │${'─'.repeat(56)}`);
  console.log(`       └${'─'.repeat(56)}`);
  console.log(colors.dim('         -3h          -2h          -1h          now'));
  console.log('');
  failure('PRESS-0847 diverged from fleet baseline at ' + timestamp(183));

  talkingPoint('Four sensors are tightly clustered around baseline. One is diverging. This pattern — a single sensor drifting while neighbors remain stable — strongly indicates a sensor hardware fault, not a real pressure change.');
  await pause(0, 'Log Correlation');

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. LOG CORRELATION
  // ═══════════════════════════════════════════════════════════════════════════

  header('3. Log Correlation — Control System Logs');

  console.log(colors.dim('  Datadog Logs > source:scada-controller > sensor:PRESS-0847'));
  console.log('');
  logLine('WARN', 'scada-ctrl-wh4', 'Calibration drift warning: PRESS-0847 deviation 2.1% from peer avg', timestamp(170));
  logLine('INFO', 'scada-ctrl-wh4', 'Auto-recalibration attempted on PRESS-0847 — result: PARTIAL', timestamp(155));
  logLine('WARN', 'scada-ctrl-wh4', 'Calibration drift warning: PRESS-0847 deviation 5.8% from peer avg', timestamp(120));
  logLine('WARN', 'scada-ctrl-wh4', 'Calibration drift warning: PRESS-0847 deviation 8.4% from peer avg', timestamp(90));
  logLine('ERROR', 'scada-ctrl-wh4', 'Auto-recalibration FAILED on PRESS-0847 — transducer not responding to zero-point reset', timestamp(85));
  logLine('WARN', 'scada-ctrl-wh4', 'Calibration drift warning: PRESS-0847 deviation 12.1% from peer avg', timestamp(60));
  logLine('ERROR', 'scada-ctrl-wh4', 'PRESS-0847 reading outside confidence interval — recommend manual inspection', timestamp(30));
  console.log('');
  info('Log frequency for PRESS-0847 warnings: 1/hr → 4/hr over the drift window');
  failure('Auto-recalibration failed — hardware fault likely');

  talkingPoint('Logs and metrics are correlated automatically. The SCADA controller tried auto-recalibration and failed — that is the confirmation. Without Datadog, an operator would need to check the SCADA logs manually, which may not happen until the next shift handover.');
  await pause(0, 'Workflow Automation');

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. WORKFLOW AUTOMATION
  // ═══════════════════════════════════════════════════════════════════════════

  header('4. Workflow Automation — Incident Response');

  console.log(colors.dim('  Datadog Workflows > Triggered: iot-sensor-anomaly-runbook'));
  console.log('');
  console.log(colors.bold('  Automated Runbook Execution:'));
  console.log('');
  success('Step 1: Incident created — INC-2847 "Pressure sensor anomaly on Well Head #4"');
  success('Step 2: Field engineer on-call paged — Maria Santos (Rig DH-II, Shift A)');
  success('Step 3: Safety checklist initiated — API-RP-14C well control checklist');
  success('Step 4: Reduced production rate on WH-4 from 100% to 80% (precautionary)');
  success('Step 5: Sensor data snapshot archived for compliance (30 CFR 250)');
  console.log('');
  info('Total automation execution time: 14 seconds');
  info('Manual equivalent: ~35 minutes (calls, emails, paperwork)');

  talkingPoint('Workflow automation is the operational multiplier. On an offshore rig, the field engineer is physically distant — automation pages them instantly, starts the safety checklist, and reduces well production as a precaution. 14 seconds vs 35 minutes for the manual process.');
  await pause(0, 'Historical Comparison');

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. HISTORICAL COMPARISON
  // ═══════════════════════════════════════════════════════════════════════════

  header('5. Historical Comparison — Sensor vs Fleet Baseline');

  console.log(colors.dim('  Datadog Notebooks > IoT Fleet Analysis > PRESS-0847 vs peer group'));
  console.log('');
  table(
    ['Period', 'PRESS-0847 Avg', 'Fleet Avg', 'Std Dev', 'Status'],
    [
      ['-72h to -24h', '2,458 PSI', '2,460 PSI', '±12', colors.green('NORMAL')],
      ['-24h to -6h', '2,461 PSI', '2,459 PSI', '±14', colors.green('NORMAL')],
      ['-6h to -3h', '2,470 PSI', '2,462 PSI', '±11', colors.green('NORMAL')],
      ['-3h to -1h', colors.yellow('2,640 PSI'), '2,465 PSI', '±13', colors.yellow('DRIFTING')],
      ['-1h to now', colors.red('2,855 PSI'), '2,468 PSI', '±15', colors.red('ANOMALY')],
    ]
  );

  console.log('');
  info('Divergence began approximately 183 minutes ago');
  info('Similar pattern matched: PRESS-0612 failure on Rig DH-I (2025-11-14) — confirmed faulty transducer');

  talkingPoint('Pattern matching against historical fleet data is extremely valuable. Datadog has seen this exact failure mode before on a sister rig. That historical context gives the field engineer confidence in the diagnosis before they even inspect the sensor.');
  await pause(0, 'Resolution');

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. RESOLUTION
  // ═══════════════════════════════════════════════════════════════════════════

  header('6. Resolution — Field Engineer Report');

  console.log(colors.dim('  Datadog Case Management > INC-2847 > Resolution Notes'));
  console.log('');
  console.log(colors.bold('  Field Engineer: Maria Santos'));
  console.log(colors.bold('  Inspection Time: ' + timestamp(15)));
  console.log('');
  console.log('  Findings:');
  console.log('  • Physical inspection confirms corrosion on PRESS-0847 transducer membrane');
  console.log('  • Saltwater ingress through damaged cable gland (O-ring failure)');
  console.log('  • Transducer output drifting high due to membrane deformation');
  console.log('  • Adjacent sensors (PRESS-0843 through 0846) confirmed healthy');
  console.log('');
  success('Replacement transducer installed and calibrated');
  success('PRESS-0847 reading: 2,462 PSI (within baseline)');
  success('Production rate restored to 100% on WH-4');
  success('Incident closed: INC-2847');

  talkingPoint('The field engineer confirmed exactly what Datadog predicted: hardware fault. The key value story is that Datadog turned a potential emergency shutdown into a scheduled maintenance task.');
  await pause(0, 'Business Impact');

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. BUSINESS IMPACT
  // ═══════════════════════════════════════════════════════════════════════════

  header('7. Business Impact Summary');

  table(
    ['Metric', 'Without Datadog', 'With Datadog', 'Improvement'],
    [
      ['Detection method', 'Threshold breach at 3,200 PSI', colors.green('Anomaly at 2,650 PSI'), '4h earlier'],
      ['Detection delay', '~4 hours', colors.green('0 (continuous ML)'), '4h saved'],
      ['Outcome', colors.red('Emergency shutdown'), colors.green('Scheduled replacement'), 'No shutdown'],
      ['Production downtime', '18-24 hours', colors.green('2 hours (partial)'), '~90% less'],
      ['Revenue impact', colors.red('$2M+ (shutdown)'), colors.green('$45K (80% production)'), '$1.95M saved'],
      ['Safety risk', colors.red('High (pressure event)'), colors.green('Low (controlled)'), 'Prevented'],
      ['Compliance', 'Reactive incident report', colors.green('Proactive + archived'), 'Audit-ready'],
    ]
  );

  console.log('');
  success('Anomaly detected 4 hours before threshold breach');
  success('Emergency shutdown avoided — $2M+ downtime prevented');
  success('Automated incident response in 14 seconds');
  success('Historical pattern matching accelerated root cause');
  console.log('');
  separator();
  console.log(colors.dim('\n  End of investigation simulation.\n'));
}

run().catch(console.error);
