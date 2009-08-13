/*
 * Video sniffer.
 * Copyright (C) 2009 Dmitry Vasiliev <dima@hlabs.spb.ru>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */


var VideoSniffer = {

    video_limit: 20,

    log: function(message) {
        var aConsoleService = Components.
            classes["@mozilla.org/consoleservice;1"].
            getService(Components.interfaces.nsIConsoleService);
        aConsoleService.logStringMessage(message);
    },

    commanded: function(event) {
        var url = event.target.url;
        var referrer = event.target.referrer;
        openUILinkIn(url, "current", false, null, referrer);
        event.stopPropagation();
    },

    clearMenu: function(menu) {
        while (menu.firstChild.id != "videosniffer-collected-separator"
                && menu.firstChild.id != "videosniffer-collected-filler")
            menu.removeChild(menu.firstChild);
        if (menu.firstChild.id != "videosniffer-collected-filler") {
            menu.insertBefore(menu.filler, menu.firstChild);
        }
    },

    addURL: function(url, referrer) {
        var menu = document.getElementById("videosniffer-collected-menu");

        /* Check for duplicates */
        var n = 1;
        for (var i = menu.firstChild;
                i.id != "videosniffer-collected-separator";
                i = i.nextSibling) {
            n += 1;
            if (i.video_url == url)
                return;
        }

        /* Remove outdated items */
        if (n > this.video_limit) {
            var sep = document.getElementById("videosniffer-collected-separator");
            for (var i = sep.previousSibling; n > this.video_limit;
                    i = i.previousSibling) {
                n -= 1;
                menu.removeChild(i);
            }
        }

        /* Remove filler */
        if (menu.firstChild.id == "videosniffer-collected-filler") {
            menu.filler = menu.firstChild;
            menu.removeChild(menu.firstChild);
        }

        /* Add new URL */
        var menuitem = document.createElement("menuitem");
        menuitem.url = url;
        menuitem.referrer = referrer;
        menuitem.setAttribute("label", url);
        menuitem.setAttribute("oncommand", "VideoSniffer.commanded(event);");
        menu.insertBefore(menuitem, menu.firstChild);
    },

    observe: function(subject, topic, data) {
        if (topic == "http-on-examine-response") {
            var httpChannel = subject.QueryInterface(
                Components.interfaces.nsIHttpChannel);
            var type = httpChannel.contentType;
            var url = httpChannel.URI.asciiSpec;
            /* this.log("VideoSniffer: Type: " + type + " URL: " + url); */
            if (type.search(/video\//i) == 0
                    || url.search(/\.(flv|wmv|mpg|mpeg|avi|mp4)(\?.*)?$/i) >= 0) {
                var referrer = httpChannel.referrer;
                if (referrer)
                    referrer = referrer.asciiSpec;
                this.addURL(url, referrer);
            }
        }
    }
};

function setup() {
    var observerService = Components.
        classes["@mozilla.org/observer-service;1"].
        getService(Components.interfaces.nsIObserverService);
    observerService.addObserver(VideoSniffer,
        "http-on-examine-response", false);
}

window.addEventListener("load", setup, false);
