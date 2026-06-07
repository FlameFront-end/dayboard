export type TaskStatus = 'todo' | 'done';

export type Task = {
  id: string;
  title: string;
  date: string;
  time?: string;
  remindAt?: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  reminderFiredAt?: string;
  snoozedUntil?: string;
};

export type AppTheme = 'dark' | 'light' | 'system';

export type AppSettings = {
  alwaysOnTop: boolean;
  isWindowLocked: boolean;
  isHeaderCollapsed: boolean;
  showInTaskbar: boolean;
  launchAtStartup: boolean;
  theme: AppTheme;
  notificationSound: boolean;
  defaultReminderOffsetMinutes: number | null;
  compactMode: boolean;
};

export type CreateTaskInput = {
  title: string;
  date: string;
  time?: string;
  remindAt?: string;
};

export type StoreSchema = {
  tasks: Task[];
  settings: AppSettings;
  windowBounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  schemaVersion: number;
};

export const DEFAULT_SETTINGS: AppSettings = {
  alwaysOnTop: true,
  isWindowLocked: false,
  isHeaderCollapsed: false,
  showInTaskbar: false,
  launchAtStartup: false,
  theme: 'dark',
  notificationSound: false,
  defaultReminderOffsetMinutes: null,
  compactMode: false
};

export const STORE_SCHEMA_VERSION = 1;
