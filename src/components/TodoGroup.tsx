import { AnimatePresence, Reorder } from 'framer-motion';
import { TodoItem } from './TodoItem';
import type { MoveDirection, Todo, TodoActions } from '../types';
import styles from './TodoGroup.module.css';

const LEVEL_CLASSES = [styles.level1, styles.level2, styles.level3];

interface TodoGroupProps {
  todos: Todo[];
  depth: number;
  childrenByParentId: Map<string | null, Todo[]>;
  newTodoId: string | null;
  actions: TodoActions;
  ariaLabel: string;
  showCompletedHeading?: boolean;
}

export function TodoGroup({
  todos,
  depth,
  childrenByParentId,
  newTodoId,
  actions,
  ariaLabel,
  showCompletedHeading = false,
}: TodoGroupProps) {
  const activeTodos = todos.filter((todo) => !todo.completed);
  const completedTodos = todos.filter((todo) => todo.completed);
  const listClassName = [
    styles.list,
    LEVEL_CLASSES[depth % LEVEL_CLASSES.length],
    depth === 0 ? styles.rootList : '',
  ]
    .filter(Boolean)
    .join(' ');

  const moveTodo = (targetId: string, direction: MoveDirection) => {
    const currentIndex = activeTodos.findIndex((todo) => todo.id === targetId);
    const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (currentIndex === -1 || nextIndex < 0 || nextIndex >= activeTodos.length) {
      return;
    }

    const reordered = [...activeTodos];
    const [movedTodo] = reordered.splice(currentIndex, 1);
    reordered.splice(nextIndex, 0, movedTodo);
    actions.reorder(reordered);
  };

  const renderTodo = (todo: Todo, onMove?: typeof moveTodo) => (
    <TodoItem
      key={todo.id}
      todo={todo}
      isNew={todo.id === newTodoId}
      actions={actions}
      onMove={onMove}
    >
      <TodoGroup
        todos={childrenByParentId.get(todo.id) ?? []}
        depth={depth + 1}
        childrenByParentId={childrenByParentId}
        newTodoId={newTodoId}
        actions={actions}
        ariaLabel={`「${todo.text}」の子課題`}
      />
    </TodoItem>
  );

  if (todos.length === 0) {
    return null;
  }

  return (
    <>
      {activeTodos.length > 0 && (
        <Reorder.Group
          as="ul"
          axis="y"
          values={activeTodos}
          onReorder={actions.reorder}
          className={listClassName}
          role="list"
          aria-label={ariaLabel}
        >
          <AnimatePresence mode="popLayout">
            {activeTodos.map((todo) => renderTodo(todo, moveTodo))}
          </AnimatePresence>
        </Reorder.Group>
      )}

      {completedTodos.length > 0 && (
        <>
          {showCompletedHeading && (
            <p className={styles.sectionLabel}>
              完了済み（{completedTodos.length}）
            </p>
          )}
          <ul
            className={listClassName}
            role="list"
            aria-label={`${ariaLabel}（完了済み）`}
          >
            <AnimatePresence mode="popLayout">
              {completedTodos.map((todo) => renderTodo(todo))}
            </AnimatePresence>
          </ul>
        </>
      )}
    </>
  );
}
