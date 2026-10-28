# Exercise 1 — Create the First Dashboard

[← Back to README](../../README.md) · [← Setup](../setup.md)

## Objective

Compare a dashboard generated without data, where the agent has to invent the values, with one generated from real CSV data. In the second part each participant chooses their own KPIs, colors, and layout, so every dashboard in the group ends up different.

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

## Part 2 — Generation with CSV data

1. Download [resources.zip](https://github.com/carlos-peiro-ntt/agentsdata/releases/latest/download/resources.zip) and extract it into a `resources` folder at the root of your project folder:
   - macOS: double-click the zip and move the resulting `resources` folder into your project folder.
   - Windows: right-click the zip, select **Extract All**, and set the destination to `<project folder>\resources`.
   - Linux or WSL: `unzip resources.zip -d <project folder>/resources`.

   Check that `resources/` contains the seven CSV files directly, without a nested folder.
2. Decide which KPIs, colors, and layout you want. Choose your own; do not copy a colleague's.
3. Send the prompt, replacing the placeholders with your choices:

```text
Generate an HTML sales dashboard for business users using the CSV files in the `resources` folder.
```

4. Review which files the agent wants to read and modify, and accept the changes after checking that it uses the CSV files.
5. Open the dashboard in the browser the way the agent indicates.

### Discussion points

- Same data, different prompts: compare your dashboard with your colleagues'. KPIs, calculations, and style vary because each prompt carries different, one-off context.
- That context is lost on the next prompt. The next exercise moves it into persistent instructions.

## Exercise validation

Check that:

- `{name}.html` was created;
- the data comes from `resources`;
- the KPIs, colors, and layout reflect your choices;
- no personal data is displayed;
- the KPIs are calculated from the data, not manually entered values.

---

Continue to [Exercise 2 — From Prompt to AGENTS.md](exercise-02-agents-md.md).
