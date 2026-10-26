# Exercise 5 — Guided Implementation, Verify, and Harness/Evals

[← Back to README](../../README.md) · [← Exercise 4](exercise-04-sdd.md)

## Objective

Implement the reviewed OpenSpec change, let the agent verify it against the spec's scenarios, and confirm the result with a simple, reproducible **harness**.

The complete flow is:

```text
Reviewed change → Implementation (/opsx-apply) → Verify (/opsx-verify) → Harness
                                                                      ↓
                                          FAIL → Correction → Retry → PASS
                                                                      ↓
                                                                  Archive
```

The harness is a single `evals/harness.js`, run with plain Node.js (already a prerequisite for this course) — no browser, no local server, no npm packages. Its checks are derived directly from the `#### Scenario:` blocks in `openspec/changes/total-sales-mom-comparison/specs/`, instead of a fixed, invented count.

## Part 1 — Translate the spec into checks

Before implementing, open `openspec/changes/total-sales-mom-comparison/specs/<capability>/spec.md` and list its scenarios — the harness will observe exactly these, one EVAL per scenario. For this change, that's typically five, because the percentage-change requirement carries two scenarios (the normal calculation and the zero-previous edge case):

| Eval | Scenario | Check |
| --- | --- | --- |
| EVAL-001 | current month total | The current-month total exists and is correct. |
| EVAL-002 | previous month total | The previous-month total exists and is correct. |
| EVAL-003 | euro difference | The euro difference is `current - previous`. |
| EVAL-004 | percentage change is calculated | The percentage applies the agreed formula when previous is greater than zero. |
| EVAL-005 | percentage change is N/A | The percentage shows `N/A` when the previous value is zero. |

Do not add more evals than scenarios, and do not drop any. This keeps the harness a direct derivative of the spec, not of the implementation.

## Part 2 — Implement the change

In Copilot Chat:

```text
/opsx-apply
```

The agent works through `openspec/changes/total-sales-mom-comparison/tasks.md`, checking off each task as it lands. Confirm it also:

- follows `AGENTS.md` and `.github/instructions/dashboard.instructions.md`;
- implements only the tasks in the reviewed change, in the existing Total Sales card;
- uses stable DOM identifiers for the four displayed values;
- preserves the self-contained dashboard.

If a session is interrupted or runs out of context, re-run `/opsx-apply` — it resumes at the first unchecked task.

## Part 3 — Verify against the spec

`verify` is an optional workflow, not installed by the default `openspec init`. Enable it once per machine with the interactive profile selector, then refresh the generated Copilot files:

```bash
openspec config profile
openspec update
```

In `openspec config profile`, select the workflows to install and make sure `verify` is checked alongside the existing ones (`propose`, `explore`, `apply`, `update`, `sync`, `archive`), then confirm. Restart VS Code if `/opsx-verify` doesn't show up right away.

Then, in Copilot Chat:

```text
/opsx-verify
```

The agent produces a report across three dimensions — **Completeness** (tasks and spec coverage), **Correctness** (requirement implementation mapping and scenario coverage), and **Coherence** (design adherence and code pattern consistency) — without touching the harness or the dashboard.

Expect `verify` to flag **Scenario Coverage** as a WARNING the first time, even though the implementation is correct: it only searches the codebase for matching logic, it never runs the dashboard or computes an expected value. Without any automated test file in the repo, every scenario reads "not covered" by design — that is not a mistake to fix here, it is the lesson for this part of the exercise. Fix any CRITICAL issue it reports; leave the Scenario Coverage WARNING as-is and carry it into Part 4, where the harness closes exactly that gap.

## Part 4 — Create the harness

`verify` only audits structure and code; it cannot load the dashboard, pick a real filter combination, or compute an expected euro value independently. The harness fills exactly that gap, and it is the only part of this flow that actually executes the real calculation against real data.

Send:

