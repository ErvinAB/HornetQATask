import { test, expect } from '../fixtures/todo.fixture';
import { TODO_TITLES } from '../data/todos';

test.describe('Todo Filtering — P0 / P1', () => {

  test.beforeEach(async ({ todoPage }) => {
    await todoPage.open();
  });

  test('Active and Completed filters display only correct records and visibly select the correct route',
    { tag: ['@smoke', '@P0'] }, async ({ todoPage }) => {
      await test.step('complete the first todo', async () => {
        await todoPage.toggleTodo(TODO_TITLES.DEFAULT_1);
      });

      await test.step('filter Active — only active todo should show', async () => {
        await todoPage.selectFilter('Active');
        await todoPage.expectVisibleTodos([TODO_TITLES.DEFAULT_2]);
        await todoPage.expectSelectedFilter('Active');
      });

      await test.step('filter Completed — only completed todo should show', async () => {
        await todoPage.selectFilter('Completed');
        await todoPage.expectVisibleTodos([TODO_TITLES.DEFAULT_1]);
        await todoPage.expectSelectedFilter('Completed');
      });

      await test.step('filter All — both todos should show', async () => {
        await todoPage.selectFilter('All');
        await todoPage.expectVisibleTodos([TODO_TITLES.DEFAULT_1, TODO_TITLES.DEFAULT_2]);
        await todoPage.expectSelectedFilter('All');
      });
    });

  test('toggle-all completes all active records and can return all records to active',
    { tag: ['@regression', '@P1'] }, async ({ page, todoPage }) => {
      await test.step('seed items with unique IDs (workaround for duplicate-ID bug)', async () => {
        await page.evaluate(() => {
          localStorage.setItem('todos-vanillajs', JSON.stringify([
            { id: 1, title: 'Pay electric bill', completed: false },
            { id: 2, title: 'Walk the dog', completed: false },
          ]));
        });
        await page.reload();
      });

      await test.step('toggle all to complete everything', async () => {
        await todoPage.toggleAll();
      });

      await test.step('verify both todos show completed', async () => {
        await todoPage.expectTodoCompleted(TODO_TITLES.DEFAULT_1, true);
        await todoPage.expectTodoCompleted(TODO_TITLES.DEFAULT_2, true);
      });

      await test.step('verify active count is 0', async () => {
        await todoPage.expectCount(0);
      });

      await test.step('toggle all again to reactivate everything', async () => {
        await todoPage.toggleAll();
      });

      await test.step('verify both todos are active again', async () => {
        await todoPage.expectTodoCompleted(TODO_TITLES.DEFAULT_1, false);
        await todoPage.expectTodoCompleted(TODO_TITLES.DEFAULT_2, false);
      });

      await test.step('verify active count is 2', async () => {
        await todoPage.expectCount(2);
      });
    });

  test('clear-completed removes only completed records and disappears afterward',
    { tag: ['@regression', '@P1'] }, async ({ todoPage }) => {
      await test.step('complete one todo', async () => {
        await todoPage.toggleTodo(TODO_TITLES.DEFAULT_1);
      });

      await test.step('verify clear completed button is visible', async () => {
        await todoPage.expectClearCompletedVisible(true);
      });

      await test.step('clear completed items', async () => {
        await todoPage.clearCompletedAction();
      });

      await test.step('verify only active todo remains', async () => {
        await todoPage.expectVisibleTodos([TODO_TITLES.DEFAULT_2]);
      });

      await test.step('verify active count is 1', async () => {
        await todoPage.expectCount(1);
      });

      await test.step('verify clear completed button is no longer visible', async () => {
        await todoPage.expectClearCompletedVisible(false);
      });
    });
});
