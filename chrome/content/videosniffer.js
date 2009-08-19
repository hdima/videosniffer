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

    counter: 0,
    videos: new Object(),

    onLoad: function()
    {
        var observerService = Components.
            classes["@mozilla.org/observer-service;1"].
            getService(Components.interfaces.nsIObserverService);
        observerService.addObserver(VideoSniffer,
            "http-on-examine-response", false);
    },

    onUnload: function()
    {
        var observerService = Components.
            classes["@mozilla.org/observer-service;1"].
            getService(Components.interfaces.nsIObserverService);
        observerService.removeObserver(VideoSniffer,
            "http-on-examine-response");
    },

    getPrefs: function()
    {
        return Components.classes["@mozilla.org/preferences-service;1"]
            .getService(Components.interfaces.nsIPrefService)
            .getBranch("extensions.videosniffer.");
    },

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
        this.videos = new Object();
    },

    addURL: function(uri_info)
    {
        /* Check for duplicates */
        if (this.videos[uri_info.uri])
            return;
        var menu = document.getElementById("videosniffer-collected-menu");

        /* Remove outdated items */
        var c = this.videos.__count__
            - this.getPrefs().getIntPref("videolimit");
        if (c >= 0) {
            var n = document.getElementById(
                "videosniffer-collected-separator").previousSibling;
            for (; c >= 0; c--, n = n.previousSibling) {
                delete this.videos[n.uri_info.uri];
                menu.removeChild(n);
            }
        }

        /* Remove filler */
        if (menu.firstChild.id == "videosniffer-collected-filler") {
            menu.filler = menu.firstChild;
            menu.removeChild(menu.firstChild);
        }

        /* Add new URL */
        this.counter++;

        var shownumber = this.getPrefs().getBoolPref("shownumber");
        var showsize = this.getPrefs().getBoolPref("showsize");
        var showtype = this.getPrefs().getBoolPref("showtype");

        var menuitem = document.createElement("menuitem");
        menuitem.uri_info = uri_info;
        menuitem.setAttribute("label", uri_info.getTitle(
            shownumber? this.counter: null, showsize, showtype));
        menuitem.setAttribute("oncommand", "VideoSniffer.commanded(event);");
        menu.insertBefore(menuitem, menu.firstChild);
        this.videos[uri_info.uri] = 1;
    },

    observe: function(subject, topic, data)
    {
        if (topic != "http-on-examine-response")
            return
        var channel = subject.QueryInterface(
            Components.interfaces.nsIHttpChannel);
        if (channel.requestSucceeded) {
            var uri_info = new URIInfo(channel);
            if (uri_info.isVideo())
                this.addURL(uri_info);
        }
    }
}


var VideoContentTypes = {
    "3gp": "video/3gpp",
    axv: "video/annodex",
    dl: "video/dl",
    dif: "video/dv",
    dv: "video/dv",
    fli: "video/fli",
    gl: "video/gl",
    mpeg: "video/mpeg",
    mpg: "video/mpeg",
    mpe: "video/mpeg",
    mp4: "video/mp4",
    qt: "video/quicktime",
    mov: "video/quicktime",
    ogv: "video/ogg",
    mxu: "video/vnd.mpegurl",
    flv: "video/x-flv",
    lsf: "video/x-la-asf",
    lsx: "video/x-la-asf",
    mng: "video/x-mng",
    asf: "video/x-ms-asf",
    asx: "video/x-ms-asf",
    wm: "video/x-ms-wm",
    wmv: "video/x-ms-wmv",
    wmx: "video/x-ms-wmx",
    wvx: "video/x-ms-wvx",
    avi: "video/x-msvideo",
    movie: "video/x-sgi-movie",
    mpv: "video/x-matroska",
    mkv: "video/x-matroska",

    guessContentType: function(contentType, path)
    {
        var parts = path.match(/\.([a-z0-9]+)(\?.*)?$/i);
        if (parts) {
            var ext = parts[1];
            if (VideoContentTypes[ext])
                return VideoContentTypes[ext];
        }
        return contentType;
    }
}


function URIInfo(channel)
{
    this.uri = channel.URI.asciiSpec;
    this.path = channel.URI.path;
    var referrer = channel.referrer;
    if (referrer)
        referrer = referrer.asciiSpec;
    this.referrer = referrer;
    this.contentType = channel.contentType;
    if (!this.contentType.match(/^video\//i))
        this.contentType = VideoContentTypes.guessContentType(
            this.contentType, this.path);
    this.contentLength = channel.contentLength;
}

URIInfo.prototype.isVideo = function()
{
    return this.contentType.match(/^video\//i);
}

URIInfo.prototype.getTitle = function(counter, showsize, showtype)
{
    var header = "";

    if (counter)
        header += counter.toString() + ". ";

    if (showsize) {
        var size = this.contentLength < 0? "???":
            this.formatSize(this.contentLength);
        header += "(" + size;
    }

    if (showtype) {
        var type = "???";
        var parts = this.contentType.match(/^video\/(.*)/i);
        if (parts && parts[1]) {
            type = parts[1];
        }
        if (showsize)
            header += " " + type;
        else
            header += "(" + type;
    }

    if (showtype || showsize)
        header += ") ";

    return header + this.uri;
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

window.addEventListener("load",
    function(e) { VideoSniffer.onLoad(); }, false);
window.addEventListener("unload",
    function(e) { VideoSniffer.onUnload(); }, false);
