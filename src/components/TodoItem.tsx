import { useRef } from 'react';
import { motion } from 'framer-motion';
import { triggerExplosion, triggerLightning } from './ExplosionCanvas';
import type { Todo } from '../types';
import styles from './TodoItem.module.css';

interface TodoItemProps {
  todo: Todo;
  isNew: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const slamVariants = {
  initial: { opacity: 0, y: -120, scale: 1.2 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      y: { type: 'spring', stiffness: 800, damping: 20, mass: 1.2 },
      scale: { type: 'spring', stiffness: 600, damping: 15, delay: 0.05 },
      opacity: { duration: 0.1 },
    },
  },
};

const normalVariants = {
  initial: { opacity: 1, y: 0, scale: 1 },
  animate: { opacity: 1, y: 0, scale: 1 },
};

export function TodoItem({ todo, isNew, onToggle, onDelete }: TodoItemProps) {
  const checkboxRef = useRef<HTMLButtonElement>(null);
  const itemRef = useRef<HTMLLIElement>(null);

  const handleToggle = () => {
    if (!todo.completed && checkboxRef.current) {
      const rect = checkboxRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      triggerExplosion(x, y);
    }
    onToggle(todo.id);
  };

  const handleDelete = () => {
    if (itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      triggerLightning(x, y);
    }
    onDelete(todo.id);
  };

  return (
    <motion.li
      ref={itemRef}
      layout
      variants={isNew ? slamVariants : normalVariants}
      initial="initial"
      animate="animate"
      exit={{ opacity: 0, scale: 0.8, filter: 'blur(4px)', transition: { duration: 0.25 } }}
      transition={{
        layout: { type: 'spring', stiffness: 500, damping: 35 },
      }}
      className={`${styles.item} ${todo.completed ? styles.completed : ''}`}
    >
      <button
        ref={checkboxRef}
        className={`${styles.checkbox} ${todo.completed ? styles.checked : ''}`}
        onClick={handleToggle}
        aria-label={todo.completed ? `「${todo.text}」を未完了に戻す` : `「${todo.text}」を完了にする`}
      >
        {todo.completed && (
          <motion.svg
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 600, damping: 15 }}
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2 7.5L5.5 11L12 3"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        )}
      </button>

      <span className={styles.text}>{todo.text}</span>

      <button
        className={styles.deleteButton}
        onClick={handleDelete}
        aria-label={`「${todo.text}」を削除`}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M4 4L12 12M12 4L4 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </motion.li>
  );
}
