/* Notes about timer logic:
 * On new popup load -> fetch endtime if exists
 * On button click -> notify background of new endtime
 */
var buttons = [
    'start',
    'shortBreak',
    'longBreak',
    'reset'
];
var endTime = null;

function syncInfo() {
    chrome.runtime.sendMessage({message: "timer"}, function(response) {
        console.log(response.time);
        if (response.time) {
            console.log('Got: ' + response.time);
            endTime = new Date(response.time);
        } else {
            endTime = null;
        }
    });
    updateTimer();
}

function updateDomTimer(seconds) {
    document.getElementById('minutes').innerHTML = ('0' + Math.floor(seconds / 60).toString()).slice(-2);
    document.getElementById('seconds').innerHTML = ('0' + (seconds % 60).toString()).slice(-2);
}

function updateTimer() {
    if (endTime) {
        var curTime = new Date();
        var remainingTime = Math.round((endTime - curTime) / 1000);
        if (remainingTime >= 0) {
            updateDomTimer(remainingTime);
        }
    } else {
        updateDomTimer(0);
    }
}

function main() {
    syncInfo();
    setInterval(updateTimer, 1000);
    setInterval(syncInfo, 5000);
    document.getElementById('start').addEventListener('click', function() {
        chrome.runtime.sendMessage({message: 'start'}, () => {});
        syncInfo();
    });
    document.getElementById('shortBreak').addEventListener('click', function() {
        chrome.runtime.sendMessage({message: 'shortBreak'}, () => {});
        syncInfo();
    });
    document.getElementById('longBreak').addEventListener('click', function() {
        chrome.runtime.sendMessage({message: 'longBreak'}, () => {});
        syncInfo();
    });
    document.getElementById('reset').addEventListener('click', function() {
        chrome.runtime.sendMessage({message: 'reset'}, (response) => {return true;});
        syncInfo();
    });
}

window.onload = main;
