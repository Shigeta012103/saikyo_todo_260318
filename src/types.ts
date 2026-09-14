export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  parentId: string | null;
}

export type MoveDirection = 'up' | 'down';

export interface TodoActions {
  toggle: (id: string) => void;
  remove: (id: string) => void;
  reorder: (reorderedSiblings: Todo[]) => void;
  addChild: (parentId: string, text: string) => void;
}
