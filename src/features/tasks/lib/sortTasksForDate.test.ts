import type { Task } from '../../../shared/lib/contracts';
import { sortTasksForDate } from './sortTasksForDate';

function createTask(overrides: Partial<Task>): Task {
  return {
    id: crypto.randomUUID(),
    title: 'Task',
    date: '2026-06-07',
    status: 'todo',
    createdAt: '2026-06-07T08:00:00.000Z',
    updatedAt: '2026-06-07T08:00:00.000Z',
    ...overrides
  };
}

describe('sortTasksForDate', () => {
  test('sorts timed undone tasks first, then untimed, then done by completed date desc', () => {
    const untimedTodo = createTask({ id: 'untimed', title: 'Untimed' });
    const earlyTodo = createTask({ id: 'early', title: 'Early', time: '09:00' });
    const lateTodo = createTask({ id: 'late', title: 'Late', time: '12:00' });
    const oldDone = createTask({
      id: 'done-old',
      title: 'Done old',
      status: 'done',
      completedAt: '2026-06-07T11:00:00.000Z'
    });
    const newDone = createTask({
      id: 'done-new',
      title: 'Done new',
      status: 'done',
      completedAt: '2026-06-07T12:00:00.000Z'
    });

    expect(
      sortTasksForDate([untimedTodo, newDone, lateTodo, oldDone, earlyTodo]).map((task) => task.id)
    ).toEqual(['early', 'late', 'untimed', 'done-new', 'done-old']);
  });
});
