var QUERY = localStorage["query"];

function fetchChanges() {
    // QUERY = ["is:open", "reviewer:self", "-owner:self"].join('+')
    queryChangeList(QUERY).then(
        function(result) {
            chrome.storage.local.set({ 'changes': result });
        }, function(e) {
            console.warn("failed to fetch changes:", e.message);
            delete chrome.storage.local.unreadCount;
        });
}

function updateIcon(changes) {
    try {
        var unread = changes.filter(function(value, index, array) {return !value.reviewed});
    } catch (e) {
    }
    chrome.browserAction.setBadgeText({ text: unread && unread.length.toString() || "..." });
}

function onAlarm(alarm) {
    fetchChanges();
}

function onStartup() {
    chrome.storage.local.get("changes", function(items) {
        updateIcon(items.changes);
    });
    fetchChanges();
    chrome.alarms.create('refresh', {periodInMinutes: 15});
}

function onNavigate(details) {
    fetchChanges();
}

chrome.alarms.onAlarm.addListener(onAlarm);
chrome.runtime.onStartup.addListener(onStartup);
chrome.runtime.onInstalled.addListener(onStartup);
chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (key in changes) {
        var storageChange = changes[key];
        if (key === "changes") {
            updateIcon(storageChange.newValue);
        }
    }
});
chrome.webNavigation.onReferenceFragmentUpdated.addListener(onNavigate, {
    url: [
        { hostSuffix: localStorage["api_endpoint"].split("://").pop() }
    ]
});
