import { addDays, addMinutes, format } from 'date-fns';
import {
  AlarmClockPlus,
  CheckCheck,
  LockKeyhole,
  ListTodo,
  PanelTopClose,
  Pin,
  Settings2
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Task } from '../../../shared/lib/contracts';
import { formatSelectedDateLabel, formatLocalDate } from '../../../shared/lib/date';
import { useAppStore } from '../../../app/appStore';
import { useTasksStore } from '../model/useTasksStore';
import { sortTasksForDate } from '../lib/sortTasksForDate';
import { QuickAddForm } from './QuickAddForm';
import { TaskList } from './TaskList';
import { SettingsPanel } from '../../settings/components/SettingsPanel';
import styles from './TaskBoard.module.scss';

function buildReminderPatch(): Partial<Task> {
  return {
    snoozedUntil: addMinutes(new Date(), 10).toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function buildTaskDatePatch(task: Task, targetDate: string): Partial<Task> {
  const remindAt = task.time !== undefined ? new Date(`${targetDate}T${task.time}:00.000Z`).toISOString() : undefined;

  return {
    date: targetDate,
    remindAt,
    snoozedUntil: undefined
  };
}

export function TaskBoard() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [now, setNow] = useState(() => new Date());
  const {
    selectedDate,
    followToday,
    isSettingsOpen,
    activeReminderTaskId,
    setSelectedDate,
    setSettingsOpen,
    setActiveReminderTaskId,
    syncTodayDate
  } = useAppStore();
  const { tasks, settings, version, isReady, load, createTask, updateTask, deleteTask, moveTaskToTomorrow, moveUnfinishedToTomorrow, updateSettings, refreshTasks, applySettings } =
    useTasksStore();

  const today = formatLocalDate(now);
  const visibleTasks = useMemo(
    () => sortTasksForDate(tasks.filter((task) => task.date === selectedDate)),
    [selectedDate, tasks]
  );
  const remainingCount = visibleTasks.filter((task) => task.status === 'todo').length;
  const doneCount = visibleTasks.filter((task) => task.status === 'done').length;
  const selectedLabel = formatSelectedDateLabel(selectedDate);
  const showMoveUnfinished = selectedDate <= today && remainingCount > 0;

  useEffect(() => {
    void load();

    const unsubscribeTasks = window.dayboard.events.onTasksChanged(() => {
      void refreshTasks();
    });
    const unsubscribeSettings = window.dayboard.events.onSettingsChanged((nextSettings) => {
      applySettings(nextSettings);
    });
    const unsubscribeFocus = window.dayboard.events.onFocusQuickAdd(() => {
      inputRef.current?.focus();
    });
    const unsubscribeReminder = window.dayboard.events.onReminderTriggered(({ taskId }) => {
      setActiveReminderTaskId(taskId);
    });

    return () => {
      unsubscribeTasks();
      unsubscribeSettings();
      unsubscribeFocus();
      unsubscribeReminder();
    };
  }, [applySettings, load, refreshTasks, setActiveReminderTaskId]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const nextNow = new Date();
      setNow(nextNow);
      syncTodayDate(nextNow);
    }, 30_000);

    return () => {
      window.clearInterval(timer);
    };
  }, [syncTodayDate]);

  const handleToggleDone = async (task: Task): Promise<void> => {
    await updateTask(task.id, {
      status: task.status === 'todo' ? 'done' : 'todo',
      completedAt: task.status === 'todo' ? new Date().toISOString() : undefined
    });
  };

  const handleSaveTime = async (taskId: string, time?: string): Promise<void> => {
    const remindAt = time !== undefined ? new Date(`${selectedDate}T${time}:00.000Z`).toISOString() : undefined;
    await updateTask(taskId, {
      time,
      remindAt,
      snoozedUntil: undefined
    });
  };

  const handleMoveTaskDate = async (task: Task): Promise<void> => {
    if (task.date > today) {
      await updateTask(task.id, buildTaskDatePatch(task, today));
      return;
    }

    await moveTaskToTomorrow(task.id);
  };

  const activeReminderTask = visibleTasks.find((task) => task.id === activeReminderTaskId);
  const headerWindowActions = (
    <div className={styles.windowActions}>
      <button
        type="button"
        className={styles.iconButton}
        onClick={() => {
          void updateSettings({ isHeaderCollapsed: !settings.isHeaderCollapsed });
        }}
        aria-label={settings.isHeaderCollapsed ? 'Expand header' : 'Collapse header'}
      >
        <PanelTopClose
          size={15}
          strokeWidth={1.9}
          className={settings.isHeaderCollapsed ? styles.activeIcon : styles.inactiveIcon}
        />
      </button>
      <button
        type="button"
        className={styles.iconButton}
        onClick={() => {
          void window.dayboard.window.toggleWindowLocked();
        }}
        aria-label={settings.isWindowLocked ? 'Unlock window' : 'Lock window'}
      >
        <LockKeyhole
          size={15}
          strokeWidth={1.9}
          className={settings.isWindowLocked ? styles.activeIcon : styles.inactiveIcon}
        />
      </button>
      <button
        type="button"
        className={styles.iconButton}
        onClick={() => {
          void window.dayboard.window.toggleAlwaysOnTop();
        }}
        aria-label={settings.alwaysOnTop ? 'Disable always on top' : 'Enable always on top'}
      >
        <Pin
          size={15}
          strokeWidth={1.9}
          className={settings.alwaysOnTop ? styles.activeIcon : styles.inactiveIcon}
        />
      </button>
      <button
        type="button"
        className={styles.iconButton}
        onClick={() => setSettingsOpen(!isSettingsOpen)}
        aria-label="Settings"
      >
        <Settings2 size={16} strokeWidth={1.8} />
      </button>
    </div>
  );

  return (
    <div className={styles.board}>
      <header
        className={`${styles.header} ${settings.isWindowLocked ? styles.headerLocked : ''} ${settings.isHeaderCollapsed ? styles.headerCollapsed : ''}`}
      >
        <div className={styles.headerMain}>
          <div className={styles.headerTitleBlock}>
            {!settings.isHeaderCollapsed ? <h1>Dayboard</h1> : null}
            {!settings.isHeaderCollapsed ? <p>{settings.alwaysOnTop ? 'Always on top enabled' : 'Always on top disabled'}</p> : null}
          </div>
          <div className={styles.headerRight}>
            <div className={styles.headerMeta}>
              <span className={styles.dateLabel}>{selectedLabel}</span>
              <span className={styles.clock}>{format(now, 'HH:mm')}</span>
            </div>
            {settings.isHeaderCollapsed ? headerWindowActions : null}
          </div>
        </div>
        <div className={`${styles.headerActions} ${settings.isHeaderCollapsed ? styles.headerActionsCollapsed : ''}`}>
          <div className={styles.daySwitch}>
            <button type="button" className={followToday ? styles.activeChip : styles.chip} onClick={() => setSelectedDate(today, true)}>
              Today
            </button>
            <button
              type="button"
              className={!followToday && selectedDate > today ? styles.activeChip : styles.chip}
              onClick={() => setSelectedDate(formatLocalDate(addDays(new Date(`${today}T00:00:00.000Z`), 1)), false)}
            >
              Tomorrow
            </button>
          </div>
          {headerWindowActions}
        </div>
      </header>

      {activeReminderTask !== undefined ? (
        <div className={styles.reminderBar}>
          <span className={styles.reminderText}>
            <AlarmClockPlus size={15} strokeWidth={1.85} />
            <span>{activeReminderTask.time ? `${activeReminderTask.time} — ` : ''}{activeReminderTask.title}</span>
          </span>
          <div className={styles.reminderActions}>
            <button
              type="button"
              onClick={() => {
                void handleToggleDone(activeReminderTask).then(() => {
                  setActiveReminderTaskId(undefined);
                });
              }}
            >
              <CheckCheck size={14} strokeWidth={1.9} />
              <span>Done</span>
            </button>
            <button
              type="button"
              onClick={() =>
                void updateTask(activeReminderTask.id, buildReminderPatch()).then(() => {
                  setActiveReminderTaskId(undefined);
                })
              }
            >
              <AlarmClockPlus size={14} strokeWidth={1.9} />
              <span>Snooze 10m</span>
            </button>
          </div>
        </div>
      ) : null}

      <QuickAddForm
        inputRef={inputRef}
        selectedDate={selectedDate}
        isCompact={settings.isHeaderCollapsed}
        onCreateTask={createTask}
      />

      <section className={styles.listSection}>
        {isReady ? (
          <TaskList
            tasks={visibleTasks}
            today={today}
            now={now}
            compactMode={settings.compactMode}
            activeReminderTaskId={activeReminderTaskId}
            onToggleDone={handleToggleDone}
            onSaveTitle={(taskId, title) => updateTask(taskId, { title })}
            onSaveTime={handleSaveTime}
            onDelete={deleteTask}
            onMoveTaskDate={handleMoveTaskDate}
            onSnooze={(task) =>
              updateTask(task.id, buildReminderPatch()).then(() => {
                setActiveReminderTaskId(undefined);
              })
            }
          />
        ) : (
          <div className={styles.loading}>Loading...</div>
        )}
      </section>

      <footer className={styles.footer}>
        <span className={styles.footerStats}>
          <span className={styles.footerStat}>
            <ListTodo size={14} strokeWidth={1.9} />
            <span>{remainingCount} left</span>
          </span>
          <span className={styles.footerDot}>·</span>
          <span className={styles.footerStat}>
            <CheckCheck size={14} strokeWidth={1.9} />
            <span>{doneCount} done</span>
          </span>
        </span>
        <div className={styles.footerActionSlot}>
          <button
            type="button"
            className={showMoveUnfinished ? styles.footerActionVisible : styles.footerActionHidden}
            onClick={() => {
              if (!showMoveUnfinished) {
                return;
              }

              void moveUnfinishedToTomorrow(selectedDate);
            }}
            tabIndex={showMoveUnfinished ? 0 : -1}
            aria-hidden={!showMoveUnfinished}
          >
            Move unfinished
          </button>
        </div>
      </footer>

      {isSettingsOpen ? (
        <div className={styles.overlay}>
          <SettingsPanel
            settings={settings}
            version={version}
            onClose={() => setSettingsOpen(false)}
            onUpdateSettings={updateSettings}
          />
        </div>
      ) : null}
    </div>
  );
}
