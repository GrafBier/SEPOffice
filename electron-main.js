const electron = require('electron');
/**
 * FIX: Intermittent Electron initialization bug.
 */
let app = electron.app;
let BrowserWindow = electron.BrowserWindow;
const Tray = electron.Tray;
const Menu = electron.Menu;

if (typeof electron === 'string' || !app) {
  try {
    const e = require('electron');
    app = app || e.app;
    BrowserWindow = BrowserWindow || e.BrowserWindow;
  } catch (err) {
    console.error('Manual electron require failed:', err);
  }
}

const path = require('path');
const { spawn, execSync } = require('child_process');

let tray = null;
const iconPath = path.join(__dirname, 'icon.png');

console.log('SEPOffice Starting... isPackaged:', app ? app.isPackaged : 'UNKNOWN');
const isDev = app ? !app.isPackaged : true;

// Singleton Lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  console.log('Another instance is already running. Quitting.');
  app.quit();
  process.exit(0);
}

let apiProcess = null;
let aiProcess = null;

const fs = require('fs');

function logToFile(msg) {
  try {
    const logPath = path.join(process.resourcesPath, '..', 'debug_app.log'); // Should be next to exe
    fs.appendFileSync(logPath, msg + '\n');
  } catch (e) { /* ignore */ }
}

function startAiService(force = false) {
  logToFile('startAiService called with force=' + force);

  // If we are forcing a restart OR starting fresh (aiProcess is null),
  // we attempt to kill any lingering processes to ensure a clean start.
  if (force || !aiProcess) {
    if (!isDev) {
        try {
          logToFile('Killing old ai_service instances...');
          require('child_process').execSync('taskkill /F /IM ai_service.exe /T', { stdio: 'ignore' });
        } catch (e) { /* ignore */ }
    }
  }

  if (aiProcess && !force) {
    logToFile('AI Service already running (tracked). Skipping start.');
    return;
  }
  
  if (force && aiProcess) {
      // Just clear the reference, since we already killed it above
      aiProcess = null;
  }

  // Ensure any orphaned ai_service processes are killed too (Windows specific)
  // (Removed redundant check since we did it above)

  /**
   * Spawns the AI Backend service.
   * Fix: Implemented absolute path resolution and a fallback mechanism to handle
   * both 'unpacked' and 'portable' (temp directory) build environments.
   */
  const resourcesPath = isDev ? __dirname : process.resourcesPath;
  const aiPath = isDev
    ? null // Dev uses npm run ai:dev
    : path.join(resourcesPath, 'ai_service.exe');

  console.log(`AI Service Path Check (Prod): ${aiPath} -> Exists: ${require('fs').existsSync(aiPath)}`);
  console.log(`AI Service Working Dir: ${resourcesPath}`);

  if (isDev) {
    console.log('Spawning AI Service via npm (Dev)...');
    aiProcess = spawn('npm', ['run', 'ai:dev'], { shell: true, cwd: __dirname });
  } else if (require('fs').existsSync(aiPath)) {
    // Normal case for win-unpacked builds
    console.log('Spawning AI Service binary (Prod) at:', aiPath);
    logToFile('Found AI Binary at: ' + aiPath);
    // Explicitly hide window for background process, though default for spawn without shell
    // Adding stdio to debug if needed, but keeping it simple first
    try {
        logToFile('Spawning AI process...');
        aiProcess = spawn(aiPath, [], { cwd: resourcesPath });
        logToFile('AI Process spawned with PID: ' + (aiProcess.pid || 'null'));
    } catch (spawnError) {
        console.error('Failed to spawn AI process:', spawnError);
        logToFile('Failed to spawn: ' + spawnError.toString());
    }
  } else {
    // Fallback case for Portable builds where resourcesPath might point to
    // a different location than the app executable.
    const fallbackPath = path.join(app.getAppPath(), 'ai_service.exe');
    if (require('fs').existsSync(fallbackPath)) {
      console.log('Spawning AI Service via AppPath fallback:', fallbackPath);
      aiProcess = spawn(fallbackPath, [], { cwd: path.dirname(fallbackPath) });
    } else {
      console.warn('AI binary not found in primary or fallback locations.');
      return;
    }
  }

  if (aiProcess) {
    aiProcess.stdout.on('data', (data) => console.log(`AI: ${data}`));
    aiProcess.stderr.on('data', (data) => console.error(`AI Error: ${data}`));
    aiProcess.on('close', (code) => {
      console.log(`AI process exited with code ${code}`);
      aiProcess = null;
    });
    aiProcess.on('error', (err) => {
      console.error('AI Process Spawn Error:', err);
    });
  } else {
    console.error('AI Process was NOT created successfully.');
  }
}

