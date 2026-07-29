# Test Approach

## Overview

Automated test suite for the Cypress Kitchen Sink TodoMVC application using
Playwright + TypeScript with Allure reporting, Docker containerisation, and
GitHub Actions CI. 15 tests covering core CRUD, filtering, persistence, and
known-defect regression.

## Technology Stack

| Component          | Choice                        |
|--------------------|-------------------------------|
| Test framework     | Playwright v1.62              |
| Language           | TypeScript                    |
| Page Object Model  | Yes (TodoPage class)          |
| Test data          | Centralised constants file    |
| Reporting          | Allure 2 (allure-playwright)  |
| Containerisation   | Docker (mcr.microsoft.com/playwright:v1.62.0-noble) |
| CI                 | GitHub Actions                |

## Directory Structure

```
.
├── app/                          # Upstream application (Cypress Kitchen Sink)
├── scripts/
│   └── server.cjs                # Custom zero-dependency static server
├── tests/
│   ├── data/todos.ts             # Test data constants
│   ├── fixtures/todo.fixture.ts  # Playwright fixture (constructs TodoPage only)
│   ├── pages/todo.page.ts        # Page Object Model
│   └── specs/
│       ├── todo-core.spec.ts     # P0 smoke tests (add, complete, uncomplete)
│       ├── todo-editing.spec.ts  # P0/P1 editing & deletion
│       ├── todo-filtering.spec.ts# P0/P1 filters & toggle-all
│       └── todo-persistence.spec.ts# P1 localStorage persistence
├── docs/
│   ├── BUG-001-duplicate-todo-ids.md
│   ├── BUG-002-empty-state-persistence.md
│   ├── QUALITY_FINDINGS.md
│   └── TEST_APPROACH.md
├── allure-results/               # Allure raw results (gitignored)
├── allure-report/                # Allure HTML report (gitignored)
├── playwright.config.ts
├── Dockerfile
├── .github/workflows/assessment.yml
└── scripts/server.cjs
```

## Scope & Exclusions

### In scope

- Todo CRUD (add, complete, uncomplete, edit, delete)
- Filtering (All, Active, Completed)
- Toggle-all / clear-completed
- localStorage persistence (seeded, non-empty)
- Known-defect regression for BUG-002
- Chromium only (single-browser)

### Exclusions (with reasons)

| Exclusion | Reason |
|-----------|--------|
| **Other Kitchen Sink pages** (`commands/*`, `cypress-api.html`, etc.) | Assessment scope is the TodoMVC application only |
| **Cypress example tests** | Those are upstream examples for Cypress, not relevant to Playwright validation |
| **API testing** | The app is a client-side-only vanilla JS SPA with no backend |
| **Full accessibility audit** | Would require axe-core or similar tool; scope would extend significantly; a single a11y finding (BUG-004) was captured via source inspection |
| **Visual regression** | Requires screenshot baselines and a comparison service; excluded to keep scope focused on functional correctness |
| **Performance testing** | No performance requirements were specified; the app is a lightweight demo |
| **Firefox / WebKit** | Playwright fully supports cross-browser, but the task explicitly focused on Chromium; expanding the matrix would multiply execution time without proportional benefit for a vanilla JS demo |
| **Mobile viewports** | The app is not responsive; mobile testing would add no value |

## Priorities & Risk Model

Tests are tagged with priority levels based on impact and user visibility:

| Priority | Label | Criteria | Tests |
|----------|-------|----------|-------|
| P0 | `@P0` | Core user flows; failure blocks primary use | add, complete, edit, delete, filter |
| P1 | `@P1` | Secondary flows; edge cases, persistence | toggle-all, clear-completed, whitespace, HTML chars, escape, empty edit, persistence, known-defect |

## Test Design Principles

1. **Page Object Model**: All element selectors and interaction logic live in
   `TodoPage`. Specs contain only test logic (arrange/act/assert steps).

2. **Tag-based filtering**: Tests tagged with `@smoke`/`@regression`/`@P0`/
   `@P1` for selective execution.

3. **Test steps**: Each test uses `test.step` for readable, self-documenting
   output.

4. **Deterministic test data**: Tests work against the app's defaults where
   possible. For toggle-all, localStorage is seeded with unique IDs to isolate
   intended behaviour from the duplicate-ID defect (BUG-001).

5. **Expected-failure marker**: The BUG-002 regression uses `test.fail()`
   (Playwright API). It runs every execution and will alert the team with an
   unexpected pass when the defect is fixed.

## Assumptions

- The application is served locally at `http://127.0.0.1:8080/todo/`
- Browser is Chromium in headless mode
- No authentication or session management is required
- All test state is isolated to localStorage key `todos-vanillajs`

## Hybrid Test-Data Strategy

- **Defaults where possible**: Many tests use the app's built-in defaults
  ("Pay electric bill", "Walk the dog") to validate realistic user paths.
- **Seeded where necessary**: The toggle-all test and the persistence seed test
  bypass app defaults by writing explicit `localStorage` entries to ensure
  deterministic IDs and known state.
- **Fixtures**: The `TodoPage` is constructed via Playwright's fixture system
  but tests control page navigation explicitly (no auto-open).

## Isolation & Parallel Execution

- Tests run with `fullyParallel: true` — each test gets its own browser context
  with isolated localStorage.
- Workers default to CPU count (local) or 2 (CI) to balance speed against
  resource constraints inside Docker.
- Each test opens the page independently via `todoPage.open()` or via
  `page.addInitScript` for seeded tests, ensuring no cross-test contamination.

## Locator Strategy

