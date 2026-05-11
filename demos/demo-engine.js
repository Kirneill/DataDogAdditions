'use strict';

const readline = require('readline');

// ─── ANSI Colors ──────────────────────────────────────────────────────────────

const colors = {
  red:     (t) => `\x1b[31m${t}\x1b[0m`,
  green:   (t) => `\x1b[32m${t}\x1b[0m`,
  yellow:  (t) => `\x1b[33m${t}\x1b[0m`,
  blue:    (t) => `\x1b[34m${t}\x1b[0m`,
  cyan:    (t) => `\x1b[36m${t}\x1b[0m`,
  magenta: (t) => `\x1b[35m${t}\x1b[0m`,
  bold:    (t) => `\x1b[1m${t}\x1b[0m`,
  dim:     (t) => `\x1b[2m${t}\x1b[0m`,
  reset:   '\x1b[0m',
};

// ─── Presentation Mode ───────────────────────────────────────────────────────

const presentMode = process.argv.includes('--present');

// ─── Timestamp Generators ────────────────────────────────────────────────────

function timestamp(minutesAgo) {
  const d = new Date(Date.now() - minutesAgo * 60 * 1000);
  return d.toISOString().replace(/\.\d{3}Z$/, 'Z').replace('Z', '');
}

function timeRange(startMinutesAgo, endMinutesAgo) {
  return `${timestamp(startMinutesAgo)} → ${timestamp(endMinutesAgo)}`;
}

// ─── Print Helpers ───────────────────────────────────────────────────────────

function header(text) {
  const line = '═'.repeat(70);
  console.log('');
  console.log(colors.bold(colors.cyan(`╔${line}╗`)));
  console.log(colors.bold(colors.cyan(`║  ${text.padEnd(68)}║`)));
  console.log(colors.bold(colors.cyan(`╚${line}╝`)));
  console.log('');
}

function subheader(text) {
  console.log('');
  console.log(colors.bold(colors.blue(`  ─── ${text} ${'─'.repeat(Math.max(0, 58 - text.length))}`)));
  console.log('');
}

function metric(name, value, unit, tags) {
  const tagStr = tags && tags.length ? colors.dim(` [${tags.join(', ')}]`) : '';
  const formattedVal = typeof value === 'number' ? value.toLocaleString() : value;
  console.log(`  ${colors.cyan(name)} = ${colors.bold(formattedVal)}${unit ? colors.yellow(unit) : ''}${tagStr}`);
}

function logLine(level, service, message, ts) {
  const time = ts || timestamp(0);
  const levelColors = {
    ERROR: colors.red,
    WARN:  colors.yellow,
    INFO:  colors.green,
    DEBUG: colors.dim,
  };
  const colorFn = levelColors[level] || colors.dim;
  console.log(`  ${colors.dim(time)} ${colorFn(`[${level}]`)} ${colors.bold(service)}: ${message}`);
}

function traceSpan(service, operation, duration, status, depth) {
  const indent = depth || 0;
  const prefix = indent === 0 ? '  ' : '  ' + '  '.repeat(indent - 1);
  const connector = indent === 0 ? '┌─' : '├─';
  const durStr = typeof duration === 'number' ? `${duration.toLocaleString()}ms` : duration;
  const statusIcon = status === 'OK' ? colors.green('✓') : colors.red('✗ ' + status);
  console.log(`${prefix}${connector} ${colors.bold(service)} ${colors.dim(operation)} ${colors.yellow(durStr)} ${statusIcon}`);
}

function alert(severity, monitor, message) {
  const sevColors = { P1: colors.red, P2: colors.yellow, P3: colors.blue, CRITICAL: colors.red, HIGH: colors.red, MEDIUM: colors.yellow, LOW: colors.blue };
  const colorFn = sevColors[severity] || colors.yellow;
  console.log(`  ${colorFn(`[ALERT] [${severity}]`)} ${colors.bold(monitor)}: ${message}`);
}

function table(headers, rows) {
  const allRows = [headers, ...rows];
  const widths = headers.map((_, i) =>
    Math.max(...allRows.map(r => stripAnsi(String(r[i] || '')).length))
  );

  const divider = '  ┌' + widths.map(w => '─'.repeat(w + 2)).join('┬') + '┐';
  const midline = '  ├' + widths.map(w => '─'.repeat(w + 2)).join('┼') + '┤';
  const bottom  = '  └' + widths.map(w => '─'.repeat(w + 2)).join('┴') + '┘';

  console.log(divider);
  console.log('  │' + headers.map((h, i) => ` ${colors.bold(padCell(String(h), widths[i]))} `).join('│') + '│');
  console.log(midline);
  rows.forEach(row => {
    console.log('  │' + row.map((c, i) => ` ${padCell(String(c || ''), widths[i])} `).join('│') + '│');
  });
  console.log(bottom);
}

function separator() {
  console.log(colors.dim('  ' + '─'.repeat(70)));
}

function talkingPoint(text) {
  if (presentMode) {
    console.log('');
    console.log(colors.magenta(`  [💬 TALKING POINT] ${text}`));
  }
}

function pause(seconds, label) {
  if (!presentMode) return Promise.resolve();
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const prompt = label ? `  ${colors.dim(`Press ENTER to continue: ${label}`)}` : `  ${colors.dim('Press ENTER to continue...')}`;
    rl.question(prompt, () => {
      rl.close();
      resolve();
    });
  });
}

// ─── Status Indicators ──────────────────────────────────────────────────────

function success(text) {
  console.log(`  ${colors.green('✓')} ${colors.green(text)}`);
}

function failure(text) {
  console.log(`  ${colors.red('✗')} ${colors.red(text)}`);
}

function warning(text) {
  console.log(`  ${colors.yellow('⚠')} ${colors.yellow(text)}`);
}

function info(text) {
  console.log(`  ${colors.blue('ℹ')} ${colors.blue(text)}`);
}

// ─── Internal Helpers ────────────────────────────────────────────────────────

function stripAnsi(str) {
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

function padCell(str, width) {
  const visible = stripAnsi(str);
  const pad = Math.max(0, width - visible.length);
  return str + ' '.repeat(pad);
}

// ─── Exports ─────────────────────────────────────────────────────────────────

module.exports = {
  colors,
  presentMode,
  header,
  subheader,
  metric,
  logLine,
  traceSpan,
  alert,
  table,
  separator,
  talkingPoint,
  pause,
  timestamp,
  timeRange,
  success,
  failure,
  warning,
  info,
};
