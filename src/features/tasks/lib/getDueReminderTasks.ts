import type { Task } from '../../../shared/lib/contracts';

function isDueAtOrBefore(dateValue: string | undefined, now: Date): boolean {
  return dateValue !== undefined && new Date(dateValue).getTime() <= now.getTime();
}

function hasReminderFiredForCurrentDueTime(task: Task): boolean {
  if (task.reminderFiredAt === undefined) {
    return false;
  }

  if (task.snoozedUntil === undefined) {
    return true;
  }

  return new Date(task.reminderFiredAt).getTime() >= new Date(task.snoozedUntil).getTime();
}

export function getDueReminderTasks(tasks: Task[], now: Date): Task[] {
  return tasks.filter((task) => {
    if (task.status !== 'todo') {
      return false;
    }

    const isSnoozeDue = isDueAtOrBefore(task.snoozedUntil, now);
    const isReminderDue = task.snoozedUntil === undefined && isDueAtOrBefore(task.remindAt, now);

    if (!isSnoozeDue && !isReminderDue) {
      return false;
    }

    return !hasReminderFiredForCurrentDueTime(task);
  });
}
