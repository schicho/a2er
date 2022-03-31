function storageGetReplacementWithPromise() {
    return new Promise(resolve => {
        chrome.storage.local.get(['doReplace'], result => {
            resolve(Boolean(result.doReplace));
        });
    });
}

async function storageGetReplacementResponse() {
    const value = await storageGetReplacementWithPromise();
    var response = {};
    response.enableReplacement = value;
    return response
}

function storageSetReplacement(value) {
    chrome.storage.local.set({'doReplace': value}, function(){});
    if (chrome.runtime.lastError) {
        console.log('Error setting');
    }
}

async function updateIcon() {
    const isEnabled = await storageGetReplacementWithPromise();
    if (isEnabled === true) {
        chrome.action.setIcon({
            path: {
                "32": "icons/er32.png",
                "48": "icons/er48.png",
                "96": "icons/er96.png",
                "128": "icons/er128.png"
              },
        });
        chrome.action.setTitle({ title: "a -> er is enabled." });
    } else {
        chrome.action.setIcon({
            path: {
                "32": "icons/er-off32.png",
                "48": "icons/er-off48.png",
                "96": "icons/er-off96.png",
                "128": "icons/er-off128.png"
              },
        });
        chrome.action.setTitle({ title: "a -> er is disabled. Press ALT + K to replace without enabling." });
    }
}

async function toggleA2er() {
    const isEnabled = await storageGetReplacementWithPromise();
    storageSetReplacement(!isEnabled);
    updateIcon();
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.message === "enable_replacement") {
            storageGetReplacementResponse().then(sendResponse);
            return true;
        }
    }
);

chrome.action.onClicked.addListener(function(tab) {
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