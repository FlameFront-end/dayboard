import { app } from 'electron';
import ElectronStoreModule from 'electron-store';
import type ElectronStoreType from 'electron-store';
import type { AppSettings, StoreSchema, Task } from '../../src/shared/lib/contracts';
import { DEFAULT_SETTINGS, STORE_SCHEMA_VERSION } from '../../src/shared/lib/contracts';

const STORE_NAME = 'dayboard';

type WindowBounds = NonNullable<StoreSchema['windowBounds']>;
type ElectronStoreConstructor = typeof import('electron-store').default;

function resolveElectronStoreConstructor(moduleValue: unknown): ElectronStoreConstructor {
  if (typeof moduleValue === 'function') {
    return moduleValue as ElectronStoreConstructor;
  }

  if (
    typeof moduleValue === 'object' &&
    moduleValue !== null &&
    'default' in moduleValue &&
    typeof moduleValue.default === 'function'
  ) {
    return moduleValue.default as ElectronStoreConstructor;
  }

  throw new Error('Failed to resolve electron-store constructor');
}

const ElectronStore = resolveElectronStoreConstructor(ElectronStoreModule);

const DEFAULT_SCHEMA: StoreSchema = {
  tasks: [],
  settings: DEFAULT_SETTINGS,
  schemaVersion: STORE_SCHEMA_VERSION
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeStoreSchema(store: ElectronStoreType<StoreSchema>): void {
  const currentSettings = store.get('settings');
  const normalizedSettings = {
    ...DEFAULT_SETTINGS,
    ...(isObject(currentSettings) ? currentSettings : {})
  };

  if (
    !isObject(currentSettings) ||
    store.get('schemaVersion') !== STORE_SCHEMA_VERSION ||
    JSON.stringify(currentSettings) !== JSON.stringify(normalizedSettings)
  ) {
    store.set('settings', normalizedSettings);
    store.set('schemaVersion', STORE_SCHEMA_VERSION);
  }
}

function createStore(): ElectronStoreType<StoreSchema> {
  const store = new ElectronStore<StoreSchema>({
    name: STORE_NAME,
    cwd: app.getPath('userData'),
    clearInvalidConfig: true,
    defaults: DEFAULT_SCHEMA
  });

  normalizeStoreSchema(store);

  return store;
}

const appStore = createStore();

export function listTasks(): Task[] {
  return appStore.get('tasks');
}

export function saveTasks(tasks: Task[]): void {
  appStore.set('tasks', tasks);
}

export function getSettings(): AppSettings {
  const settings = appStore.get('settings');

  return {
    ...DEFAULT_SETTINGS,
    ...settings
  };
}

export function saveSettings(settings: AppSettings): void {
  appStore.set('settings', settings);
}

export function getWindowBounds(): WindowBounds | undefined {
  return appStore.get('windowBounds');
}

export function saveWindowBounds(bounds: WindowBounds): void {
  appStore.set('windowBounds', bounds);
}
