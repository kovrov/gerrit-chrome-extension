var BASE_URL = localStorage["api_endpoint"];

function queryChangeList(q) {
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", BASE_URL + '/changes/?q=' + q);
        xhr.send();
        // call to reject() is ignored once resolve() has been invoked
        xhr.onload = function() {
            try {
                resolve(JSON.parse(xhr.responseText.substr(5)));
            } catch (e) {
                reject(new TypeError(e.message));
            }
        }
        xhr.onloadend = function() {
            reject(new Error("Network error"));
        }
    });
}
