if (typeof chrome !== 'undefined') {
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
            if (request.ask) {
                const local = localStorage;
                chrome.runtime.sendMessage({ local }, function(response) {
                    console.log(response.farewell);
                });
            }
        });   
}
