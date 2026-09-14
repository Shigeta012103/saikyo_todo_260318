import { useRef, useState, type ReactNode } from 'react';
import { motion, Reorder, useDragControls } from 'framer-motion';
import { ChildTodoInput } from './ChildTodoInput';
import { triggerExplosion, triggerLightning } from './ExplosionCanvas';
import {
  exitAnimation,
  layoutTransition,
  normalVariants,
  slamVariants,
} from './todoItemAnimations';
import type { MoveDirection, Todo, TodoActions } from '../types';
import styles from './TodoItem.module.css';

interface TodoItemProps {
  todo: Todo;
  isNew: boolean;
  actions: TodoActions;
  onMove?: (id: string, direction: MoveDirection) => void;
  children?: ReactNode;
}

export function TodoItem({ todo, isNew, actions, onMove, children }: TodoItemProps) {
  const [isAddingChild, setIsAddingChild] = useState(false);
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
    actions.toggle(todo.id);
  };

  const handleDelete = () => {
    if (itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      triggerLightning(x, y);
    }
    actions.remove(todo.id);
  };

  const handleHandleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!onMove || (event.key !== 'ArrowUp' && event.key !== 'ArrowDown')) {
      return;
    }
    event.preventDefault();
    onMove(todo.id, event.key === 'ArrowUp' ? 'up' : 'down');
  };

  const body = (
    <>
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

        {!todo.completed && (
          <button
            className={styles.addChildButton}
            onClick={() => setIsAddingChild(true)}
            aria-expanded={isAddingChild}
            aria-label={`「${todo.text}」に子課題を追加`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}

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

      {children}

      {isAddingChild && (
        <ChildTodoInput
          parentText={todo.text}
          onAdd={(text) => actions.addChild(todo.id, text)}
          onClose={() => setIsAddingChild(false)}
        />
      )}
    </>
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
