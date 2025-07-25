/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/src/FileSaver.js */
var saveAs = saveAs || (function(view) {
    "use strict";
    var doc = view.document,
        get_URL = function() {
            return view.URL || view.webkitURL || view;
        },
        save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a"),
        can_use_save_link = "download" in save_link,
        click = function(node) {
            var event = new MouseEvent("click");
            node.dispatchEvent(event);
        },
        is_safari = /constructor/i.test(view.HTMLElement),
        is_chrome_ios = /CriOS\/[\d]+/.test(navigator.userAgent),
        throw_outside = function(ex) {
            (view.setImmediate || view.setTimeout)(function() {
                throw ex;
            }, 0);
        },
        force_saveable_type = "application/octet-stream",
        arbitrary_revoke_timeout = 1000 * 40,
        revoke = function(file) {
            var revoker = function() {
                if (typeof file === "string") {
                    get_URL().revokeObjectURL(file);
                } else {
                    file.remove();
                }
            };
            setTimeout(revoker, arbitrary_revoke_timeout);
        },
        dispatch = function(filesaver, event_types, event) {
            event_types = [].concat(event_types);
            var i = event_types.length;
            while (i--) {
                var listener = filesaver["on" + event_types[i]];
                if (typeof listener === "function") {
                    try {
                        listener.call(filesaver, event || filesaver);
                    } catch (ex) {
                        throw_outside(ex);
                    }
                }
            }
        },
        auto_bom = function(blob) {
            if (/^\s*(?:text\/(?:plain|xml)|application\/xml|\+xml)(?:;.*)?$/i.test(blob.type)) {
                return new Blob([String.fromCharCode(0xFEFF), blob], { type: blob.type });
            }
            return blob;
        },
        FileSaver = function(blob, name, no_auto_bom) {
            if (!no_auto_bom) {
                blob = auto_bom(blob);
            }
            var filesaver = this,
                type = blob.type,
                force = type === force_saveable_type,
                object_url,
                dispatch_all = function() {
                    dispatch(filesaver, "writestart progress write writeend".split(" "));
                },
                fs_error = function() {
                    if ((is_chrome_ios || (force && is_safari)) && view.FileReader) {
                        var reader = new FileReader();
                        reader.onloadend = function() {
                            var url = is_chrome_ios ? reader.result : reader.result.replace(/^data:[^;]*;/, 'data:attachment/file;');
                            var popup = view.open(url, '_blank');
                            if (!popup) view.location.href = url;
                            url = undefined;
                            filesaver.readyState = filesaver.DONE;
                            dispatch_all();
                        };
                        reader.readAsDataURL(blob);
                        filesaver.readyState = filesaver.INIT;
                        return;
                    }
                    if (!object_url) object_url = get_URL().createObjectURL(blob);
                    if (force) view.location.href = object_url;
                    else {
                        var opened = view.open(object_url, '_blank');
                        if (!opened) view.location.href = object_url;
                    }
                    filesaver.readyState = filesaver.DONE;
                    dispatch_all();
                    revoke(object_url);
                };
            filesaver.readyState = filesaver.INIT;

            if (can_use_save_link) {
                object_url = get_URL().createObjectURL(blob);
                setTimeout(function() {
                    save_link.href = object_url;
                    save_link.download = name;
                    click(save_link);
                    dispatch_all();
                    revoke(object_url);
                    filesaver.readyState = filesaver.DONE;
                });
                return;
            }

            fs_error();
        },
        FS_proto = FileSaver.prototype,
        saveAs = function(blob, name, no_auto_bom) {
            return new FileSaver(blob, name || blob.name || "download", no_auto_bom);
        };

    if (typeof module !== "undefined") module.exports = saveAs;
    return saveAs;
}(typeof self !== "undefined" && self || typeof window !== "undefined" && window || this.content));