```text
Create evals/harness.js using plain Node.js, no npm packages.

Read:
- openspec/changes/total-sales-mom-comparison/specs/;
- the implemented dashboard.html;
- AGENTS.md;
- .github/instructions/dashboard.instructions.md.

Do not modify the change folder or the dashboard.

Create exactly one evaluation per Scenario block found in specs/ — one
EVAL per requirement/scenario pair, named after that scenario. Do not
invent additional evaluations and do not drop any.

The script must, when run with `node evals/harness.js`:
- read dashboard.html as text and extract the embedded SNAPSHOT array;
- compute each scenario's expected value independently, reimplementing
  the formula from the spec — never by calling or copying the
  dashboard's own code;
- extract the dashboard's actual calculation lines for the current
  total, previous total, difference, and percentage change from
  dashboard.html by pattern, and evaluate them against the same
  SNAPSHOT to get the dashboard's actual value for comparison;
- confirm, by inspecting the source, that the stable DOM ids
  (#kpiRevenue, #kpiRevenuePrevious, #kpiRevenueDifference,
  #kpiRevenueChange) are assigned from those same variables;
- print one row per EVAL with the scenario name, expected value,
  actual value, and PASS/FAIL;
- persist attempt history across runs in evals/.harness-history.json,
  so a FAIL → PASS transition from a previous run is visible;
- treat any harness error (missing SNAPSHOT, missing DOM id, parse
  failure) as FAIL for that EVAL, never a crash;
- print a final summary such as N/N PASS;
- exit with a non-zero status code if any EVAL fails.

Do not add dependencies, a browser, a local server, exports, or
MANUAL/BLOCKED states.
```

## Part 5 — Run the harness

```bash
node evals/harness.js
```

The result must show one row per scenario, each with expected vs. actual, and a final `N/N PASS` summary. A non-zero exit code means at least one scenario failed.

## Part 6 — Fix and run regression

If an EVAL returns `FAIL`:

1. Read the expected vs. actual values printed for that row.
2. Fix only the implementation that violates the spec; do not lower the criterion.
3. Run `node evals/harness.js` again. `evals/.harness-history.json` must preserve the first `FAIL` and add the new result, so the transition is visible across runs.
4. Once it passes, confirm the summary reads `N/N PASS` with no regressions.

To demonstrate the cycle during the course, if the first run returns `N/N PASS`, temporarily rename one of the stable IDs the harness reads (for example `#kpiRevenuePrevious`) and run it again — that EVAL must fail. Restore the ID and run again; the history file must clearly show `FAIL → PASS` for that EVAL.

## Part 7 — Re-verify against the spec

Now that `evals/harness.js` exists and exercises all 5 scenarios, run `/opsx-verify` again:

```text
/opsx-verify
```

Compare this report to the one from Part 3: **Scenario Coverage** should no longer read "not covered" — `verify` now finds a test file exercising each scenario. This is the lab's payoff: the same command, run twice, shows the exact gap the harness was built to close.

## Part 8 — Archive the change

Once the harness is green and `tasks.md` is fully checked:

```text
/opsx-archive
```

Expect two confirmation gates before anything moves — `/opsx-archive` never archives silently:

1. **Incomplete artifacts**: `design.md` reads `ready`, not `done` or `skipped` — this is the design artifact we deliberately left uncreated in Exercise 4. The agent warns about it and asks to continue; confirm, since nothing in this change needed a design decision.
2. **Delta spec sync**: `openspec/specs/` is still empty, so the `total-sales-kpi` capability has no main spec yet. Since the delta only has `ADDED Requirements`, the agent offers **"Sync now (recommended)"** or **"Archive without syncing"**. Choose **Sync now** — this is what turns the four requirements into `openspec/specs/total-sales-kpi/spec.md`, the project's living specification. Skipping it would archive the change but leave `openspec/specs/` empty, losing the point of using OpenSpec over a disposable spec file.

Once confirmed, this merges the requirements into `openspec/specs/` and moves the change folder into `openspec/changes/archive/` with today's date prefixed to its name. Nothing about the dashboard's self-contained architecture changes.

## Final course validation

Check that:

- `openspec/changes/archive/` contains the dated, completed change;
- `openspec/specs/` now holds the Total Sales requirements as living documentation;
- exactly one harness row exists per scenario in the archived spec;
- `node evals/harness.js` prints `N/N PASS`, and `evals/.harness-history.json` shows the retry if there was a failure;
- the second `/opsx-verify` run no longer flags Scenario Coverage as not covered;
- the dashboard remains self-contained and works without the harness.

The final course chain is:

```text
Idea → Propose → Review → Apply → Verify (gap) → Harness → Fix → Retry → Verify (closed) → Archive
```

---

[← Back to README](../../README.md)
