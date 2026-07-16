(() => {
  const MANUAL_EVIDENCE = 'Requires human review of chart readability and equivalent-date interpretation.';

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function score(status, evidence, details = {}) {
    return {
      status,
      evidence,
      details,
    };
  }

  function read(node) {
    return node ? String(node.textContent || '').trim() : '';
  }

  function textList(nodes) {
    return Array.from(nodes || [], (node) => read(node)).filter(Boolean);
  }

  function parseNumberLike(value) {
    const cleaned = String(value || '')
      .replace(/\s/g, '')
      .replace(/\./g, '')
      .replace(/,/g, '.')
      .replace(/[^0-9.+-]/g, '');
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }

  async function loadDashboard() {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-99999px';
    container.style.top = '0';
    container.style.width = '1400px';
    container.style.height = '1200px';

    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.width = '1400px';
    iframe.style.height = '1200px';
    iframe.style.border = '0';
    iframe.src = '../web.html?eval=' + Date.now() + '-' + Math.random().toString(36).slice(2);

    container.appendChild(iframe);
    document.body.appendChild(container);

    await new Promise((resolve, reject) => {
      iframe.addEventListener('load', resolve, { once: true });
      iframe.addEventListener('error', () => reject(new Error('Failed to load dashboard iframe')), { once: true });
    });

    const frameWindow = iframe.contentWindow;
    const frameDocument = iframe.contentDocument;
    if (!frameWindow || !frameDocument) {
      throw new Error('Dashboard iframe was not accessible');
    }

    return {
      iframe,
      frameWindow,
      frameDocument,
      dispose() {
        container.remove();
      },
    };
  }

  function selectSingleOption(frameDocument, selector, value) {
    const select = frameDocument.querySelector(selector);
    if (!select) {
      throw new Error('Missing select: ' + selector);
    }
    Array.from(select.options).forEach((option) => {
      option.selected = String(option.value) === String(value);
    });
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function selectOnlyIndex(frameDocument, selector, index) {
    const select = frameDocument.querySelector(selector);
    if (!select) {
      throw new Error('Missing select: ' + selector);
    }
    Array.from(select.options).forEach((option, optionIndex) => {
      option.selected = optionIndex === index;
    });
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function readQualityRows(frameDocument) {
    return textList(frameDocument.querySelectorAll('#qualityList .quality-row, #qualityList .join-row'));
  }

  function readKpiPeriods(frameDocument, key) {
    return {
      current: read(frameDocument.getElementById(key + 'Current')),
      previous: read(frameDocument.getElementById(key + 'Previous')),
      value: read(frameDocument.getElementById(key)),
      delta: read(frameDocument.getElementById(key + 'Delta')),
    };
  }

  function makeFailingQuality(kind) {
    const tableChecks = [
      { name: 'fact_ventas', rows: 200, unique: 200, status: 'PASS' },
      { name: 'dim_articulos', rows: 57, unique: 57, status: 'PASS' },
      { name: 'dim_canal', rows: 6, unique: 6, status: 'PASS' },
      { name: 'dim_fecha', rows: 174, unique: 174, status: 'PASS' },
      { name: 'dim_promociones', rows: 7, unique: 7, status: 'PASS' },
      { name: 'dim_usuarios', rows: 11, unique: 11, status: 'PASS' },
      { name: 'fact_promociones_articulos', rows: 124, unique: 124, status: 'PASS' },
    ];
    if (kind === 'table') {
      tableChecks[0].status = 'FAIL';
    }
    return {
      tableChecks,
      factRows: 200,
      distinctLines: 200,
      distinctOrders: 200,
      joinPass: kind !== 'join',
      piiPass: true,
      tablePass: kind !== 'table',
      overallPass: false,
      joinRows: 200,
    };
  }

  function externalAssets(frameDocument) {
    return {
      scripts: Array.from(frameDocument.querySelectorAll('script[src]')).map((node) => node.src),
      styles: Array.from(frameDocument.querySelectorAll('link[rel="stylesheet"][href]')).map((node) => node.href),
    };
  }

  const evaluations = [
    {
      id: 'EVAL-001',
      ac: 'AC-001',
      mode: 'automated',
      title: 'Base period and prior-year comparison are visible',
      run: async () => {
        const env = await loadDashboard();
        try {
          const legend = textList(env.frameDocument.querySelectorAll('#weeklyChart .summary-chip em'));
          const selectionPeriod = read(env.frameDocument.querySelector('#selectionSummary .summary-chip em'));
          const base = legend.find((value) => /2026/.test(value)) || '';
          const compared = legend.find((value) => /2025/.test(value)) || '';
          const pass = Boolean(selectionPeriod && base && compared && base !== compared && legend.length >= 2);
          return score(pass ? 'PASS' : 'FAIL', `selection=${selectionPeriod}; base=${base}; compared=${compared}; legend=${legend.join(' | ')}`);
        } finally {
          env.dispose();
        }
      },
    },
    {
      id: 'EVAL-002',
      ac: 'AC-002',
      mode: 'automated',
      title: 'Filters recalculate both windows symmetrically',
      run: async () => {
        const env = await loadDashboard();
        try {
          const before = read(env.frameDocument.getElementById('selectionSummary'));
          const beforeSales = read(env.frameDocument.getElementById('kpiSales'));
          selectOnlyIndex(env.frameDocument, '#channelFilter', 0);
          await sleep(0);
          const after = read(env.frameDocument.getElementById('selectionSummary'));
          const afterSales = read(env.frameDocument.getElementById('kpiSales'));
          const pass = before !== after && /Canales\s*1/.test(after) && beforeSales !== afterSales;
          return score(pass ? 'PASS' : 'FAIL', `before=${before}; after=${after}; sales=${beforeSales}→${afterSales}`);
        } finally {
          env.dispose();
        }
      },
    },
    {
      id: 'EVAL-003',
      ac: 'AC-003',
      mode: 'automated',
      title: 'KPI cards expose both periods',
      run: async () => {
        const env = await loadDashboard();
        try {
          const keys = ['kpiSales', 'kpiOrders', 'kpiAov', 'kpiMargin', 'kpiUnits'];
          const results = keys.map((key) => {
            const period = readKpiPeriods(env.frameDocument, key);
            const hasBase = Boolean(period.current);
            const hasCompared = Boolean(period.previous);
            const mainAndBaseMatch = period.value === period.current;
            return { key, period, hasBase, hasCompared, mainAndBaseMatch };
          });
          const pass = results.every((item) => item.hasBase && item.hasCompared && item.mainAndBaseMatch);
          return score(pass ? 'PASS' : 'FAIL', results.map((item) => `${item.key}:${item.period.current}|${item.period.previous}`).join('; '));
        } finally {
          env.dispose();
        }
      },
    },
    {
      id: 'EVAL-004',
      ac: 'AC-004',
      mode: 'automated',
      title: 'KPI deltas show absolute and relative change',
      run: async () => {
        const env = await loadDashboard();
        try {
          const keys = ['kpiSales', 'kpiOrders', 'kpiAov', 'kpiMargin', 'kpiUnits'];
          const deltas = keys.map((key) => readKpiPeriods(env.frameDocument, key).delta);
          const pass = deltas.every((value) => /·/.test(value) && /%/.test(value) && /[+-]/.test(value));
          return score(pass ? 'PASS' : 'FAIL', deltas.join(' | '));
        } finally {
          env.dispose();
        }
      },
    },
    {
      id: 'EVAL-005',
      ac: 'AC-005',
      mode: 'manual',
      title: 'Main chart is readable by equivalent calendar date',
      run: async () => score('MANUAL', MANUAL_EVIDENCE),
    },
    {
      id: 'EVAL-006',
      ac: 'AC-006',
      mode: 'automated',
      title: 'Rankings and narratives emphasize contribution to change',
      run: async () => {
        const env = await loadDashboard();
        try {
          const channelItems = Array.from(env.frameDocument.querySelectorAll('#channelList .list-item'));
          const deltas = channelItems.map((item) => {
            const text = read(item.querySelector('.list-head span'));
            const value = parseNumberLike(text);
            return { text, value };
          });
          const sorted = deltas.every((item, index, array) => index === 0 || Math.abs(array[index - 1].value || 0) >= Math.abs(item.value || 0));
          const insightText = textList(env.frameDocument.querySelectorAll('#insightList .insight')).join(' | ');
          const pass = channelItems.length >= 4 && sorted && /impulso positivo/i.test(insightText) && /resta/i.test(insightText);
          return score(pass ? 'PASS' : 'FAIL', `deltas=${deltas.map((item) => item.text).join(' | ')}; insights=${insightText}`);
        } finally {
          env.dispose();
        }
      },
    },
    {
      id: 'EVAL-007',
      ac: 'AC-007',
      mode: 'automated',
      title: 'Missing comparison produces informative empty state',
      run: async () => {
        const env = await loadDashboard();
        try {
          selectSingleOption(env.frameDocument, '#yearFilter', '2024');
          await sleep(0);
          const chartText = read(env.frameDocument.getElementById('weeklyChart'));
          const summary = read(env.frameDocument.getElementById('weeklySummary'));
          const pass = /No existe bloque comparable del año anterior/.test(chartText) && /Sin comparado/.test(summary);
          return score(pass ? 'PASS' : 'FAIL', `chart=${chartText}; summary=${summary}`);
        } finally {
          env.dispose();
        }
      },
    },
    {
      id: 'EVAL-008',
      ac: 'AC-008',
      mode: 'automated',
      title: 'A failing source-table validation blocks the dashboard',
      run: async () => {
        const env = await loadDashboard();
        try {
          env.frameWindow.evaluateQuality = () => makeFailingQuality('table');
          env.frameWindow.renderAll();
          await sleep(0);
          const banner = read(env.frameDocument.getElementById('qualityBanner'));
          const tableRow = read(env.frameDocument.querySelector('#quality-table-fact_ventas, [data-testid="quality-table-fact_ventas"]'));
          const summary = read(env.frameDocument.getElementById('qualitySummary'));
          const pass = /bad/.test(env.frameDocument.getElementById('qualityBanner').className) && /FAIL/.test(banner + tableRow) && /validación falló/i.test(summary);
          return score(pass ? 'PASS' : 'FAIL', `banner=${banner}; table=${tableRow}; summary=${summary}`);
        } finally {
          env.dispose();
        }
      },
    },
    {
      id: 'EVAL-009',
      ac: 'AC-009',
      mode: 'automated',
      title: 'A failing join cardinality blocks the dashboard',
      run: async () => {
        const env = await loadDashboard();
        try {
          env.frameWindow.evaluateQuality = () => makeFailingQuality('join');
          env.frameWindow.renderAll();
          await sleep(0);
          const joinRow = read(env.frameDocument.querySelector('[data-testid="join-row-fact_ventas-dimensiones"], #join-row-fact-ventas-dimensiones, .join-row'));
          const summary = read(env.frameDocument.getElementById('qualitySummary'));
          const pass = /FAIL/.test(joinRow) && /validación falló/i.test(summary);
          return score(pass ? 'PASS' : 'FAIL', `join=${joinRow}; summary=${summary}`);
        } finally {
          env.dispose();
        }
      },
    },
    {
      id: 'EVAL-010',
      ac: 'AC-010',
      mode: 'automated',
      title: 'Rendered UI avoids exposing personal data',
      run: async () => {
        const env = await loadDashboard();
        try {
          const sourceText = textList(env.frameDocument.querySelectorAll('#sourceList .source-row')).join(' | ');
          const headers = textList(env.frameDocument.querySelectorAll('table thead th'));
          const salesTableText = read(env.frameDocument.getElementById('salesTable'));
          const piiRegex = /@|\b\d{5}\b/;
          const forbiddenHeader = headers.some((header) => /nombre|apellidos|email|fecha de nacimiento|codigo postal|código postal/i.test(header));
          const allowedSource = /segmento_cliente/i.test(sourceText) && /genero/i.test(sourceText) && /comunidad_autonoma/i.test(sourceText) && /tipo_usuario/i.test(sourceText);
          const noExposedPii = !piiRegex.test(sourceText) && !piiRegex.test(salesTableText) && !forbiddenHeader;
          const pass = allowedSource && noExposedPii;
          return score(pass ? 'PASS' : 'FAIL', `sources=${sourceText}; headers=${headers.join(' | ')}`);
        } finally {
          env.dispose();
        }
      },
    },
    {
      id: 'EVAL-011',
      ac: 'AC-011',
      mode: 'automated',
      title: 'Dashboard uses an embedded snapshot without external assets',
      run: async () => {
        const env = await loadDashboard();
        try {
          const assets = externalAssets(env.frameDocument);
          const pass = assets.scripts.length === 0 && assets.styles.length === 0;
          return score(pass ? 'PASS' : 'FAIL', `scripts=${assets.scripts.length}; styles=${assets.styles.length}`);
        } finally {
          env.dispose();
        }
      },
    },
  ];

  async function runEvaluation(evaluation) {
    const startedAt = new Date().toISOString();
    if (evaluation.mode === 'manual') {
      return {
        id: evaluation.id,
        ac: evaluation.ac,
        title: evaluation.title,
        mode: evaluation.mode,
        status: 'MANUAL',
        evidence: MANUAL_EVIDENCE,
        startedAt,
        finishedAt: startedAt,
      };
    }

    const result = await evaluation.run();
    const finishedAt = new Date().toISOString();
    return {
      id: evaluation.id,
      ac: evaluation.ac,
      title: evaluation.title,
      mode: evaluation.mode,
      status: result.status,
      evidence: result.evidence,
      details: result.details || {},
      startedAt,
      finishedAt,
    };
  }

  async function runAll(onProgress) {
    const results = [];
    for (let index = 0; index < evaluations.length; index += 1) {
      const evaluation = evaluations[index];
      if (onProgress) onProgress(index, evaluation);
      results.push(await runEvaluation(evaluation));
    }
    if (onProgress) onProgress(evaluations.length, null);
    return results;
  }

  function summarize(results) {
    return results.reduce((acc, item) => {
      acc.total += 1;
      acc[item.status.toLowerCase()] = (acc[item.status.toLowerCase()] || 0) + 1;
      if (item.mode === 'automated') acc.automatedChecks += 1;
      if (item.mode === 'manual') acc.manualChecks += 1;
      return acc;
    }, { total: 0, pass: 0, fail: 0, blocked: 0, manual: 0, automatedChecks: 0, manualChecks: 0 });
  }

  window.DashboardEval = {
    evaluations,
    runEvaluation,
    runAll,
    summarize,
  };
})();