- `getByTestId('new-todo')` for the input (uses `data-test` attribute)
- `locator('.todo-list li').filter({ hasText })` for finding todo items
- Role-based: `getByRole('link', { name: filter })` for filter links
- Label-based: `getByLabel('Mark all as complete')` for toggle-all
- CSS class names for structural elements (`.main`, `.footer`, `.todo-count`)
- CSS class checking for completed state (`toHaveClass(/completed/)`)

## Why Allure 2

Allure 2 was chosen over Playwright's built-in HTML reporter for:

- **History trends**: Tracks pass/fail/duration across CI runs
- **Environment info**: Captures browser, OS, Node version per run
- **Executor metadata**: Links each report to its CI build
- **Step-level detail**: Full step tree with pass/fail per step
- **Custom widgets**: Behaviours, categories, severity views

The `allure-playwright` adapter integrates with zero config; the `allure-commandline`
package generates the report.

## Evidence Strategy

- **Screenshots**: Captured on failure only (`screenshot: 'only-on-failure'`)
- **Video**: Retained on failure (`video: 'retain-on-failure'`)
- **Trace**: Retained on failure (`trace: 'retain-on-failure'`)
- **Allure steps**: All test steps are recorded via `test.step`, visible in the
  Allure report tree
- **Expected failure capture**: The BUG-002 test uses `test.fail()` — it runs to
  completion, captures screenshot/video/trace of the actual failure, and the
  error is visible in Allure as a "passed" test with failure detail in
  `statusDetails`

## History / Trend Mechanism

- On each `main` push, the CI workflow fetches the previous Allure report from
  the `gh-pages` branch.
- The `history/` directory (containing `history-trend.json`, `retry-trend.json`,
  `categories-trend.json`, `duration-trend.json`) is copied into
  `allure-results/history/` before `allure generate`.
- The new report includes trend data from all previous runs.
- Concurrency on `main` is serialised (`main-deploy` group) to prevent race
  conditions on the `gh-pages` branch.
- The first run has no history to restore; trends start from that run.

## CI Security Decisions

- **Test job**: `contents: read` — only needs to check out code, upload
  artifacts, and read the `gh-pages` branch for history. No write access.
- **Publish job**: `contents: write` — runs only on `main` pushes;
  writes to the `gh-pages` branch. Pull requests never get write permissions.
- **No `pages: write` or `id-token: write`**: Deployment is done by writing
  to the `gh-pages` branch, not through the official Pages deployment API,
  so the broader Pages permission set is not required.
- **`actions/checkout`, `actions/setup-node`, `actions/upload-artifact`**:
  Pinned to `@v7` (Node 24 compatible) to avoid Node 20 deprecation warnings.

## Known-Defect Handling

| Defect | Handling |
|--------|----------|
| **BUG-001** (duplicate IDs) | Toggle-all test seeds unique IDs to work around the defect. No automated fail-expect test because ~80% reproduction would introduce flakiness. |
| **BUG-002** (empty state) | Automated `test.fail()` regression. Runs every execution; expected to fail. Will unexpectedly pass when the defect is fixed, alerting the team. |

## Run Modes

```bash
# All tests
npm test

# Smoke only (P0)
npm run test:smoke

# Regression only (P1)
npm run test:regression

# Known-issue only
npm run test:known-issue

# Single file
npx playwright test tests/specs/todo-core.spec.ts

# With Allure report
npm test
npx allure generate allure-results --clean -o allure-report
npx allure open allure-report

# Docker
docker build -t hornet-todo-assessment .
docker run --rm -e CI=true -e DOCKER=true hornet-todo-assessment
```

## CI Pipeline (`.github/workflows/assessment.yml`)

1. **Test job** (`contents: read`): Check out, install, type-check, build Docker,
   run tests, restore Allure history, generate report, upload artifacts.
2. **Publish job** (`contents: write`, `main` only): Download report artifact,
   publish to `gh-pages`, fail if tests failed.

## Quality Findings

See `docs/QUALITY_FINDINGS.md` for the complete list.

### Summary

| ID | Finding | Category | Severity | Status |
|----|---------|----------|----------|--------|
| BUG-001 | Duplicate default Todo IDs break toggle-all | Product defect | High | Confirmed |
| BUG-002 | Empty state not preserved after reload | Product defect | Medium | Confirmed |
| BUG-003 | Unsupported hash route causes JS error | Product defect | Low | Confirmed |
| BUG-004 | Controls lack accessible names | Product defect (a11y) | Low | Confirmed |
| BUG-005 | Wrong document title | Product defect (cosmetic) | Low | Confirmed |
| N1 | `data-test` vs `data-testid` convention | Testability concern | — | Resolved |
| N2 | Hidden toggle-all interaction | Testability observation | — | Resolved |
| N3 | CSS-selector interpolation with special chars | Test impl. correction | — | Resolved |

## Limitations

- Single browser (Chromium only)
- No visual regression or full a11y audit
- Known-defect test for BUG-001 is not automated (would be flaky)
- Performance and load testing not included
- No cross-browser or mobile matrix

## What Would Be Improved With More Time

1. **Cross-browser matrix**: Add Firefox and WebKit workers to the Playwright
   project configuration.
2. **Full accessibility audit**: Integrate `@axe-core/playwright` into the
   fixture to run automated a11y checks on every page state.
3. **Visual regression**: Add Playwright's `expect().toHaveScreenshot()` for
   critical UI states with CI-managed baselines.
4. **BUG-001 deterministic reproduction**: If product source could be patched
   (e.g., add a `performance.now()` offset), convert the expected-failure test
   from non-deterministic to reliable.
5. **Performance budget**: Track page load time and interaction latencies via
   Playwright's Performance API.
6. **API layer**: If a backend were added, extend tests with API validation.
7. **GitHub Actions matrix**: Run smoke tests on push and full suite on PR.
8. **Slack notifications**: Alert the team when expected-failure tests flip to
   unexpected pass.
