# BUG-001: Duplicate default Todo IDs break toggle-all and item-level updates

**GitHub Issue**: [#1](https://github.com/ErvinAB/HornetQATask/issues/1)

## Summary

The two default Todo records created during `app.js` initialisation can receive
the same numeric ID because the `Store` generates IDs using
`new Date().getTime()` at millisecond granularity, and both `addItem` calls
are synchronous.

## Severity & Priority

- **Severity**: High — breaks a core user operation (toggle-all) and can cause
  silent data corruption (updating or deleting the wrong record).
- **Priority**: P0 — directly affects the most basic feature usability.
- **Category**: Product defect (data integrity).

## Environment

- Application: Cypress Kitchen Sink TodoMVC (vanilla JavaScript)
- Source: https://github.com/cypress-io/cypress-example-kitchensink
- Imported at SHA: `9642cc1d45480073f5197fe9e43b0cbb0471fc8b`
- Observed in: Chromium headless (Playwright v1.62.0)
- Reproduction rate: ~80 % of fresh page loads

## Steps to reproduce

1. Open the Todo application at `/todo` with an empty localStorage.
2. Let the `init` function create the two default items
   ("Pay electric bill", "Walk the dog").
3. Inspect `localStorage['todos-vanillajs']` — observe the `id` values.
4. Click the toggle-all checkbox (or the associated label).
5. Inspect `localStorage['todos-vanillajs']` again.

## Expected result

- Both records should have different numeric IDs.
- Both records should have `"completed": true` after toggle-all.

## Actual result

- Both records frequently have the same `id` (same `Date.now()` millisecond).
- In that case, toggle-all only marks the **first** item as completed; the
  second item remains `"completed": false`.

## Root cause

`store.js:103` — ID generation:
```js
updateData.id = new Date().getTime()
```

`store.js:89-96` — update loop exits after first ID match:
```js
if (todos[i].id === id) {
  todos[i][key] = updateData[key]
  break   // <-- only the first match is updated
}
```

`app.js:31-36` — both addItem calls are synchronous, so `getTime()` can return
the same value:
```js
todo.controller.addItem('Pay electric bill')
todo.controller.addItem('Walk the dog')
```

## Suggested fix

Replace `new Date().getTime()` with a monotonically increasing counter
persisted in localStorage:

```js
// store.js — inside Store constructor or save method
this._lastId = parseInt(localStorage.getItem(this._dbName + '-lastId') || '0', 10)
// When creating a new item:
updateData.id = ++this._lastId
localStorage.setItem(this._dbName + '-lastId', String(this._lastId))
```

Alternatively, use `crypto.randomUUID()` where supported, or concatenate the
timestamp with a session-scoped counter.
