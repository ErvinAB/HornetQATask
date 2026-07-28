import { test, expect } from '../fixtures/todo.fixture';
import { DEFAULT_TODOS, TODO_TITLES, STORAGE_KEY, seedLocalStorage } from '../data/todos';

test.describe('Todo Persistence — P1 / Regression', () => {

  test('a normal non-empty state persists after reload',
    { tag: ['@regression', '@P1'] }, async ({ todoPage }) => {
      await test.step('add a new todo item via UI', async () => {
        await todoPage.open();
        await todoPage.addTodo(TODO_TITLES.NEW_ITEM);
      });

      await test.step('reload the page', async () => {
        await todoPage.reload();
      });

      await test.step('verify all three todos are still present', async () => {
        await todoPage.expectVisibleTodos([
          TODO_TITLES.DEFAULT_1,
          TODO_TITLES.DEFAULT_2,
          TODO_TITLES.NEW_ITEM,
        ]);
      });

      await test.step('verify the active count is correct', async () => {
        await todoPage.expectCount(3);
      });
    });

  test.describe('BUG-002: empty state is not preserved after reload', () => {

    test('delete all todos — list stays empty after reload (known issue)',
      { tag: ['@regression', '@P1', '@known-issue'] }, async ({ todoPage }) => {
        test.fail(
          true,
          'BUG-002: app.js re-seeds defaults when localStorage is empty after reload. ' +
          'Expected: empty list survives reload. Actual: defaults are re-seeded.',
        );

        await test.step('delete all todos via UI', async () => {
          await todoPage.open();
          await todoPage.deleteTodo(TODO_TITLES.DEFAULT_1);
          await todoPage.deleteTodo(TODO_TITLES.DEFAULT_2);
        });

        await test.step('verify the list is empty', async () => {
          await todoPage.expectTodoListEmpty();
        });

        await test.step('reload the page', async () => {
          await todoPage.reload();
        });

        await test.step('verify the list remains empty', async () => {
          await todoPage.expectTodoListEmpty();
        });
      });

    test('seeded todos from localStorage survive a reload',
      { tag: ['@regression', '@P1'] }, async ({ todoPage, page }) => {
        await test.step('seed deterministic todos into localStorage before navigation', async () => {
          await page.addInitScript((data: string) => {
            localStorage.setItem('todos-vanillajs', data);
          }, seedLocalStorage([
            { id: 100, title: 'Seeded todo A', completed: false },
            { id: 101, title: 'Seeded todo B', completed: true },
          ]));
          await todoPage.open();
        });

        await test.step('verify seeded todos are visible', async () => {
          await todoPage.expectVisibleTodos(['Seeded todo A', 'Seeded todo B']);
        });

        await test.step('verify completed state is correct', async () => {
          await todoPage.expectTodoCompleted('Seeded todo B', true);
        });

        await test.step('verify active count', async () => {
          await todoPage.expectCount(1);
        });
      });
  });
});
