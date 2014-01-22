
// Saves options to localStorage.
function save_options() {
    localStorage["api_endpoint"] = document.getElementById("api_endpoint").value;
    localStorage["query"] = document.getElementById("query").value;
    // Update status to let user know options were saved.
    var status = document.getElementById("status");
    status.innerHTML = "Options Saved.";
    setTimeout(function() {
        status.innerHTML = "";
    }, 750);
}

// Restores select box state to saved value from localStorage.
function restore_options() {
    document.getElementById("api_endpoint").value = localStorage["api_endpoint"];
    document.getElementById("query").value = localStorage["query"];
}

document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);
