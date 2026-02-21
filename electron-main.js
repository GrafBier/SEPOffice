const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const isDev = !app.isPackaged;

let apiProcess = null;
let aiProcess = null;

function startServices() {
  if (isDev) {
    // In Dev we assume the servers are already running via console
    console.log('Running in Dev mode: Assume services are started manually.');
    return;
  }

  // Paths to binaries (assuming they are bundled or placed in resources)
  const apiPath = path.join(process.resourcesPath, 'api.exe'); // Simplified
  const aiPath = path.join(process.resourcesPath, 'ai_service.exe');

  // apiProcess = spawn(apiPath);
  // aiProcess = spawn(aiPath);
  
  console.log('Startup: Sidecars logic prepared.');
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "SEPOffice - AI powered Office Suite",
    icon: path.join(__dirname, 'apps', 'web', 'public', 'vite.svg'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
    // win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, 'apps', 'web', 'dist', 'index.html'));
  }

  win.on('page-title-updated', (e) => e.preventDefault());
}

app.whenReady().then(() => {
  startServices();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (apiProcess) apiProcess.kill();
  if (aiProcess) aiProcess.kill();
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
