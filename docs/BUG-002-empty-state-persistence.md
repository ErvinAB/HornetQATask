---
title: "[BUG-002] Empty Todo list is repopulated with default tasks after reload"
labels: bug
---

## Summary

When a user deletes every Todo item in the application and reloads the page, the
two default sample records ("Pay electric bill", "Walk the dog") reappear. An empty list
is not preserved across page reloads.

## Environment

- **Application**: TodoMVC VanillaJS (assessment version)
- **Browser**: Chromium 120+
- **Storage**: localStorage (key `todos-vanillajs`)

## Preconditions

1. The application has been loaded at least once so the default seed data exists
   in localStorage.

## Steps to Reproduce

1. Open the Todo application.
2. Confirm that two default items are visible: "Pay electric bill" and "Walk the dog".
3. Delete "Pay electric bill" by hovering over its row and clicking the × button.
4. Delete "Walk the dog" by the same method.
5. Verify the list is empty and the UI shows no todos (main section hidden,
   footer hidden or showing 0 items).
6. Reload the page (F5 / Cmd+R).
7. Observe the result.

## Expected Result

The list remains empty. A user who has deliberately cleared all tasks should
not see those tasks reappear after a reload.

## Actual Result

Both default items ("Pay electric bill", "Walk the dog") reappear immediately on reload.

## Frequency

100 % — every reload of an empty list.

## Impact

A user who intentionally removes every Todo cannot preserve an empty list
between sessions. Deleted sample tasks appear again, which makes persistence
unreliable and may cause users to distrust whether their changes were saved.

## Severity & Priority

- **Severity**: Medium
- **Priority**: P1 (high) — core data integrity issue

## Technical Observation

The `Store` constructor in `todo/src/store.js` calls `this._seed()` whenever
`localStorage` contains no data or an empty `todos` array. The `_seed()` method
writes two hard-coded records. The constructor does not distinguish between
"first-ever load" (where seeding is helpful) and "user deliberately cleared the
list" (where seeding is destructive).

A straightforward improvement would be to track whether the data was explicitly
cleared (e.g. via a `_cleared` flag or by checking a separate marker in
localStorage) so that an empty-but-intentional state is preserved.

Storing a user-facing empty array `{ todos: [] }` should be sufficient for the
store to skip re-seeding.

## Evidence

- Reproduced manually in Chromium.
- Confirmed from source code inspection: `store.js` `_seed()` is called
  unconditionally when the stored data is missing or empty.

## Acceptance Criteria

1. Delete all items via the UI.
2. Reload the page.
3. The list must remain empty.
4. New items can still be added normally.
5. Existing acceptance tests for add, complete, filter, and persistence of
   non-empty state must continue to pass.
