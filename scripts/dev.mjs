import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const backendDirectory = path.join(rootDirectory, 'backend');
const frontendDirectory = path.join(rootDirectory, 'frontend');
const dependenciesAreInstalled =
  existsSync(path.join(backendDirectory, 'node_modules', 'express', 'package.json')) &&
  existsSync(
    path.join(frontendDirectory, 'node_modules', 'vite', 'bin', 'vite.js'),
  );

function npmCommand(args) {
  const npmCliPath = process.env.npm_execpath;

  if (npmCliPath) {
    return {
      command: process.execPath,
      args: [npmCliPath, ...args],
      shell: false,
    };
  }

  const isWindows = process.platform === 'win32';
  return {
    command: isWindows ? 'npm.cmd' : 'npm',
    args,
    shell: isWindows,
  };
}

function runInstall(directory, name) {
  const npm = npmCommand(['install']);
  console.log(`\nInstalling ${name} dependencies...`);

  return new Promise((resolve, reject) => {
    const child = spawn(npm.command, npm.args, {
      cwd: directory,
      shell: npm.shell,
      stdio: 'inherit',
    });

    child.once('error', reject);
    child.once('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${name} dependency installation failed (exit ${code}).`));
      }
    });
  });
}

async function installDependencies() {
  await runInstall(backendDirectory, 'backend');
  await runInstall(frontendDirectory, 'frontend');
  console.log('\nDependencies installed for frontend and backend.');
}

function startDevelopmentServers() {
  const services = [
    {
      name: 'Backend',
      command: process.execPath,
      args: ['--watch', 'src/server.js'],
      cwd: backendDirectory,
    },
    {
      name: 'Frontend',
      command: process.execPath,
      args: [path.join('node_modules', 'vite', 'bin', 'vite.js')],
      cwd: frontendDirectory,
    },
  ];

  console.log('\nStarting backend and frontend. Press Ctrl+C to stop both.\n');

  return new Promise((resolve) => {
    const children = services.map((service) => {
      const child = spawn(service.command, service.args, {
        cwd: service.cwd,
        stdio: 'inherit',
      });

      child.once('error', (error) => {
        console.error(`${service.name} failed to start: ${error.message}`);
        process.exitCode = 1;
        stopServices('SIGTERM');
      });

      child.once('close', (code) => {
        if (!isStopping) {
          process.exitCode = code ?? 1;
          stopServices('SIGTERM');
        }

        remainingChildren -= 1;
        if (remainingChildren === 0) {
          resolve();
        }
      });

      return child;
    });

    let remainingChildren = children.length;
    let isStopping = false;

    function stopServices(signal) {
      if (isStopping) {
        return;
      }

      isStopping = true;
      for (const child of children) {
        if (child.exitCode === null && child.signalCode === null) {
          child.kill(signal);
        }
      }
    }

    process.once('SIGINT', () => {
      process.exitCode = 0;
      stopServices('SIGINT');
    });
    process.once('SIGTERM', () => {
      process.exitCode = 0;
      stopServices('SIGTERM');
    });
  });
}

const command = process.argv[2] ?? 'dev';

if (command !== 'setup' && command !== 'dev') {
  throw new Error(`Unknown command "${command}". Use "setup" or "dev".`);
}

if (command === 'setup') {
  await installDependencies();
} else {
  if (!dependenciesAreInstalled) {
    await installDependencies();
  }
  await startDevelopmentServers();
}
