# Exercise 1 — Create the First Dashboard

[← Back to README](../../README.md) · [← Setup](setup.md)

## Objective

Compare a dashboard generated without data, where the agent has to invent the values, with one generated from real CSV data. In the second part each participant chooses their own KPIs, colors, and layout, so every dashboard in the group ends up different.

## Part 1 — Generation without data

1. Open the VS Code chat.
2. Select **Ask** mode.

<details>
<summary><strong>Codex</strong></summary>

Codex has no **Ask** mode; its composer only shows a permissions selector (**Ask for approval**). Make it read-only through its project configuration instead:

1. Create `.codex/config.toml` in the project folder with:

   ```toml
   sandbox_mode = "read-only"
   approval_policy = "never"
   ```

2. Start a new Codex conversation so it loads the file. Codex can now read the project but cannot write files, run commands, or ask to do so.
3. Codex only loads project configuration for trusted projects. If it ignores the file, add the same two lines to `~/.codex/config.toml` and remember to change them in Part 2 and Exercise 2.
4. In step 3, add this line to the prompt; without it Codex only reports that it cannot write the file: `Return the complete HTML in your reply. Do not create or modify files.`

Alternative: run this exercise in ChatGPT (web or desktop app). In Part 2, upload the CSV files to the conversation.

</details>

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
- Codex has no mode called **Ask**: a `read-only` sandbox plus an explicit "reply in chat" instruction gives the same result (see the **Codex** block above).

## Part 2 — Generation with CSV data

1. Download [resources.zip](https://github.com/carlos-peiro-ntt/agentsdata/releases/latest/download/resources.zip) and extract it into a `resources` folder at the root of your project folder:
   - macOS: double-click the zip and move the resulting `resources` folder into your project folder.
   - Windows: right-click the zip, select **Extract All**, and set the destination to `<project folder>\resources`.
   - Linux or WSL: `unzip resources.zip -d <project folder>/resources`.

   Check that `resources/` contains the seven CSV files directly, without a nested folder.
2. Decide which KPIs, colors, and layout you want. Choose your own; do not copy a colleague's.

<details>
<summary><strong>Codex</strong></summary>

So Codex can request approval to write the dashboard, change `approval_policy` in `.codex/config.toml` and start a new Codex conversation. Send the prompt below without the extra line from Part 1.

```toml
sandbox_mode = "read-only"
approval_policy = "on-request"
```

</details>

3. Send the prompt, replacing the placeholders with your choices:

```text
Generate an HTML sales dashboard for business users using the CSV files in the `resources` folder.
Embed the data in a single self-contained HTML file that opens directly from disk. Do not start a local web server.
```

4. Review which files the agent wants to read and modify, and accept the changes after checking that it uses the CSV files. With Codex in `read-only`, this is the approval request to write the file.
5. Open the generated HTML file directly in the browser (double-click it or drag it into a browser window). If the agent offers to start a local server (for example `python -m http.server`), decline.

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
