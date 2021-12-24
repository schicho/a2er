var enableReplacement = true;

function updateIcon() {
    if (enableReplacement === true) {
        chrome.browserAction.setIcon({
            path: {
                "32": "icons/er32.png",
                "48": "icons/er48.png",
                "96": "icons/er96.png",
                "128": "icons/er128.png"
              },
        });
        chrome.browserAction.setTitle({ title: "a -> er is enabled." });
    } else {
        chrome.browserAction.setIcon({
            path: {
                "32": "icons/er-off32.png",
                "48": "icons/er-off48.png",
                "96": "icons/er-off96.png",
                "128": "icons/er-off128.png"
              },
        });
        chrome.browserAction.setTitle({ title: "a -> er is disabled. Press ALT + K to replace without enabling." });
    }
}
updateIcon();

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