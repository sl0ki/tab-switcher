chrome.commands.onCommand.addListener(function(command) {
    console.log('Command:', command);
    init();
});

function init() {
  // get active tab
    chrome.tabs.query({active: true}, function(tabs) {
    	// inject css and js  to page
    	chrome.tabs.insertCSS(tabs[0].id, {file: 'styles.css'})
	  	chrome.tabs.executeScript(tabs[0].id, {file: 'window.js'});
        chrome.tabs.executeScript(tabs[0].id, {file: 'fuzzy.js'});
	});
};

// recent tabs
var recentTabIds = [];
function clear(val) {
    var index = recentTabIds.indexOf(val);
    if (index > -1) recentTabIds.splice(index, 1);
}
// tabs observers
chrome.tabs.onActivated.addListener(function (info) {
    clear(info.tabId);
    recentTabIds.push(info.tabId);
});
chrome.tabs.onRemoved.addListener(function (removedTabId) {
    clear(removedTabId);
});
chrome.tabs.onReplaced.addListener(function (addedTabId,  removedTabId) {
    clear(removedTabId);
    clear(addedTabId);
    recentTabIds.push(addedTabId);
});

function getRecentTabs(callback) {
    var n = recentTabIds.length
    var j = 0, tabs = [];
    if (n < 2) return callback([]);
    for(var i = n - 2; i >= 0; i--) {
        chrome.tabs.get(recentTabIds[i], function(tab) {
            if (tab) tabs.push(tab);
            if (j === (n - 2)) return callback(tabs);
            j++;
        });
    };
}

// message comunication
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if (msg.action === 'activate_tab') {
        chrome.tabs.update(msg.data.tab.id, {selected: true});
    }
    if (msg.action === 'get_all_tabs') {
        chrome.tabs.query({}, function(tabs) {
            msg.data = tabs;
            chrome.tabs.sendMessage(sender.tab.id, msg);
        });
    }
    if (msg.action === 'get_recent_tabs') {
        getRecentTabs(function(tabs) {
            msg.data = tabs;
            chrome.tabs.sendMessage(sender.tab.id, msg);
        });
    }
});
