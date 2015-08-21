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

// send tabs array
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if (msg.action === 'activate_tab') {
        chrome.tabs.update(msg.data.tab.id, {selected: true});
    }
    if (msg.action === 'get_tabs') {
        chrome.tabs.query({}, function(tabs) {
            chrome.tabs.sendMessage(sender.tab.id, tabs);
        });
    }    
});
