const { app, BrowserWindow, ipcMain, powerMonitor } = require('electron');
const path = require('path');
const { execSync } = require('child_process');
const fs = require('fs');

let mainWindow;
let isPreventingIdle = false;
let preventionStartTime = null;
let lastAction = 'None';
let idleCheckInterval;
let selectedDuration = 28800; // Default 8 hours in seconds

// Function to get the correct resource path
function getResourcePath(filename) {
    if (app.isPackaged) {
        return path.join(process.resourcesPath, filename);
    }
    return path.join(__dirname, filename);
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 360,
        height: 400,
        frame: false,
        transparent: true,
        resizable: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadFile('index.html');
}

function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    parts.push(`${remainingSeconds}s`);
    
    return parts.join(' ');
}

// Function to perform system-wide activity
function performSystemActivity() {
    return new Promise((resolve) => {
        try {
            const vbsPath = getResourcePath('prevent_idle.vbs');
            console.log('Running VBScript:', vbsPath);
            
            if (!fs.existsSync(vbsPath)) {
                console.error('VBScript file not found at:', vbsPath);
                resolve('Error: VBScript file not found');
                return;
            }
            
            // Run the VBScript
            const result = execSync(`cscript //nologo "${vbsPath}"`, {
                encoding: 'utf8',
                shell: true
            });

            lastAction = 'Key Press (NumLock, ScrollLock)';
            console.log('VBScript executed successfully');
            resolve('Simulated keyboard input using VBScript');
        } catch (error) {
            console.error('Error in performSystemActivity:', error);
            resolve('Error performing activity: ' + error.message);
        }
    });
}

function updateStatus() {
    if (!mainWindow) return;
    
    const now = Date.now();
    const elapsedTime = preventionStartTime ? Math.floor((now - preventionStartTime) / 1000) : 0;
    const remainingTime = selectedDuration - elapsedTime;
    
    mainWindow.webContents.send('status-update', {
        isActive: isPreventingIdle,
        elapsedTime: formatDuration(elapsedTime),
        remainingTime: formatDuration(Math.max(0, remainingTime)),
        lastAction
    });

    if (isPreventingIdle && remainingTime <= 0) {
        stopPreventingIdle();
    }
}

function stopPreventingIdle() {
    console.log('Stopping idle prevention');
    isPreventingIdle = false;
    if (idleCheckInterval) {
        clearInterval(idleCheckInterval);
        idleCheckInterval = null;
    }
    preventionStartTime = null;
    if (mainWindow) {
        mainWindow.webContents.send('reset-ui');
    }
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Handle close window event
ipcMain.on('close-window', () => {
    console.log('Received close-window event');
    if (idleCheckInterval) {
        clearInterval(idleCheckInterval);
    }
    app.quit();
});

ipcMain.handle('set-duration', (event, duration) => {
    selectedDuration = duration;
    if (isPreventingIdle) {
        // If already running, update the prevention duration
        preventionStartTime = Date.now();
        updateStatus();
    }
});

ipcMain.on('toggle-idle-prevention', (event, enabled) => {
    isPreventingIdle = enabled;
    console.log('Idle prevention toggled:', enabled);
    
    if (enabled) {
        preventionStartTime = Date.now();
        console.log(`Idle prevention will run for ${formatDuration(selectedDuration)} (until ${new Date(Date.now() + selectedDuration * 1000).toLocaleTimeString()})`);
        idleCheckInterval = setInterval(async () => {
            const idleTime = powerMonitor.getSystemIdleTime();
            console.log('Current idle time:', idleTime);
            
            // Send idle time update to renderer
            mainWindow.webContents.send('idle-time-update', idleTime);
            
            if (idleTime >= 50) { // 50 seconds
                console.log('Idle threshold reached, performing activity...');
                const actionDescription = await performSystemActivity();
                console.log('Action performed:', actionDescription);
                
                const preventionDuration = formatDuration(Math.floor((Date.now() - preventionStartTime) / 1000));
                mainWindow.webContents.send('activity-performed', {
                    preventionDuration,
                    lastAction
                });
            }
            updateStatus();
        }, 1000);
    } else {
        if (idleCheckInterval) {
            clearInterval(idleCheckInterval);
        }
    }
});
