import { spawn } from 'child_process';

/**
 * Verification Script: Runtime Survival Test
 * Starts the application and ensures it stays alive for 60 seconds without crashing.
 */

async function main() {
  console.log('=== Starting 60s Runtime Survival Test ===');
  
  const child = spawn('npm', ['run', 'start'], {
    shell: true,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' }
  });

  let hasCrashed = false;
  let exitCode: number | null = null;

  child.on('exit', (code) => {
    exitCode = code;
    if (code !== 0 && code !== null) {
      hasCrashed = true;
    }
  });

  child.on('error', (err) => {
    console.error('Failed to start process:', err);
    hasCrashed = true;
  });

  // Wait for 60 seconds
  await new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      if (!hasCrashed) {
        console.log('\n[SUCCESS] App survived 60 seconds.');
      }
      resolve();
    }, 60000);

    // If it crashes earlier, stop waiting
    const interval = setInterval(() => {
      if (hasCrashed) {
        clearTimeout(timeout);
        clearInterval(interval);
        resolve();
      }
    }, 1000);
  });

  if (hasCrashed) {
    console.error(`\n[FAILURE] App crashed with exit code ${exitCode}`);
    process.exit(1);
  }

  // Kill the process group on Windows or child process on Unix
  console.log('Cleaning up...');
  if (process.platform === 'win32') {
    spawn('taskkill', ['/pid', child.pid!.toString(), '/f', '/t'], { shell: true });
  } else {
    child.kill('SIGKILL');
  }

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
