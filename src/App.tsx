import { useRef, useState } from 'react';
import { ExplosionCanvas } from './components/ExplosionCanvas';
import { TodoInput } from './components/TodoInput';
import { TodoList } from './components/TodoList';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useScreenShake } from './hooks/useScreenShake';
import { collectDescendantIds } from './utils/todoTree';
import type { Todo, TodoActions } from './types';
import styles from './App.module.css';

const STORAGE_KEY = 'saikyo-todos';
const NEW_TODO_RESET_DELAY_MS = 600;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function App() {
  const [todos, setTodos] = useLocalStorage<Todo[]>(STORAGE_KEY, []);
  const [newTodoId, setNewTodoId] = useState<string | null>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const shake = useScreenShake();

  const addTodo = (text: string, parentId: string | null = null) => {
    const id = generateId();
    const newTodo: Todo = {
      id,
      text,
      completed: false,
      createdAt: Date.now(),
      parentId,
    };

    setNewTodoId(id);
    setTodos((prev) => (parentId === null ? [newTodo, ...prev] : [...prev, newTodo]));

    setTimeout(() => shake(), 150);

    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }
    resetTimerRef.current = setTimeout(() => {
      setNewTodoId(null);
    }, NEW_TODO_RESET_DELAY_MS);
  };

  const toggleTodo = (targetId: string) => {
    setTodos((prev) => {
      const target = prev.find((todo) => todo.id === targetId);
      if (!target) {
        return prev;
      }

      if (target.completed) {
        return prev.map((todo) =>
          todo.id === targetId ? { ...todo, completed: false } : todo
        );
      }

      const descendantIds = collectDescendantIds(prev, targetId);
      return prev.map((todo) =>
        todo.id === targetId || descendantIds.has(todo.id)
          ? { ...todo, completed: true }
          : todo
      );
    });
  };

  const deleteTodo = (targetId: string) => {
    setTodos((prev) => {
      const descendantIds = collectDescendantIds(prev, targetId);
      return prev.filter((todo) => todo.id !== targetId && !descendantIds.has(todo.id));
    });
  };

  const reorderTodos = (reorderedSiblings: Todo[]) => {
    setTodos((prev) => {
      const siblingIds = new Set(reorderedSiblings.map((todo) => todo.id));
      let nextSiblingIndex = 0;

      return prev.map((todo) =>
        siblingIds.has(todo.id) ? reorderedSiblings[nextSiblingIndex++] : todo
      );
    });
  };

  const todoActions: TodoActions = {
    toggle: toggleTodo,
    remove: deleteTodo,
    reorder: reorderTodos,
    addChild: (parentId, text) => addTodo(text, parentId),
  };

  const activeCount = todos.filter((todo) => !todo.completed).length;

  return (
    <>
      <ExplosionCanvas />
      <header className={styles.header}>
        <h1 className={styles.title}>💥 最強Todo</h1>
        {todos.length > 0 && (
          <p className={styles.counter}>
            {activeCount > 0
              ? `残り ${activeCount} 件`
              : 'すべて完了！'}
          </p>
        )}
      </header>
      <TodoInput onAdd={addTodo} />
      <TodoList todos={todos} newTodoId={newTodoId} actions={todoActions} />
    </>
  );
}

export default App;
