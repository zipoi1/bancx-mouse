let isEnabled = false;
const toggleButton = document.getElementById('toggleButton');
const statusDiv = document.getElementById('status');
const lastActionElement = document.getElementById('lastAction');

// Function to format idle time
function formatIdleTime(seconds) {
    if (seconds < 60) {
        return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
}

toggleButton.addEventListener('click', () => {
    isEnabled = !isEnabled;
    toggleButton.textContent = isEnabled ? 'Stop' : 'Keep Active';
    toggleButton.classList.toggle('bg-red-500', isEnabled);
    toggleButton.classList.toggle('bg-blue-600', !isEnabled);
    
    window.electronAPI.toggleIdlePrevention(isEnabled);
    
    if (!isEnabled) {
        statusDiv.textContent = '0s';
        lastActionElement.textContent = 'No actions taken';
    }
});

document.getElementById('closeButton').addEventListener('click', () => {
    window.electronAPI.closeWindow();
});

window.electronAPI.onActivityPerformed((data) => {
    lastActionElement.textContent = data.lastAction;
});

window.electronAPI.onIdleTimeUpdate((idleTime) => {
    statusDiv.textContent = formatIdleTime(idleTime);
});

// Handle UI reset when idle prevention stops
window.electronAPI.onResetUI(() => {
    isEnabled = false;
    toggleButton.textContent = 'Keep Active';
    toggleButton.classList.remove('bg-red-500');
    toggleButton.classList.add('bg-blue-600');
    statusDiv.textContent = '0s';
    lastActionElement.textContent = 'No actions taken';
});
