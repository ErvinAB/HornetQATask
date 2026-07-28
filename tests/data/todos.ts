export interface TodoItem {
  id: number;
  title: string;
  completed: boolean;
}

export const DEFAULT_TODOS: TodoItem[] = [
  { id: 1, title: 'Pay electric bill', completed: false },
  { id: 2, title: 'Walk the dog', completed: false },
];

export const TODO_TITLES = {
  DEFAULT_1: 'Pay electric bill',
  DEFAULT_2: 'Walk the dog',
  NEW_ITEM: 'Write tests',
  EDIT_ITEM: 'Review code',
  HTML_INPUT: '<script>alert("xss")</script>',
  WHITESPACE: '   ',
} as const;

export const STORAGE_KEY = 'todos-vanillajs';

export function seedLocalStorage(todos: TodoItem[]): string {
  return JSON.stringify(todos);
}
