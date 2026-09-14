import { AnimatePresence, Reorder } from 'framer-motion';
import { TodoItem } from './TodoItem';
import type { MoveDirection, Todo } from '../types';
import styles from './TodoList.module.css';

interface TodoListProps {
  todos: Todo[];
  newTodoId: string | null;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (reorderedActiveTodos: Todo[]) => void;
}

export function TodoList({ todos, newTodoId, onToggle, onDelete, onReorder }: TodoListProps) {
  const activeTodos = todos.filter((todo) => !todo.completed);
  const completedTodos = todos.filter((todo) => todo.completed);

  const moveTodo = (targetId: string, direction: MoveDirection) => {
    const currentIndex = activeTodos.findIndex((todo) => todo.id === targetId);
    const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (currentIndex === -1 || nextIndex < 0 || nextIndex >= activeTodos.length) {
      return;
    }

    const reordered = [...activeTodos];
    const [movedTodo] = reordered.splice(currentIndex, 1);
    reordered.splice(nextIndex, 0, movedTodo);
    onReorder(reordered);
  };

  if (todos.length === 0) {
    return (
      <p className={styles.empty}>
        タスクがありません
      </p>
    );
  }

  return (
    <div>
      <Reorder.Group
        as="ul"
        axis="y"
        values={activeTodos}
        onReorder={onReorder}
        className={styles.list}
        role="list"
        aria-label="タスク一覧"
      >
        <AnimatePresence mode="popLayout">
          {activeTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              isNew={todo.id === newTodoId}
              onToggle={onToggle}
              onDelete={onDelete}
              onMove={moveTodo}
            />
          ))}
        </AnimatePresence>
      </Reorder.Group>

      {completedTodos.length > 0 && (
        <>
          <p className={styles.sectionLabel}>
            完了済み（{completedTodos.length}）
          </p>
          <ul className={styles.list} role="list" aria-label="完了済みタスク">
            <AnimatePresence mode="popLayout">
              {completedTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  isNew={false}
                  onToggle={onToggle}
                  onDelete={onDelete}
                />
              ))}
            </AnimatePresence>
          </ul>
        </>
      )}
    </div>
  );
}
