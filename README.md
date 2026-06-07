# Dayboard

Always-visible execution board for today.

## Stack

- Electron
- React
- TypeScript
- Vite
- Zustand
- electron-store
- date-fns
- SCSS Modules
- Vitest

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run dist
```

## Verify

```bash
npm run typecheck
npm run lint
npm test
```

## Product Behavior

- Frameless desktop widget window with custom header and compact task board UI.
- Quick add supports inputs like `09:30 English lesson`.
- Tasks persist locally through `electron-store`.
- Close hides the app to tray instead of quitting.
- Tray menu supports showing the app, focusing quick add, toggling always-on-top, and quitting.
- Reminder scheduler checks every 30 seconds and fires local notifications once per due reminder.
- Reminder banner inside the app provides `Done` and `Snooze 10m`.
- Settings include theme, launch on startup, always on top, compact mode, notification sound, and reminder offset storage.

## Keyboard

- `Enter` adds a task from quick add.
- `Esc` clears quick add or leaves inline editing.
- `Ctrl+Alt+T` shows the window and focuses quick add when the global shortcut registers successfully.

## Notes

- Windows is the primary target.
- The app is local-only and works offline.
- Notification actions are implemented in-app through the reminder banner because Windows desktop notifications are not wired to direct action callbacks in this MVP.
