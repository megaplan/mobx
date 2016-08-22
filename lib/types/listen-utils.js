"use strict";
var utils_1 = require("../utils/utils");
var derivation_1 = require("../core/derivation");
function hasListeners(listenable) {
    return listenable.changeListeners && listenable.changeListeners.length > 0;
}
exports.hasListeners = hasListeners;
function registerListener(listenable, handler) {
    var listeners = listenable.changeListeners || (listenable.changeListeners = []);
    listeners.push(handler);
    return utils_1.once(function () {
        var idx = listeners.indexOf(handler);
        if (idx !== -1)
            listeners.splice(idx, 1);
    });
}
exports.registerListener = registerListener;
function notifyListeners(listenable, change) {
    var prevU = derivation_1.untrackedStart();
    var listeners = listenable.changeListeners;
    if (!listeners)
        return;
    listeners = listeners.slice();
    for (var i = 0, l = listeners.length; i < l; i++) {
        if (Array.isArray(change)) {
            listeners[i].apply(null, change);
        }
        else {
            listeners[i](change);
        }
    }
    derivation_1.untrackedEnd(prevU);
}
exports.notifyListeners = notifyListeners;
