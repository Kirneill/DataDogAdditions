'use strict';

const {
  colors, header, subheader, metric, logLine, traceSpan, alert,
  table, separator, talkingPoint, pause, timestamp, timeRange,
  success, failure, warning, info, presentMode,
} = require('./demo-engine');

async function run() {
  console.log(colors.bold(colors.cyan('\n  Datadog Investigation — Black Friday Checkout Latency Spike')));
  console.log(colors.dim(`  Simulated ${timestamp(0)} | Environment: prod-us-south-1\n`));

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. ALERT TRIGGERS
  // ═══════════════════════════════════════════════════════════════════════════

  header('1. Monitor Alert — Checkout Latency Threshold Breach');

  alert('P1', 'checkout-latency-p99', `p99 latency > 3,000ms for the last 5m on env:prod, service:checkout-service`);
  console.log('');
  metric('trace.servlet.request.duration.p99', 4102, 'ms', ['env:prod', 'service:checkout-service']);
  metric('trace.servlet.request.duration.p50', 890, 'ms', ['env:prod', 'service:checkout-service']);
  metric('trace.servlet.request.duration.p99 (baseline)', 195, 'ms', ['env:prod', 'service:checkout-service']);
  console.log('');
  warning('p99 latency jumped 21x from baseline (195ms → 4,102ms)');
  failure('SLO breach: 99.9% target, currently at 94.2% — burning error budget at 58x normal rate');

  talkingPoint('Notice the monitor fires on p99, not average — averages hide tail latency. For a retailer doing $50K/min in checkout revenue, even 5% of users hitting 4s latency means abandoned carts.');
  await pause(0, 'Service Map');

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. SERVICE MAP
  // ═══════════════════════════════════════════════════════════════════════════

  header('2. Service Map — Dependency Chain');

  console.log(colors.dim('  Datadog APM > Service Map > checkout-service downstream'));
  console.log('');
  console.log(`  ┌──────────────────┐     ┌──────────────────┐     ${colors.red('┌──────────────────┐')}     ┌──────────────────┐`);
  console.log(`  │  ${colors.green('checkout-svc')}   │────▶│  ${colors.green('payment-svc')}    │────▶${colors.red('│  inventory-svc   │')}────▶│  ${colors.green('postgres-db')}    │`);
  console.log(`  │  p99: 4,102ms   │     │  p99: 120ms      │     ${colors.red('│  p99: 3,241ms    │')}     │  p99: 3,198ms    │`);
  console.log(`  │  ${colors.yellow('▲ 21x')}           │     │  ${colors.green('✓ normal')}        │     ${colors.red('│  ▲ 16x  ✗ ERROR  │')}     │  ${colors.red('▲ 16x')}            │`);
  console.log(`  └──────────────────┘     └──────────────────┘     ${colors.red('└──────────────────┘')}     └──────────────────┘`);
  console.log('');
  info('Hotspot identified: inventory-service → postgres query path');
  failure('inventory-service error rate: 12.4% (baseline: 0.1%)');

  talkingPoint('The Service Map immediately narrows the blast radius. Payment-service is healthy — the problem is downstream in inventory. This is the power of distributed tracing: you skip the guesswork.');
  await pause(0, 'Distributed Trace');

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. DISTRIBUTED TRACE
  // ═══════════════════════════════════════════════════════════════════════════

  header('3. Distributed Trace — Slowest Request');

  console.log(colors.dim(`  Trace ID: 7a4f8e2c-1b3d-4e5f-9a6b-8c7d0e1f2a3b`));
  console.log(colors.dim(`  ${timestamp(12)} | Duration: 4,102ms | Spans: 14`));
  console.log('');
  traceSpan('checkout-service', 'POST /api/v1/checkout', 4102, 'ERROR', 0);
  traceSpan('auth-service', 'POST /validate-token', 8, 'OK', 1);
  traceSpan('cart-service', 'GET /cart/usr-44819', 23, 'OK', 1);
  traceSpan('payment-service', 'POST /authorize', 120, 'OK', 1);
  traceSpan('inventory-service', 'GET /stock/check-multi', 3241, 'ERROR', 1);
  traceSpan('postgres', 'SELECT stock_count FROM inventory...', 3198, 'ERROR', 2);
  traceSpan('notification-service', 'POST /email/order-confirm', 0, 'SKIPPED', 1);
  console.log('');
  separator();
  console.log('');
  console.log(colors.dim('  Span detail: postgres query'));
  console.log(colors.red('  ┌─────────────────────────────────────────────────────────────────┐'));
  console.log(colors.red('  │') + `  Duration: ${colors.bold('3,198ms')}   Rows returned: ${colors.bold('0')}   Rows scanned: ${colors.bold('4,218,907')}  ${colors.red('│')}`);
  console.log(colors.red('  └─────────────────────────────────────────────────────────────────┘'));

  talkingPoint('Key detail: 4.2 million rows scanned to return 0 results. That is a sequential scan — no index hit. This single span accounts for 78% of total request latency.');
  await pause(0, 'Database Monitoring');

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. DATABASE MONITORING
  // ═══════════════════════════════════════════════════════════════════════════

  header('4. Database Monitoring — Slow Query Analysis');

  console.log(colors.dim('  Datadog DBM > Top Queries > sorted by avg latency'));
  console.log('');
  console.log(colors.yellow('  Query (normalized):'));
  console.log(colors.bold('  SELECT stock_count FROM inventory'));
  console.log(colors.bold('  WHERE sku_id IN (SELECT sku_id FROM flash_sale_items)'));
  console.log(colors.bold('  AND warehouse_region = ?'));
  console.log('');
  metric('avg latency', 3198, 'ms', ['db:inventory-prod', 'host:pg-south-01']);
  metric('calls/min', 8400, '', ['env:prod']);
  metric('rows scanned/call', '4,218,907', '', []);
  metric('rows returned/call', 0.3, '', []);
  console.log('');
  subheader('Explain Plan');
  console.log(colors.dim('  ─────────────────────────────────────────────────────'));
  console.log(`  ${colors.red('Seq Scan')} on inventory  (cost=0.00..${colors.red('892,104')}.23 rows=4218907 width=8)`);
  console.log(`    Filter: (warehouse_region = 'south-central')`);
  console.log(`      ${colors.red('Seq Scan')} on flash_sale_items  (cost=0.00..${colors.red('28,441')}.00 rows=847201 width=4)`);
  console.log(colors.dim('  ─────────────────────────────────────────────────────'));
  console.log('');
  failure('Missing index on flash_sale_items.sku_id — full table scan on every checkout');
  failure('flash_sale_items table grew from 12K to 847K rows when Black Friday flash sales loaded at 13:45 UTC');
  info('Recommendation: CREATE INDEX idx_flash_sale_sku ON flash_sale_items(sku_id);');

  talkingPoint('Database Monitoring gives you the explain plan without SSH-ing into the DB host. For a retailer, this is critical — the DBA sees the exact query, the plan, and the calling service all in one view. No war-room finger-pointing.');
  await pause(0, 'Watchdog');

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. WATCHDOG ALERT
  // ═══════════════════════════════════════════════════════════════════════════

  header('5. Watchdog — Anomaly Detected Before Threshold Breach');

  console.log(colors.magenta('  🐕 Watchdog Anomaly Detection'));
  console.log('');
  console.log(`  ${colors.bold('Anomaly detected at:')} ${timestamp(53)} (${colors.green('8 minutes BEFORE monitor threshold breach')})`);
  console.log(`  ${colors.bold('Monitor triggered at:')} ${timestamp(45)}`);
  console.log('');
  console.log(colors.bold('  Root Cause Summary:'));
  console.log(`  inventory-service database query latency increased ${colors.red('16x')} at ${timestamp(53)}`);
  console.log(`  correlating with flash_sale_items table load at ${timestamp(55)} (847K rows inserted)`);
  console.log('');
  info('Watchdog uses unsupervised ML — no manual threshold tuning required');
  success('Anomaly correctly identified root cause: missing index + data volume spike');

  talkingPoint('Watchdog caught this 8 minutes before the static monitor. In a real scenario, that is 8 minutes of additional revenue protected. The ML baseline adapts — you do not need to manually tune thresholds every time traffic patterns change.');
  await pause(0, 'Resolution Timeline');

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. RESOLUTION TIMELINE
  // ═══════════════════════════════════════════════════════════════════════════

  header('6. Resolution Timeline');

  table(
    ['Timestamp', 'Event', 'Impact'],
    [
      [timestamp(55), 'Flash sale items bulk loaded (847K rows)', 'flash_sale_items table 70x larger'],
      [timestamp(53), colors.magenta('Watchdog anomaly detected'), 'Auto-correlated with DB query spike'],
      [timestamp(52), 'On-call SRE paged via PagerDuty', 'MTTR clock starts'],
      [timestamp(45), colors.red('P1 monitor alert fires'), 'p99 > 3,000ms for 5m'],
      [timestamp(40), 'SRE opens trace, finds slow query', 'Root cause identified in 5 clicks'],
      [timestamp(35), 'DBA applies index on flash_sale_items', 'CREATE INDEX completes in 90s'],
      [timestamp(33), colors.green('Latency returns to baseline'), 'p99 back to 210ms'],
      [timestamp(30), 'Incident resolved, postmortem started', 'Total MTTR: 22 minutes'],
    ]
  );

  talkingPoint('Walk through the timeline — emphasize that root cause was identified in under 5 minutes. The traditional approach (check dashboards, SSH into hosts, read logs, guess) would take 45+ minutes.');
  await pause(0, 'Business Impact');

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. BUSINESS IMPACT
  // ═══════════════════════════════════════════════════════════════════════════

  header('7. Business Impact Summary');

  table(
    ['Metric', 'Before Datadog', 'With Datadog', 'Improvement'],
    [
      ['Mean Time to Detect', '25 min', colors.green('0 min (Watchdog)'), '25 min saved'],
      ['Mean Time to Root Cause', '45 min', colors.green('5 min'), '89% faster'],
      ['Mean Time to Resolve', '60 min', colors.green('22 min'), '63% faster'],
      ['Revenue loss rate', '$50K/min', '$50K/min', '—'],
      ['Total downtime', '60 min', colors.green('22 min'), '38 min saved'],
      ['Revenue protected', '—', colors.green('$1.9M'), colors.bold('$1.9M saved')],
    ]
  );

  console.log('');
  success('Watchdog early detection saved 8 additional minutes = $400K');
  success('Distributed tracing eliminated war-room diagnosis = 40 min saved');
  success('Database Monitoring provided explain plan without DB access = instant root cause');
  console.log('');
  separator();
  console.log(colors.dim('\n  End of investigation simulation.\n'));
}

run().catch(console.error);
