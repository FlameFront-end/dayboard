import type { Task } from '../../../shared/lib/contracts';

function compareOptionalTime(leftTime: string | undefined, rightTime: string | undefined): number {
  if (leftTime === undefined && rightTime === undefined) {
    return 0;
  }

  if (leftTime === undefined) {
    return 1;
  }

  if (rightTime === undefined) {
    return -1;
  }

  return leftTime.localeCompare(rightTime);
}

function compareCompletedAtDesc(left: Task, right: Task): number {
  const leftCompletedAt = left.completedAt ?? '';
  const rightCompletedAt = right.completedAt ?? '';
  return rightCompletedAt.localeCompare(leftCompletedAt);
}

export function sortTasksForDate(tasks: Task[]): Task[] {
  return [...tasks].sort((left, right) => {
    if (left.status === 'done' && right.status !== 'done') {
      return 1;
    }

    if (left.status !== 'done' && right.status === 'done') {
      return -1;
    }

    if (left.status === 'done' && right.status === 'done') {
      return compareCompletedAtDesc(left, right);
    }

    return compareOptionalTime(left.time, right.time);
  });
}
