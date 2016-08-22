"use strict";
var derivation_1 = require("./derivation");
var globalstate_1 = require("./globalstate");
function addObserver(observable, node) {
    observable.observers.add(node);
}
exports.addObserver = addObserver;
function removeObserver(observable, node) {
    observable.observers.remove(node);
    if (observable.observers.length === 0)
        observable.onBecomeUnobserved(); // TODO: test if this happens only once, e.g. remove returns bool!
}
exports.removeObserver = removeObserver;
function reportObserved(observable) {
    if (globalstate_1.globalState.isTracking === false)
        return;
    var derivation = globalstate_1.globalState.derivationStack[globalstate_1.globalState.derivationStack.length - 1];
    /**
     * Simple optimization, give each derivation run an unique id (runId)
     * Check if last time this observable was accessed the same runId is used
     * if this is the case, the relation is already known
     */
    if (derivation.runId !== observable.lastAccessedBy) {
        observable.lastAccessedBy = derivation.runId;
        derivation.observing[derivation.unboundDepsCount++] = observable;
    }
}
exports.reportObserved = reportObserved;
function propagateStaleness(observable) {
    var os = observable.observers.asArray();
    var l = os.length;
    for (var i = 0; i < l; i++)
        derivation_1.notifyDependencyStale(os[i]);
    observable.staleObservers = observable.staleObservers.concat(os);
}
exports.propagateStaleness = propagateStaleness;
function propagateReadiness(observable, valueDidActuallyChange) {
    observable.staleObservers.splice(0).forEach(function (o) { return derivation_1.notifyDependencyReady(o, valueDidActuallyChange); });
}
exports.propagateReadiness = propagateReadiness;
