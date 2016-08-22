"use strict";
var globalstate_1 = require("./globalstate");
var atom_1 = require("./atom");
var reaction_1 = require("./reaction");
var spy_1 = require("./spy");
/**
 * During a transaction no views are updated until the end of the transaction.
 * The transaction will be run synchronously nonetheless.
 * @param action a function that updates some reactive state
 * @returns any value that was returned by the 'action' parameter.
 */
function transaction(action, thisArg, report) {
    if (thisArg === void 0) { thisArg = undefined; }
    if (report === void 0) { report = true; }
    transactionStart((action.name) || "anonymous transaction", thisArg, report);
    var res = action.call(thisArg);
    transactionEnd(report);
    return res;
}
exports.transaction = transaction;
function transactionStart(name, thisArg, report) {
    if (thisArg === void 0) { thisArg = undefined; }
    if (report === void 0) { report = true; }
    globalstate_1.globalState.inTransaction += 1;
    if (report && spy_1.isSpyEnabled()) {
        spy_1.spyReportStart({
            type: "transaction",
            target: thisArg,
            name: name
        });
    }
}
exports.transactionStart = transactionStart;
function transactionEnd(report) {
    if (report === void 0) { report = true; }
    if (--globalstate_1.globalState.inTransaction === 0) {
        var values = globalstate_1.globalState.changedAtoms.splice(0);
        for (var i = 0, l = values.length; i < l; i++)
            atom_1.propagateAtomReady(values[i]);
        reaction_1.runReactions();
    }
    if (report && spy_1.isSpyEnabled())
        spy_1.spyReportEnd();
}
exports.transactionEnd = transactionEnd;
