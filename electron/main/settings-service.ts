import type { AppSettings } from '../../src/shared/lib/contracts';
import { getSettings, saveSettings } from './store';

export function listSettings(): AppSettings {
  return getSettings();
}

export function updateSettings(patch: Partial<AppSettings>): AppSettings {
  const nextSettings = {
    ...getSettings(),
    ...patch
  };

  saveSettings(nextSettings);
  return nextSettings;
}
