import { test, expect } from '../fixtures/todo.fixture';
import { DEFAULT_TODOS, TODO_TITLES } from '../data/todos';

test.describe('Todo Core — P0 / Smoke', () => {

  test('initial application state shows the two default todos and correct active count',
    { tag: ['@smoke', '@P0'] }, async ({ todoPage }) => {
      await test.step('open the application', async () => {
        await todoPage.open();
      });

      await test.step('verify two default todos are visible', async () => {
        await todoPage.expectVisibleTodos([TODO_TITLES.DEFAULT_1, TODO_TITLES.DEFAULT_2]);
      });

      await test.step('verify the active count shows 2', async () => {
        await todoPage.expectCount(2);
      });

      await test.step('verify main and footer are visible', async () => {
        await todoPage.expectMainAndFooterVisible(true);
      });
    });

  test('a user can add a Todo; surrounding whitespace is trimmed and the input is cleared',
    { tag: ['@smoke', '@P0'] }, async ({ todoPage }) => {
      await test.step('open the application', async () => {
        await todoPage.open();
      });

      await test.step('add a new todo with surrounding whitespace', async () => {
        await todoPage.addTodo(`  ${TODO_TITLES.NEW_ITEM}  `);
      });

      await test.step('verify the new todo appears trimmed', async () => {
        await todoPage.expectVisibleTodos([
          TODO_TITLES.DEFAULT_1,
          TODO_TITLES.DEFAULT_2,
          TODO_TITLES.NEW_ITEM,
        ]);
      });

      await test.step('verify the input field is cleared', async () => {
        await expect(todoPage.newTodoInput).toHaveValue('');
      });

      await test.step('verify the active count is updated', async () => {
        await todoPage.expectCount(3);
      });
    });

  test('a user can complete and uncomplete a Todo; styling, checkbox and active counter remain consistent',
    { tag: ['@smoke', '@P0'] }, async ({ todoPage }) => {
      await test.step('open the application', async () => {
        await todoPage.open();
      });

      await test.step('complete the first todo', async () => {
        await todoPage.toggleTodo(TODO_TITLES.DEFAULT_1);
      });

      await test.step('verify the todo shows completed styling', async () => {
        await todoPage.expectTodoCompleted(TODO_TITLES.DEFAULT_1, true);
      });

      await test.step('verify the active count decrements', async () => {
        await todoPage.expectCount(1);
      });

      await test.step('uncomplete the todo', async () => {
        await todoPage.toggleTodo(TODO_TITLES.DEFAULT_1);
      });

      await test.step('verify the todo is active again', async () => {
        await todoPage.expectTodoCompleted(TODO_TITLES.DEFAULT_1, false);
      });

      await test.step('verify the active count returns to original', async () => {
        await todoPage.expectCount(2);
      });
    });
});
