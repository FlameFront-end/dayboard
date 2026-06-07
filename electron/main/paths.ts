import { app } from 'electron';
import { join } from 'node:path';

export function resolveAppPath(...segments: string[]): string {
  return join(app.getAppPath(), ...segments);
}
