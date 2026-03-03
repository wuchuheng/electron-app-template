import { execSync, spawn, ChildProcess } from 'child_process';

const command = process.argv[2]; // 'dev', 'build', 'package', 'publish'

// ===========================================
// Logging Utility
// ===========================================

function getTimestamp() {
  return new Date().toLocaleTimeString('en-GB', { hour12: false });
}

function log(level: 'info' | 'success' | 'warn' | 'error' | 'step', message: string) {
  const reset = '\x1b[0m';
  const bold = '\x1b[1m';
  const colors = {
    info: '\x1b[34m',    // Blue
    success: '\x1b[32m', // Green
    warn: '\x1b[33m',    // Yellow
    error: '\x1b[31m',   // Red
    step: '\x1b[35m'     // Magenta
  };

  const levelName = level.toUpperCase();
  const coloredLevel = `${bold}${colors[level]}${levelName}${reset}`;
  
  console.log(`[${getTimestamp()}] ${coloredLevel}: ${message}`);
}

if (process.platform === 'win32') {
  try {
    execSync('chcp 65001', { stdio: 'ignore' });
  } catch {
    /* ignore error */
  }
}

const env = { ...process.env, NODE_ENV: command === 'dev' ? 'development' : 'production' };

function run(cmd: string): ChildProcess {
  return spawn(cmd, { shell: true, stdio: 'inherit', env });
}

async function execute() {
  switch (command) {
    case 'dev': {
      execSync('npm run ipc:sync', { stdio: 'inherit', env });
      execSync('tsx scripts/sync-app-name.ts', { stdio: 'inherit', env });
      
      log('step', 'Starting electron-vite dev server...');
      
      // Use a Promise to keep the execute() function alive until the child process exits
      await new Promise<void>((resolve, reject) => {
        const child = run('electron-vite dev');
        
        child.on('exit', (code) => {
          if (code === 0 || code === null) {
            resolve();
          } else {
            reject(new Error(`electron-vite exited with code ${code}`));
          }
        });

        child.on('error', (err) => {
          reject(err);
        });

        // Ensure child is killed when parent receives termination signals
        const handleSignal = () => {
          if (!child.killed) {
            child.kill('SIGINT');
          }
        };

        process.on('SIGINT', handleSignal);
        process.on('SIGTERM', handleSignal);
      });
      break;
    }

    case 'build':
      log('step', 'Building production assets...');
      execSync('npm run ipc:sync', { stdio: 'inherit', env });
      execSync('tsx scripts/sync-app-name.ts', { stdio: 'inherit', env });
      execSync('electron-vite build', { stdio: 'inherit', env });
      break;

    case 'package':
    case 'publish': {
      const isPublish = command === 'publish';
      const platform = process.platform;

      log('step', `Packaging for ${platform}/${process.arch}...`);

      // 1. Build
      execSync('npm run manage build', { stdio: 'inherit', env });

      // 2. Package using electron-builder defaults
      const builderFlag = platform === 'win32' ? '--win' : platform === 'darwin' ? '--mac' : '--linux';
      const publishFlag = isPublish ? '-p always' : '';

      const builderCmd = `npx electron-builder build ${builderFlag} ${publishFlag}`.trim();

      log('info', `Executing: ${builderCmd}`);
      try {
        execSync(builderCmd, { stdio: 'inherit', env });
        log('success', 'Success! Artifacts are in: dist/');
      } catch {
        log('error', 'Build failed. Tip: Close any running instances of the app.');
        process.exit(1);
      }
      break;
    }

    default:
      process.exit(1);
  }
}

execute().catch((err) => {
  console.error(err);
  process.exit(1);
});
