import { useRef } from 'react';
import { motion, Reorder, useDragControls } from 'framer-motion';
import { triggerExplosion, triggerLightning } from './ExplosionCanvas';
import type { MoveDirection, Todo } from '../types';
import styles from './TodoItem.module.css';

interface TodoItemProps {
  todo: Todo;
  isNew: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onMove?: (id: string, direction: MoveDirection) => void;
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

const exitAnimation = {
  opacity: 0,
  scale: 0.8,
  filter: 'blur(4px)',
  transition: { duration: 0.25 },
};

const layoutTransition = {
  layout: { type: 'spring', stiffness: 500, damping: 35 },
} as const;

export function TodoItem({ todo, isNew, onToggle, onDelete, onMove }: TodoItemProps) {
  const checkboxRef = useRef<HTMLButtonElement>(null);
  const itemRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

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

  const handleHandleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!onMove || (event.key !== 'ArrowUp' && event.key !== 'ArrowDown')) {
      return;
    }
    event.preventDefault();
    onMove(todo.id, event.key === 'ArrowUp' ? 'up' : 'down');
  };

  const body = (
    <motion.div
      ref={itemRef}
      variants={isNew ? slamVariants : normalVariants}
      initial="initial"
      animate="animate"
      className={`${styles.item} ${todo.completed ? styles.completed : ''}`}
    >
      {onMove && (
        <button
          className={styles.dragHandle}
          onPointerDown={(event) => dragControls.start(event)}
          onKeyDown={handleHandleKeyDown}
          aria-label={`「${todo.text}」の優先順位を変更（上下キーで移動）`}
        >
          <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor" aria-hidden="true">
            <circle cx="2" cy="3" r="1.5" />
            <circle cx="8" cy="3" r="1.5" />
            <circle cx="2" cy="8" r="1.5" />
            <circle cx="8" cy="8" r="1.5" />
            <circle cx="2" cy="13" r="1.5" />
            <circle cx="8" cy="13" r="1.5" />
          </svg>
        </button>
      )}

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
    </motion.div>
  );

  if (!onMove) {
    return (
      <motion.li layout exit={exitAnimation} transition={layoutTransition}>
        {body}
      </motion.li>
    );
  }

  return (
    <Reorder.Item
      value={todo}
      dragListener={false}
      dragControls={dragControls}
      animate={{ scale: 1, zIndex: 0 }}
      exit={exitAnimation}
      transition={layoutTransition}
      whileDrag={{ scale: 1.03, zIndex: 1 }}
      className={styles.draggable}
    >
      {body}
    </Reorder.Item>
  );
}
