import { spawn } from 'node:child_process';
import process from 'node:process';

// Auto-bootstrap TS execution if invoked directly via `node server.ts` without tsx module loader
const isTsx = process.execArgv.some((arg) => arg.includes('tsx')) || process.env._TSX_BOOTSTRAPPED === '1';

if (!isTsx) {
  process.env._TSX_BOOTSTRAPPED = '1';
  const child = spawn(process.execPath, ['--import', 'tsx', ...process.argv.slice(1)], {
    stdio: 'inherit',
    env: process.env,
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
    } else {
      process.exit(code ?? 0);
    }
  });

  process.on('SIGTERM', () => child.kill('SIGTERM'));
  process.on('SIGINT', () => child.kill('SIGINT'));
} else {
  const { bootstrap } = await import('./src/server/serverApp');
  bootstrap().catch((err: unknown) => {
    console.error('[FES Academy] Fatal server startup error:', err);
    process.exit(1);
  });
}
