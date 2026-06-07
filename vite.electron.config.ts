import { builtinModules } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

const packageJson = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf8')) as {
  dependencies?: Record<string, string>;
};

const packageDependencies = Object.keys(packageJson.dependencies ?? {});
const external = [
  'electron',
  ...packageDependencies,
  ...builtinModules,
  ...builtinModules.map((moduleName) => `node:${moduleName}`)
];
const isWatchMode = process.argv.includes('--watch');

export default defineConfig({
  build: {
    outDir: 'dist-electron',
    emptyOutDir: !isWatchMode,
    lib: {
      entry: {
        main: resolve(__dirname, 'electron/main/index.ts'),
        preload: resolve(__dirname, 'electron/preload/index.ts')
      },
      formats: ['cjs']
    },
    rollupOptions: {
      external,
      output: {
        entryFileNames: '[name]/index.cjs'
      }
    },
    sourcemap: true,
    target: 'node20'
  }
});
