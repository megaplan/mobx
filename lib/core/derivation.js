"use strict";
var observable_1 = require("./observable");
var globalstate_1 = require("./globalstate");
var utils_1 = require("../utils/utils");
var spy_1 = require("./spy");
function isComputingDerivation() {
    return globalstate_1.globalState.derivationStack.length > 0
        && globalstate_1.globalState.isTracking; // filter out actions inside computations
}
exports.isComputingDerivation = isComputingDerivation;
function checkIfStateModificationsAreAllowed() {
    if (!globalstate_1.globalState.allowStateChanges) {
        utils_1.invariant(false, globalstate_1.globalState.strictMode
            ? "It is not allowed to create or change state outside an `action` when MobX is in strict mode. Wrap the current method in `action` if this state change is intended"
            : "It is not allowed to change the state when a computed value or transformer is being evaluated. Use 'autorun' to create reactive functions with side-effects.");
    }
}
exports.checkIfStateModificationsAreAllowed = checkIfStateModificationsAreAllowed;
/**
 * Notify a derivation that one of the values it is observing has become stale
 */
function notifyDependencyStale(derivation) {
    if (++derivation.dependencyStaleCount === 1) {
        observable_1.propagateStaleness(derivation);
    }
}
exports.notifyDependencyStale = notifyDependencyStale;
/**
 * Notify a derivation that one of the values it is observing has become stable again.
 * If all observed values are stable and at least one of them has changed, the derivation
 * will be scheduled for re-evaluation.
 */
function notifyDependencyReady(derivation, dependencyDidChange) {
    utils_1.invariant(derivation.dependencyStaleCount > 0, "unexpected ready notification");
    if (dependencyDidChange)
        derivation.dependencyChangeCount += 1;
    if (--derivation.dependencyStaleCount === 0) {
        // all dependencies are ready
        if (derivation.dependencyChangeCount > 0) {
            // did any of the observables really change?
            derivation.dependencyChangeCount = 0;
            var changed = derivation.onDependenciesReady();
            observable_1.propagateReadiness(derivation, changed);
        }
        else {
            // we're done, but didn't change, lets make sure verybody knows..
            observable_1.propagateReadiness(derivation, false);
        }
    }
}
exports.notifyDependencyReady = notifyDependencyReady;
/**
 * Executes the provided function `f` and tracks which observables are being accessed.
 * The tracking information is stored on the `derivation` object and the derivation is registered
 * as observer of any of the accessed observables.
 */
function trackDerivedFunction(derivation, f) {
    var prevObserving = derivation.observing;
    // pre allocate array allocation + room for variation in deps
    // array will be trimmed by bindDependencies
    derivation.observing = new Array(prevObserving.length + 100);
    derivation.unboundDepsCount = 0;
    derivation.runId = ++globalstate_1.globalState.runId;
    globalstate_1.globalState.derivationStack.push(derivation);
    var prevTracking = globalstate_1.globalState.isTracking;
    globalstate_1.globalState.isTracking = true;
    var hasException = true;
    var result;
    try {
        result = f.call(derivation);
        hasException = false;
    }
    finally {
        if (hasException) {
            var message = ("[mobx] An uncaught exception occurred while calculating your computed value, autorun or transformer. Or inside the render() method of an observer based React component. " +
                "These functions should never throw exceptions as MobX will not always be able to recover from them. " +
                ("Please fix the error reported after this message or enable 'Pause on (caught) exceptions' in your debugger to find the root cause. In: '" + derivation.name + "'. ") +
                "For more details see https://github.com/mobxjs/mobx/issues/462");
            if (spy_1.isSpyEnabled()) {
                spy_1.spyReport({
                    type: "error",
                    object: this,
                    message: message
                });
            }
            console.warn(message); // In next major, maybe don't emit this message at all?
            // Poor mans recovery attempt
            // Assumption here is that this is the only exception handler in MobX.
            // So functions higher up in the stack (like transanction) won't be modifying the globalState anymore after this call.
            // (Except for other trackDerivedFunction calls of course, but that is just)
            derivation.unboundDepsCount = 0;
            derivation.observing = prevObserving;
            globalstate_1.resetGlobalState();
        }
        else {
            globalstate_1.globalState.isTracking = prevTracking;
            globalstate_1.globalState.derivationStack.length -= 1;
            bindDependencies(derivation, prevObserving);
        }
    }
    return result;
}
exports.trackDerivedFunction = trackDerivedFunction;
function bindDependencies(derivation, prevObserving) {
    var prevLength = prevObserving.length;
    // trim and determina new observing length
    var observing = derivation.observing;
    var newLength = observing.length = derivation.unboundDepsCount;
    // Idea of this algorithm is start with marking all observables in observing and prevObserving with weight 0
    // After that all prevObserving weights are decreased with -1
    // And all new observing are increased with +1.
    // After that holds: 0 = old dep that is still in use, -1 = old dep, no longer in use, +1 = (seemingly) new dep, was not in use before
    // This process is optimized by making sure deps are always left 'clean', with value 0, so that they don't need to be reset at the start of this process
    // after that, all prevObserving items are marked with -1 directly, instead of 0 and doing -- after that
    // further the +1 and addObserver can be done in one go.
    for (var i = 0; i < prevLength; i++)
        prevObserving[i].diffValue = -1;
    for (var i = 0; i < newLength; i++) {
        var dep = observing[i];
        // there is no guarantee that the observing collection is unique, so especially in the first run of the derivation
        // this check might succeed too often (namely, for each double dep). That is no problem because addObserve is backed by a set
        // In subsequent runs of the derivation, double entries are a lot less likely to happen, because then the used derivations are hot and executed
        // _before_ this derivation, meaning that the lastAccessedDerivation optimization will most probably have skip all the doubles already.
        // see also the "unoptimizable subscriptions are diffed correctly" test
        if ((++dep.diffValue) > 0) {
            dep.diffValue = 0; // this also short circuits add if a dep is multiple times in the observing list
            observable_1.addObserver(dep, derivation);
        }
    }
    for (var i = 0; i < prevLength; i++) {
        var dep = prevObserving[i];
        if (dep.diffValue < 0) {
            dep.diffValue = 0; // this also short circuits add if a dep is multiple times in the observing list
            observable_1.removeObserver(dep, derivation);
        }
    }
}
function clearObserving(derivation) {
    var obs = derivation.observing;
    var l = obs.length;
    for (var i = 0; i < l; i++)
        observable_1.removeObserver(obs[i], derivation);
    obs.length = 0;
}
exports.clearObserving = clearObserving;
function untracked(action) {
    var prev = untrackedStart();
    var res = action();
    untrackedEnd(prev);
    return res;
}
exports.untracked = untracked;
function untrackedStart() {
    var prev = globalstate_1.globalState.isTracking;
    globalstate_1.globalState.isTracking = false;
    return prev;
}
exports.untrackedStart = untrackedStart;
function untrackedEnd(prev) {
    globalstate_1.globalState.isTracking = prev;
}
exports.untrackedEnd = untrackedEnd;
