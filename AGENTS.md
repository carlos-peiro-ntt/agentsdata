# AGENTS.md

## Project Overview

This repository contains a standalone retail sales dashboard in [web.html](web.html). The main goal is to build and iterate on a business-facing sales dashboard without introducing unnecessary dependencies. Dashboard data is now sourced from the configured Supabase MCP, validated, and embedded into the self-contained HTML output.

## Business Context

This project is a retail sales analytics dashboard for business users.

The primary goal is to help business stakeholders understand sales performance through reliable KPIs, interactive visualizations, and actionable insights.

## Repository Entry Points

Use this file as the main entry point for future agents working in this repository. The supporting guidance lives in:

- Rules: [rules/dashboard.md](rules/dashboard.md)
- Skills: [.agents/skills/](.agents/skills/) and the registry snapshot in [skills-lock.json](skills-lock.json)
- MCP configuration: [.vscode/mcp.json](.vscode/mcp.json)

## Agent Guidance

When working on this project:

- Prioritize business insights over visual complexity.
- Treat [rules/dashboard.md](rules/dashboard.md) as the governing source for dashboard data, privacy, validation, and publishing rules.
- Retrieve required data through the read-only Supabase MCP and embed the validated snapshot in the HTML dashboard.
- Validate each required source table and join before presenting KPIs, and stop if a required check fails.
- If the Supabase MCP is unavailable or the required data cannot be retrieved, stop and report the limitation rather than falling back to CSVs, sample data, or invented values.
- Exclude personal data and never surface names, email addresses, birth dates, postal codes, or other identifying fields.
- Report data-quality limitations before making recommendations.
- Prefer simple, business-readable dashboards with interactive filtering.
- Keep the current standalone HTML architecture unless a different technical approach is explicitly requested.
- Avoid introducing external dependencies unless explicitly approved.

## Available Skills

Use skills for task-specific guidance, design patterns, or domain workflows. They are the right tool when the problem is about how to think, structure, or present work rather than where to fetch data from.

- [frontend-design](.agents/skills/frontend-design/SKILL.md): use when shaping the UI, layout, typography, motion, or visual identity of the dashboard.
- [kpi-dashboard-design](.agents/skills/kpi-dashboard-design/SKILL.md): use when selecting KPIs, organizing metric hierarchies, comparing business measures, or checking dashboard logic against KPI best practices.

## Available MCP Servers

Use MCPs when the task needs live access to an external system, source-of-truth data, or repository-backed metadata that is not already in the local files.

- [confluence](.vscode/mcp.json): read and search Confluence content for project documentation, page content, attachments, and related page metadata.
- [supabase](.vscode/mcp.json): run read-only database operations against the Supabase project for schema inspection and SQL reads.

## Skill Versus MCP

Prefer a skill when the task is about guidance, judgment, or a repeatable workflow, such as choosing KPIs or designing a screen.

Prefer an MCP when the task needs current data, repository-backed records, or verification against an external system, such as reading a Confluence page or checking Supabase tables.

Use both when helpful: a skill can define the approach, and an MCP can supply the evidence.

## Dashboard Rules

When generating dashboard content or related documentation, follow the constraints in [rules/dashboard.md](rules/dashboard.md): use Supabase rather than CSV files, keep the HTML self-contained, enforce the data-quality gate, and publish Confluence documentation only as the specified child page under the approved parent.

## Business KPIs

When relevant, prioritize metrics such as:

- Revenue
- Margin %
- Average Ticket
- Sales by Channel
- Sales by Category
- Conversion
- Units Sold

## Data Quality

Before presenting results:

- Validate null or missing values.
- Check referential integrity across dimension tables.
- Detect anomalous values, including unusual price drops and potential stock issues.
- Explain any limitations that may affect the reliability of the analysis.

## Local Validation

- For browser-only changes, validate by serving the repo with a local HTTP server and opening the dashboard in a browser.
- If JavaScript is edited, check the browser console for data loading, parsing, or embedding errors.
- There are no project build or test scripts in this repository by default.