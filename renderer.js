let isEnabled = false;
const toggleButton = document.getElementById('toggleButton');
const statusDiv = document.getElementById('status');
const lastActionElement = document.getElementById('lastAction');
const durationSelect = document.getElementById('durationSelect');

// Function to format idle time
function formatIdleTime(seconds) {
    if (seconds < 60) {
        return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
}

// Initialize duration
window.electronAPI.setDuration(parseInt(durationSelect.value));

toggleButton.addEventListener('click', () => {
    isEnabled = !isEnabled;
    toggleButton.textContent = isEnabled ? 'Stop' : 'Keep Active';
    toggleButton.classList.toggle('bg-red-500', isEnabled);
    toggleButton.classList.toggle('bg-blue-600', !isEnabled);
    
    if (isEnabled) {
        // When enabling, send both the toggle state and current duration
        window.electronAPI.toggleIdlePrevention(true, parseInt(durationSelect.value));
    } else {
        window.electronAPI.toggleIdlePrevention(false);
    }
    
    if (!isEnabled) {
        statusDiv.textContent = '0s';
        lastActionElement.textContent = 'No actions taken';
    }
});

// Handle duration selection
durationSelect.addEventListener('change', (event) => {
    const duration = parseInt(event.target.value);
    window.electronAPI.setDuration(duration);
    if (isEnabled) {
        // If already running, restart with new duration
        window.electronAPI.toggleIdlePrevention(true, duration);
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
