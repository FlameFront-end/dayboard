import type { Task } from '../../../shared/lib/contracts';
import { getDueReminderTasks } from './getDueReminderTasks';

function createTask(overrides: Partial<Task>): Task {
  return {
    id: 'task-1',
    title: 'English lesson',
    date: '2026-06-07',
    status: 'todo',
    createdAt: '2026-06-07T08:00:00.000Z',
    updatedAt: '2026-06-07T08:00:00.000Z',
    ...overrides
  };
}

describe('getDueReminderTasks', () => {
  const now = new Date('2026-06-07T09:30:00.000Z');

  test('does not notify done task', () => {
    const tasks = [
      createTask({
        status: 'done',
        remindAt: '2026-06-07T09:00:00.000Z'
      })
    ];

    expect(getDueReminderTasks(tasks, now)).toEqual([]);
  });

  test('notifies due task', () => {
    const task = createTask({
      remindAt: '2026-06-07T09:00:00.000Z'
    });

    expect(getDueReminderTasks([task], now)).toEqual([task]);
  });

  test('does not notify future task', () => {
    const tasks = [
      createTask({
        remindAt: '2026-06-07T10:00:00.000Z'
      })
    ];

    expect(getDueReminderTasks(tasks, now)).toEqual([]);
  });

  test('does not notify same task twice', () => {
    const tasks = [
      createTask({
        remindAt: '2026-06-07T09:00:00.000Z',
        reminderFiredAt: '2026-06-07T09:05:00.000Z'
      })
    ];

    expect(getDueReminderTasks(tasks, now)).toEqual([]);
  });

  test('notifies snoozed task when snooze time arrives', () => {
    const task = createTask({
      remindAt: '2026-06-07T09:00:00.000Z',
      reminderFiredAt: '2026-06-07T09:00:00.000Z',
      snoozedUntil: '2026-06-07T09:20:00.000Z'
    });

    expect(getDueReminderTasks([task], now)).toEqual([task]);
  });

  test('handles missed reminders after app restart', () => {
    const task = createTask({
      date: '2026-06-06',
      remindAt: '2026-06-06T22:00:00.000Z'
    });

    expect(getDueReminderTasks([task], now)).toEqual([task]);
  });
});
