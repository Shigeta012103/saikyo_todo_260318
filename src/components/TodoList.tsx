import { TodoGroup } from './TodoGroup';
import { buildChildrenByParentId } from '../utils/todoTree';
import type { Todo, TodoActions } from '../types';
import styles from './TodoList.module.css';

interface TodoListProps {
  todos: Todo[];
  newTodoId: string | null;
  actions: TodoActions;
}

export function TodoList({ todos, newTodoId, actions }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <p className={styles.empty}>
        タスクがありません
      </p>
    );
  }

  const childrenByParentId = buildChildrenByParentId(todos);

  return (
    <div>
      <TodoGroup
        todos={childrenByParentId.get(null) ?? []}
        childrenByParentId={childrenByParentId}
        newTodoId={newTodoId}
        actions={actions}
        ariaLabel="タスク一覧"
        showCompletedHeading
      />
    </div>
  );
}
