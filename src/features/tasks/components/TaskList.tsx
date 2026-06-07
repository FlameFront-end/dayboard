import type { Task } from '../../../shared/lib/contracts';
import { TaskRow } from './TaskRow';
import styles from './TaskList.module.scss';

type TaskListProps = {
  tasks: Task[];
  today: string;
  now: Date;
  compactMode: boolean;
  activeReminderTaskId?: string;
  onToggleDone: (task: Task) => Promise<void>;
  onSaveTitle: (taskId: string, title: string) => Promise<void>;
  onSaveTime: (taskId: string, time?: string) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  onMoveTaskDate: (task: Task) => Promise<void>;
  onSnooze: (task: Task) => Promise<void>;
};

export function TaskList(props: TaskListProps) {
  if (props.tasks.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No tasks for today.</p>
        <span>Add one thing worth finishing.</span>
      </div>
    );
  }

  return (
    <ul className={styles.list}>
      {props.tasks.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          today={props.today}
          now={props.now}
          compactMode={props.compactMode}
          isReminderActive={props.activeReminderTaskId === task.id}
          onToggleDone={props.onToggleDone}
          onSaveTitle={props.onSaveTitle}
          onSaveTime={props.onSaveTime}
          onDelete={props.onDelete}
          onMoveTaskDate={props.onMoveTaskDate}
          onSnooze={props.onSnooze}
        />
      ))}
    </ul>
  );
}
