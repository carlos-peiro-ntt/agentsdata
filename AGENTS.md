# AGENTS.md

## Project Overview

This repository contains a standalone retail sales dashboard in [dashboard.html](dashboard.html). The main goal is to build and iterate on a business-facing sales dashboard without introducing unnecessary dependencies. Dashboard data is sourced from the configured Supabase MCP, validated, and embedded into the self-contained HTML output.

## Business Context

This project is a retail sales analytics dashboard for business users.

The primary goal is to help business stakeholders understand sales performance through reliable KPIs, interactive visualizations, and actionable insights.

## Repository Entry Points

Use this file as the main entry point for future agents working in this repository. The supporting guidance lives in:

- Instructions: [.github/instructions/dashboard.instructions.md](.github/instructions/dashboard.instructions.md)
- Skills: [.agents/skills/](.agents/skills/) and the registry snapshot in [skills-lock.json](skills-lock.json)
- MCP configuration: [.vscode/mcp.json](.vscode/mcp.json)

## Agent Guidance

When working on this project:

- Prioritize business insights over visual complexity.
- Treat [.github/instructions/dashboard.instructions.md](.github/instructions/dashboard.instructions.md) as the governing source for dashboard data, privacy, validation, and publishing rules.
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

## Dashboard Instructions

Read and follow [.github/instructions/dashboard.instructions.md](.github/instructions/dashboard.instructions.md) before generating dashboard content or related documentation. It is the single source of truth for the mandatory data source, privacy, data-quality, self-contained HTML, and Confluence publishing constraints.

## Business KPIs

When relevant, prioritize metrics such as:

- Revenue
- Margin %
- Average Ticket
- Sales by Channel
- Sales by Category
- Conversion
- Units Sold

## Local Validation

- For browser-only changes, validate by serving the repo with a local HTTP server and opening the dashboard in a browser.
- If JavaScript is edited, check the browser console for data loading, parsing, or embedding errors.
- There are no project build or test scripts in this repository by default.