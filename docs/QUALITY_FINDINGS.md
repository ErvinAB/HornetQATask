# Quality Findings

## Product Defects

### BUG-001: Duplicate default Todo IDs break toggle-all and item updates

**Category**: Product defect (data integrity)  
**Severity**: High | **Priority**: P0  
**Status**: Confirmed — reproduced at ~80% frequency  
**Reference**: `docs/BUG-001-duplicate-todo-ids.md`

The `Store.prototype.save` method (`store.js:103`) generates IDs using
`new Date().getTime()`, which has millisecond granularity:

```js
updateData.id = new Date().getTime()
```

The `app.js:31-36` `init` function creates two default items synchronously
within the same millisecond, so both receive the **same** `id` value:

```js
todo.controller.addItem('Pay electric bill')
todo.controller.addItem('Walk the dog')
```

The `Store.prototype.save` update loop (`store.js:89-96`) only updates the
**first** matching item because it `break`s after the first match:

```js
for (let i = 0; i < todos.length; i++) {
  if (todos[i].id === id) {
    for (let key in updateData) {
      todos[i][key] = updateData[key]
    }
    break    // <-- second item never updated
  }
}
```

**Consequences**:
- `toggle-all` only toggles the first of the two default items; the second
  remains unchanged.
- Individual item operations that identify by ID may silently update the wrong
  record when multiple items share the same ID.

**Reproduction frequency**: 4 out of 5 fresh page loads in headless Chromium
produced duplicate IDs for the two default records.

**Test impact**: The toggle-all test seeds localStorage with explicit
deterministic IDs (`{ id: 1, ... }, { id: 2, ... }`) to work around this
defect for normal coverage. BUG-001 was reproduced through repeated exploratory
execution and localStorage inspection; there is no automated expected-failure
test for this defect because its ~80% timing-based reproduction would introduce
undesirable flakiness without modifying product source. BUG-002 is the one
automated expected-failure regression using `test.fail()`.

**Suggested fix**: Replace `new Date().getTime()` with a monotonically
increasing counter persisted in localStorage (e.g. a "high-water-mark"
approach), or use `crypto.randomUUID()`.

---

### BUG-002: Completely empty Todo state is not preserved after reload

**Category**: Product defect (behavioural)  
**Severity**: Medium | **Priority**: P1  
**Status**: Confirmed from source code and test execution

The `app.js:31-36` `init` function unconditionally seeds two default records
whenever `localStorage` is empty on page load:

```js
todo.storage.findAll((data) => {
  if (!data.length) {
    todo.controller.addItem('Pay electric bill')
    todo.controller.addItem('Walk the dog')
  }
})
```

A user who deletes every item cannot maintain an empty list across a page
reload because the init function re-seeds the defaults.

**Test impact**: Test `delete all todos — list stays empty after reload` is
registered as `test.fail()` (expected failure). It runs every execution and
will alert the team when the defect is fixed by unexpectedly passing.

**Suggested fix**: Remove the init-time seeding, or gate it behind a
first-visit flag (e.g. a `sessionStorage` marker or a "has been initialised"
flag stored in localStorage itself).

---

### BUG-003: Unsupported hash routes cause a JavaScript error

**Category**: Product defect (error handling)  
**Severity**: Low | **Priority**: P3  
**Status**: Confirmed from source code inspection

The `_setFilter` method in `view.js` runs:

```js
qs('.filters .selected').className = '';
qs('.filters [href="#/' + currentPage + '"]').className = 'selected';
```

If `currentPage` is an unexpected value (e.g. `#/unknown`), the second
`querySelector` returns `null` and the assignment throws:

```
Uncaught TypeError: Cannot set properties of null (setting 'className')
```

This crashes the filter update; the filter UI state becomes inconsistent.
(Other application functions were not tested after triggering this condition.)

**Suggested fix**: Guard against `null` before assigning `className`.

---

### BUG-004: Per-item controls lack accessible names

**Category**: Product defect (accessibility)  
**Severity**: Low (accessibility) | **Priority**: P2  
**Status**: Confirmed from source code inspection

The `.toggle` checkbox and `.destroy` button inside each `<li>` have no
`aria-label`, `aria-labelledby`, or `title` attribute. This makes them
inaccessible to screen readers and forces test automation to rely on fragile
CSS class selectors.

**Test impact**:
- Destroy button is hidden via CSS (`display: none`) until `<li>` hover.
  Tests must simulate hover before clicking `.destroy`.
- Checkbox has no accessible name, so
  `page.getByRole('checkbox', { name: ... })` does not work.

**Suggested fix**: Add `aria-label="Toggle todo"` and
`aria-label="Delete todo"` to the respective elements.

---

### BUG-005: Wrong document title

**Category**: Product defect (cosmetic)  
**Severity**: Low | **Priority**: P4  
**Status**: Confirmed from source code inspection

The `<title>` in `todo.html` reads `Cypress.io: Kitchen Sink`. This is a
copy-paste artifact from the Cypress Kitchen Sink application shell. It
should describe the Todo feature.

**Suggested fix**: Change the `<title>` to `TodoMVC: Vanilla JavaScript`.

---

## Testability / Configuration Notes

### N1: `data-test` attribute vs Playwright's default `data-testid`

**Category**: Testability / configuration concern (not a product defect)

The app uses `data-test="new-todo"` for the new-todo input element.
Playwright's `getByTestId()` default attribute is `data-testid`. This is a
selector convention mismatch, not a product bug.

**Resolution**: Configured `testIdAttribute: 'data-test'` in
`playwright.config.ts`.

### N2: Hidden toggle-all checkbox

**Category**: Testability observation (not a product defect)

The `.toggle-all` checkbox is visually hidden (`opacity: 0; position:
absolute; right: 100%; bottom: 100%`). A `<label for="toggle-all">` with
text "Mark all as complete" is provided as the visible click target, and
Playwright's `getByLabel('Mark all as complete').click()` reliably triggers
the checkbox's `change` event via the browser's built-in label-click
forwarding.

**Resolution**: The test clicks the visible `<label>` element rather than the
hidden checkbox directly.

### N3: CSS-selector interpolation with special characters (test implementation)

**Category**: Test implementation correction (not a product defect)

The original `todoItem()` method used string interpolation in a CSS selector:

```js
this.todoList.locator(`li:has(label:text-is("${title}"))`);
```

Titles containing double quotes or angle brackets (e.g.
`<script>alert("xss")</script>`) broke the CSS selector syntax.

**Resolution**: Changed to Playwright's `filter({ hasText: title })` API,
which handles special characters internally.
