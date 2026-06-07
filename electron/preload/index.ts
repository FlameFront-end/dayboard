import { contextBridge, ipcRenderer } from 'electron';
import type { AppSettings, CreateTaskInput, Task } from '../../src/shared/lib/contracts';
import type { DayboardApi, ReminderEvent } from '../../src/shared/lib/dayboard-api';

function createEventSubscription<T>(channel: string, listener: (payload: T) => void): () => void {
  const wrappedListener = (_event: Electron.IpcRendererEvent, payload: T) => {
    listener(payload);
  };

  ipcRenderer.on(channel, wrappedListener);

  return () => {
    ipcRenderer.removeListener(channel, wrappedListener);
  };
}

const api: DayboardApi = {
  tasks: {
    list: () => ipcRenderer.invoke('tasks:list') as Promise<Task[]>,
    create: (input: CreateTaskInput) => ipcRenderer.invoke('tasks:create', input) as Promise<Task>,
    update: (id: string, patch: Partial<Task>) => ipcRenderer.invoke('tasks:update', id, patch) as Promise<Task>,
    delete: (id: string) => ipcRenderer.invoke('tasks:delete', id) as Promise<void>,
    moveToTomorrow: (id: string) => ipcRenderer.invoke('tasks:move-to-tomorrow', id) as Promise<Task>,
    moveUnfinishedToTomorrow: (date: string) =>
      ipcRenderer.invoke('tasks:move-unfinished-to-tomorrow', date) as Promise<Task[]>
  },
  settings: {
    get: () => ipcRenderer.invoke('settings:get') as Promise<AppSettings>,
    update: (patch: Partial<AppSettings>) => ipcRenderer.invoke('settings:update', patch) as Promise<AppSettings>
  },
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize') as Promise<void>,
    hideToTray: () => ipcRenderer.invoke('window:hide-to-tray') as Promise<void>,
    toggleAlwaysOnTop: () => ipcRenderer.invoke('window:toggle-always-on-top') as Promise<boolean>,
    getAlwaysOnTop: () => ipcRenderer.invoke('window:get-always-on-top') as Promise<boolean>,
    toggleWindowLocked: () => ipcRenderer.invoke('window:toggle-window-locked') as Promise<boolean>,
    getWindowLocked: () => ipcRenderer.invoke('window:get-window-locked') as Promise<boolean>
  },
  app: {
    getVersion: () => ipcRenderer.invoke('app:get-version') as Promise<string>
  },
  events: {
    onTasksChanged: (listener: () => void) => createEventSubscription('tasks-changed', () => listener()),
    onSettingsChanged: (listener: (settings: AppSettings) => void) =>
      createEventSubscription('settings-changed', listener),
    onFocusQuickAdd: (listener: () => void) => createEventSubscription('focus-quick-add', () => listener()),
    onReminderTriggered: (listener: (event: ReminderEvent) => void) =>
      createEventSubscription('reminder-triggered', listener)
  }
};

contextBridge.exposeInMainWorld('dayboard', api);
