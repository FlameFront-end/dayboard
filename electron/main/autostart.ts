import { app } from 'electron';

export function setLaunchAtStartup(enabled: boolean): void {
  app.setLoginItemSettings({
    openAtLogin: enabled
  });
}

export function getLaunchAtStartup(): boolean {
  return app.getLoginItemSettings().openAtLogin;
}
