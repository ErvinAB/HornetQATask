# Hornetsecurity QA Automation Assessment

Playwright/TypeScript test suite for the [Cypress Kitchen
Sink](https://github.com/cypress-io/cypress-example-kitchensink) TodoMVC
application, with Allure reporting, Docker containerisation, and GitHub
Actions CI.

**Repository**: https://github.com/ErvinAB/HornetQATask
**GitHub Actions**: https://github.com/ErvinAB/HornetQATask/actions
**Allure Report (GitHub Pages)**: https://ervinab.github.io/HornetQATask/

> ⚠️ The GitHub Pages URL requires Pages to be configured at
> **Settings → Pages → Source: Deploy from branch → gh-pages / / (root)**.
> Until this is enabled, the URL returns HTTP 404.

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
npm ci
npx playwright install chromium
npm test
```

## Documentation

- [Test Approach](docs/TEST_APPROACH.md) — architecture, design decisions, CI
- [Quality Findings](docs/QUALITY_FINDINGS.md) — discovered bugs and issues
- [BUG-001](docs/BUG-001-duplicate-todo-ids.md) ([#1](https://github.com/ErvinAB/HornetQATask/issues/1)) — duplicate default Todo IDs (primary)
- [BUG-002](docs/BUG-002-empty-state-persistence.md) ([#2](https://github.com/ErvinAB/HornetQATask/issues/2)) — empty state persistence

## Prerequisites

- Node.js 20+
- Java 21+ (for Allure report generation)
- Docker (for containerised run, optional)

## Scripts

| Command | Description |
|---------|-------------|
| `npm test` | Run all Playwright tests (14 normal + 1 expected failure) |
| `npm run test:smoke` | Run P0 smoke tests only (6 tests) |
| `npm run test:regression` | Run P1 regression tests (9 tests) |
| `npm run test:known-issue` | Run BUG-002 expected-failure test only |
| `npx playwright test --headed` | Run in headed mode (visible browser) |
| `npx playwright test --debug` | Run with Playwright Inspector |
| `npm run test -- --grep @P0` | Run by priority tag |
| `npm run allure:generate` | Generate Allure HTML report from allure-results/ |
| `npm run allure:open` | Open Allure report in browser |
| `npm run typecheck` | TypeScript type-checking |
| `node scripts/server.cjs` | Start the custom static server (port 8080) |

## Test Count Explanation

The suite contains **15 tests**:
- **14 normal tests** that are expected to pass
- **1 expected-failure test** for BUG-002 (empty-state persistence)

The expected-failure test uses Playwright's `test.fail()` — it runs every
execution and is designed to fail. Playwright counts it as "passed" in the
exit code (test behaviour: the test is expected to fail, so failing is the
correct outcome). This test will alert the team by unexpectedly passing when
the underlying defect is fixed.

## CI Architecture

- **Test job** (`contents: read`): Checkout, install, type-check, build Docker,
  run tests inside container, generate Allure report, upload artifacts.
- **Publish job** (`contents: write`, `main` only): Download report artifact,
  deploy to `gh-pages` branch. Pull requests never get write permissions.
- **Full workflow**: https://github.com/ErvinAB/HornetQATask/actions

## Docker

```bash
docker build -t hornet-todo-assessment .
docker run --rm -e CI=true -e DOCKER=true hornet-todo-assessment
```

The Docker image uses `mcr.microsoft.com/playwright:v1.62.0-noble` with Java 21
for report generation. The container starts Playwright's built-in web server
automatically.

## Allure Report

Generate and view the report locally:

```bash
npm test
npx allure generate allure-results --clean -o allure-report
npx allure open allure-report
```

The report includes:
- **Environment info**: Browser, OS, Node version, CI status
- **Executor metadata**: Run ID, build URL, report URL (when generated in CI)
- **History trends**: Pass/fail/duration across CI runs (accumulated on `gh-pages`)
- **Step-level detail**: Full step tree for every test

> **History/trend mechanism**: On each `main` push, the CI workflow fetches
> the previous `history/` directory from the `gh-pages` branch before
> generating the new report. Concurrency on `main` is serialised to prevent
> race conditions on the history data. Trends start from the first CI run.

## Scope & Exclusions

| In scope | Excluded |
|----------|----------|
| Todo CRUD, filtering, toggle-all, clear-completed | Other Kitchen Sink pages |
| localStorage persistence | Cypress example tests |
| Known-defect regression (BUG-002) | API testing |
| Chromium only | Full accessibility audit |
| | Visual regression |
| | Performance testing |
| | Firefox / WebKit / mobile |

See [TEST_APPROACH.md](docs/TEST_APPROACH.md) for rationale.

## Main Technical Decisions

- **Custom static server** (in `scripts/server.cjs`) replaces `serve` /
  `serve-handler` to eliminate dependency vulnerabilities.
- **Allure 2** for historical trends and rich reporting.
- **`test.fail()`** for known-defect regression instead of skipping.
- **Least-privilege CI**: Read-only permissions for test job, write only for
  the publish job.
- **Hybrid test data**: Uses app defaults where possible, seeds localStorage
  where defects interfere.

## What I Would Improve With More Time

1. Cross-browser matrix (Firefox, WebKit)
2. Full a11y audit with `@axe-core/playwright`
3. Visual regression with `toHaveScreenshot()`
4. Deterministic BUG-001 reproduction test (requires source patch)
5. Performance budgets and load testing
6. Slack/email notifications for expected-failure status changes
7. Parallel smoke on push + full suite on PR
8. Workflow dispatch for targeted test suites
