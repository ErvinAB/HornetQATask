import { test as base } from '@playwright/test';
import { TodoPage } from '../pages/todo.page';
import { type TodoItem, STORAGE_KEY, seedLocalStorage } from '../data/todos';

type TodoFixtures = {
  todoPage: TodoPage;
};

export const test = base.extend<TodoFixtures>({
  todoPage: async ({ page }, use) => {
    const todoPage = new TodoPage(page);
    await use(todoPage);
  },
});

export function seedTodos(page: import('@playwright/test').Page, todos: TodoItem[]) {
  return page.addInitScript((data: string) => {
    localStorage.setItem('todos-vanillajs', data);
  }, seedLocalStorage(todos));
}

export { expect } from '@playwright/test';
