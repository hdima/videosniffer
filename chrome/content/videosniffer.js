/*
 * Vide sniffer.
 * Copyright (C) 2007-2008 Dmitry Vasiliev <dima@hlabs.spb.ru>
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
        var url = event.target.getAttribute("label");
        openUILinkIn(url, "current");
        event.stopPropagation();
    },

    clearMenu: function(menu) {
        while (menu.firstChild.id != "videosniffer-collected-separator")
            menu.removeChild(menu.firstChild);
    },

    addURL: function(url) {
        var menu = document.getElementById("videosniffer-collected-menu");

        var n = 1;
        for (var i = menu.firstChild;
                i.id != "videosniffer-collected-separator";
                i = i.nextSibling) {
            n += 1;
            if (i.getAttribute("label") == url)
                return;
        }

        if (n > this.video_limit) {
            var sep = document.getElementById("videosniffer-collected-separator");
            for (var i = sep.previousSibling; n > this.video_limit;
                    i = i.previousSibling) {
                n -= 1;
                menu.removeChild(i);
            }
        }

        var menuitem = document.createElement("menuitem");
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
                this.addURL(url);
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
