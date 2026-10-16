#!/usr/bin/env node
'use strict';

// Harness for openspec/changes/total-sales-mom-comparison.
// One EVAL per Scenario in specs/total-sales-kpi/spec.md. Plain Node.js,
// no browser, no server, no npm packages.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DASHBOARD_PATH = path.join(ROOT, 'dashboard.html');
const HISTORY_PATH = path.join(__dirname, '.harness-history.json');

const DASHBOARD_HTML = fs.readFileSync(DASHBOARD_PATH, 'utf8');

function extractLiteral(pattern, label) {
  const match = DASHBOARD_HTML.match(pattern);
  if (!match) throw new Error(`${label} not found in dashboard.html`);
  // Evaluates a literal/arrow-function expression extracted verbatim from our own trusted file.
  // eslint-disable-next-line no-eval
  return eval(match[1]);
}

const SNAPSHOT = extractLiteral(/const SNAPSHOT = (\[[\s\S]*?\]);/, 'SNAPSHOT');
const fmtPct = extractLiteral(/const fmtPct = ([^\n]+);/, 'fmtPct');

function extractCalculationBlock() {
  const match = DASHBOARD_HTML.match(/const sumCompletedRevenue[\s\S]*?const revenueChange[\s\S]*?: null;/);
  if (!match) throw new Error('Revenue calculation block not found in dashboard.html');
  return match[0];
}

const CALCULATION_BLOCK = extractCalculationBlock();

// Runs the dashboard's *actual* calculation code (extracted verbatim), not a copy of it.
function runDashboardCalculation(rows) {
  const body = `${CALCULATION_BLOCK}\nreturn { currentMonthRevenue, previousMonthRevenue, revenueDifference, revenueChange };`;
  // eslint-disable-next-line no-new-func
  const fn = new Function('filtered', 'nonDateFiltered', 'fmtPct', body);
  return fn(rows, rows, fmtPct);
}

// Independent re-implementation of the spec's formula, never reusing dashboard code.
function computeExpected(rows) {
  const periodOf = row => row.year * 12 + row.month - 1;
  const maxPeriod = Math.max(...rows.map(periodOf));
  const sumRevenueForPeriod = period => rows
    .filter(row => row.status === 'Completada' && periodOf(row) === period)
    .reduce((total, row) => total + Number(row.revenue || 0), 0);
  const current = sumRevenueForPeriod(maxPeriod);
  const previous = sumRevenueForPeriod(maxPeriod - 1);
  const difference = current - previous;
  const change = previous === 0 ? 'N/A' : `${((difference / previous) * 100).toFixed(1)}%`;
  return { current, previous, difference, change };
}

function domAssignsFrom(id, variableName) {
  const re = new RegExp(`#${id}'\\)\\.textContent\\s*=\\s*[^;]*\\b${variableName}\\b`);
  return re.test(DASHBOARD_HTML);
}

function closeEnough(a, b) {
  return typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) < 0.005;
}

// Deterministic edge-case fixture: only the current month has rows, so the
// previous month's revenue is necessarily zero, regardless of live data.
const ZERO_PREVIOUS_FIXTURE = [
  { year: 2030, month: 2, channel: 'Online', userType: 'Registrado', promotion: 'Sin promocion', category: 'Test', status: 'Completada', units: 1, revenue: 100 },
];

