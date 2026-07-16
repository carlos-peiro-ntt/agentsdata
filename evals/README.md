# Evaluation Harness

This folder contains the zero-dependency browser evaluation harness for the interannual sales dashboard.

## Files

- `harness.html` - runner UI, iframe preview, status summary, JSON export, and manual review controls.
- `evals.js` - eval definitions and execution logic.
- `results/.gitkeep` - placeholder for exported evidence files.

## How to run

Serve the repository from its root with a local HTTP server, then open the harness:

```bash
python3 -m http.server 8000
```

Open:

```text
http://localhost:8000/evals/harness.html
```

The harness loads `../web.html` in an iframe and does not duplicate the dashboard implementation.

## Coverage

Approved spec coverage is 7 automated ACs out of 11 total ACs.

- Automated: AC-001, AC-002, AC-003, AC-004, AC-007, AC-010, AC-011
- Manual: AC-005, AC-006, AC-008, AC-009

The manual checks remain MANUAL until a reviewer records a status and evidence in the harness UI.

## Limitations

- Visual interpretation of the main comparison chart remains manual.
- Narrative emphasis and ranking quality remain manual.
- Supabase table PASS/FAIL evidence and join-cardinality evidence remain manual because the approved plan treats them as source evidence, not browser state.
- Snapshot provenance is manual because it depends on validated read-only Supabase evidence outside the browser.

## Evidence workflow

1. Run all automated evals.
2. Review any FAIL or BLOCKED result and correct the underlying issue.
3. Fill in the manual eval rows with a status and concise evidence.
4. Use `Copy JSON` or `Export JSON` to capture the final evidence bundle locally.
5. Save exported evidence files under `results/` if you want to keep them in the workspace.

The JSON export never leaves the local browser session.