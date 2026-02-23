const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    startAi: () => ipcRenderer.invoke('ai:start'),
    getEnv: () => ipcRenderer.invoke('env:get')
});

window.addEventListener('DOMContentLoaded', () => {
    console.log('SEPOffice Desktop Preload Loaded');
});
