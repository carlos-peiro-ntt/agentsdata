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

The harness is still a single `evals/harness.html` using native HTML and JavaScript. It loads the dashboard from the same local server and uses no packages or external services. Its checks are now derived directly from the `#### Scenario:` blocks in `openspec/changes/total-sales-mom-comparison/specs/`, instead of a fixed, invented count.

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

`verify` is an optional workflow, not installed by the default `openspec init`. Enable it once per machine by adding it to the configured workflow list, then refreshing the generated Copilot files:

```bash
openspec config set workflows '["propose","explore","apply","update","sync","archive","verify"]'
openspec update
```

`openspec config set` replaces the whole list, so it's spelled out in full rather than just adding `verify`. Restart VS Code if `/opsx-verify` doesn't show up right away.

Then, in Copilot Chat:

```text
/opsx-verify
```

The agent produces a report across three dimensions — **Completeness** (tasks and spec coverage), **Correctness** (requirement implementation mapping and scenario coverage), and **Coherence** (design adherence and code pattern consistency) — without touching the harness or the dashboard.

Expect `verify` to flag **Scenario Coverage** as a WARNING even when the implementation is correct: it only searches the codebase for matching logic, it does not run the dashboard or compute expected values. Without any automated test evidence, every scenario reads "not covered" by design. Fix any CRITICAL issue it reports before moving on; a Scenario Coverage WARNING is expected here and is resolved by the harness in the next part.

## Part 4 — Create the harness

`verify` audits structure and code; it cannot load the dashboard, pick a real filter combination, or compute an expected euro value independently. The harness fills exactly that gap: it is the automated test evidence `/opsx-verify` is looking for, and it is the only part of this flow that actually executes the implementation against real data. Re-run `/opsx-verify` after the harness exists — Scenario Coverage should move from "not covered" to covered once a test file exercising those scenarios is present.

Once the implementation passes verify, send:

```text
Create evals/harness.html using only HTML and JavaScript.

Read:
- openspec/changes/total-sales-mom-comparison/specs/;
- the implemented dashboard;
- AGENTS.md;
- .github/instructions/dashboard.instructions.md.

Do not modify the change folder or the dashboard.

Create exactly one evaluation per Scenario block found in specs/ — one
EVAL per requirement/scenario pair, named after that scenario. Do not
invent additional evaluations and do not drop any.

The harness must:
- load the dashboard in an iframe;
- show EVAL, the source requirement, PASS/FAIL, and evidence;
- provide Run all and Retry failed buttons;
- keep the attempt history;
- show transitions such as FAIL → PASS;
- calculate expected values independently;
- treat harness errors as FAIL;
- show a final summary such as N/N PASS.

Do not add dependencies, exports, charts, MANUAL states, or BLOCKED states.
```

## Part 5 — Run the harness

Serve the repository from its root:

**Windows — PowerShell**

```powershell
python -m http.server 8000
```

**macOS, Linux, or WSL — Bash/Zsh**

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000/evals/harness.html` and press **Run all**. The result must show one row per scenario and a global summary.

## Part 6 — Fix and run regression

If an eval returns `FAIL`:

1. Read the source scenario and the evidence in that row.
2. Fix only the implementation that violates the spec; do not lower the criterion.
3. Press **Retry failed**. The history must preserve the first `FAIL` and add the new result.
4. Once it passes, press **Run all** to check for regressions.

To demonstrate the cycle during the course, if the first run returns N/N `PASS`, temporarily rename one of the stable IDs read by the harness and run **Run all**. Restore the ID according to the spec and press **Retry failed**. The history must clearly show `FAIL → PASS`.

## Part 7 — Archive the change

Once the harness is green and `tasks.md` is fully checked:

```text
/opsx-archive
```

This merges the change's requirements into `openspec/specs/` — the project's living specification — and moves the change folder into `openspec/changes/archive/` with today's date prefixed to its name. Nothing about the dashboard's self-contained architecture changes.

## Final course validation

Check that:

- `openspec/changes/archive/` contains the dated, completed change;
- `openspec/specs/` now holds the Total Sales requirements as living documentation;
- exactly one harness row exists per scenario in the archived spec;
- the final result is N/N `PASS`;
- if there was a failure, the history shows the retry and its fix;
- the dashboard remains self-contained and works without the harness.

The final course chain is:

```text
Idea → Propose → Review → Apply → Verify → Harness → Fix → Retry → Archive
```

---

[← Back to README](../../README.md)
