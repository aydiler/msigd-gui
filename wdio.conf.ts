/**
 * WebdriverIO Configuration for Tauri E2E Testing
 *
 * Prerequisites:
 *   - WebKitWebDriver: `sudo pacman -S webkitgtk-6.0` (Arch) or `sudo apt install webkit2gtk-driver` (Debian/Ubuntu)
 *   - tauri-driver: `cargo install tauri-driver`
 *   - Built app: `npm run tauri build`
 *
 * Run tests:
 *   npm run test:wdio
 */

import type { Options } from '@wdio/types';
import { spawn, type ChildProcess } from 'child_process';
import path from 'path';
import os from 'os';

let tauriDriver: ChildProcess;
let exit = false;

export const config: Options.Testrunner = {
  // Connect to tauri-driver
  host: '127.0.0.1',
  port: 4444,

  // Test files
  specs: ['./tests/e2e/**/*.spec.ts'],
  exclude: [],

  // Single instance - Tauri apps can't run multiple instances
  maxInstances: 1,
  capabilities: [
    {
      maxInstances: 1,
      'tauri:options': {
        application: './src-tauri/target/release/msigd-gui',
      },
    },
  ],

  // TypeScript support
  runner: 'local',
  autoCompileOpts: {
    autoCompile: true,
    tsNodeOpts: {
      project: './tests/tsconfig.json',
      transpileOnly: true,
    },
  },

  // Test configuration
  logLevel: 'warn',
  bail: 0,
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  // Framework
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000,
  },

  // Start tauri-driver before each session
  beforeSession: () => {
    tauriDriver = spawn(
      path.resolve(os.homedir(), '.cargo', 'bin', 'tauri-driver'),
      [],
      { stdio: [null, process.stdout, process.stderr] }
    );

    tauriDriver.on('error', (error) => {
      console.error('tauri-driver error:', error);
      process.exit(1);
    });

    tauriDriver.on('exit', (code) => {
      if (!exit) {
        console.error('tauri-driver exited with code:', code);
        process.exit(1);
      }
    });
  },

  // Clean up tauri-driver after session
  afterSession: () => {
    exit = true;
    tauriDriver?.kill();
  },
};

// Ensure cleanup on process exit
process.on('exit', () => {
  exit = true;
  tauriDriver?.kill();
});
process.on('SIGINT', () => process.exit());
process.on('SIGTERM', () => process.exit());
