const reg = /([A-Za-z]*[aeiou][a-z]*[^aeou\s])a([wrtzpsdfghjklcvbnm]{0,1})(\s|\.|-|,|:|!|\?|\)|\]|$)/gm;

const sab = new SharedArrayBuffer(1);
const isParsing = new Uint8Array(sab);

var enableReplacement = true;

document.addEventListener('DOMContentLoaded', function () {
    chrome.runtime.sendMessage({
        message: "enable_replacement"
    }, function(response) {
        enableReplacement = response.enableReplacement;
        //console.log("received response:", enableReplacement);

        if (Atomics.load(isParsing, 0) === 0) {
            parse();
            initMO(document.body);
        }
    });
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.command == "parse_page_now") {
        if (enableReplacement) {
            parse();
        } else {
            enableReplacement = true;
            parse();
            enableReplacement = false;
        }
        
    }
});

async function parse() {
    if (enableReplacement) {
        if (Atomics.compareExchange(isParsing, 0, 0, 1) === 0) {
            //console.log("Parsing.")
            walk(document.body);
            await new Promise(r => setTimeout(r, 2000));
            Atomics.store(isParsing, 0, 0);
        } else {
            //console.log("Skipping parsing as it's already been called.");
        }
    }
}

function walk(node) {
    if (hasEditableNode(node)) {
        return;
    }

    switch (node.nodeType) {
        case 1: // Element
        case 9: // Document
        case 11: // Document fragment
            for (let i = 0; i < node.childNodes.length; i++) {
                let child = node.childNodes[i];
                if (/SCRIPT|STYLE|IMG|NOSCRIPT|TEXTAREA|CODE/i.test(child.nodeName) === false) {
                    walk(child);
                }
            }
            break;
        case 3: // Text node
            aToEr(node);
            break;
        default:
            break;
    }
}

function aToEr(node) {
    let text = node.nodeValue;
    node.nodeValue = text.replace(reg, "$1er$2$3");
}

function hasEditableNode(el) {
    try {
        var namedNodeMap = el.attributes;

        for (var i = 0; i < namedNodeMap.length; i++) {
            var attr = namedNodeMap.item(i);
            if (attr.name === "contenteditable") {

                return true;
            } else if (attr.name === "class" && attr.value === "notranslate") {

                return true;
            } else if (attr.name === "translate" && attr.value === "no") {

                return true;
            } else if (attr.name === "role" && attr.value === "textbox") {

                return true;
            }
        }
    } catch (error) { }
    return false;
}

function initMO(root) {
    MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

    var observer = new MutationObserver(function (mutations, observer) {
        parse();
    });
    var opts = {
        characterData: false,
        childList: true,
        subtree: true
    };
    var observe = function () {
        observer.takeRecords();
        observer.observe(root, opts);
    };
    observe();
}
