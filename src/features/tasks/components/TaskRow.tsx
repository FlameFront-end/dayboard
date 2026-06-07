import { AlarmClockPlus, AlertCircle, ArrowLeft, ArrowRight, Check, Clock3, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { Task } from '../../../shared/lib/contracts';
import styles from './TaskRow.module.scss';

type TaskRowProps = {
  task: Task;
  today: string;
  now: Date;
  compactMode: boolean;
  isReminderActive: boolean;
  onToggleDone: (task: Task) => Promise<void>;
  onSaveTitle: (taskId: string, title: string) => Promise<void>;
  onSaveTime: (taskId: string, time?: string) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  onMoveTaskDate: (task: Task) => Promise<void>;
  onSnooze: (task: Task) => Promise<void>;
};

function isTaskOverdue(task: Task, today: string, now: Date): boolean {
  if (task.status === 'done') {
    return false;
  }

  if (task.date < today) {
    return true;
  }

  if (task.date > today || task.time === undefined) {
    return false;
  }

  const currentTime = format(now, 'HH:mm');
  return task.time < currentTime;
}

function formatSnoozedUntil(task: Task): string | undefined {
  if (task.snoozedUntil === undefined) {
    return undefined;
  }

  return `Snoozed ${format(new Date(task.snoozedUntil), 'HH:mm')}`;
}

type TimeParts = {
  hour: number;
  minute: number;
};

function parseTimeParts(time?: string): TimeParts {
  if (time === undefined) {
    return { hour: 9, minute: 0 };
  }

  const [rawHour, rawMinute] = time.split(':');
  const hour = Number(rawHour);
  const minute = Number(rawMinute);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return { hour: 9, minute: 0 };
  }

  return {
    hour: Math.min(23, Math.max(0, hour)),
    minute: Math.min(59, Math.max(0, minute))
  };
}

function formatTimeParts(parts: TimeParts): string {
  return `${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}`;
}

function shiftHour(parts: TimeParts, delta: number): TimeParts {
  return {
    ...parts,
    hour: (parts.hour + delta + 24) % 24
  };
}

function shiftMinute(parts: TimeParts, delta: number): TimeParts {
  const totalMinutes = parts.hour * 60 + parts.minute + delta;
  const normalizedMinutes = (totalMinutes + 24 * 60) % (24 * 60);

  return {
    hour: Math.floor(normalizedMinutes / 60),
    minute: normalizedMinutes % 60
  };
}

const TIME_PRESETS: readonly string[] = ['09:00', '12:00', '18:00', '21:00'];

