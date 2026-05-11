'use strict';

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// 1. Run the demo and capture raw ANSI output
// ---------------------------------------------------------------------------

const rootDir = path.resolve(__dirname, '..');
const demoScript = path.join(rootDir, 'demos', 'llm-hallucination-detection.js');
const outFile = path.join(rootDir, 'demos', 'demo.svg');

let raw;
try {
  raw = execFileSync('node', [demoScript], {
    cwd: rootDir,
    env: { ...process.env, FORCE_COLOR: '1' },
    encoding: 'utf-8',
    maxBuffer: 10 * 1024 * 1024,
  });
} catch (err) {
  console.error('Failed to run demo script:', err.message);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 2. Trim to first 45 lines
// ---------------------------------------------------------------------------

const allLines = raw.split('\n');
const lines = allLines.slice(0, 45);

// ---------------------------------------------------------------------------
// 3. ANSI → SVG conversion helpers
// ---------------------------------------------------------------------------

const ANSI_COLOR_MAP = {
  '31': '#e74c3c',   // red
  '32': '#2ecc71',   // green
  '33': '#f39c12',   // yellow
  '34': '#3498db',   // blue
  '35': '#9b59b6',   // magenta
  '36': '#632ca6',   // cyan
};

function xmlEscape(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Parse a single line of text containing ANSI escape codes and return an
 * array of SVG <tspan> fragments.
 */
function ansiLineToTspans(line) {
  const parts = [];
  let bold = false;
  let dim = false;
  let color = null;   // hex string or null (default)

  // Split the string around ANSI escape sequences, keeping the sequences.
  const tokens = line.split(/(\x1b\[[0-9;]*m)/);

  for (const token of tokens) {
    if (!token) continue;

    const ansiMatch = token.match(/^\x1b\[([0-9;]*)m$/);
    if (ansiMatch) {
      const codes = ansiMatch[1].split(';').filter(Boolean);
      for (const code of codes) {
        if (code === '0') {
          bold = false;
          dim = false;
          color = null;
        } else if (code === '1') {
          bold = true;
        } else if (code === '2') {
          dim = true;
        } else if (ANSI_COLOR_MAP[code]) {
          color = ANSI_COLOR_MAP[code];
        }
      }
      continue;
    }

    // Regular text — emit a tspan
    const text = xmlEscape(token);
    if (!text) continue;

    const attrs = [];
    if (color) attrs.push(`fill="${color}"`);
    if (bold) attrs.push('font-weight="bold"');
    if (dim) attrs.push('opacity="0.6"');

    if (attrs.length > 0) {
      parts.push(`<tspan ${attrs.join(' ')}>${text}</tspan>`);
    } else {
      parts.push(text);
    }
  }

  return parts.join('');
}

// ---------------------------------------------------------------------------
// 4. Build the SVG
// ---------------------------------------------------------------------------

const FONT_SIZE = 13;
const LINE_HEIGHT = 18;
const PADDING_X = 20;
const PADDING_Y = 20;
const TITLE_BAR_HEIGHT = 36;
const MAX_WIDTH = 900;
const BG_COLOR = '#1a1a2e';
const TITLE_BAR_COLOR = '#16213e';
const TEXT_COLOR = '#e0e0e0';
const TITLE_TEXT = 'Datadog Investigation — LLM Hallucination Detection';

const contentHeight = lines.length * LINE_HEIGHT + PADDING_Y * 2;
const totalHeight = TITLE_BAR_HEIGHT + contentHeight;

const svgLines = [];

svgLines.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MAX_WIDTH} ${totalHeight}" width="${MAX_WIDTH}" height="${totalHeight}">`);

// Background + rounded rect
svgLines.push(`  <rect width="${MAX_WIDTH}" height="${totalHeight}" rx="8" ry="8" fill="${BG_COLOR}" />`);

// Title bar
svgLines.push(`  <rect width="${MAX_WIDTH}" height="${TITLE_BAR_HEIGHT}" rx="8" ry="8" fill="${TITLE_BAR_COLOR}" />`);
// Cover the bottom-left/right rounding of the title bar so it looks flush
svgLines.push(`  <rect y="${TITLE_BAR_HEIGHT - 8}" width="${MAX_WIDTH}" height="8" fill="${TITLE_BAR_COLOR}" />`);

// Window control dots
svgLines.push(`  <circle cx="18" cy="${TITLE_BAR_HEIGHT / 2}" r="6" fill="#e74c3c" />`);
svgLines.push(`  <circle cx="38" cy="${TITLE_BAR_HEIGHT / 2}" r="6" fill="#f39c12" />`);
svgLines.push(`  <circle cx="58" cy="${TITLE_BAR_HEIGHT / 2}" r="6" fill="#2ecc71" />`);

// Title text
svgLines.push(`  <text x="${MAX_WIDTH / 2}" y="${TITLE_BAR_HEIGHT / 2 + 4}" text-anchor="middle" font-family="Consolas, Monaco, monospace" font-size="12" fill="#a0a0b0">${xmlEscape(TITLE_TEXT)}</text>`);

// Content area — each line as a <text> element
const baseY = TITLE_BAR_HEIGHT + PADDING_Y + FONT_SIZE;

for (let i = 0; i < lines.length; i++) {
  const y = baseY + i * LINE_HEIGHT;
  const content = ansiLineToTspans(lines[i]);
  svgLines.push(`  <text x="${PADDING_X}" y="${y}" font-family="Consolas, Monaco, monospace" font-size="${FONT_SIZE}" fill="${TEXT_COLOR}" xml:space="preserve">${content}</text>`);
}

svgLines.push('</svg>');

// ---------------------------------------------------------------------------
// 5. Write output
// ---------------------------------------------------------------------------

const svg = svgLines.join('\n');
fs.writeFileSync(outFile, svg, 'utf-8');
console.log(`SVG written to ${outFile} (${lines.length} lines, ${(svg.length / 1024).toFixed(1)} KB)`);
