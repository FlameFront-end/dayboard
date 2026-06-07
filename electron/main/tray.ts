import { Menu, Tray, nativeImage } from 'electron';
import { resolveAppPath } from './paths';
import { getSettings } from './store';

type TrayCallbacks = {
  onShow: () => void;
  onAddTask: () => void;
  onToggleAlwaysOnTop: () => void;
  onQuit: () => void;
};

export function createTray(callbacks: TrayCallbacks): Tray {
  const iconPath = resolveAppPath('build', 'icon.png');
  const tray = new Tray(nativeImage.createFromPath(iconPath));

  const buildMenu = (): Menu =>
    Menu.buildFromTemplate([
      { label: 'Show Dayboard', click: callbacks.onShow },
      { label: 'Add task', click: callbacks.onAddTask },
      {
        label: getSettings().alwaysOnTop ? 'Disable always on top' : 'Enable always on top',
        click: callbacks.onToggleAlwaysOnTop
      },
      { type: 'separator' },
      { label: 'Quit', click: callbacks.onQuit }
    ]);

  tray.setToolTip('Dayboard');
  tray.setContextMenu(buildMenu());
  tray.on('click', callbacks.onShow);

  return tray;
}

export function refreshTrayMenu(tray: Tray, callbacks: TrayCallbacks): void {
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: 'Show Dayboard', click: callbacks.onShow },
      { label: 'Add task', click: callbacks.onAddTask },
      {
        label: getSettings().alwaysOnTop ? 'Disable always on top' : 'Enable always on top',
        click: callbacks.onToggleAlwaysOnTop
      },
      { type: 'separator' },
      { label: 'Quit', click: callbacks.onQuit }
    ])
  );
}