function evalSafe(fn) {
  try {
    return { ok: true, value: fn() };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

const results = [];
function addResult(id, scenario, outcome) {
  results.push({ id, scenario, ...outcome });
}

// EVAL-001..004 use the live snapshot.
{
  const live = evalSafe(() => ({
    expected: computeExpected(SNAPSHOT),
    actual: runDashboardCalculation(SNAPSHOT),
  }));

  if (!live.ok) {
    ['current month total is shown', 'previous month total is shown', 'euro difference is current minus previous', 'percentage change is calculated']
      .forEach((scenario, i) => addResult(`EVAL-00${i + 1}`, scenario, { status: 'FAIL', expected: null, actual: null, note: live.error }));
  } else {
    const { expected, actual } = live.value;

    addResult('EVAL-001', 'current month total is shown', {
      status: closeEnough(actual.currentMonthRevenue, expected.current) && domAssignsFrom('kpiRevenue', 'currentMonthRevenue') ? 'PASS' : 'FAIL',
      expected: expected.current,
      actual: actual.currentMonthRevenue,
    });

    addResult('EVAL-002', 'previous month total is shown', {
      status: closeEnough(actual.previousMonthRevenue, expected.previous) && domAssignsFrom('kpiRevenuePrevious', 'previousMonthRevenue') ? 'PASS' : 'FAIL',
      expected: expected.previous,
      actual: actual.previousMonthRevenue,
    });

    addResult('EVAL-003', 'euro difference is current minus previous', {
      status: closeEnough(actual.revenueDifference, expected.difference) && domAssignsFrom('kpiRevenueDifference', 'revenueDifference') ? 'PASS' : 'FAIL',
      expected: expected.difference,
      actual: actual.revenueDifference,
    });

    if (expected.previous > 0) {
      addResult('EVAL-004', 'percentage change is calculated', {
        status: actual.revenueChange === expected.change && domAssignsFrom('kpiRevenueChange', 'revenueChange') ? 'PASS' : 'FAIL',
        expected: expected.change,
        actual: actual.revenueChange,
      });
    } else {
      addResult('EVAL-004', 'percentage change is calculated', {
        status: 'FAIL',
        expected: 'previous > 0 required',
        actual: 'live dataset previous month is zero',
        note: 'Cannot exercise the normal branch with live data.',
      });
    }
  }
}

// EVAL-005 uses a synthetic fixture so the zero-previous edge case is deterministic.
{
  const fixture = evalSafe(() => ({
    expected: computeExpected(ZERO_PREVIOUS_FIXTURE),
    actual: runDashboardCalculation(ZERO_PREVIOUS_FIXTURE),
  }));

  if (!fixture.ok) {
    addResult('EVAL-005', 'percentage change is N/A when previous is zero', { status: 'FAIL', expected: 'N/A', actual: null, note: fixture.error });
  } else {
    const { expected, actual } = fixture.value;
    addResult('EVAL-005', 'percentage change is N/A when previous is zero', {
      status: actual.revenueChange === 'N/A' && expected.change === 'N/A' ? 'PASS' : 'FAIL',
      expected: expected.change,
      actual: actual.revenueChange,
    });
  }
}

function loadHistory() {
  try {
    return JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf8'));
  } catch {
    return [];
  }
}

const history = loadHistory();
const lastRun = history[history.length - 1];
const lastStatusById = new Map((lastRun ? lastRun.results : []).map(r => [r.id, r.status]));

console.log('## Harness: total-sales-mom-comparison\n');
console.log('| EVAL | Scenario | Expected | Actual | Result |');
console.log('| --- | --- | --- | --- | --- |');

let passCount = 0;
for (const r of results) {
  const transition = lastStatusById.has(r.id) && lastStatusById.get(r.id) !== r.status
    ? ` (${lastStatusById.get(r.id)} \u2192 ${r.status})`
    : '';
  console.log(`| ${r.id} | ${r.scenario} | ${JSON.stringify(r.expected)} | ${JSON.stringify(r.actual)} | ${r.status}${transition} |`);
  if (r.status === 'PASS') passCount += 1;
}

console.log(`\nSummary: ${passCount}/${results.length} PASS`);

history.push({
  timestamp: new Date().toISOString(),
  results: results.map(r => ({ id: r.id, scenario: r.scenario, status: r.status })),
  summary: `${passCount}/${results.length} PASS`,
});
fs.writeFileSync(HISTORY_PATH, `${JSON.stringify(history, null, 2)}\n`);

process.exit(passCount === results.length ? 0 : 1);
