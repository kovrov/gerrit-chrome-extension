var BASE_URL = localStorage["api_endpoint"];
var QUERY = localStorage["query"];

function onNavigate(details) {
    fetchChanges();
}

chrome.webNavigation.onReferenceFragmentUpdated.addListener(onNavigate, {
    url: [
        { hostSuffix: BASE_URL.split("://").pop() },
    ]
});

function fetchChanges() {
    queryChangeList(
        //["is:open", "reviewer:self", "-owner:self"].join('+'),
        QUERY,
        function(result, error) {
            if (error || result === undefined) {
                delete chrome.storage.local.unreadCount;
            } else {
                chrome.storage.local.set({ 'changes': result });
            }
        });
}

function queryChangeList(q, onCallback) {
    var url = BASE_URL + '/changes/' + '?q=' + q
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.ontimeout = function() { onCallback(null, xhr.statusText) };
    xhr.onerror = function() { onCallback(null, xhr.statusText) };
    xhr.onload = function(event) {
        if (event.target.status !== 200) {
            onCallback(null, xhr.statusText);
            return;
        }
        try {
            onCallback(JSON.parse(xhr.responseText.substr(5)));
        } catch (e) {
            onCallback(undefined, e);
        }
    };
    try {
        xhr.send(null);
    } catch (e) {
        console.debug("xhr send failed")
    }
}

chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (key in changes) {
        var storageChange = changes[key];
        console.log('Storage key "%s" in namespace "%s" changed. ' +
            'Old value was "%s", new value is "%s".',
            key,
            namespace,
            storageChange.oldValue,
            storageChange.newValue);
        if (key === "changes") {
            updateIcon(storageChange.newValue)
        }
    }
});

function updateIcon(changes) {
    try {
        var unread = changes.filter(function(value, index, array) {return !value.reviewed});
    } catch (e) {
    }
    chrome.browserAction.setBadgeText({
        text: unread && unread.length.toString() || "..."
    });
}

function onAlarm(alarm) {
    fetchChanges();
}

function onStartup() {
    console.log('background.onStartup...');
    chrome.storage.local.get("changes", function(items) {
        updateIcon(items.changes)
    });
    fetchChanges();
    chrome.alarms.create('refresh', {periodInMinutes: 15});
}

chrome.alarms.onAlarm.addListener(onAlarm);
chrome.runtime.onStartup.addListener(onStartup);
chrome.runtime.onInstalled.addListener(onStartup);
