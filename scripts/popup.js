const buttons = ['start', 'shortBreak', 'longBreak', 'reset'];
let endTime = null;

async function syncInfo() {
    try {
        const response = await chrome.runtime.sendMessage({ message: "timer" });
        if (response.time) {
            console.log('Got: ' + response.time);
            endTime = new Date(response.time);
        } else {
            endTime = null;
        }
    } catch (error) {
        console.error('Error syncing info:', error);
    }
}

function updateDomTimer(seconds) {
    document.getElementById('minutes').innerHTML = ('0' + Math.floor(seconds / 60).toString()).slice(-2);
    document.getElementById('seconds').innerHTML = ('0' + (seconds % 60).toString()).slice(-2);
}

function updateTimer() {
    if (endTime) {
        const curTime = new Date();
        const remainingTime = Math.round((endTime - curTime) / 1000);
        if (remainingTime >= 0) {
            updateDomTimer(remainingTime);
        }
    } else {
        updateDomTimer(0);
    }
}

async function syncAndUpdate() {
    await syncInfo();
    updateTimer();
}

function main() {
    syncAndUpdate();
    setInterval(syncAndUpdate, 1000);

    document.getElementById('start').addEventListener('click', async function () {
        await chrome.runtime.sendMessage({ message: 'start' });
        syncAndUpdate();
    });

    document.getElementById('shortBreak').addEventListener('click', async function () {
        await chrome.runtime.sendMessage({ message: 'shortBreak' });
        syncAndUpdate();
    });

    document.getElementById('longBreak').addEventListener('click', async function () {
        await chrome.runtime.sendMessage({ message: 'longBreak' });
        syncAndUpdate();
    });

    document.getElementById('reset').addEventListener('click', async function () {
        await chrome.runtime.sendMessage({ message: 'reset' });
        syncAndUpdate();
    });
}

window.onload = main;
