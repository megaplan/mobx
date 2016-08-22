"use strict";
var transaction_1 = require("../core/transaction");
var utils_1 = require("../utils/utils");
var derivation_1 = require("../core/derivation");
var spy_1 = require("../core/spy");
var computedvalue_1 = require("../core/computedvalue");
var globalstate_1 = require("../core/globalstate");
function createAction(actionName, fn) {
    utils_1.invariant(typeof fn === "function", "`action` can only be invoked on functions");
    utils_1.invariant(typeof actionName === "string" && actionName.length > 0, "actions should have valid names, got: '" + actionName + "'");
    var res = function () {
        return executeAction(actionName, fn, this, arguments);
    };
    res.isMobxAction = true;
    return res;
}
exports.createAction = createAction;
function executeAction(actionName, fn, scope, args) {
    // actions should not be called from computeds. check only works if the computed is actively observed, but that is fine enough as heuristic
    var ds = globalstate_1.globalState.derivationStack;
    utils_1.invariant(!(ds[ds.length - 1] instanceof computedvalue_1.ComputedValue), "Computed values or transformers should not invoke actions or trigger other side effects");
    var notifySpy = spy_1.isSpyEnabled();
    var startTime;
    if (notifySpy) {
        startTime = Date.now();
        var l = (args && args.length) || 0;
        var flattendArgs = new Array(l);
        if (l > 0)
            for (var i = 0; i < l; i++)
                flattendArgs[i] = args[i];
        spy_1.spyReportStart({
            type: "action",
            name: actionName,
            fn: fn,
            target: scope,
            arguments: flattendArgs
        });
    }
    var prevUntracked = derivation_1.untrackedStart();
    transaction_1.transactionStart(actionName, scope, false);
    var prevAllowStateChanges = allowStateChangesStart(true);
    try {
        return fn.apply(scope, args);
    }
    finally {
        allowStateChangesEnd(prevAllowStateChanges);
        transaction_1.transactionEnd(false);
        derivation_1.untrackedEnd(prevUntracked);
        if (notifySpy)
            spy_1.spyReportEnd({ time: Date.now() - startTime });
    }
}
exports.executeAction = executeAction;
function useStrict(strict) {
    if (arguments.length === 0)
        return globalstate_1.globalState.strictMode;
    else {
        utils_1.invariant(globalstate_1.globalState.derivationStack.length === 0, "It is not allowed to set `useStrict` when a derivation is running");
        globalstate_1.globalState.strictMode = strict;
        globalstate_1.globalState.allowStateChanges = !strict;
    }
}
exports.useStrict = useStrict;
function allowStateChanges(allowStateChanges, func) {
    var prev = allowStateChangesStart(allowStateChanges);
    var res = func();
    allowStateChangesEnd(prev);
    return res;
}
exports.allowStateChanges = allowStateChanges;
function allowStateChangesStart(allowStateChanges) {
    var prev = globalstate_1.globalState.allowStateChanges;
    globalstate_1.globalState.allowStateChanges = allowStateChanges;
    return prev;
}
exports.allowStateChangesStart = allowStateChangesStart;
function allowStateChangesEnd(prev) {
    globalstate_1.globalState.allowStateChanges = prev;
}
exports.allowStateChangesEnd = allowStateChangesEnd;
