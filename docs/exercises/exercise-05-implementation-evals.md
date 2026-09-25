# Exercise 5 — Guided Implementation and Harness/Evals

[← Back to README](../../README.md) · [← Exercise 4](exercise-04-sdd.md)

## Objective

Implement the approved spec and check its four `REQ/AC` pairs with a simple, reproducible **harness**.

The complete flow is:

```text
Idea → Plan → Approved spec → Implementation → Harness
                                             ↓
                         FAIL → Correction → Retry → PASS
```

The harness will be a single `evals/harness.html` using native HTML and JavaScript. It will load the dashboard from the same local server and use no packages or external services.

## Part 1 — Translate the spec into four checks

Before implementing, identify what the harness will observe:

| Eval | Contract | Check |
| --- | --- | --- |
| EVAL-001 | REQ-001 / AC-001 | The current-month total exists and is correct. |
| EVAL-002 | REQ-002 / AC-002 | The previous-month total exists and is correct. |
| EVAL-003 | REQ-003 / AC-003 | The euro difference is `current - previous`. |
| EVAL-004 | REQ-004 / AC-004 | The percentage applies the agreed formula or shows `N/A` when the previous value is zero. |

Do not add more evals. This makes clear that the harness derives from the spec, not from the implementation.

## Part 2 — Implement the approved spec

Return to **Agent** mode and send:

```text
Implement the approved specification in specs/dashboard-evolution.md.

Confirm first that:
- Status is Approved;
- Version is 1.0.0;
- there are no blocking TBD items.

Follow AGENTS.md and .github/instructions/dashboard.instructions.md.

Implement only REQ-001 through REQ-004 in the existing Total Sales card.
Use stable DOM identifiers for the four displayed values.

Preserve the self-contained dashboard.
Do not modify the approved spec.
Do not create the harness yet.

Report:
- implemented REQ identifiers;
- modified files;
- validation performed.
```

## Part 3 — Create the harness

Once the implementation is available, send:

```text
Create evals/harness.html using only HTML and JavaScript.

Read:
- specs/dashboard-evolution.md;
- the implemented dashboard;
- AGENTS.md;
- .github/instructions/dashboard.instructions.md.

Do not modify the spec or dashboard.

Create exactly four evaluations:

- EVAL-001 validates REQ-001 / AC-001.
- EVAL-002 validates REQ-002 / AC-002.
- EVAL-003 validates REQ-003 / AC-003.
- EVAL-004 validates REQ-004 / AC-004.

The harness must:
- load the dashboard in an iframe;
- show EVAL, REQ, AC, PASS/FAIL and evidence;
- provide Run all and Retry failed buttons;
- keep the attempt history;
- show transitions such as FAIL → PASS;
- calculate expected values independently;
- treat harness errors as FAIL;
- show a final summary such as 4/4 PASS.

Do not add more evals, dependencies, exports, charts,
MANUAL states or BLOCKED states.
```

## Part 4 — Run the harness

Serve the repository from its root:

**Windows — PowerShell**

```powershell
python -m http.server 8000
```

**macOS, Linux, or WSL — Bash/Zsh**

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000/evals/harness.html` and press **Run all**. The result must show only four rows and a global summary.

## Part 5 — Fix and run regression

If an eval returns `FAIL`:

1. Read the `REQ/AC` and the evidence in that row.
2. Fix only the implementation that violates the spec; do not lower the criterion.
3. Press **Retry failed**. The history must preserve the first `FAIL` and add the new result.
4. Once it passes, press **Run all** to check for regressions.

To demonstrate the cycle during the course, if the first run returns `4/4 PASS`, temporarily rename one of the stable IDs read by the harness and run **Run all**. Restore the ID according to the spec and press **Retry failed**. The history must clearly show `FAIL → PASS`.

## Final course validation

Check that:

- the spec remains `Approved` and was not changed to make the tests pass;
- exactly four rows exist and each links one `REQ` to its `AC`;
- the final result is `4/4 PASS`;
- if there was a failure, the history shows the retry and its fix;
- the dashboard remains self-contained and works without the harness.

The final course chain is:

```text
Idea → Plan → Approved spec → Implementation → Harness → Fix → Retry
```

---

[← Back to README](../../README.md)
