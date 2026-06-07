import { BrowserWindow, screen } from 'electron';
import { resolveAppPath } from './paths';
import { getSettings, getWindowBounds, saveWindowBounds } from './store';

const DEFAULT_WINDOW_WIDTH = 380;
const DEFAULT_WINDOW_HEIGHT = 560;
const WINDOW_EDGE_MARGIN = 24;

function getDefaultBounds(): Electron.Rectangle {
  const workArea = screen.getPrimaryDisplay().workArea;

  return {
    width: DEFAULT_WINDOW_WIDTH,
    height: DEFAULT_WINDOW_HEIGHT,
    x: workArea.x + workArea.width - DEFAULT_WINDOW_WIDTH - WINDOW_EDGE_MARGIN,
    y: workArea.y + Math.round((workArea.height - DEFAULT_WINDOW_HEIGHT) / 2)
  };
}

function getInitialBounds(): Electron.Rectangle {
  return getWindowBounds() ?? getDefaultBounds();
}

export function applyWindowLockState(window: BrowserWindow, isLocked: boolean): void {
  window.setMovable(!isLocked);
  window.setResizable(!isLocked);
}

export function applyTaskbarVisibility(window: BrowserWindow, showInTaskbar: boolean): void {
  window.setSkipTaskbar(!showInTaskbar);
}

function disableWindowAccentHighlight(window: BrowserWindow): void {
  if (process.platform !== 'win32') {
    return;
  }

  try {
    window.setAccentColor(false);
  } catch (error) {
    console.warn('Failed to disable window accent highlight.', error);
  }
}

export function createMainWindow(): BrowserWindow {
  const settings = getSettings();
  const window = new BrowserWindow({
    ...getInitialBounds(),
    minWidth: 260,
    minHeight: 420,
    frame: false,
    transparent: false,
    show: false,
    skipTaskbar: !settings.showInTaskbar,
    autoHideMenuBar: true,
    backgroundColor: '#000000',
    alwaysOnTop: settings.alwaysOnTop,
    title: 'Dayboard',
    webPreferences: {
      preload: resolveAppPath('dist-electron', 'preload', 'index.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  applyWindowLockState(window, settings.isWindowLocked);
  applyTaskbarVisibility(window, settings.showInTaskbar);
  disableWindowAccentHighlight(window);

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;

  if (devServerUrl !== undefined) {
    void window.loadURL(devServerUrl);
  } else {
    void window.loadFile(resolveAppPath('dist', 'index.html'));
  }

  window.once('ready-to-show', () => {
    window.show();
  });

  const persistBounds = (): void => {
    if (window.isDestroyed()) {
      return;
    }

    const bounds = window.getBounds();
    saveWindowBounds(bounds);
  };

  window.on('moved', persistBounds);
  window.on('resized', persistBounds);

  return window;
}

export function showMainWindow(window: BrowserWindow): void {
  if (window.isMinimized()) {
    window.restore();
  }

  window.show();
  window.focus();
}
