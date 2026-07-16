# Evaluation Harness

This folder contains the simplest reproducible evaluation mechanism for the approved year-over-year dashboard.

## Files
- [harness.html](harness.html): browser-based runner that loads [../web.html](../web.html) in an iframe and reports results.
- [evals.js](evals.js): evaluation definitions and reusable helpers.
- [eval-plan.md](eval-plan.md): acceptance-criteria mapping used as the evaluation design reference.

## How to run locally
1. Serve the repository from its root with a local HTTP server.
2. Open [http://localhost:8000/evals/harness.html](http://localhost:8000/evals/harness.html).
3. Click `Run all`.
4. Optionally click `Download JSON` to export the latest run as evidence.

Example server command:

```bash
python3 -m http.server 8000
```

## What is automated
- Required KPI elements exist.
- Required chart and source panels exist.
- Filters exist and update observable dashboard state.
- Empty-state behavior for missing comparison works.
- Quality banner and per-table status render.
- Simulated validation failures block the dashboard and surface warnings.
- Rendered source and table areas avoid exposed personal-data patterns.
- The dashboard does not load external scripts or styles.

## What remains manual
- AC-005: whether the main visualization is readable for a business user without manual calculations.

## What is blocked
- No current checks are blocked in the delivered implementation.

## Coverage
- Automated: 10 acceptance criteria.
- Manual: 1 acceptance criterion.
- Blocked: 0 acceptance criteria.

## Evidence
The runner exports a JSON report with:
- status for every evaluation;
- concise evidence strings;
- timestamps;
- coverage summary.

The report does not include raw records, credentials, or runtime service connections.