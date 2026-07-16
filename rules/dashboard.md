# Dashboard Privacy and Data Governance

These rules are mandatory for every dashboard, analysis, and generated document.

## Dashboard Data Source

- Do not use the `resources/` directory or any CSV file as a data source. Those files are no longer available at this stage of the workshop.
- Retrieve all data required by the dashboard from the configured Supabase MCP in read-only mode.
- Inspect and validate the Supabase schemas and tables before downloading the required data and embedding the validated snapshot in the self-contained HTML dashboard.
- Never include Supabase credentials or a runtime database connection in the generated HTML.
- If the Supabase MCP is unavailable or the required data cannot be retrieved, stop and report the limitation. Do not fall back to CSV files, sample data, or invented values.

## Privacy and GDPR

- Never display or expose first name, last name, email address, date of birth, postal code, or any field that can identify a natural person.
- This prohibition applies to charts, KPIs, tooltips, labels, legends, filters, tables, embedded HTML/JavaScript data, source-code examples, and Confluence documentation.
- User-profile analysis may use only anonymized attributes such as `segmento_cliente`, `genero`, and `comunidad_autonoma`.
- Document in the dashboard source code why first and last names are intentionally excluded from the analysis.

## Data-Quality Gate

- Validate every required source table separately before generating dashboard or documentation output.
- Record a clear `PASS` or `FAIL` result for every table.
- Check join cardinality by comparing row counts before and after each join.
- Abort generation if a join unexpectedly increases the row count or duplicates sales records.
- Report failed checks and limitations instead of producing potentially misleading KPIs.

## Confluence Publishing

- Always create dashboard documentation as a child page of Confluence page ID `1430576442`, space_key `IADEIADATAENGINEERS`.
- Use exactly this title pattern: `{creator name} - Informe ventas`.
- Never create the report at the Confluence root or under another parent page.