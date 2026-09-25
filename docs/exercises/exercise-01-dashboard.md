# Exercise 1 — Create the First Dashboard

[← Back to README](../../README.md) · [← Setup](../setup.md)

## Objective

Compare the result of a prompt without context with the result obtained when the agent has real data.

## Part 1 — Generation without data

1. Open the VS Code chat.
2. Select **Ask** mode.
3. Send:

```text
Generate an HTML sales dashboard for business users.
```

4. Review the agent's response.
5. If it proposes creating files, review the changes before accepting them.
6. Check what information it had to invent because it had no data.

### Discussion points

- Ask is still an agent-based mode, but it has more restricted actions.
- Without data, generation is fast, but values and KPIs may be fictional.
- Codex and OpenCode do not always expose a mode called **Ask**. In that case, explicitly request: `Analyze and propose a solution without modifying files`.

## Part 2 — Add the CSV files

1. Receive the `resources` folder for the exercise from the instructor.
2. Copy the folder to the repository root.
3. Check that the files are available:

**Windows — PowerShell**

```powershell
Get-ChildItem .\resources
```

**macOS, Linux, or WSL — Bash/Zsh**

```bash
ls -la ./resources
```

4. Return to chat and send:

```text
Generate an HTML sales dashboard for business users using the CSV files in the `resources` folder.
```

5. Review which files the agent wants to read and modify.
6. Accept the changes after checking that it uses the CSV files.
7. Serve the dashboard:

**Windows — PowerShell**

```powershell
py -m http.server 8000
```

**macOS, Linux, or WSL — Bash/Zsh**

```bash
python3 -m http.server 8000
```

8. Open `http://localhost:8000/{name}.html`.
9. Stop the server with `Ctrl+C` when finished.

## Exercise validation

Check that:

- `{name}.html` was created;
- the data comes from `resources`;
- the dashboard loads over HTTP;
- no personal data is displayed;
- the KPIs are not manually entered values.

---

Continue to [Exercise 2 — From Prompt to Persistent Instructions](exercise-02-agent-instructions.md).
