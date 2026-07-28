import { test, expect } from '../fixtures/todo.fixture';
import { TODO_TITLES } from '../data/todos';

test.describe('Todo Editing — P0 / P1', () => {

  test.beforeEach(async ({ todoPage }) => {
    await todoPage.open();
  });

  test('a user can edit and save a Todo',
    { tag: ['@smoke', '@P0'] }, async ({ todoPage }) => {
      await test.step('edit the first todo item', async () => {
        await todoPage.editTodo(TODO_TITLES.DEFAULT_1, TODO_TITLES.EDIT_ITEM);
      });

      await test.step('verify the todo title was updated', async () => {
        await todoPage.expectVisibleTodos([TODO_TITLES.EDIT_ITEM, TODO_TITLES.DEFAULT_2]);
      });

      await test.step('verify the active count remains 2', async () => {
        await todoPage.expectCount(2);
      });
    });

  test('a user can delete a Todo',
    { tag: ['@smoke', '@P0'] }, async ({ todoPage }) => {
      await test.step('delete the first todo', async () => {
        await todoPage.deleteTodo(TODO_TITLES.DEFAULT_1);
      });

      await test.step('verify only the second todo remains', async () => {
        await todoPage.expectVisibleTodos([TODO_TITLES.DEFAULT_2]);
      });

      await test.step('verify the active count is 1', async () => {
        await todoPage.expectCount(1);
      });
    });

  test('whitespace-only input is ignored',
    { tag: ['@regression', '@P1'] }, async ({ todoPage }) => {
      await test.step('try adding whitespace-only todo', async () => {
        await todoPage.addTodo(TODO_TITLES.WHITESPACE);
      });

      await test.step('verify no new todo was created', async () => {
        await todoPage.expectVisibleTodos([TODO_TITLES.DEFAULT_1, TODO_TITLES.DEFAULT_2]);
      });

      await test.step('verify count remains 2', async () => {
        await todoPage.expectCount(2);
      });
    });

  test('special HTML-like characters are displayed as text and do not create injected markup',
    { tag: ['@regression', '@P1'] }, async ({ todoPage }) => {
      await test.step('add a todo with HTML-like content', async () => {
        await todoPage.addTodo(TODO_TITLES.HTML_INPUT);
      });

      await test.step('verify the text is rendered as plain text not HTML', async () => {
        const item = todoPage.todoItem(TODO_TITLES.HTML_INPUT);
        await expect(item.locator('label')).toHaveText(TODO_TITLES.HTML_INPUT);
      });
    });

  test('escape cancels an edit and preserves the original title',
    { tag: ['@regression', '@P1'] }, async ({ todoPage }) => {
      await test.step('start editing and press Escape', async () => {
        await todoPage.cancelEdit(TODO_TITLES.DEFAULT_1);
      });

      await test.step('verify the original title is preserved', async () => {
        await todoPage.expectVisibleTodos([TODO_TITLES.DEFAULT_1, TODO_TITLES.DEFAULT_2]);
      });
    });

  test('saving an empty edited title removes the Todo',
    { tag: ['@regression', '@P1'] }, async ({ todoPage }) => {
      await test.step('edit the todo to an empty value', async () => {
        const item = todoPage.todoItem(TODO_TITLES.DEFAULT_1);
        await item.locator('label').dblclick();
        const editInput = item.locator('.edit');
        await editInput.fill('');
        await editInput.press('Enter');
      });

      await test.step('verify the todo was removed', async () => {
        await todoPage.expectVisibleTodos([TODO_TITLES.DEFAULT_2]);
      });

      await test.step('verify the count updated to 1', async () => {
        await todoPage.expectCount(1);
      });
    });
});
