import type { BrowserWindow } from 'electron';
import { getDueReminderTasks } from '../../src/features/tasks/lib/getDueReminderTasks';
import { updateTask } from './task-service';
import { listTasks } from './store';
import { showTaskNotification } from './notifications';

const REMINDER_POLL_INTERVAL_MS = 30_000;

export type ReminderScheduler = {
  runNow: () => void;
  stop: () => void;
};

export function startReminderScheduler(
  window: BrowserWindow,
  onTasksChanged: () => void
): ReminderScheduler {
  const run = (): void => {
    const dueTasks = getDueReminderTasks(listTasks(), new Date());

    for (const task of dueTasks) {
      showTaskNotification(task);
      updateTask(task.id, {
        reminderFiredAt: new Date().toISOString()
      });
      onTasksChanged();
      window.webContents.send('reminder-triggered', { taskId: task.id });
    }
  };

  run();
  const timer = setInterval(run, REMINDER_POLL_INTERVAL_MS);

  return {
    runNow: run,
    stop: () => {
      clearInterval(timer);
    }
  };
}
