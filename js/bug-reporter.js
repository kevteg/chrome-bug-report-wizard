var BugReporter = null;

(function() {

    "use strict";

    BugReporter = function(options) {

        this.title = options.title || null;
        this.description = options.description || null;

        this.sendReport = function(callback) {
            var me = this;
            var pivotalTracker = new PivotalTransporter(localStorage["pivotal-token"], localStorage["pivotal-project-id"]);
            this._getActiveTabUrl(function(url) {
                pivotalTracker.createBug({
                    title: me.title,
                    description: me.description,
                    url: url,
                    details: me._gatherBrowserDetails()
                }, callback);
            });
        };

        this._gatherBrowserDetails = function() {
            var data = {
                browser: navigator.appVersion,
                language: navigator.language,
                userAgent: navigator.userAgent,
                cookieEnabled: navigator.cookieEnabled,
                doNotTrack: navigator.doNotTrack
            };

            var installedPlugins = [];
            for (var i = 0 ; i < navigator.plugins.length ; i++) {
                installedPlugins.push(navigator.plugins[i].name);
            }

            data["plugins"] = "\n    - " + installedPlugins.join("\n    - ");

            return data;
        };

        this._getActiveTabUrl = function(callback) {
            chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
                callback(tabs[0].url);
            });
        }
    };

})();