export function TaskRow({
  task,
  today,
  now,
  compactMode,
  isReminderActive,
  onToggleDone,
  onSaveTitle,
  onSaveTime,
  onDelete,
  onMoveTaskDate,
  onSnooze
}: TaskRowProps) {
  const [draftTitle, setDraftTitle] = useState(task.title);
  const [draftTimeParts, setDraftTimeParts] = useState<TimeParts>(() => parseTimeParts(task.time));
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const timeModalRef = useRef<HTMLDivElement>(null);
  const isOverdue = useMemo(() => isTaskOverdue(task, today, now), [now, task, today]);
  const snoozedLabel = formatSnoozedUntil(task);
  const shouldMoveToToday = task.date > today;

  const openTimeModal = useCallback((): void => {
    setDraftTimeParts(parseTimeParts(task.time));
    setIsEditingTime(true);
  }, [task.time]);

  const closeTimeModal = useCallback((): void => {
    setDraftTimeParts(parseTimeParts(task.time));
    setIsEditingTime(false);
  }, [task.time]);

  useEffect(() => {
    if (!isEditingTime) {
      return;
    }

    const handlePointerDown = (event: PointerEvent): void => {
      if (timeModalRef.current?.contains(event.target as Node) ?? false) {
        return;
      }

      closeTimeModal();
    };

    const handleEscape = (event: globalThis.KeyboardEvent): void => {
      if (event.key !== 'Escape') {
        return;
      }

      closeTimeModal();
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [closeTimeModal, isEditingTime]);

  const saveTitle = async (): Promise<void> => {
    const nextTitle = draftTitle.trim();
    if (nextTitle.length === 0) {
      setDraftTitle(task.title);
      setIsEditingTitle(false);
      return;
    }

    await onSaveTitle(task.id, nextTitle);
    setIsEditingTitle(false);
  };

  const applyDraftTime = async (): Promise<void> => {
    const nextTime = formatTimeParts(draftTimeParts);
    await onSaveTime(task.id, nextTime);
    setIsEditingTime(false);
  };

  const clearDraftTime = async (): Promise<void> => {
    await onSaveTime(task.id, undefined);
    setIsEditingTime(false);
  };

  const handleInlineKeyDown = async (
    event: KeyboardEvent<HTMLInputElement>,
    save: () => Promise<void>,
    cancel: () => void
  ): Promise<void> => {
    if (event.key === 'Enter') {
      event.preventDefault();
      await save();
    }

    if (event.key === 'Escape') {
      cancel();
    }
  };

  return (
    <>
      <li className={`${styles.row} ${compactMode ? styles.compact : ''} ${task.status === 'done' ? styles.done : ''}`}>
        <button
          className={`${styles.checkbox} ${task.status === 'done' ? styles.checkboxDone : ''}`}
          type="button"
          onClick={() => void onToggleDone(task)}
          aria-label="Toggle done"
          aria-pressed={task.status === 'done'}
        >
          <span className={styles.checkboxBox}>
            {task.status === 'done' ? <Check size={13} strokeWidth={2.6} /> : null}
          </span>
        </button>
        <div className={styles.main}>
          <div className={styles.primary}>
            <button
              className={styles.time}
              type="button"
              onClick={openTimeModal}
            >
              {task.time ?? '--:--'}
            </button>
            {isEditingTitle ? (
              <input
                className={styles.titleInput}
                value={draftTitle}
                onChange={(event) => setDraftTitle(event.target.value)}
                onBlur={() => {
                  void saveTitle();
                }}
                onKeyDown={(event) => {
                  void handleInlineKeyDown(
                    event,
                    saveTitle,
                    () => {
                      setDraftTitle(task.title);
                      setIsEditingTitle(false);
                    }
                  );
                }}
                autoFocus
              />
            ) : (
              <button className={styles.titleButton} type="button" onClick={() => setIsEditingTitle(true)}>
                <span className={styles.title}>{task.title}</span>
              </button>
            )}
          </div>
          <div className={styles.meta}>
            {isOverdue ? <span className={styles.metaItem}><AlertCircle size={12} strokeWidth={2} className={styles.warning} /><span className={styles.warning}>Overdue</span></span> : null}
            {task.remindAt !== undefined ? <span className={styles.metaItem}><AlarmClockPlus size={12} strokeWidth={2} /><span>Reminder</span></span> : null}
            {snoozedLabel !== undefined ? <span className={styles.metaItem}><Clock3 size={12} strokeWidth={2} /><span>{snoozedLabel}</span></span> : null}
            {isReminderActive ? <span className={styles.metaItem}><AlertCircle size={12} strokeWidth={2} className={styles.warning} /><span className={styles.warning}>Due now</span></span> : null}
          </div>
        </div>
        <div className={styles.actions}>
          {isReminderActive ? (
            <button className={styles.action} type="button" onClick={() => void onSnooze(task)}>
              <AlarmClockPlus size={13} strokeWidth={1.9} />
              <span>Snooze 10m</span>
            </button>
          ) : null}
          <button className={styles.action} type="button" onClick={() => void onMoveTaskDate(task)}>
            {shouldMoveToToday ? <ArrowLeft size={13} strokeWidth={1.9} /> : <ArrowRight size={13} strokeWidth={1.9} />}
            <span>{shouldMoveToToday ? 'Today' : 'Tomorrow'}</span>
          </button>
          <button className={styles.deleteAction} type="button" onClick={() => void onDelete(task.id)}>
            <Trash2 size={13} strokeWidth={1.9} />
            <span>Delete</span>
          </button>
        </div>
      </li>
      {isEditingTime ? (
        <div className={styles.timeModalBackdrop}>
          <div
            ref={timeModalRef}
            className={styles.timeModal}
            role="dialog"
            aria-modal="true"
            aria-label="Choose task time"
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                void applyDraftTime();
              }
            }}
          >
            <div className={styles.timeModalHeader}>
              <span className={styles.timeModalLabel}>Task time</span>
              <span className={styles.timeModalPreview}>{formatTimeParts(draftTimeParts)}</span>
            </div>
            <div className={styles.timeModalColumns}>
              <div className={styles.timeModalColumn}>
                <button
                  className={styles.timeAdjustButton}
                  type="button"
                  onClick={() => setDraftTimeParts((currentParts) => shiftHour(currentParts, 1))}
                  aria-label="Increase hour"
                >
                  +
                </button>
                <span className={styles.timeValue}>{String(draftTimeParts.hour).padStart(2, '0')}</span>
                <button
                  className={styles.timeAdjustButton}
                  type="button"
                  onClick={() => setDraftTimeParts((currentParts) => shiftHour(currentParts, -1))}
                  aria-label="Decrease hour"
                >
                  -
                </button>
              </div>
              <span className={styles.timeSeparator}>:</span>
              <div className={styles.timeModalColumn}>
                <button
                  className={styles.timeAdjustButton}
                  type="button"
                  onClick={() => setDraftTimeParts((currentParts) => shiftMinute(currentParts, 5))}
                  aria-label="Increase minute"
                >
                  +
                </button>
                <span className={styles.timeValue}>{String(draftTimeParts.minute).padStart(2, '0')}</span>
                <button
                  className={styles.timeAdjustButton}
                  type="button"
                  onClick={() => setDraftTimeParts((currentParts) => shiftMinute(currentParts, -5))}
                  aria-label="Decrease minute"
                >
                  -
                </button>
              </div>
            </div>
            <div className={styles.timePresetList}>
              {TIME_PRESETS.map((preset) => (
                <button
                  key={preset}
                  className={styles.timePreset}
                  type="button"
                  onClick={() => setDraftTimeParts(parseTimeParts(preset))}
                >
                  {preset}
                </button>
              ))}
            </div>
            <div className={styles.timeModalActions}>
              <button className={styles.timeModalAction} type="button" onClick={closeTimeModal}>
                Cancel
              </button>
              <button className={styles.timeModalAction} type="button" onClick={() => void clearDraftTime()}>
                Clear
              </button>
              <button className={styles.timeModalActionPrimary} type="button" onClick={() => void applyDraftTime()}>
                Apply
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
