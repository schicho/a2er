chrome.commands.onCommand.addListener(function (command) {
    if (command === "parse_page_now") {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { command: "parse_page_now" }, function (response) {
            });
        });
    }
});