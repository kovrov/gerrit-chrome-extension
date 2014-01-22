var BASE_URL = localStorage["api_endpoint"];

function initUI(items) {
    var list = document.getElementById('list');
    list.innerHTML = "";
    for (var i = 0; i < items.changes.length; i++) {
        var change = items.changes[i];
        if (change.reviewed)
            continue;

        var dt = document.createElement('dt');
        var a = document.createElement('a');
        a.href = "#";
        a.addEventListener('click', function(e) {
            chrome.tabs.update(null, {
                url: BASE_URL + "/" + this.textContent
            })
        })

        a.textContent = change._number;
        dt.appendChild(a);
        list.appendChild(dt);

        var dd = document.createElement('dd');
        dd.textContent = change.subject;
        // dd.textContent = JSON.stringify(change);
        list.appendChild(dd);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.local.get("changes", initUI);
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (key in changes) {
        var storageChange = changes[key];
        if (key === "changes") {
            initUI(storageChange.newValue)
        }
    }
});
