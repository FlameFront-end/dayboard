import { addDays } from 'date-fns';
import { randomUUID } from 'node:crypto';
import type { CreateTaskInput, Task } from '../../src/shared/lib/contracts';
import { formatLocalDate } from '../../src/shared/lib/date';
import { listTasks, saveTasks } from './store';

function updateTasks(mutator: (tasks: Task[]) => Task[]): Task[] {
  const nextTasks = mutator(listTasks());
  saveTasks(nextTasks);
  return nextTasks;
}

function updateTaskById(taskId: string, mutator: (task: Task) => Task): Task {
  let updatedTask: Task | undefined;

  const nextTasks = updateTasks((tasks) =>
    tasks.map((task) => {
      if (task.id !== taskId) {
        return task;
      }

      updatedTask = mutator(task);
      return updatedTask;
    })
  );

  if (updatedTask === undefined) {
    throw new Error(`Task not found: ${taskId}`);
  }

  saveTasks(nextTasks);

  return updatedTask;
}

export function createTask(input: CreateTaskInput): Task {
  const now = new Date().toISOString();
  const task: Task = {
    id: randomUUID(),
    title: input.title.trim(),
    date: input.date,
    time: input.time,
    remindAt: input.remindAt,
    status: 'todo',
    createdAt: now,
    updatedAt: now
  };

  updateTasks((tasks) => [...tasks, task]);
  return task;
}

export function updateTask(taskId: string, patch: Partial<Task>): Task {
  return updateTaskById(taskId, (task) => {
    const nextStatus = patch.status ?? task.status;
    const nextCompletedAt =
      nextStatus === 'done'
        ? patch.completedAt ?? task.completedAt ?? new Date().toISOString()
        : patch.status === 'todo'
          ? undefined
          : patch.completedAt ?? task.completedAt;

    return {
      ...task,
      ...patch,
      status: nextStatus,
      completedAt: nextCompletedAt,
      updatedAt: new Date().toISOString()
    };
  });
}

export function deleteTask(taskId: string): void {
  updateTasks((tasks) => tasks.filter((task) => task.id !== taskId));
}

export function moveTaskToTomorrow(taskId: string): Task {
  return updateTaskById(taskId, (task) => ({
    ...task,
    date: formatLocalDate(addDays(new Date(`${task.date}T00:00:00.000Z`), 1)),
    updatedAt: new Date().toISOString()
  }));
}

export function moveUnfinishedTasksToTomorrow(date: string): Task[] {
  const tomorrow = formatLocalDate(addDays(new Date(`${date}T00:00:00.000Z`), 1));
  const movedTasks: Task[] = [];

  updateTasks((tasks) =>
    tasks.map((task) => {
      if (task.status !== 'todo' || task.date !== date) {
        return task;
      }

      const movedTask = {
        ...task,
        date: tomorrow,
        updatedAt: new Date().toISOString()
      };

      movedTasks.push(movedTask);
      return movedTask;
    })
  );

  return movedTasks;
}
