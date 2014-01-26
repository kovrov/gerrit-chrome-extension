function fetchChanges() {
    console.debug("fetching changes...")
    chrome.browserAction.setBadgeBackgroundColor({ color: "#F00" });
    var query = localStorage["query"] || ["is:open", "reviewer:self", "-owner:self"].join('+');
    queryChangeList(query).then(
        function(result) {
            console.debug("got changes:", result.length);
            chrome.storage.local.set({ 'changes': result });
        }, function(e) {
            console.warn("failed to fetch changes:", e.message);
            delete chrome.storage.local.changes;
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
    console.debug('background.onAlarm...');
    fetchChanges();
}

function favicon(url) {
    var split = url.split('://');
    var host = split.pop();
    if (!host) throw new Error;
    var scheme = split.pop();
    return (scheme ? scheme + '://' : "") + host.split('/').shift() + "/favicon.ico";
}

function onStartup() {
    console.debug('background.onStartup...');

    try {
        chrome.browserAction.setIcon({path: favicon(localStorage["api_endpoint"])});
    } catch (e) {
    }

    chrome.storage.local.get("changes", function(items) {
        updateIcon(items.changes);
    });
    fetchChanges();
    chrome.alarms.create('refresh', {periodInMinutes: 15});
    chrome.browserAction.setBadgeBackgroundColor({color: "#000"});
}

function onNavigate(details) {
    fetchChanges();
}

chrome.alarms.onAlarm.addListener(onAlarm);
chrome.runtime.onStartup.addListener(onStartup);
chrome.runtime.onInstalled.addListener(onStartup);
chrome.runtime.onSuspend.addListener(function() {
    chrome.browserAction.setBadgeBackgroundColor({color: "#888"});
});
chrome.runtime.onSuspendCanceled.addListener(function() {
    chrome.browserAction.setBadgeBackgroundColor({color: "#F0F"});
});
chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (key in changes) {
        var storageChange = changes[key];
        console.debug('Storage key "%s" in namespace "%s" changed. ' +
            'Old value was "%s", new value is "%s".',
            key,
            namespace,
            storageChange.oldValue,
            storageChange.newValue);
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
