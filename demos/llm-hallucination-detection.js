'use strict';

const {
  colors, header, subheader, metric, logLine, traceSpan, alert,
  table, separator, talkingPoint, pause, timestamp, timeRange,
  success, failure, warning, info, presentMode,
} = require('./demo-engine');

async function run() {
  console.log(colors.bold(colors.cyan('\n  Datadog Investigation — LLM Hallucination Detection in Customer Service Agent')));
  console.log(colors.dim(`  Simulated ${timestamp(0)} | Environment: prod-us-west-2 | Org: RetailGenius Inc.\n`));

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. LLM OBSERVABILITY DASHBOARD
  // ═══════════════════════════════════════════════════════════════════════════

  header('1. LLM Observability Dashboard — Overview');

  console.log(colors.dim('  Datadog LLM Observability > AI Customer Service Agent > Today'));
  console.log('');
  table(
    ['Metric', 'Value', 'Trend', 'Status'],
    [
      ['Total conversations', colors.bold('12,400'), colors.green('↑ 8% vs yesterday'), colors.green('NORMAL')],
      ['Avg response latency', '2.3s', colors.green('↓ 0.1s'), colors.green('NORMAL')],
      ['Avg tokens/response', '847', colors.yellow('↑ 12%'), colors.yellow('ELEVATED')],
      ['Completion rate', '94.1%', colors.green('stable'), colors.green('NORMAL')],
      ['User satisfaction (CSAT)', '3.8/5', colors.yellow('↓ 0.3'), colors.yellow('DECLINING')],
      ['Hallucination rate', colors.red('8.2%'), colors.red('↑ 340%'), colors.red('CRITICAL')],
    ]
  );

  console.log('');
  alert('P2', 'llm.hallucination-rate', 'Hallucination rate exceeded 5% threshold — current: 8.2% (baseline: 1.9%)');
  console.log('');
  warning('Hallucination rate spiked from 1.9% to 8.2% starting 6 hours ago');
  info('1,017 conversations today flagged as potentially unfaithful to source documents');

  talkingPoint('LLM Observability gives you the same monitoring rigor for AI that you have for traditional services. Hallucination rate is a first-class metric — you can set monitors, track trends, and alert on it just like latency or error rate.');
  await pause(0, 'Trace Deep Dive');

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. TRACE DEEP DIVE — HALLUCINATED CONVERSATION
  // ═══════════════════════════════════════════════════════════════════════════

  header('2. Trace Deep Dive — Hallucinated Conversation');

  console.log(colors.dim(`  Trace ID: conv-9f2a1b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c`));
  console.log(colors.dim(`  ${timestamp(42)} | Customer: usr-88214 | Topic: Return Policy`));
  console.log('');
  traceSpan('agent-orchestrator', 'conversation.handle', 4820, 'OK', 0);
  traceSpan('embedding-service', 'embed.user-query', 45, 'OK', 1);
  traceSpan('retrieval-service', 'vector.search', 180, 'OK', 1);
  traceSpan('retrieval-service', 'rerank.results', 62, 'OK', 2);
  traceSpan('llm-gateway', 'gpt-4o.completion', 3100, colors.red('HALLUCINATED'), 1);
  traceSpan('response-service', 'format.response', 33, 'OK', 1);

  console.log('');
  separator();
  subheader('Conversation Detail');

  console.log(colors.dim('  User:'));
  console.log('  "What is your return policy for electronics?"');
  console.log('');
  console.log(colors.dim('  Retrieved Document (faithfulness source):'));
  console.log(colors.green('  "Electronics may be returned within 30 days of purchase with original'));
  console.log(colors.green('   receipt. Items must be in original packaging. Opened software and'));
  console.log(colors.green('   digital downloads are non-refundable."'));
  console.log('');
  console.log(colors.dim('  Agent Response:'));
  console.log(colors.red('  "Our electronics return policy allows returns within 90 days of'));
  console.log(colors.red('   purchase. You\'ll need your receipt and the item should be in'));
  console.log(colors.red('   reasonable condition. We also offer free return shipping!"'));
  console.log('');
  failure('Hallucination: "90 days" — source document says "30 days"');
  failure('Hallucination: "reasonable condition" — source says "original packaging"');
  failure('Hallucination: "free return shipping" — not mentioned in source');

  talkingPoint('This trace shows exactly where the hallucination happened. The retrieval step found the correct document — the LLM generation step produced unfaithful output. The span-level detail lets you isolate whether the problem is retrieval or generation, which determines the fix.');
  await pause(0, 'Evaluation Results');

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. EVALUATION RESULTS
  // ═══════════════════════════════════════════════════════════════════════════

  header('3. Evaluation Results — Faithfulness Scoring');

  console.log(colors.dim('  Datadog LLM Observability > Evaluations > faithfulness > last 100 conversations'));
  console.log('');
  metric('conversations evaluated', 100, '', ['eval:faithfulness']);
  metric('passing (score > 0.85)', 92, '', [colors.green('92%')]);
  metric('failing (score < 0.85)', 8, '', [colors.red('8%')]);
  console.log('');
  subheader('Failed Conversations');
  table(
    ['Conv ID', 'Topic', 'Faith. Score', 'Failure Reason'],
    [
      ['conv-9f2a..', 'Return policy', colors.red('0.31'), 'Wrong timeframe (90d vs 30d)'],
      ['conv-a3b7..', 'Return policy', colors.red('0.28'), 'Fabricated free shipping claim'],
      ['conv-c1d4..', 'Warranty terms', colors.red('0.42'), 'Wrong warranty duration (2yr vs 1yr)'],
      ['conv-e5f8..', 'Return policy', colors.red('0.35'), 'Wrong condition requirements'],
      ['conv-7a2b..', 'Price matching', colors.red('0.22'), 'Fabricated price match guarantee'],
      ['conv-d9e1..', 'Return policy', colors.red('0.39'), 'Mixed old and new policy terms'],
      ['conv-f3a6..', 'Shipping policy', colors.red('0.51'), 'Wrong free shipping threshold'],
      ['conv-b8c2..', 'Return policy', colors.red('0.33'), 'Wrong refund timeframe'],
    ]
  );

  console.log('');
  warning('Pattern: 6/8 failures involve return policy or warranty — topics that changed 2 weeks ago');
  info('Faithfulness eval compares generation output against retrieved source documents');

  talkingPoint('The evaluation system runs automatically on every conversation. Faithfulness scoring catches exactly what human review misses — subtle factual errors that sound plausible. The pattern here is clear: topics that recently changed are hallucinating at a much higher rate.');
  await pause(0, 'Cost Analysis');

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. TOKEN COST ANALYSIS
  // ═══════════════════════════════════════════════════════════════════════════

  header('4. Token Cost Analysis');

  console.log(colors.dim('  Datadog LLM Observability > Cost > Breakdown by conversation quality'));
  console.log('');
  table(
    ['Category', 'Avg Tokens', 'Avg Cost', 'Conversations', 'Total Cost'],
    [
      [colors.green('Normal conversations'), '847', '$0.12', '11,383', '$1,365.96'],
      [colors.red('Hallucinated conversations'), '1,890', '$0.34', '1,017', '$345.78'],
      [colors.yellow('  ...of which retry loops'), '2,410', '$0.41', '612', '$250.92'],
    ]
  );

  console.log('');
  metric('total daily LLM spend', '$1,711.74', '', ['service:ai-agent']);
  metric('waste from hallucinations', '$345.78', '', [colors.red('20.2% of spend')]);
  console.log('');
  warning('Hallucinated conversations cost 2.8x normal due to retry/clarification loops');
  info('Users in hallucinated conversations ask 2.4 follow-up questions on average (vs 0.8 normal)');

  talkingPoint('Cost visibility is a huge selling point. LLM costs are opaque by default — Datadog breaks them down per conversation, per span, per model. Showing that hallucinations cost 2.8x more makes the ROI argument concrete: fixing hallucinations saves money AND improves quality.');
  await pause(0, 'AI Agents Console');

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. AI AGENTS CONSOLE — TOOL CALL PATTERNS
  // ═══════════════════════════════════════════════════════════════════════════

  header('5. AI Agents Console — Tool Call Patterns');

  console.log(colors.dim('  Datadog LLM Observability > Agents > ai-customer-service > Tool Usage'));
  console.log('');
  table(
    ['Tool Call Pattern', 'Conversations', '% of Total', 'Avg Faithfulness', 'Signal'],
    [
      ['1 retrieval → 1 generation', '8,420', '67.9%', colors.green('0.94'), colors.green('HEALTHY')],
      ['1 retrieval → 2 generations', '2,350', '18.9%', colors.yellow('0.82'), colors.yellow('MARGINAL')],
      ['2 retrievals → 1 generation', '613', '4.9%', colors.green('0.91'), colors.green('HEALTHY')],
      [colors.red('3+ retrievals → generation'), colors.red('1,017'), colors.red('8.2%'), colors.red('0.36'), colors.red('FAILING')],
    ]
  );

  console.log('');
  failure('Conversations with 3+ retrieval attempts have 0.36 avg faithfulness');
  info('Pattern suggests the agent is "confused" — retrieving multiple times but not finding authoritative content');
  console.log('');
  console.log(colors.dim('  Example tool call sequence (conv-9f2a..):'));
  console.log(`  1. ${colors.cyan('retrieve')}("return policy electronics") → ${colors.green('doc-4281')} (updated 2w ago)`);
  console.log(`  2. ${colors.cyan('retrieve')}("electronics return window") → ${colors.yellow('doc-1847')} (archived, old policy)`);
  console.log(`  3. ${colors.cyan('retrieve')}("return timeframe days") → ${colors.yellow('doc-0923')} (FAQ, references old policy)`);
  console.log(`  4. ${colors.red('generate')}(context: conflicting docs) → ${colors.red('hallucinated response')}`);

  talkingPoint('The Agents console shows the tool call patterns that lead to failure. 3+ retrieval attempts is a distress signal — the agent is trying to reconcile conflicting information. The old policy docs are still in the vector store, creating confusion.');
  await pause(0, 'Bits AI Recommendation');

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. BITS AI RECOMMENDATION
  // ═══════════════════════════════════════════════════════════════════════════

  header('6. Bits AI — Root Cause Analysis & Recommendation');

  console.log(colors.magenta('  🤖 Bits AI Dev Agent — Automated Analysis'));
  console.log('');
  console.log(colors.bold('  Root Cause Identified:'));
  console.log('  The return policy was updated 14 days ago (doc-4281), but 3 related');
  console.log('  documents still reference the old 90-day return window:');
  console.log('');
  console.log(`    ${colors.red('•')} doc-1847: "Electronics Return Policy" (archived, not removed from index)`);
  console.log(`    ${colors.red('•')} doc-0923: "FAQ — Returns & Exchanges" (references old timeframe)`);
  console.log(`    ${colors.red('•')} doc-3156: "Holiday Return Extension" (references old base policy)`);
  console.log('');
  console.log(colors.bold('  Recommended Fix:'));
  console.log('  1. Remove stale documents from vector store (doc-1847, doc-0923, doc-3156)');
  console.log('  2. Update retrieval prompt to include document freshness as a ranking signal');
  console.log('  3. Add metadata filter: prefer docs updated within last 30 days when');
  console.log('     multiple conflicting results are retrieved');
  console.log('');
  info('Bits AI analyzed 1,017 failed conversations and 12,400 total in 3 minutes');
  success('Recommendation validated against historical data — similar fix reduced hallucinations 96% in test org');

  talkingPoint('Bits AI is doing the investigative work that would take a human ML engineer hours. It identified the stale document problem, traced it to the policy change 2 weeks ago, and provided a specific fix with historical validation. This is Datadog acting as an AI teammate, not just a dashboard.');
  await pause(0, 'Business Impact');

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. BUSINESS IMPACT — AFTER FIX
  // ═══════════════════════════════════════════════════════════════════════════

  header('7. Business Impact — After Remediation');

  console.log(colors.dim('  Results measured 24 hours after applying Bits AI recommendation'));
  console.log('');
  table(
    ['Metric', 'Before Fix', 'After Fix', 'Improvement'],
    [
      ['Hallucination rate', colors.red('8.2%'), colors.green('0.3%'), colors.bold('96% reduction')],
      ['CSAT score', '3.8/5', colors.green('4.4/5'), '+0.6 points (+15%)'],
      ['Avg tokens/conversation', '1,120', colors.green('780'), '-30% (less retry)'],
      ['Cost per conversation', '$0.16', colors.green('$0.096'), '-40%'],
      ['Daily LLM spend', '$1,711', colors.green('$1,190'), '-$521/day'],
      ['Escalation to human', '12.1%', colors.green('4.8%'), '-60%'],
      ['Monthly projected savings', '—', colors.green('$15,630'), colors.bold('$187K/year')],
    ]
  );

  console.log('');
  success('Hallucination rate: 8.2% → 0.3% — below 1% target');
  success('Customer satisfaction recovered +15 points in 24 hours');
  success('LLM cost reduced 40% by eliminating retry loops');
  success('Human escalation reduced 60% — agent handles more autonomously');
  console.log('');
  separator();
  console.log(colors.dim('\n  End of investigation simulation.\n'));
}

run().catch(console.error);
