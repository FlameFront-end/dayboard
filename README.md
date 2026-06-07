# Dayboard

Desktop day planner built as a small always-visible widget for Windows.

Dayboard is designed for one narrow job: keep today's tasks visible, editable, and hard to ignore. It stays on top when needed, lives in the tray, works offline, and stores everything locally.

## Features

- Frameless desktop widget UI built with Electron, React, TypeScript, and SCSS Modules
- Quick add with lightweight time parsing, for example `09:30 English lesson`
- Separate task views for `Today` and `Tomorrow`
- Inline task editing for title and completion state
- Compact time picker modal for setting or clearing task time
- Local reminders with in-app `Done` and `Snooze 10m` actions
- Tray integration with quick show, add-task focus, always-on-top toggle, and quit
- Global shortcut `Ctrl+Alt+T` to show the window and focus quick add
- Persistent UI settings, including:
  - always on top
  - lock window position and resize
  - show or hide from taskbar
  - launch on startup
  - compact mode
  - collapsed header
  - theme

## Tech Stack

- Electron
- React 19
- TypeScript
- Vite
- Zustand
- `electron-store`
- `date-fns`
- `lucide-react`
- SCSS Modules
- Vitest

## Development

Install dependencies:

```bash
npm install
```

Run the app in development mode:

```bash
npm run dev
```

The dev script starts:

- Vite for the renderer
- Vite build watch for Electron main and preload
- Electron after both outputs are ready

## Build

Create production bundles:

```bash
npm run build
```

Build the Windows installer with `electron-builder`:

```bash
npm run dist
```

Generated artifacts are written to `release/`.

## Verification

Run the main checks:

```bash
npm run typecheck
npm run lint
npm test
```

## Project Structure

```text
electron/
  main/        Electron main process, tray, scheduler, window lifecycle
  preload/     Typed bridge exposed to the renderer
src/
  app/         App shell and state wiring
  features/    Task board, settings, task interactions
  shared/      Contracts, utilities, global styles
build/         Static assets such as app icons
```

## Product Behavior

- Tasks and UI settings are stored locally with `electron-store`
- The app is local-only and works offline
- Closing the window hides it instead of quitting the process
- The tray icon remains the main background entry point
- Reminder polling runs on an interval and triggers local notifications plus an in-app reminder banner
- Scrollbars are hidden visually, but scrolling remains enabled

## Keyboard

- `Enter` creates a task from quick add
- `Escape` clears quick add or exits inline editing
- `Ctrl+Alt+T` shows the app and focuses the quick add field

## Current Scope

This repository is currently focused on the desktop MVP:

- Windows-first behavior
- local persistence only
- no cloud sync
- no accounts
- no collaboration features

## License

No license has been added yet.
