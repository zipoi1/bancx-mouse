const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    closeWindow: () => ipcRenderer.send('close-window'),
    toggleIdlePrevention: (enabled) => ipcRenderer.send('toggle-idle-prevention', enabled),
    setDuration: (duration) => ipcRenderer.invoke('set-duration', duration),
    onActivityPerformed: (callback) => ipcRenderer.on('activity-performed', (event, data) => callback(data)),
    onIdleTimeUpdate: (callback) => ipcRenderer.on('idle-time-update', (event, idleTime) => callback(idleTime)),
    onResetUI: (callback) => ipcRenderer.on('reset-ui', () => callback())
});