function startServices() {
  const resourcesPath = isDev ? __dirname : process.resourcesPath;

  if (isDev) {
    console.log('Running in Dev mode: Spawning API via npm.');
    apiProcess = spawn('npm', ['run', 'api:dev'], { shell: true, cwd: __dirname });
    startAiService();
  } else {
    const apiExePath = path.join(resourcesPath, 'api.exe');
    const apiJsPath = path.join(app.getAppPath(), 'apps', 'api', 'dist', 'index.js');

    console.log('Production Startup: Spawning sidecars...');
    console.log('ResourcesPath:', resourcesPath);

    // API Spawning (EXE or JS fallback)
    if (require('fs').existsSync(apiExePath)) {
      apiProcess = spawn(apiExePath, [], { cwd: resourcesPath });
    } else if (require('fs').existsSync(apiJsPath)) {
      console.log('API EXE not found, spawning via Node:', apiJsPath);
      apiProcess = spawn(process.execPath, [apiJsPath], {
        cwd: resourcesPath,
        env: { ...process.env, PORT: 4000, ELECTRON_RUN_AS_NODE: '1' }
      });
    } else {
      console.warn('API component not found.');
    }

    startAiService();
  }

  if (apiProcess) {
    apiProcess.stdout.on('data', (data) => console.log(`API: ${data}`));
    apiProcess.stderr.on('data', (data) => console.error(`API Error: ${data}`));
    apiProcess.on('close', (code) => console.log(`API process exited with code ${code}`));
  }

  // Periodic health check log
  setInterval(() => {
    if (apiProcess && apiProcess.exitCode !== null) console.warn('HEALTH: API process is dead.');
    if (aiProcess && aiProcess.exitCode !== null) console.warn('HEALTH: AI process is dead.');
  }, 20000);
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "SEPOffice - AI powered Office Suite",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  try {
    if (iconPath) win.setIcon(iconPath);
  } catch (err) {
    console.error('Failed to set window icon:', err);
  }

  if (isDev) {
    win.loadURL('http://localhost:5173');
  } else {
    const indexPath = path.join(__dirname, 'apps', 'web', 'dist', 'index.html');
    win.loadFile(indexPath).catch(err => {
      console.error('loadFile error:', err);
      win.webContents.openDevTools();
    });
  }

  // win.webContents.openDevTools();
  win.on('page-title-updated', (e) => e.preventDefault());
}

function createTray() {
  try {
    tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'SEPOffice öffnen', click: () => {
          if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
          } else {
            BrowserWindow.getAllWindows()[0].show();
          }
        }
      },
      { type: 'separator' },
      { label: 'Beenden', click: () => { app.quit(); } }
    ]);
    tray.setToolTip('SEPOffice');
    tray.setContextMenu(contextMenu);
    tray.on('click', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      } else {
        const win = BrowserWindow.getAllWindows()[0];
        if (win.isVisible()) win.focus(); else win.show();
      }
    });
  } catch (err) {
    console.error('Failed to create tray:', err);
  }
}

app.whenReady().then(() => {
  startServices();
  createTray();
  createWindow();

  electron.ipcMain.handle('ai:start', async () => {
    console.log('IPC: ai:start called (forced restart)');
    startAiService(true);
    return true;
  });

  /**
   * Diagnostic Bridge: Returns environment info to the frontend.
   * Helps determine if we are in 'win-unpacked' vs 'portable' mode
   * and if the binary path resolution is correct.
   */
  electron.ipcMain.handle('env:get', async () => {
    return {
      isDev,
      resourcesPath: process.resourcesPath,
      appPath: app.getAppPath(),
      aiPath: !isDev ? path.join(process.resourcesPath, 'ai_service.exe') : 'dev-npm'
    };
  });

  app.on('browser-window-focus', () => {
    console.log('App focused - ensuring focus recovery');
  });

  app.on('second-instance', () => {
    if (BrowserWindow.getAllWindows().length > 0) {
      const win = BrowserWindow.getAllWindows()[0];
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (apiProcess) apiProcess.kill();
  if (aiProcess) aiProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});
