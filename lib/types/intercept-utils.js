"use strict";
var utils_1 = require("../utils/utils");
var derivation_1 = require("../core/derivation");
function hasInterceptors(interceptable) {
    return (interceptable.interceptors && interceptable.interceptors.length > 0);
}
exports.hasInterceptors = hasInterceptors;
function registerInterceptor(interceptable, handler) {
    var interceptors = interceptable.interceptors || (interceptable.interceptors = []);
    interceptors.push(handler);
    return utils_1.once(function () {
        var idx = interceptors.indexOf(handler);
        if (idx !== -1)
            interceptors.splice(idx, 1);
    });
}
exports.registerInterceptor = registerInterceptor;
function interceptChange(interceptable, change) {
    var prevU = derivation_1.untrackedStart();
    var interceptors = interceptable.interceptors;
    for (var i = 0, l = interceptors.length; i < l; i++) {
        change = interceptors[i](change);
        utils_1.invariant(!change || change.type, "Intercept handlers should return nothing or a change object");
        if (!change)
            return null;
    }
    derivation_1.untrackedEnd(prevU);
    return change;
}
exports.interceptChange = interceptChange;
