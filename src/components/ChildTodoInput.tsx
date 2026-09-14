import { useState } from 'react';
import styles from './ChildTodoInput.module.css';

interface ChildTodoInputProps {
  parentText: string;
  onAdd: (text: string) => void;
  onClose: () => void;
}

export function ChildTodoInput({ parentText, onAdd, onClose }: ChildTodoInputProps) {
  const [text, setText] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = text.trim();

    if (!trimmed) {
      onClose();
      return;
    }

    onAdd(trimmed);
    setText('');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      onClose();
    }
  };

  const handleBlur = () => {
    if (text.trim()) {
      return;
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <input
        type="text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="子課題を入力して Enter"
        className={styles.input}
        autoFocus
        aria-label={`「${parentText}」の子課題を入力`}
      />
    </form>
  );
}
