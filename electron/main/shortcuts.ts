import { globalShortcut } from 'electron';

const QUICK_SHOW_SHORTCUT = 'CommandOrControl+Alt+T';

export function registerQuickShowShortcut(callback: () => void): boolean {
  try {
    return globalShortcut.register(QUICK_SHOW_SHORTCUT, callback);
  } catch (error) {
    console.warn('Failed to register quick show shortcut', error);
    return false;
  }
}

export function unregisterAllShortcuts(): void {
  globalShortcut.unregisterAll();
}
