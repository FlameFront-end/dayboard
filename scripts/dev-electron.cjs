const { spawn } = require('node:child_process');
const electronBinary = require('electron');

const childEnv = { ...process.env };
delete childEnv.ELECTRON_RUN_AS_NODE;

const child = spawn(electronBinary, ['.'], {
  stdio: 'inherit',
  env: childEnv
});

child.on('close', (code) => {
  process.exit(code ?? 0);
});
