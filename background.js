var enableReplacement = true;

function updateIcon() {
    if (enableReplacement === true) {
        chrome.browserAction.setIcon({
            path: {
                "16": "er.svg",
                "19": "er.svg",
                "32": "er.svg",
                "38": "er.svg",
                "48": "er.svg",
                "96": "er.svg",
                "128": "er.svg"
            }
        });
        chrome.browserAction.setTitle({ title: "a -> er is enabled." });
    } else {
        chrome.browserAction.setIcon({
            path: {
                "16": "er-off.svg",
                "96": "er-off.svg",
                "19": "er-off.svg",
                "32": "er-off.svg",
                "38": "er-off.svg",
                "48": "er-off.svg",
                "128": "er-off.svg"
            }
        });
        chrome.browserAction.setTitle({ title: "a -> er is disabled. Press ALT + K to replace without enabling." });
    }
}

function toggleA2er() {
    if (enableReplacement === true) {
        enableReplacement = false;
    } else {
        enableReplacement = true;
    }
    updateIcon();
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.message === "enable_replacement") {
            var response = {};
            response.enableReplacement = enableReplacement;
            sendResponse(response);
        }
    }
);

chrome.browserAction.onClicked.addListener(function(tab){
    toggleA2er();
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.reload(tabs[0].id);
    });    
});

chrome.commands.onCommand.addListener(function (command) {
    if (command === "parse_page_now") {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { command: "parse_page_now" }, function (response) {
            });
        });
    }
});