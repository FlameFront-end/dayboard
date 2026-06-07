import { Notification } from 'electron';
import type { Task } from '../../src/shared/lib/contracts';

export function showTaskNotification(task: Task): void {
  const body = task.time !== undefined ? `${task.time} — ${task.title}` : task.title;

  if (!Notification.isSupported()) {
    return;
  }

  new Notification({
    title: 'Dayboard',
    body,
    silent: true
  }).show();
}
