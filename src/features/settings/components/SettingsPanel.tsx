import { AppWindow, Bell, Monitor, Moon, PanelTopClose, Pin, Rocket, Rows3, Sun, X } from 'lucide-react';
import { Check } from 'lucide-react';
import type { AppSettings, AppTheme } from '../../../shared/lib/contracts';
import styles from './SettingsPanel.module.scss';

type SettingsPanelProps = {
  settings: AppSettings;
  version: string;
  onClose: () => void;
  onUpdateSettings: (patch: Partial<AppSettings>) => Promise<void>;
};

const THEMES: AppTheme[] = ['dark', 'light', 'system'];

const THEME_ICONS = {
  dark: Moon,
  light: Sun,
  system: Monitor
} as const;

export function SettingsPanel({ settings, version, onClose, onUpdateSettings }: SettingsPanelProps) {
  const renderToggle = (
    checked: boolean,
    onChange: (checked: boolean) => Promise<void>
  ) => (
    <button
      type="button"
      className={`${styles.checkbox} ${checked ? styles.checkboxChecked : ''}`}
      aria-pressed={checked}
      onClick={() => {
        void onChange(!checked);
      }}
    >
      <span className={styles.checkboxBox}>
        {checked ? <Check size={13} strokeWidth={2.6} /> : null}
      </span>
    </button>
  );

  return (
    <aside className={styles.panel}>
      <div className={styles.header}>
        <h2>Settings</h2>
        <button type="button" className={styles.iconButton} onClick={onClose} aria-label="Close settings">
          <X size={16} strokeWidth={1.8} />
        </button>
      </div>

      <section className={styles.section}>
        <span className={styles.label}>Theme</span>
        <div className={styles.themeRow}>
          {THEMES.map((theme) => (
            (() => {
              const ThemeIcon = THEME_ICONS[theme];

              return (
                <button
                  key={theme}
                  type="button"
                  className={settings.theme === theme ? styles.activeChip : styles.chip}
                  onClick={() => void onUpdateSettings({ theme })}
                >
                  <ThemeIcon size={14} strokeWidth={1.9} />
                  <span>{theme}</span>
                </button>
              );
            })()
          ))}
        </div>
      </section>

      <label className={styles.toggle}>
        <span className={styles.toggleLabel}>
          <Pin size={14} strokeWidth={1.9} />
          <span>Always on top</span>
        </span>
        {renderToggle(settings.alwaysOnTop, async (checked) => onUpdateSettings({ alwaysOnTop: checked }))}
      </label>

      <label className={styles.toggle}>
        <span className={styles.toggleLabel}>
          <Rocket size={14} strokeWidth={1.9} />
          <span>Launch on startup</span>
        </span>
        {renderToggle(settings.launchAtStartup, async (checked) => onUpdateSettings({ launchAtStartup: checked }))}
      </label>

      <label className={styles.toggle}>
        <span className={styles.toggleLabel}>
          <AppWindow size={14} strokeWidth={1.9} />
          <span>Show in taskbar</span>
        </span>
        {renderToggle(settings.showInTaskbar, async (checked) => onUpdateSettings({ showInTaskbar: checked }))}
      </label>

      <label className={styles.toggle}>
        <span className={styles.toggleLabel}>
          <Rows3 size={14} strokeWidth={1.9} />
          <span>Compact mode</span>
        </span>
        {renderToggle(settings.compactMode, async (checked) => onUpdateSettings({ compactMode: checked }))}
      </label>

      <label className={styles.toggle}>
        <span className={styles.toggleLabel}>
          <PanelTopClose size={14} strokeWidth={1.9} />
          <span>Collapsed header</span>
        </span>
        {renderToggle(settings.isHeaderCollapsed, async (checked) => onUpdateSettings({ isHeaderCollapsed: checked }))}
      </label>

      <label className={styles.toggle}>
        <span className={styles.toggleLabel}>
          <Bell size={14} strokeWidth={1.9} />
          <span>Notification sound</span>
        </span>
        {renderToggle(settings.notificationSound, async (checked) => onUpdateSettings({ notificationSound: checked }))}
      </label>

      <div className={styles.footer}>v{version || '0.1.0'}</div>
    </aside>
  );
}
