import { type Locator, type Page, expect } from '@playwright/test';

export type FilterOption = 'All' | 'Active' | 'Completed';

export class TodoPage {
  readonly newTodoInput: Locator;
  readonly todoList: Locator;
  readonly todoCount: Locator;
  readonly clearCompleted: Locator;
  readonly toggleAllCheckbox: Locator;
  readonly footer: Locator;
  readonly main: Locator;
  readonly todoAppWrapper: Locator;

  constructor(readonly page: Page) {
    this.todoAppWrapper = page.locator('.todoapp-wrapper');
    this.newTodoInput = page.getByTestId('new-todo');
    this.todoList = page.locator('.todo-list');
    this.todoCount = page.locator('.todo-count');
    this.clearCompleted = page.locator('.clear-completed');
    this.toggleAllCheckbox = page.locator('.toggle-all');
    this.footer = page.locator('.footer');
    this.main = page.locator('.main');
  }

  async open() {
    await this.page.goto('/todo');
  }

  async addTodo(title: string) {
    await this.newTodoInput.fill(title);
    await this.newTodoInput.press('Enter');
  }

  todoItem(title: string): Locator {
    return this.todoList.locator('li').filter({ hasText: title });
  }

  async toggleTodo(title: string) {
    const item = this.todoItem(title);
    await item.locator('.toggle').click();
  }

  async editTodo(title: string, replacement: string) {
    const item = this.todoItem(title);
    await item.locator('label').dblclick();
    const editInput = item.locator('.edit');
    await editInput.fill(replacement);
    await editInput.press('Enter');
  }

  async cancelEdit(title: string) {
    const item = this.todoItem(title);
    await item.locator('label').dblclick();
    const editInput = item.locator('.edit');
    await editInput.fill(title);
    await editInput.press('Escape');
  }

  async deleteTodo(title: string) {
    const item = this.todoItem(title);
    await item.hover();
    await item.locator('.destroy').click();
  }

  async selectFilter(filter: FilterOption) {
    const link = this.page.locator('.filters').getByRole('link', { name: filter, exact: true });
    await link.click();
  }

  async toggleAll() {
    await this.page.locator('label[for="toggle-all"]').click();
  }

  async clearCompletedAction() {
    await this.clearCompleted.click();
  }

  async expectVisibleTodos(titles: string[]) {
    const items = this.todoList.locator('li');
    await expect(items).toHaveCount(titles.length);
    for (const title of titles) {
      await expect(this.todoItem(title)).toBeVisible();
    }
  }

  async expectTodoCompleted(title: string, completed: boolean) {
    const item = this.todoItem(title);
    if (completed) {
      await expect(item).toHaveClass(/completed/);
    } else {
      await expect(item).not.toHaveClass(/completed/);
    }
  }

  async expectCount(expected: number) {
    await expect(this.todoCount).toContainText(`${expected}`);
  }

  async expectSelectedFilter(filter: FilterOption) {
    const link = this.page.locator('.filters').getByRole('link', { name: filter, exact: true });
    await expect(link).toHaveClass(/selected/);
  }

  async expectMainAndFooterVisible(visible: boolean) {
    if (visible) {
      await expect(this.main).toBeVisible();
      await expect(this.footer).toBeVisible();
    } else {
      await expect(this.main).not.toBeVisible();
      await expect(this.footer).not.toBeVisible();
    }
  }

  async expectClearCompletedVisible(visible: boolean) {
    if (visible) {
      await expect(this.clearCompleted).toBeVisible();
    } else {
      await expect(this.clearCompleted).not.toBeVisible();
    }
  }

  async expectTodoListEmpty() {
    await expect(this.todoList.locator('li')).toHaveCount(0);
  }

  async reload() {
    await this.page.reload();
  }
}
