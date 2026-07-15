# AGENTS.md

## Project Overview

This repository contains a standalone retail sales dashboard in [web.html](web.html) that loads CSV data from [resources/](resources/). The main goal is to build and iterate on a business-facing sales dashboard without introducing unnecessary dependencies.

## Business Context

This project is a retail sales analytics dashboard for business users.

The primary goal is to help business stakeholders understand sales performance through reliable KPIs, interactive visualizations, and actionable insights.

## Agent Guidance

When working on this project:

- Prioritize business insights over visual complexity.
- Validate data quality before calculating or presenting KPIs.
- Clearly identify the source CSVs used for each metric.
- Report data-quality limitations before making recommendations.
- Prefer simple, business-readable dashboards with interactive filtering.
- Keep the current standalone HTML architecture unless a different technical approach is explicitly requested.
- Avoid introducing external dependencies unless explicitly approved.

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
- If JavaScript is edited, check the browser console for CSV loading or parsing errors.
- There are no project build or test scripts in this repository by default.