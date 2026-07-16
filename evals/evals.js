(function () {
  const FORBIDDEN_FIELDS = [
    /"nombre"\s*:/i,
    /"apellidos"\s*:/i,
    /"email"\s*:/i,
    /"fecha_nacimiento"\s*:/i,
    /"codigo_postal"\s*:/i,
  ];

  const FILTERS = {
    yearFilter: ['2025'],
    monthFilter: ['1'],
    channelFilter: ['App'],
    userTypeFilter: ['Registrado'],
    promotionFilter: ['Sin promocion'],
  };

  function trimText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function normalizeForCompare(value) {
    return trimText(value).replace(/\u00a0/g, ' ');
  }

  function getDashboardDoc(context) {
    if (!context || !context.iframe || !context.iframe.contentDocument) {
      throw new Error('Dashboard iframe not ready');
    }
    return context.iframe.contentDocument;
  }

  function getDashboardWindow(context) {
    if (!context || !context.iframe || !context.iframe.contentWindow) {
      throw new Error('Dashboard iframe not ready');
    }
    return context.iframe.contentWindow;
  }

  function wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  async function waitFor(predicate, timeoutMs = 4000, intervalMs = 50) {
    const deadline = performance.now() + timeoutMs;
    let lastError = null;
    while (performance.now() < deadline) {
      try {
        const result = await predicate();
        if (result) return result;
      } catch (error) {
        lastError = error;
      }
      await wait(intervalMs);
    }
    if (lastError) throw lastError;
    throw new Error('Timed out waiting for dashboard state');
  }

  async function waitForDashboardReady(context) {
    const doc = getDashboardDoc(context);
    await waitFor(() => {
      const sales = doc.getElementById('kpiSales');
      const summary = doc.getElementById('selectionSummary');
      return Boolean(sales && summary && trimText(sales.textContent) !== '-' && trimText(summary.textContent));
    }, 6000);
    return doc;
  }

  async function reloadDashboard(context) {
    const cacheBuster = `eval=${Date.now()}`;
    context.iframe.src = `${context.url}${context.url.includes('?') ? '&' : '?'}${cacheBuster}`;
    return waitForDashboardReady(context);
  }

  function getSelectValues(select) {
    return [...select.selectedOptions].map((option) => option.value);
  }

  function setSelectValues(select, wantedValues) {
    const wanted = new Set(wantedValues.map(String));
    [...select.options].forEach((option) => {
      option.selected = wanted.has(option.value);
    });
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function snapshotMetrics(doc) {
    const ids = ['kpiSales', 'kpiOrders', 'kpiAov', 'kpiMargin', 'kpiUnits'];
    const deltas = ['kpiSalesDelta', 'kpiOrdersDelta', 'kpiAovDelta', 'kpiMarginDelta', 'kpiUnitsDelta'];
    const metrics = Object.fromEntries(ids.map((id) => [id, trimText(doc.getElementById(id)?.textContent)]));
    const metricDeltas = Object.fromEntries(deltas.map((id) => [id, trimText(doc.getElementById(id)?.textContent)]));
    return {
      selectionSummary: trimText(doc.getElementById('selectionSummary')?.textContent),
      weeklySummary: trimText(doc.getElementById('weeklySummary')?.textContent),
      chartText: trimText(doc.getElementById('weeklyChart')?.textContent),
      qualityBanner: trimText(doc.getElementById('qualityBanner')?.textContent),
      metrics,
      metricDeltas,
      qualityState: trimText(doc.getElementById('qualityState')?.textContent),
      rows: doc.querySelectorAll('#salesTable tr').length,
    };
  }

  function extractPeriods(text) {
    const normalized = normalizeForCompare(text).replace(/\s+/g, '');
    const baseMatch = normalized.match(/Base(\d{4})\|(.+?)Comparado/i);
    const compareMatch = normalized.match(/Comparado(\d{4})\|(.+)$/i);
    return {
      baseYear: baseMatch ? Number(baseMatch[1]) : null,
      baseSpan: baseMatch ? trimText(baseMatch[2]) : null,
      compareYear: compareMatch ? Number(compareMatch[1]) : null,
      compareSpan: compareMatch ? trimText(compareMatch[2]) : null,
    };
  }

  async function sourceText(context) {
    const response = await fetch(new URL('../web.html', context.url).href, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Unable to fetch dashboard source: ${response.status}`);
    }
    return response.text();
  }

  function collectDataBearingText(doc) {
    const selectors = [
      '#selectionSummary',
      '#weeklySummary',
      '#weeklyChart',
      '#qualityList',
      '#sourceList',
      '#salesTable',
      '#kpiSales',
      '#kpiOrders',
      '#kpiAov',
      '#kpiMargin',
      '#kpiUnits',
      '#kpiSalesDelta',
      '#kpiOrdersDelta',
      '#kpiAovDelta',
      '#kpiMarginDelta',
      '#kpiUnitsDelta',
    ];
    return selectors.map((selector) => trimText(doc.querySelector(selector)?.textContent)).filter(Boolean).join(' | ');
  }

  function result(status, observed, evidence, extra = {}) {
    return {
      status,
      observed,
      evidence,
      ...extra,
    };
  }

  async function run001(context) {
    const doc = await waitForDashboardReady(context);
    const snapshot = snapshotMetrics(doc);
    const periods = extractPeriods(snapshot.chartText);
    const expected = 'Base and comparison periods should show the same span, with the comparison year shifted back by one year.';
    if (!periods.baseYear || !periods.compareYear || !periods.baseSpan || !periods.compareSpan) {
      return result('BLOCKED', snapshot, 'Could not extract the comparison periods from the chart summary.', { expected });
    }
    const pass = periods.baseYear - periods.compareYear === 1 && periods.baseSpan === periods.compareSpan;
    return result(pass ? 'PASS' : 'FAIL', periods, `Selection summary: ${snapshot.selectionSummary}. Chart summary: ${snapshot.chartText}.`, { expected });
  }

  async function run002(context) {
    const expected = 'Each non-temporal filter should update the dashboard state and recalculate observable KPIs/chart summary.';
    const details = [];
    const filters = Object.entries(FILTERS);

    for (const [filterId, desiredValues] of filters) {
      const doc = await reloadDashboard(context);
      const baseline = snapshotMetrics(doc);
      const select = doc.getElementById(filterId);
      if (!select) {
        return result('BLOCKED', { missingFilter: filterId }, `Missing filter control: ${filterId}.`, { expected });
      }
      setSelectValues(select, desiredValues);
      await wait(200);
      const after = snapshotMetrics(doc);
      const changed = Object.values(after.metrics).some((value, index) => value !== Object.values(baseline.metrics)[index]);
        const visibleComparison = /Base/i.test(after.chartText) && /Comparado/i.test(after.chartText);
        const informativeNoComparison = after.weeklySummary === 'Sin comparado' || /No existe bloque comparable/i.test(after.chartText) || after.weeklySummary === 'Sin base';
        if (!changed || (!visibleComparison && !informativeNoComparison)) {
          return result('FAIL', { filterId, before: baseline, after, chartText: after.chartText }, `Filter ${filterId} did not produce the expected observable change.`, { expected });
      }
      details.push({ filterId, selectionSummary: after.selectionSummary, weeklySummary: after.weeklySummary, kpiSales: after.metrics.kpiSales });
    }

    return result('PASS', details, 'Each filter changed the dashboard from a fresh baseline and produced an updated observable state.', { expected });
  }

  async function run003(context) {
    const doc = await waitForDashboardReady(context);
    const expected = 'Five KPI families should be visible with stable value and delta targets.';
    const ids = [
      ['kpiSales', 'kpiSalesDelta'],
      ['kpiOrders', 'kpiOrdersDelta'],
      ['kpiAov', 'kpiAovDelta'],
      ['kpiMargin', 'kpiMarginDelta'],
      ['kpiUnits', 'kpiUnitsDelta'],
    ];
    const observed = ids.map(([valueId, deltaId]) => ({
      valueId,
      deltaId,
      value: trimText(doc.getElementById(valueId)?.textContent),
      delta: trimText(doc.getElementById(deltaId)?.textContent),
    }));
    const pass = observed.every((item) => item.value && item.value !== '-' && item.delta && !/^Cargando/i.test(item.delta));
    return result(pass ? 'PASS' : 'FAIL', observed, 'Captured KPI values and delta states from the dashboard DOM.', { expected });
  }

  async function run004(context) {
    const doc = await waitForDashboardReady(context);
    const expected = 'Each KPI delta should include an absolute variation and a relative variation.';
    const deltaIds = ['kpiSalesDelta', 'kpiOrdersDelta', 'kpiAovDelta', 'kpiMarginDelta', 'kpiUnitsDelta'];
    const observed = deltaIds.map((id) => ({ id, text: trimText(doc.getElementById(id)?.textContent) }));
    const pass = observed.every((item) => /·/.test(item.text) && /%/.test(item.text));
    return result(pass ? 'PASS' : 'FAIL', observed, 'Validated the visible delta format on all KPI cards.', { expected });
  }

  async function run007(context) {
    const expected = 'Setting a base period without prior-year rows should surface an informative no-comparison state.';
    const doc = await reloadDashboard(context);
    const yearFilter = doc.getElementById('yearFilter');
    const monthFilter = doc.getElementById('monthFilter');
    const channelFilter = doc.getElementById('channelFilter');
    const userTypeFilter = doc.getElementById('userTypeFilter');
    const promotionFilter = doc.getElementById('promotionFilter');
    if (!yearFilter || !monthFilter || !channelFilter || !userTypeFilter || !promotionFilter) {
      return result('BLOCKED', { missing: true }, 'One or more filter controls are missing.', { expected });
    }
    const originalSnapshot = snapshotMetrics(doc);
    const original = {
      year: getSelectValues(yearFilter),
      month: getSelectValues(monthFilter),
      channel: getSelectValues(channelFilter),
      userType: getSelectValues(userTypeFilter),
      promotion: getSelectValues(promotionFilter),
    };

    setSelectValues(yearFilter, ['2024']);
    setSelectValues(monthFilter, ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']);
    setSelectValues(channelFilter, original.channel);
    setSelectValues(userTypeFilter, original.userType);
    setSelectValues(promotionFilter, original.promotion);

    await wait(200);
    const snapshot = snapshotMetrics(doc);
    const pass = snapshot.weeklySummary === 'Sin comparado' && /No existe bloque comparable del año anterior/i.test(snapshot.chartText);

    setSelectValues(yearFilter, original.year);
    setSelectValues(monthFilter, original.month);
    setSelectValues(channelFilter, original.channel);
    setSelectValues(userTypeFilter, original.userType);
    setSelectValues(promotionFilter, original.promotion);

    await wait(200);

    return result(pass ? 'PASS' : 'FAIL', { noComparison: snapshot.weeklySummary, chartText: snapshot.chartText }, 'Detected the no-comparison message for a base year without a prior-year counterpart.', { expected });
  }

  async function run010(context) {
    const doc = await waitForDashboardReady(context);
    const source = await sourceText(context);
    const renderedText = collectDataBearingText(doc);
    const expected = 'Rendered data and embedded snapshot keys should not expose prohibited personal identifiers.';
    const violations = [];
    const sourceViolations = FORBIDDEN_FIELDS.filter((pattern) => pattern.test(source)).map((pattern) => pattern.toString());
    const renderedViolations = FORBIDDEN_FIELDS.filter((pattern) => pattern.test(renderedText)).map((pattern) => pattern.toString());
    if (sourceViolations.length) violations.push({ area: 'source', matches: sourceViolations });
    if (renderedViolations.length) violations.push({ area: 'rendered', matches: renderedViolations });
    const pass = violations.length === 0;
    return result(pass ? 'PASS' : 'FAIL', { violations: violations.length ? violations : 'none' }, 'Scanned the dashboard source and data-bearing rendered text for prohibited personal fields.', { expected });
  }

  async function run011(context) {
    const doc = await waitForDashboardReady(context);
    const source = await sourceText(context);
    const expected = 'The production HTML should be self-contained and not depend on CSV files or a runtime Supabase connection.';
    const forbiddenPatterns = [
      /resources\//i,
      /\.csv\b/i,
      /fetch\s*\(/i,
      /supabase\.com\/mcp/i,
      /project_ref=/i,
      /http[s]?:\/\//i,
      /https?:\/\//i,
    ];
    const sourceMatches = forbiddenPatterns.filter((pattern) => pattern.test(source)).map((pattern) => pattern.toString());
    const externalNodes = [...doc.querySelectorAll('script[src], link[href]')].map((node) => node.getAttribute('src') || node.getAttribute('href') || '');
    const externalMatches = externalNodes.filter((value) => /^https?:\/\//i.test(value));
    const pass = sourceMatches.length === 0 && externalMatches.length === 0;
    return result(pass ? 'PASS' : 'FAIL', { sourceMatches, externalMatches, sourceLength: source.length }, 'Inspected the dashboard source and linked assets for runtime CSV or database dependencies.', { expected });
  }

  async function run012(context) {
    await waitForDashboardReady(context);
    const expected = 'The embedded snapshot provenance must be reviewed against validated read-only Supabase evidence.';
    return result('MANUAL', 'Pending reviewer verification of Supabase provenance evidence.', 'This check requires matching the embedded snapshot against validated read-only Supabase evidence.', { expected });
  }

  const definitions = [
    {
      id: 'EVAL-001',
      relatedAcIds: ['AC-001'],
      relatedReqIds: ['REQ-001', 'REQ-002'],
      type: 'DOM',
      automation: 'automated',
      title: 'Compare the selected span with the prior year',
      expected: 'The selected base period and the comparison period must cover the same calendar span shifted one year back.',
      run: run001,
    },
    {
      id: 'EVAL-002',
      relatedAcIds: ['AC-002'],
      relatedReqIds: ['REQ-003'],
      type: 'interaction',
      automation: 'automated',
      title: 'Symmetric filter propagation',
      expected: 'Non-temporal filters should update the dashboard symmetrically for both periods.',
      run: run002,
    },
    {
      id: 'EVAL-003',
      relatedAcIds: ['AC-003'],
      relatedReqIds: ['REQ-004'],
      type: 'DOM',
      automation: 'automated',
      title: 'Five KPI families visible',
      expected: 'Five KPI families should render with current values and delta states.',
      run: run003,
    },
    {
      id: 'EVAL-004',
      relatedAcIds: ['AC-004'],
      relatedReqIds: ['REQ-005'],
      type: 'DOM',
      automation: 'automated',
      title: 'Delta formatting',
      expected: 'Each KPI delta should expose absolute and relative variation.',
      run: run004,
    },
    {
      id: 'EVAL-005',
      relatedAcIds: ['AC-005'],
      relatedReqIds: ['REQ-006'],
      type: 'visual-manual',
      automation: 'manual',
      title: 'Equivalent-calendar chart readability',
      expected: 'A reviewer confirms the chart is readable by equivalent calendar position.',
      manual: true,
    },
    {
      id: 'EVAL-006',
      relatedAcIds: ['AC-006'],
      relatedReqIds: ['REQ-007'],
      type: 'visual-manual',
      automation: 'manual',
      title: 'Contribution-focused narrative',
      expected: 'A reviewer confirms the narrative and rankings emphasize contribution to change.',
      manual: true,
    },
    {
      id: 'EVAL-007',
      relatedAcIds: ['AC-007'],
      relatedReqIds: ['REQ-008'],
      type: 'interaction',
      automation: 'automated',
      title: 'No-comparison state',
      expected: 'The dashboard should show an informative no-comparison state when the prior-year block is absent.',
      run: run007,
    },
    {
      id: 'EVAL-008',
      relatedAcIds: ['AC-008'],
      relatedReqIds: ['REQ-009', 'REQ-012'],
      type: 'data-quality',
      automation: 'manual',
      title: 'Table validation evidence',
      expected: 'A reviewer confirms every required table has an explicit PASS or FAIL result before KPI use.',
      manual: true,
    },
    {
      id: 'EVAL-009',
      relatedAcIds: ['AC-009'],
      relatedReqIds: ['REQ-009', 'REQ-012'],
      type: 'data-quality',
      automation: 'manual',
      title: 'Join cardinality evidence',
      expected: 'A reviewer confirms joins do not duplicate sales rows.',
      manual: true,
    },
    {
      id: 'EVAL-010',
      relatedAcIds: ['AC-010'],
      relatedReqIds: ['REQ-010', 'REQ-012'],
      type: 'privacy',
      automation: 'automated',
      title: 'No prohibited personal data',
      expected: 'Rendered and embedded analytical data should not expose personal identifiers.',
      run: run010,
    },
    {
      id: 'EVAL-011',
      relatedAcIds: ['AC-011'],
      relatedReqIds: ['REQ-011'],
      type: 'static',
      automation: 'automated',
      title: 'Self-contained production artifact',
      expected: 'The production HTML should not depend on CSV files or runtime Supabase connections.',
      run: run011,
    },
    {
      id: 'EVAL-012',
      relatedAcIds: ['AC-011'],
      relatedReqIds: ['REQ-011'],
      type: 'data-quality',
      automation: 'manual',
      title: 'Snapshot provenance review',
      expected: 'A reviewer confirms the embedded snapshot is traceable to validated read-only Supabase evidence.',
      manual: true,
    },
  ];

  window.EVAL_DEFINITIONS = definitions;
  window.EVAL_HELPERS = {
    waitForDashboardReady,
    snapshotMetrics,
    setSelectValues,
    getSelectValues,
    extractPeriods,
    collectDataBearingText,
    sourceText,
    waitFor,
    trimText,
  };
})();