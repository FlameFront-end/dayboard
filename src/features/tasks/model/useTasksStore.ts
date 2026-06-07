import { create } from 'zustand';
import type { AppSettings, CreateTaskInput, Task } from '../../../shared/lib/contracts';
import { DEFAULT_SETTINGS } from '../../../shared/lib/contracts';

type TasksState = {
  tasks: Task[];
  settings: AppSettings;
  version: string;
  isReady: boolean;
  load: () => Promise<void>;
  refreshTasks: () => Promise<void>;
  createTask: (input: CreateTaskInput) => Promise<void>;
  updateTask: (taskId: string, patch: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  moveTaskToTomorrow: (taskId: string) => Promise<void>;
  moveUnfinishedToTomorrow: (date: string) => Promise<void>;
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>;
  applySettings: (settings: AppSettings) => void;
};

export const useTasksStore = create<TasksState>((set) => ({
  tasks: [],
  settings: DEFAULT_SETTINGS,
  version: '',
  isReady: false,
  load: async () => {
    const [tasks, settings, version] = await Promise.all([
      window.dayboard.tasks.list(),
      window.dayboard.settings.get(),
      window.dayboard.app.getVersion()
    ]);

    set({
      tasks,
      settings,
      version,
      isReady: true
    });
  },
  refreshTasks: async () => {
    const tasks = await window.dayboard.tasks.list();
    set({ tasks });
  },
  createTask: async (input) => {
    await window.dayboard.tasks.create(input);
    const tasks = await window.dayboard.tasks.list();
    set({ tasks });
  },
  updateTask: async (taskId, patch) => {
    await window.dayboard.tasks.update(taskId, patch);
    const tasks = await window.dayboard.tasks.list();
    set({ tasks });
  },
  deleteTask: async (taskId) => {
    await window.dayboard.tasks.delete(taskId);
    const tasks = await window.dayboard.tasks.list();
    set({ tasks });
  },
  moveTaskToTomorrow: async (taskId) => {
    await window.dayboard.tasks.moveToTomorrow(taskId);
    const tasks = await window.dayboard.tasks.list();
    set({ tasks });
  },
  moveUnfinishedToTomorrow: async (date) => {
    await window.dayboard.tasks.moveUnfinishedToTomorrow(date);
    const tasks = await window.dayboard.tasks.list();
    set({ tasks });
  },
  updateSettings: async (patch) => {
    const settings = await window.dayboard.settings.update(patch);
    set({ settings });
  },
  applySettings: (settings) => {
    set({ settings });
  }
}));
