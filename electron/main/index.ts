import { app, ipcMain } from 'electron';
import type { BrowserWindow, Tray } from 'electron';
import type { AppSettings, CreateTaskInput, Task } from '../../src/shared/lib/contracts';
import { getLaunchAtStartup, setLaunchAtStartup } from './autostart';
import { applyTaskbarVisibility, applyWindowLockState, createMainWindow, showMainWindow } from './window';
import { startReminderScheduler } from './scheduler';
import { registerQuickShowShortcut, unregisterAllShortcuts } from './shortcuts';
import { listSettings, updateSettings } from './settings-service';
import { createTask, deleteTask, moveTaskToTomorrow, moveUnfinishedTasksToTomorrow, updateTask } from './task-service';
import { getSettings, listTasks } from './store';
import { createTray, refreshTrayMenu } from './tray';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;
let reminderScheduler: import('./scheduler').ReminderScheduler | null = null;

function emitTasksChanged(): void {
  mainWindow?.webContents.send('tasks-changed');
}

function emitSettingsChanged(settings: AppSettings): void {
  mainWindow?.webContents.send('settings-changed', settings);
}

function refreshTray(): void {
  if (tray === null) {
    return;
  }

  refreshTrayMenu(tray, {
    onShow: handleShowWindow,
    onAddTask: handleFocusQuickAdd,
    onToggleAlwaysOnTop: handleToggleAlwaysOnTop,
    onQuit: handleQuit
  });
}

function handleShowWindow(): void {
  if (mainWindow === null) {
    return;
  }

  showMainWindow(mainWindow);
}

function handleFocusQuickAdd(): void {
  handleShowWindow();
  mainWindow?.webContents.send('focus-quick-add');
}

function handleToggleAlwaysOnTop(): void {
  if (mainWindow === null) {
    return;
  }

  const nextValue = !mainWindow.isAlwaysOnTop();
  mainWindow.setAlwaysOnTop(nextValue);
  const settings = updateSettings({ alwaysOnTop: nextValue });
  emitSettingsChanged(settings);
  refreshTray();
}

function handleQuit(): void {
  isQuitting = true;
  app.quit();
}

function registerIpcHandlers(): void {
  ipcMain.handle('tasks:list', (): Task[] => listTasks());
  ipcMain.handle('tasks:create', (_event, input: CreateTaskInput) => {
    const task = createTask(input);
    emitTasksChanged();
    return task;
  });
  ipcMain.handle('tasks:update', (_event, taskId: string, patch: Partial<Task>) => {
    const task = updateTask(taskId, patch);
    emitTasksChanged();
    return task;
  });
  ipcMain.handle('tasks:delete', (_event, taskId: string) => {
    deleteTask(taskId);
    emitTasksChanged();
  });
  ipcMain.handle('tasks:move-to-tomorrow', (_event, taskId: string) => {
    const task = moveTaskToTomorrow(taskId);
    emitTasksChanged();
    return task;
  });
  ipcMain.handle('tasks:move-unfinished-to-tomorrow', (_event, date: string) => {
    const tasks = moveUnfinishedTasksToTomorrow(date);
    emitTasksChanged();
    return tasks;
  });
  ipcMain.handle('settings:get', () => {
    const settings = listSettings();
    return {
      ...settings,
      launchAtStartup: getLaunchAtStartup()
    };
  });
  ipcMain.handle('settings:update', (_event, patch: Partial<AppSettings>) => {
    const settings = updateSettings(patch);

    if (patch.launchAtStartup !== undefined) {
      setLaunchAtStartup(patch.launchAtStartup);
    }

    if (patch.showInTaskbar !== undefined && mainWindow !== null) {
      applyTaskbarVisibility(mainWindow, patch.showInTaskbar);
    }

    const hydratedSettings = {
      ...settings,
      launchAtStartup: getLaunchAtStartup()
    };

    emitSettingsChanged(hydratedSettings);
    refreshTray();
    return hydratedSettings;
  });
  ipcMain.handle('window:minimize', () => {
    mainWindow?.minimize();
  });
  ipcMain.handle('window:hide-to-tray', () => {
    mainWindow?.hide();
  });
  ipcMain.handle('window:toggle-always-on-top', () => {
    if (mainWindow === null) {
      return false;
    }

    const nextValue = !mainWindow.isAlwaysOnTop();
    mainWindow.setAlwaysOnTop(nextValue);
    emitSettingsChanged(updateSettings({ alwaysOnTop: nextValue }));
    refreshTray();
    return nextValue;
  });
  ipcMain.handle('window:get-always-on-top', () => mainWindow?.isAlwaysOnTop() ?? getSettings().alwaysOnTop);
  ipcMain.handle('window:toggle-window-locked', () => {
    if (mainWindow === null) {
      return false;
    }

    const nextValue = !getSettings().isWindowLocked;
    applyWindowLockState(mainWindow, nextValue);
    emitSettingsChanged(updateSettings({ isWindowLocked: nextValue }));
    return nextValue;
  });
  ipcMain.handle('window:get-window-locked', () => getSettings().isWindowLocked);
  ipcMain.handle('app:get-version', () => app.getVersion());
}

async function bootstrap(): Promise<void> {
  await app.whenReady();
  registerIpcHandlers();

  mainWindow = createMainWindow();
  mainWindow.on('close', (event) => {
    if (isQuitting) {
      return;
    }

    event.preventDefault();
    mainWindow?.hide();
  });

  tray = createTray({
    onShow: handleShowWindow,
    onAddTask: handleFocusQuickAdd,
    onToggleAlwaysOnTop: handleToggleAlwaysOnTop,
    onQuit: handleQuit
  });

  const shortcutRegistered = registerQuickShowShortcut(handleFocusQuickAdd);
  if (!shortcutRegistered) {
    console.warn('Ctrl+Alt+T shortcut registration failed');
  }

  reminderScheduler = startReminderScheduler(mainWindow, emitTasksChanged);

  app.on('activate', () => {
    if (mainWindow !== null) {
      handleShowWindow();
    }

    reminderScheduler?.runNow();
  });

  app.on('before-quit', () => {
    isQuitting = true;
    unregisterAllShortcuts();
    reminderScheduler?.stop();
  });

  app.on('window-all-closed', () => undefined);
}

void bootstrap();
