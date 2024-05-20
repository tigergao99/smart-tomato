var buttonToTime = {
  start: 25,
  shortBreak: 5,
  longBreak: 15,
  reset: 0
};

var endTime = null;

function setMessageHandler() {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'timer') {
      if (endTime === null) {
        chrome.storage.local.get(['endTime'], (result) => {
          endTime = result.endTime;
          console.log('Retrieved from database: ' + endTime);
          sendResponse({ time: endTime });
        });
        return true; // Inform Chrome that you will send a response asynchronously
      }
      sendResponse({ time: endTime });
      console.log('Sent endTime: ' + endTime);
    } else {
      handleButtonClick(request.message);
      sendResponse("");
    }
    return true;
  });
}

function handleButtonClick(message) {
  if (message === 'reset') {
    chrome.storage.local.set({ endTime: "" }, () => {
      endTime = '';
      console.log('Value is set to null');
    });
    chrome.action.setBadgeText({ text: '' });
    chrome.alarms.clearAll((wasCleared) => { console.log(wasCleared); });
  } else {
    var minutes = buttonToTime[message];
    endTime = new Date();
    endTime.setMinutes(endTime.getMinutes() + minutes);
    chrome.storage.local.set({ endTime: endTime.toString() }, () => {
      console.log('EndTime is set to ' + endTime.toString());
    });
    chrome.alarms.create("notification", { delayInMinutes: minutes });
    chrome.alarms.create("badge", { periodInMinutes: 1 });
    chrome.action.setBadgeText({ text: minutes.toString() });
    console.log("Alarms created.");
  }
}

function updateBadge() {
  chrome.storage.local.get(['endTime'], (result) => {
    endTime = new Date(result.endTime);
    var curTime = new Date();
    var remainingSeconds = Math.round((endTime - curTime) / 1000);
    if (remainingSeconds > 0) {
      chrome.action.setBadgeText({ text: Math.floor(remainingSeconds / 60).toString() });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  });
}

function main() {
  setMessageHandler();
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'notification') {
      chrome.notifications.create(
        {
          type: "basic",
          iconUrl: chrome.runtime.getURL("images/tomato-16.png"),
          title: "Smart Tomato",
          message: "Your timer is done!",
        },
        function() {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
          }
        }
      );
      chrome.alarms.clearAll((wasCleared) => { console.log(wasCleared); });
    } else if (alarm.name === 'badge') {
      updateBadge();
    }
  });

  // Debug
  chrome.storage.onChanged.addListener((changes, namespace) => {
    for (var key in changes) {
      var storageChange = changes[key];
      console.log('Storage key "%s" in namespace "%s" changed. ' +
        'Old value was "%s", new value is "%s".',
        key, namespace, storageChange.oldValue, storageChange.newValue);
    }
  });
}

main();
