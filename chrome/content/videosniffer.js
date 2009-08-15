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

    commanded: function(event)
    {
        var uri_info = event.target.uri_info;
        openUILinkIn(uri_info.uri, "current", false, null, uri_info.referrer);
        event.stopPropagation();
    },

    clearMenu: function(menu)
    {
        while (menu.firstChild.id != "videosniffer-collected-separator"
                && menu.firstChild.id != "videosniffer-collected-filler")
            menu.removeChild(menu.firstChild);
        if (menu.firstChild.id != "videosniffer-collected-filler") {
            menu.insertBefore(menu.filler, menu.firstChild);
        }
    },

    addURL: function(uri_info)
    {
        var menu = document.getElementById("videosniffer-collected-menu");

        /* Check for duplicates */
        var n = 1;
        for (var i = menu.firstChild;
                (i.id != "videosniffer-collected-separator"
                 && i.id != "videosniffer-collected-filler");
                i = i.nextSibling) {
            n += 1;
            if (i.uri_info.uri == uri_info.uri)
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
        menuitem.uri_info = uri_info;
        menuitem.setAttribute("label", uri_info.getTitle());
        menuitem.setAttribute("oncommand", "VideoSniffer.commanded(event);");
        menu.insertBefore(menuitem, menu.firstChild);
    },

    observe: function(subject, topic, data)
    {
        if (topic != "http-on-examine-response")
            return
        var channel = subject.QueryInterface(
            Components.interfaces.nsIHttpChannel);
        if (this.needToAdd(channel))
            this.addURL(new URIInfo(channel));
    },

    needToAdd: function(channel)
    {
        return (channel.requestSucceeded
            && (channel.contentType.match(/^video\//i)
            || channel.URI.path.search(
                /\.(flv|rm|wmv|asf|ogm|mkv|mpg|mpe|m1s|mp2v|m2v|m2s|mpeg|avi|mp4|3gp|mov|qt)(\?.*)?$/i) >= 0))
    }
}


function URIInfo(channel)
{
    this.uri = channel.URI.asciiSpec;
    var referrer = channel.referrer;
    if (referrer)
        referrer = referrer.asciiSpec;
    this.referrer = referrer;
    this.contentType = channel.contentType;
    this.contentLength = channel.contentLength;
}

URIInfo.prototype.getTitle = function()
{
    var type = this.contentType? this.contentType: "?";
    var size = this.contentLength < 0? "?":
        this.formatSize(this.contentLength);
    return "(" + size + " " + type + ") " + this.uri;
}

URIInfo.prototype.formatSize = function(size)
{
    var suffixes = new Array("", "K", "M", "G", "T", "P", "E", "Z", "Y");
    var i = 0;
    while (size > 1024) {
        size /= 1024;
        i++;
    }
    var s = size.toFixed(1);
    var cs = Math.ceil(s);
    s = (cs == s)? cs: s
    return s.toString() + suffixes[i];
}


function setup() {
    var observerService = Components.
        classes["@mozilla.org/observer-service;1"].
        getService(Components.interfaces.nsIObserverService);
    observerService.addObserver(VideoSniffer,
        "http-on-examine-response", false);
}

window.addEventListener("load", setup, false);
