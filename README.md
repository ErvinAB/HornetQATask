# Hornetsecurity QA Automation Assessment

Playwright/TypeScript test suite for the [Cypress Kitchen
Sink](https://github.com/cypress-io/cypress-example-kitchensink) TodoMVC
application, with Allure reporting, Docker containerisation, and GitHub
Actions CI.

## Upstream Application

| Field | Value |
|-------|-------|
| Repository | `https://github.com/cypress-io/cypress-example-kitchensink` |
| Imported SHA | `9642cc1d45480073f5197fe9e43b0cbb0471fc8b` |
| License | MIT — Copyright (c) 2019 Cypress.io, Inc. |
| Served at | `/todo` (via `serve.json` rewrite) |
| Files copied | `app/`, `LICENSE`, `serve.json` |

No application source code was modified. The only addition to `serve.json` is the
`/todo` → `/todo.html` rewrite rule and `Cache-Control: no-cache` headers.

## Quick Start

```bash
npm install
npx playwright install chromium
npx playwright test
```

## Documentation

- [Test Approach](docs/TEST_APPROACH.md) — architecture, design decisions, CI
- [Quality Findings](docs/QUALITY_FINDINGS.md) — discovered bugs and issues
- [BUG-001](docs/BUG-001-duplicate-todo-ids.md) — duplicate default Todo IDs (primary)
- [BUG-002](docs/BUG-002-empty-state-persistence.md) — empty state persistence

## Prerequisites

- Node.js 20+
- Java 21+ (for Allure report generation)
- Docker (for containerised run, optional)

## Scripts

| Command | Description |
|---------|-------------|
| `npm test` | Run all Playwright tests |
| `npm run test:smoke` | Run P0 smoke tests only |
| `npm run allure:generate` | Generate Allure HTML report |
| `npm run allure:open` | Open Allure report in browser |
| `docker build -t hornet-todo-assessment . && docker run hornet-todo-assessment` | Run in Docker |
