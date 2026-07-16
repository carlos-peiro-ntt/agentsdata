# Dashboard Evaluation Harness

This folder contains the local, zero-dependency browser harness for the sales dashboard evaluation.

## Run locally

1. Serve the repository root with a local HTTP server.
2. Open `http://localhost:8000/evals/harness.html`.
3. Wait for the dashboard iframe to load, then the harness runs automatically.
4. Use `Download JSON` to export the reusable evidence bundle.

Example server command:

```bash
python3 -m http.server 8000
```

## What it checks

- Deterministic acceptance criteria are automated in-browser.
- Manual checks are reported explicitly as `MANUAL`.
- Any unsupported or ambiguous check can be marked `BLOCKED` by the harness.

## Output

The harness renders a results table and a compact JSON evidence bundle with:

- `id`
- `ac`
- `result`
- `summary`
- `details`
- `timestamp`

The exported JSON avoids raw records, credentials, runtime connections, and personal data.