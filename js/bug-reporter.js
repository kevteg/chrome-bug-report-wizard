var BugReporter = null;
//<script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>

(function() {

    "use strict";

    BugReporter = function(options) {

        this.title = options.title || null;
        this.description = options.description || null;
        console.log(this.title)

        this.sendReport = function() {
            var me = this;

            //return $.when(this._getActiveTabUrl(), this._getScreenshot()).then(function(url, screenshot) {
                Email.send({
                    Host : "smtp.mandrillapp.com",
                    Username : "Apploi",
                    Password : "pass",
                    To : 'kevteg05@gmail.com',
                    From : "dev@apploi.com",
                    Subject : this.title,
                    Body : this.description
                }).then(
                  message => alert(message)
                );
            //});
        };

        this._gatherBrowserDetails = function() {
            var data = {
                browser: { label: "Browser", value: navigator.appVersion },
                language: { label: "Language", value: navigator.language },
                userAgent: { label: "User-agent", value: navigator.userAgent },
                cookieEnabled: { label: "Cookies enabled", value: navigator.cookieEnabled },
                doNotTrack: { label: "Do not track", value: navigator.doNotTrack }
            };

            var installedPlugins = [];
            for (var i = 0 ; i < navigator.plugins.length ; i++) {
                installedPlugins.push(navigator.plugins[i].name);
            }

            data["plugins"] = { label: "Plug-ins", value: "\n    - " + installedPlugins.join("\n    - ") };

            return data;
        };

        this._getActiveTabUrl = function() {
            var deffered = $.Deferred();
            chrome.tabs.query({'active': true}, function (tabs) {
                deffered.resolve(tabs[0].url);
            });

            return deffered.promise();
        },

        this._getScreenshot = function(callback) {
            var deffered = $.Deferred();
            chrome.tabs.captureVisibleTab(function(screenshot) {
                deffered.resolve(screenshot);
            });

            return deffered.promise();
        }
    };

})();
