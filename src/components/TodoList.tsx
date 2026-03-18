import { AnimatePresence } from 'framer-motion';
import { TodoItem } from './TodoItem';
import type { Todo } from '../types';
import styles from './TodoList.module.css';

interface TodoListProps {
  todos: Todo[];
  newTodoId: string | null;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TodoList({ todos, newTodoId, onToggle, onDelete }: TodoListProps) {
  const activeTodos = todos.filter((todo) => !todo.completed);
  const completedTodos = todos.filter((todo) => todo.completed);

  if (todos.length === 0) {
    return (
      <p className={styles.empty}>
        タスクがありません
      </p>
    );
  }

  return (
    <div>
      <ul className={styles.list} role="list" aria-label="タスク一覧">
        <AnimatePresence mode="popLayout">
          {activeTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              isNew={todo.id === newTodoId}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))}
        </AnimatePresence>
      </ul>

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
