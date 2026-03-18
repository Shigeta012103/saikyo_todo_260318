import { useRef, useState } from 'react';
import { ExplosionCanvas } from './components/ExplosionCanvas';
import { TodoInput } from './components/TodoInput';
import { TodoList } from './components/TodoList';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useScreenShake } from './hooks/useScreenShake';
import type { Todo } from './types';
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

  const addTodo = (text: string) => {
    const id = generateId();
    const newTodo: Todo = {
      id,
      text,
      completed: false,
      createdAt: Date.now(),
    };

    setNewTodoId(id);
    setTodos((prev) => [newTodo, ...prev]);

    setTimeout(() => shake(), 150);

    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }
    resetTimerRef.current = setTimeout(() => {
      setNewTodoId(null);
    }, NEW_TODO_RESET_DELAY_MS);
  };

  const toggleTodo = (targetId: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === targetId ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (targetId: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== targetId));
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
      <TodoList
        todos={todos}
        newTodoId={newTodoId}
        onToggle={toggleTodo}
        onDelete={deleteTodo}
      />
    </>
  );
}

export default App;
