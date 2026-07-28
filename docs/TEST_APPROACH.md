# Test Approach

## Overview

Automated test suite for the Cypress Kitchen Sink TodoMVC application using
Playwright + TypeScript with Allure reporting, Docker containerisation, and
GitHub Actions CI.

## Technology Stack

| Component          | Choice                        |
|--------------------|-------------------------------|
| Test framework     | Playwright v1.62              |
| Language           | TypeScript                    |
| Page Object Model  | Yes (TodoPage class)          |
| Test data          | Centralised constants file    |
| Reporting          | Allure (allure-playwright)    |
| Containerisation   | Docker (playwright:noble)     |
| CI                 | GitHub Actions                |

## Directory Structure

```
.
├── app/                          # Upstream application (Cypress Kitchen Sink)
├── tests/
│   ├── data/todos.ts             # Test data constants
│   ├── fixtures/todo.fixture.ts  # Playwright fixture (open page before each)
│   ├── pages/todo.page.ts        # Page Object Model
│   └── specs/
│       ├── todo-core.spec.ts     # P0 smoke tests
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
└── serve.json
```

## Test Design Principles

1. **Page Object Model**: All element selectors and interaction logic live in
   `TodoPage`. Specs contain only test logic (arrange/act/assert steps).

2. **Tag-based filtering**: Tests are tagged with `@smoke`/`@regression`/`@P0`/
   `@P1` for selective execution (e.g. smoke tests only).

3. **Test steps**: Each test uses `test.step` for readable, self-documenting
   output.

4. **Deterministic test data**: The test suite works against the app's defaults
   ("Pay electric bill", "Walk the dog") where possible. Where the app's bugs
   interfere (e.g. duplicate IDs), test data is seeded via localStorage.

5. **Expected-failure marker**: Tests that exercise known app bugs use
   `test.fail()` from Playwright. The test runs and captures evidence every
   execution. It records as "expected failure" while the defect exists and will
   alert the team with an unexpected pass after the defect is fixed.

## Run Modes

```bash
# All tests
npx playwright test

# Smoke tests only (P0)
npx playwright test --grep @smoke

# Single file
npx playwright test tests/specs/todo-core.spec.ts

# With Allure report
npx playwright test
./node_modules/allure-commandline/bin/allure generate allure-results -o allure-report --clean
./node_modules/allure-commandline/bin/allure open allure-report

# Docker
docker build -t hornet-qa-assessment .
docker run --rm hornet-qa-assessment
```

## CI Pipeline (`.github/workflows/assessment.yml`)

1. **Build**: Docker image build with MCR Playwright base + Java 21
2. **Test**: `npx playwright test` inside container
3. **Report**: `allure generate` → `allure-report/`
4. **Artifacts**: Upload `allure-results/`, `allure-report/`, `test-results/`
5. **Deploy**: Publish `allure-report/` to GitHub Pages

## Quality Findings

See `docs/QUALITY_FINDINGS.md` for the complete list of bugs and
testability issues discovered during this assessment.

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
