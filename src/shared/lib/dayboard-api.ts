import type { AppSettings, CreateTaskInput, Task } from './contracts';

export type ReminderEvent = {
  taskId: string;
};

export type DayboardApi = {
  tasks: {
    list(): Promise<Task[]>;
    create(input: CreateTaskInput): Promise<Task>;
    update(id: string, patch: Partial<Task>): Promise<Task>;
    delete(id: string): Promise<void>;
    moveToTomorrow(id: string): Promise<Task>;
    moveUnfinishedToTomorrow(date: string): Promise<Task[]>;
  };
  settings: {
    get(): Promise<AppSettings>;
    update(patch: Partial<AppSettings>): Promise<AppSettings>;
  };
  window: {
    minimize(): Promise<void>;
    hideToTray(): Promise<void>;
    toggleAlwaysOnTop(): Promise<boolean>;
    getAlwaysOnTop(): Promise<boolean>;
    toggleWindowLocked(): Promise<boolean>;
    getWindowLocked(): Promise<boolean>;
  };
  app: {
    getVersion(): Promise<string>;
  };
  events: {
    onTasksChanged(listener: () => void): () => void;
    onSettingsChanged(listener: (settings: AppSettings) => void): () => void;
    onFocusQuickAdd(listener: () => void): () => void;
    onReminderTriggered(listener: (event: ReminderEvent) => void): () => void;
  };
};
