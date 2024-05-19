var buttonToTime = {
  start: 25,
  shortBreak: 5,
  longBreak: 15,
  reset: 0
};
// endTime is a string representation of Date since storage to database is needed
var endTime = null;

function setMessageHandler() {
  chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
      // Handle endTime requests
      if (request.message === 'timer') {
        if (endTime === null) {
          chrome.storage.local.get(['endTime'])
          .then((result) => {
            endTime = result.endTime;
            console.log('Retrived from database: ' + endTime);
          });
        }
        sendResponse({ time: endTime });
        console.log('Sent endTime: ' + endTime);
      } else {
        // Handle button click by setting endTime + notification alarm
        if (request.message === 'reset') {
          chrome.storage.local.set({ endTime: "" })
          .then(() => {
            endTime = '';
            console.log('Value is set to null');
          });
          chrome.action.setBadgeText({ text: '' });
          chrome.alarms.clearAll((wasCleared) => { console.log(wasCleared) });
        } else {
          var minutes = buttonToTime[request.message];
          endTime = new Date();
          endTime.setMinutes(endTime.getMinutes() + minutes);
          chrome.storage.local.set({ endTime: endTime.toString() })
          .then(() => {
            console.log('EndTime is set to ' + endTime.toString());
          });
          chrome.alarms.create("notification", {
            delayInMinutes: minutes
          });
          chrome.action.setBadgeText({ text: minutes.toString() });
          chrome.alarms.create("badge", {
            periodInMinutes: 1
          });
          console.log("alarm created.");
        }
        sendResponse("");
      }
      return true;
    });
}

function main() {
  setMessageHandler();
  // Notification alarm handler when timer expires
  chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name === 'notification') {
      chrome.notifications.create(
        "", {
        type: "basic",
        iconUrl: "images\\tomato-16.png",
        title: "Smart Tomato",
        message: "Your timer is done!",
      },
        function () { }
      );
      chrome.alarms.clearAll((wasCleared) => { console.log(wasCleared) });
    } else {
      chrome.storage.local.get(['endTime'])
      .then((result) => {
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
  });
  // Debug
  chrome.storage.onChanged.addListener(function (changes, namespace) {
    for (var key in changes) {
      var storageChange = changes[key];
      console.log('Storage key "%s" in namespace "%s" changed. ' +
        'Old value was "%s", new value is "%s".',
        key,
        namespace,
        storageChange.oldValue,
        storageChange.newValue);
    }
  });
}

main();
