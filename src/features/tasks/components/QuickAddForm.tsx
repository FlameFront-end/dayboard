import { CirclePlus } from 'lucide-react';
import { useState } from 'react';
import type { KeyboardEvent, RefObject } from 'react';
import { parseQuickTaskInput } from '../lib/parseQuickTaskInput';
import { formatLocalDate } from '../../../shared/lib/date';
import styles from './QuickAddForm.module.scss';

type QuickAddFormProps = {
  inputRef: RefObject<HTMLInputElement | null>;
  selectedDate: string;
  isCompact: boolean;
  onCreateTask: (input: { title: string; date: string; time?: string; remindAt?: string }) => Promise<void>;
};

export function QuickAddForm({ inputRef, selectedDate, isCompact, onCreateTask }: QuickAddFormProps) {
  const [value, setValue] = useState('');

  const submit = async (): Promise<void> => {
    const parsed = parseQuickTaskInput(value, new Date(`${selectedDate}T00:00:00.000Z`));
    if (parsed.title.length === 0) {
      return;
    }

    await onCreateTask({
      title: parsed.title,
      date: selectedDate || formatLocalDate(new Date()),
      time: parsed.time,
      remindAt: parsed.remindAt
    });

    setValue('');
  };

  const handleKeyDown = async (event: KeyboardEvent<HTMLInputElement>): Promise<void> => {
    if (event.key === 'Enter') {
      event.preventDefault();
      await submit();
    }

    if (event.key === 'Escape') {
      setValue('');
    }
  };

  return (
    <div className={`${styles.container} ${isCompact ? styles.containerCompact : ''}`}>
      <CirclePlus className={styles.icon} size={16} strokeWidth={1.75} />
      <input
        ref={inputRef}
        className={styles.input}
        placeholder="+ Add task..."
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          void handleKeyDown(event);
        }}
      />
    </div>
  );
}
