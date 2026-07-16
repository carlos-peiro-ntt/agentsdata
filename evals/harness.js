(function () {
  const state = {
    results: [],
    json: null,
    timestamp: null
  };

  const els = {
    runBtn: document.getElementById('runBtn'),
    downloadBtn: document.getElementById('downloadBtn'),
    copyBtn: document.getElementById('copyBtn'),
    runStatePill: document.getElementById('runStatePill'),
    runStateText: document.getElementById('runStateText'),
    summaryMeta: document.getElementById('summaryMeta'),
    resultsBody: document.getElementById('resultsBody'),
    jsonOutput: document.getElementById('jsonOutput'),
    dashboardFrame: document.getElementById('dashboardFrame')
  };

  const forbiddenKeys = new Set([
    'nombre',
    'apellido',
    'email',
    'correo',
    'telefono',
    'teléfono',
    'postal',
    'codigo_postal',
    'código_postal',
    'fecha_nacimiento',
    'birth_date',
    'dob'
  ]);

  const userTypeLabelMap = new Map([
    ['Registrado', 'Registered'],
    ['No registrado', 'Guest']
  ]);

  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function makeResult(id, ac, result, summary, details) {
    return {
      id,
      ac,
      result,
      summary,
      details,
      timestamp: new Date().toISOString()
    };
  }

  function resultPillClass(result) {
    if (result === 'PASS') return 'pass';
    if (result === 'FAIL') return 'fail';
    if (result === 'BLOCKED') return 'blocked';
    return 'manual';
  }

  function setStatus(result, text) {
    els.runStatePill.className = `pill ${resultPillClass(result)}`;
    els.runStatePill.textContent = result.toLowerCase();
    els.runStateText.textContent = text;
  }

  function serialize(json) {
    return JSON.stringify(json, null, 2);
  }

  function renderResults() {
    els.resultsBody.innerHTML = state.results.map(item => `
      <tr>
        <td>${escapeHtml(item.id)}</td>
        <td>${escapeHtml(item.ac)}</td>
        <td><span class="pill ${resultPillClass(item.result)}">${escapeHtml(item.result)}</span></td>
        <td>${escapeHtml(item.summary)}</td>
        <td><pre style="margin:0;background:transparent;border:0;padding:0;max-height:none;overflow:visible;white-space:pre-wrap;word-break:break-word;">${escapeHtml(JSON.stringify(item.details, null, 2))}</pre></td>
      </tr>
    `).join('');
  }

  function updateExport(json) {
    state.json = json;
    els.jsonOutput.textContent = serialize(json);
    els.downloadBtn.disabled = false;
    els.copyBtn.disabled = false;
  }

  function downloadJson() {
    if (!state.json) return;
    const blob = new Blob([serialize(state.json)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-evaluation-${state.timestamp.replace(/[:.]/g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function copyJson() {
    if (!state.json) return;
    await navigator.clipboard.writeText(serialize(state.json));
    setStatus('PASS', 'Copied the JSON evidence bundle to the clipboard.');
  }

  function getFrameDoc() {
    const doc = els.dashboardFrame.contentDocument;
    if (!doc) throw new Error('Dashboard iframe document is not available.');
    return doc;
  }

  function getFrameWin() {
    const win = els.dashboardFrame.contentWindow;
    if (!win) throw new Error('Dashboard iframe window is not available.');
    return win;
  }

  async function waitForDashboardReady() {
    const startedAt = performance.now();
    for (;;) {
      const doc = getFrameDoc();
      const quality = doc.getElementById('qualityStatus');
      const trend = doc.getElementById('trendChart');
      if (quality && trend && !quality.textContent.includes('loading')) return;
      if (performance.now() - startedAt > 10000) throw new Error('Timed out waiting for the dashboard to initialize.');
      await wait(50);
    }
  }

  function parseRawData(doc) {
    const scriptText = Array.from(doc.scripts)
      .map(script => script.textContent || '')
      .find(text => text.includes('const rawData = '));

    if (!scriptText) throw new Error('Embedded rawData script was not found.');
    const match = scriptText.match(/const rawData = (\[[\s\S]*?\]);\s*const state =/);
    if (!match) throw new Error('Could not extract the embedded rawData array.');
    return JSON.parse(match[1]);
  }

  function uniqueValues(rows, keyFn) {
    return [...new Set(rows.map(keyFn))];
  }

  function measureSnapshot(rows) {
    return {
      factRows: rows.length,
      years: uniqueValues(rows, row => Number(row.anio)).sort((a, b) => a - b),
      months: uniqueValues(rows, row => Number(row.mes_numero)).sort((a, b) => a - b),
      channels: uniqueValues(rows, row => row.canal).sort((a, b) => a.localeCompare(b)),
      userTypes: uniqueValues(rows, row => row.tipo_usuario).sort((a, b) => a.localeCompare(b)),
      promotions: uniqueValues(rows, row => row.nombre_promocion).sort((a, b) => a.localeCompare(b))
    };
  }

  function getButtonMap(doc) {
    return {
      years: Array.from(doc.querySelectorAll('#yearFilters button[data-group="years"]')),
      months: Array.from(doc.querySelectorAll('#monthFilters button[data-group="months"]')),
      channels: Array.from(doc.querySelectorAll('#channelFilters button[data-group="channels"]')),
      userTypes: Array.from(doc.querySelectorAll('#userTypeFilters button[data-group="userTypes"]')),
      promotions: Array.from(doc.querySelectorAll('#promotionFilters button[data-group="promotions"]'))
    };
  }

  function activeValues(doc, group) {
    return Array.from(doc.querySelectorAll(`button[data-group="${group}"]`))
      .filter(button => button.getAttribute('aria-pressed') === 'true')
      .map(button => button.dataset.value);
  }

  async function nextFrame() {
    await wait(0);
    await wait(0);
  }

  async function clickButton(button) {
    button.click();
    await nextFrame();
  }

  async function resetDashboard(doc) {
    doc.getElementById('resetFilters').click();
    await nextFrame();
  }

  function getChartState(doc) {
    const trendChart = doc.getElementById('trendChart');
    const trendLegend = doc.getElementById('trendLegend');
    return {
      trendLegendText: trendLegend.textContent.trim(),
      trendLegendItems: trendLegend.querySelectorAll('.legend-item').length,
      trendSeriesCount: trendChart.querySelectorAll('polyline').length,
      trendCircleCount: trendChart.querySelectorAll('circle').length,
      trendEmpty: !!trendChart.querySelector('.empty'),
      channelEmpty: !!doc.getElementById('channelChart').querySelector('.empty'),
      userTypeEmpty: !!doc.getElementById('userTypeChart').querySelector('.empty'),
      categoryEmpty: !!doc.getElementById('categoryChart').querySelector('.empty'),
      promotionEmpty: !!doc.getElementById('promotionChart').querySelector('.empty')
    };
  }

  function toCompactText(text) {
    return String(text).replace(/\s+/g, ' ').trim();
  }

  async function eval001(doc) {
    const groups = ['months', 'channels', 'userTypes', 'promotions'];
    const buttonsByGroup = getButtonMap(doc);

    for (const group of groups) {
      const buttons = buttonsByGroup[group];
      if (buttons.length < 2) {
        return makeResult('EVAL-001', 'AC-001', 'BLOCKED', `The ${group} control does not expose enough options to prove multi-select behavior.`, { group, optionCount: buttons.length });
      }

      const initialActive = activeValues(doc, group);
      const first = buttons[0];
      const second = buttons[1];
      await clickButton(first);
      const activeAfterToggle = activeValues(doc, group);
      const secondStillActive = second.getAttribute('aria-pressed') === 'true';
      const pass = initialActive.length === buttons.length && activeAfterToggle.length === buttons.length - 1 && secondStillActive;

      if (!pass) {
        return makeResult('EVAL-001', 'AC-001', 'FAIL', `The ${group} combo control did not retain multiple active selections after a toggle.`, {
          group,
          totalOptions: buttons.length,
          activeBefore: initialActive.length,
          activeAfter: activeAfterToggle.length,
          secondStillActive
        });
      }

      await clickButton(first);
    }

    return makeResult('EVAL-001', 'AC-001', 'PASS', 'All non-year filter groups retained multiple selections and exposed active-state changes in the DOM.', {
      groups,
      optionCounts: groups.reduce((acc, group) => {
        acc[group] = buttonsByGroup[group].length;
        return acc;
      }, {})
    });
  }

  async function eval002(doc, snapshot) {
    const yearButtons = Array.from(doc.querySelectorAll('#yearFilters button[data-group="years"]'));
    const yearGrid = doc.getElementById('yearFilters');
    const labels = yearButtons.map(button => button.textContent.trim());
    const pass = yearGrid.getAttribute('role') === 'grid' && labels.length === snapshot.years.length && labels.every(label => snapshot.years.includes(Number(label)));

    return makeResult('EVAL-002', 'AC-002', pass ? 'PASS' : 'FAIL', pass ? 'The year control is rendered as a year grid and every available year matches the validated embedded snapshot.' : 'The year control did not behave like a calendar-based picker constrained to validated dataset years.', {
      role: yearGrid.getAttribute('role'),
      labels,
      datasetYears: snapshot.years
    });
  }

  async function eval003(doc) {
    const before = {
      selection: toCompactText(doc.getElementById('selectionSummary').textContent),
      revenue: toCompactText(doc.getElementById('kpiSalesRevenue').textContent),
      years: activeValues(doc, 'years').length
    };

    const firstMonth = doc.querySelector('#monthFilters button[data-group="months"]');
    await clickButton(firstMonth);

    const mutated = {
      selection: toCompactText(doc.getElementById('selectionSummary').textContent),
      revenue: toCompactText(doc.getElementById('kpiSalesRevenue').textContent),
      years: activeValues(doc, 'years').length
    };

    const changed = before.selection !== mutated.selection || before.revenue !== mutated.revenue;
    await resetDashboard(doc);

    const after = {
      selection: toCompactText(doc.getElementById('selectionSummary').textContent),
      revenue: toCompactText(doc.getElementById('kpiSalesRevenue').textContent),
      years: activeValues(doc, 'years').length,
      months: activeValues(doc, 'months').length,
      channels: activeValues(doc, 'channels').length,
      userTypes: activeValues(doc, 'userTypes').length,
      promotions: activeValues(doc, 'promotions').length
    };

    const restored = before.selection === after.selection && before.revenue === after.revenue && after.months > 0 && after.channels > 0 && after.userTypes > 0 && after.promotions > 0;
    const result = changed && restored ? 'PASS' : 'FAIL';

    return makeResult('EVAL-003', 'AC-003', result, result === 'PASS' ? 'Reset returned every filter group to the default full-selection state and restored the dashboard output.' : 'Reset behavior did not restore the default filter state or did not visibly refresh the dashboard.', {
      before,
      mutated,
      after,
      changed,
      restored
    });
  }

  async function eval004(doc) {
    const before = {
      selectionSummary: toCompactText(doc.getElementById('selectionSummary').textContent),
      kpiSalesRevenue: toCompactText(doc.getElementById('kpiSalesRevenue').textContent),
      trendMarkupLength: doc.getElementById('trendChart').innerHTML.length,
      trendSeriesCount: doc.getElementById('trendChart').querySelectorAll('polyline').length
    };

    const monthButton = doc.querySelector('#monthFilters button[data-group="months"]');
    await clickButton(monthButton);

    const after = {
      selectionSummary: toCompactText(doc.getElementById('selectionSummary').textContent),
      kpiSalesRevenue: toCompactText(doc.getElementById('kpiSalesRevenue').textContent),
      trendMarkupLength: doc.getElementById('trendChart').innerHTML.length,
      trendSeriesCount: doc.getElementById('trendChart').querySelectorAll('polyline').length
    };

    const pass = before.selectionSummary !== after.selectionSummary && before.kpiSalesRevenue !== after.kpiSalesRevenue && before.trendMarkupLength !== after.trendMarkupLength;
    await resetDashboard(doc);

    return makeResult('EVAL-004', 'AC-004', pass ? 'PASS' : 'FAIL', pass ? 'KPIs, selection summary, and chart markup all changed after a filter interaction.' : 'At least one observable KPI or chart region did not update after a filter interaction.', {
      before,
      after,
      changedSelection: before.selectionSummary !== after.selectionSummary,
      changedKpi: before.kpiSalesRevenue !== after.kpiSalesRevenue,
      changedTrendMarkup: before.trendMarkupLength !== after.trendMarkupLength
    });
  }

  async function eval005(doc, snapshot) {
    const status = toCompactText(doc.getElementById('qualityStatus').textContent);
    const summary = toCompactText(doc.getElementById('qualitySummary').textContent);
    const expectedStatus = `PASS - ${snapshot.factRows} embedded sales rows, ${snapshot.years.length} years, ${snapshot.months.length} months`;
    const expectedSummaryFragments = [
      `${snapshot.channels.length} channels`,
      `${snapshot.userTypes.length} user types`,
      `${snapshot.promotions.length} promotions`
    ];
    const pass = status === expectedStatus && expectedSummaryFragments.every(fragment => summary.includes(fragment));

    return makeResult('EVAL-005', 'AC-005', pass ? 'PASS' : 'FAIL', pass ? 'Quality banner matches the embedded snapshot counts.' : 'The quality banner text does not match the embedded snapshot-derived facts.', {
      status,
      summary,
      expectedStatus,
      expectedSummaryFragments,
      expectedCounts: {
        factRows: snapshot.factRows,
        years: snapshot.years.length,
        months: snapshot.months.length,
        channels: snapshot.channels.length,
        userTypes: snapshot.userTypes.length,
        promotions: snapshot.promotions.length
      }
    });
  }

  async function eval006(doc, rawRows) {
    const visibleText = toCompactText(doc.body.innerText);
    const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
    const rawKeyViolations = [...new Set(rawRows.flatMap(row => Object.keys(row).filter(key => forbiddenKeys.has(key))))];
    const visibleEmailMatches = visibleText.match(emailRegex) || [];
    const pass = rawKeyViolations.length === 0 && visibleEmailMatches.length === 0;

    return makeResult('EVAL-006', 'AC-006', pass ? 'PASS' : 'FAIL', pass ? 'No obvious personal-data patterns were found in the rendered UI or embedded snapshot keys.' : 'A privacy-sensitive pattern was detected in the rendered UI or embedded snapshot keys.', {
      inspectedRowCount: rawRows.length,
      rawKeyViolations,
      visibleEmailMatches: visibleEmailMatches.length,
      visibleTextSample: visibleText.slice(0, 260)
    });
  }

  async function eval007(doc) {
    await resetDashboard(doc);
    const yearButtons = Array.from(doc.querySelectorAll('#yearFilters button[data-group="years"]'));
    for (const button of yearButtons) {
      if (button.getAttribute('aria-pressed') === 'true') await clickButton(button);
    }

    const charts = getChartState(doc);
    const selectionSummary = toCompactText(doc.getElementById('selectionSummary').textContent);
    const pass = selectionSummary.startsWith('0 lines match') && charts.trendEmpty && charts.channelEmpty && charts.userTypeEmpty && charts.categoryEmpty && charts.promotionEmpty;
    await resetDashboard(doc);

    return makeResult('EVAL-007', 'AC-007', pass ? 'PASS' : 'FAIL', pass ? 'No-match filter state rendered explicit empty states instead of broken visuals.' : 'The no-match filter state did not show explicit empty states in all affected chart regions.', {
      selectionSummary,
      charts
    });
  }

  async function eval008() {
    return makeResult('EVAL-008', 'AC-008', 'MANUAL', 'Viewport readability and operability on a narrow screen requires human review.', {
      reviewMode: 'manual',
      check: 'Inspect the dashboard at a narrow viewport for readability, touch/keyboard operability, and horizontal overflow.'
    });
  }

  async function eval009(doc, snapshot) {
    const groups = {
      years: Array.from(doc.querySelectorAll('#yearFilters button[data-group="years"]')),
      months: Array.from(doc.querySelectorAll('#monthFilters button[data-group="months"]')),
      channels: Array.from(doc.querySelectorAll('#channelFilters button[data-group="channels"]')),
      userTypes: Array.from(doc.querySelectorAll('#userTypeFilters button[data-group="userTypes"]')),
      promotions: Array.from(doc.querySelectorAll('#promotionFilters button[data-group="promotions"]'))
    };

    const optionAudit = {};
    let pass = true;

    for (const [group, buttons] of Object.entries(groups)) {
      const values = buttons.map(button => button.dataset.value);
      const labels = buttons.map(button => button.textContent.trim());
      const expectedValues = snapshot[group].map(String);
      const valuesMatch = values.length === expectedValues.length && values.every(value => expectedValues.includes(String(value)));
      let labelsMatch;
      if (group === 'userTypes') {
        labelsMatch = buttons.every(button => userTypeLabelMap.get(button.dataset.value) === button.textContent.trim());
      } else {
        labelsMatch = labels.length === expectedValues.length && labels.every((label, index) => String(label) === expectedValues[index]);
      }
      optionAudit[group] = {
        buttonCount: buttons.length,
        expectedCount: expectedValues.length,
        valuesMatch,
        labelsMatch,
        unexpectedValues: values.filter(value => !expectedValues.includes(String(value)))
      };
      pass = pass && valuesMatch && labelsMatch;
    }

    return makeResult('EVAL-009', 'AC-009', pass ? 'PASS' : 'FAIL', pass ? 'Every generated filter option matched the validated embedded values, including the translated user-type labels.' : 'At least one filter option did not match the validated embedded dataset values.', optionAudit);
  }

  async function eval010() {
    return makeResult('EVAL-010', 'AC-010', 'MANUAL', 'Business-readability and functional equivalence of the KPI/chart set requires human judgment.', {
      reviewMode: 'manual',
      check: 'Compare the dashboard before and after the filter redesign and confirm the KPI and chart set remains recognizable and functionally equivalent.'
    });
  }

  async function eval011(doc) {
    const externalNodes = Array.from(doc.querySelectorAll('script[src], link[rel="stylesheet"][href]'));
    const resourceUrls = Array.from(getFrameWin().performance.getEntriesByType('resource')).map(entry => entry.name);
    const externalResources = resourceUrls.filter(url => {
      try {
        return new URL(url, location.href).origin !== location.origin;
      } catch {
        return true;
      }
    });
    const pass = externalNodes.length === 0 && externalResources.length === 0;

    return makeResult('EVAL-011', 'AC-011', pass ? 'PASS' : 'FAIL', pass ? 'The dashboard opens locally without external script/style loads or runtime connectivity requirements.' : 'The dashboard exposed external assets or runtime resource loading.', {
      externalNodeCount: externalNodes.length,
      externalResources: externalResources.slice(0, 10),
      resourceCount: resourceUrls.length
    });
  }

  async function eval012(doc) {
    await resetDashboard(doc);
    const yearButtons = Array.from(doc.querySelectorAll('#yearFilters button[data-group="years"]'));
    const target = yearButtons[0];

    for (const button of yearButtons.slice(1)) {
      if (button.getAttribute('aria-pressed') === 'true') await clickButton(button);
    }

    const charts = getChartState(doc);
    const selectedYear = target.dataset.value;
    const activeYears = activeValues(doc, 'years');
    const pass = activeYears.length === 1 && activeYears[0] === selectedYear && charts.trendLegendItems === 1 && charts.trendSeriesCount === 1 && !charts.trendEmpty;
    await resetDashboard(doc);

    return makeResult('EVAL-012', 'AC-012', pass ? 'PASS' : 'FAIL', pass ? 'Selecting one year produced a single trend series with no prior-year overlay.' : 'Selecting one year did not collapse the comparative trend to a single series.', {
      selectedYear,
      charts,
      activeYears
    });
  }

  async function runEvaluation() {
    try {
      setStatus('MANUAL', 'Loading dashboard and collecting evidence...');
      await waitForDashboardReady();
      const doc = getFrameDoc();
      const rawRows = parseRawData(doc);
      const snapshot = measureSnapshot(rawRows);

      state.timestamp = new Date().toISOString();
      const results = [];

      results.push(await eval001(doc));
      results.push(await eval002(doc, snapshot));
      results.push(await eval003(doc));
      results.push(await eval004(doc));
      results.push(await eval005(doc, snapshot));
      results.push(await eval006(doc, rawRows));
      results.push(await eval007(doc));
      results.push(await eval008());
      results.push(await eval009(doc, snapshot));
      results.push(await eval010());
      results.push(await eval011(doc));
      results.push(await eval012(doc));

      state.results = results;
      const summary = results.reduce((acc, item) => {
        acc[item.result] = (acc[item.result] || 0) + 1;
        return acc;
      }, { PASS: 0, FAIL: 0, BLOCKED: 0, MANUAL: 0 });

      const json = {
        generatedAt: state.timestamp,
        dashboard: '/web.html',
        summary,
        results
      };

      renderResults();
      updateExport(json);
      els.summaryMeta.textContent = `Total checks: ${results.length}. Automated passes: ${summary.PASS}. Manual checks: ${summary.MANUAL}. Blocked checks: ${summary.BLOCKED}. Failures: ${summary.FAIL}.`;
      setStatus(summary.FAIL ? 'FAIL' : 'PASS', `Evaluation complete: ${summary.PASS} PASS, ${summary.FAIL} FAIL, ${summary.BLOCKED} BLOCKED, ${summary.MANUAL} MANUAL.`);
    } catch (error) {
      const result = makeResult('EVAL-RUNNER', 'N/A', 'FAIL', 'The harness could not complete the evaluation run.', {
        message: error && error.message ? error.message : String(error)
      });
      state.results = [result];
      renderResults();
      updateExport({
        generatedAt: new Date().toISOString(),
        dashboard: '/web.html',
        summary: { PASS: 0, FAIL: 1, BLOCKED: 0, MANUAL: 0 },
        results: [result]
      });
      els.summaryMeta.textContent = 'The harness failed before it could complete the evaluation run.';
      setStatus('FAIL', result.details.message);
    }
  }

  els.runBtn.addEventListener('click', runEvaluation);
  els.downloadBtn.addEventListener('click', downloadJson);
  els.copyBtn.addEventListener('click', copyJson);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runEvaluation, { once: true });
  } else {
    runEvaluation();
  }
})();