"use strict";
var globalstate_1 = require("./globalstate");
var utils_1 = require("../utils/utils");
var spyEnabled = false;
function isSpyEnabled() {
    return spyEnabled;
}
exports.isSpyEnabled = isSpyEnabled;
function spyReport(event) {
    if (!spyEnabled)
        return false;
    var listeners = globalstate_1.globalState.spyListeners;
    for (var i = 0, l = listeners.length; i < l; i++)
        listeners[i](event);
}
exports.spyReport = spyReport;
function spyReportStart(event) {
    var change = utils_1.objectAssign({}, event, { spyReportStart: true });
    spyReport(change);
}
exports.spyReportStart = spyReportStart;
var END_EVENT = { spyReportEnd: true };
function spyReportEnd(change) {
    if (change)
        spyReport(utils_1.objectAssign({}, change, END_EVENT));
    else
        spyReport(END_EVENT);
}
exports.spyReportEnd = spyReportEnd;
function spy(listener) {
    globalstate_1.globalState.spyListeners.push(listener);
    spyEnabled = globalstate_1.globalState.spyListeners.length > 0;
    return utils_1.once(function () {
        var idx = globalstate_1.globalState.spyListeners.indexOf(listener);
        if (idx !== -1)
            globalstate_1.globalState.spyListeners.splice(idx, 1);
        spyEnabled = globalstate_1.globalState.spyListeners.length > 0;
    });
}
exports.spy = spy;
function trackTransitions(onReport) {
    utils_1.deprecated("trackTransitions is deprecated. Use mobx.spy instead");
    if (typeof onReport === "boolean") {
        utils_1.deprecated("trackTransitions only takes a single callback function. If you are using the mobx-react-devtools, please update them first");
        onReport = arguments[1];
    }
    if (!onReport) {
        utils_1.deprecated("trackTransitions without callback has been deprecated and is a no-op now. If you are using the mobx-react-devtools, please update them first");
        return function () { };
    }
    return spy(onReport);
}
exports.trackTransitions = trackTransitions;
