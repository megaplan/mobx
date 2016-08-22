"use strict";
var observable_1 = require("./observable");
var derivation_1 = require("./derivation");
var globalstate_1 = require("./globalstate");
var action_1 = require("./action");
var utils_1 = require("../utils/utils");
var spy_1 = require("../core/spy");
var autorun_1 = require("../api/autorun");
var set_1 = require("../utils/set");
/**
 * A node in the state dependency root that observes other nodes, and can be observed itself.
 *
 * Computed values will update automatically if any observed value changes and if they are observed themselves.
 * If a computed value isn't actively used by another observer, but is inspect, it will compute lazily to return at least a consistent value.
 */
var ComputedValue = (function () {
    /**
     * Create a new computed value based on a function expression.
     *
     * The `name` property is for debug purposes only.
     *
     * The `compareStructural` property indicates whether the return values should be compared structurally.
     * Normally, a computed value will not notify an upstream observer if a newly produced value is strictly equal to the previously produced value.
     * However, enabling compareStructural can be convienent if you always produce an new aggregated object and don't want to notify observers if it is structurally the same.
     * This is useful for working with vectors, mouse coordinates etc.
     */
    function ComputedValue(derivation, scope, compareStructural, name) {
        this.derivation = derivation;
        this.scope = scope;
        this.compareStructural = compareStructural;
        this.isLazy = true; // nobody is observing this derived value, so don't bother tracking upstream values
        this.isComputing = false;
        this.staleObservers = [];
        this.observers = new set_1.SimpleSet(); // nodes that are dependent on this node. Will be notified when our state change
        this.observing = []; // nodes we are looking at. Our value depends on these nodes
        this.diffValue = 0;
        this.runId = 0;
        this.lastAccessedBy = 0;
        this.unboundDepsCount = 0;
        this.__mapid = "#" + utils_1.getNextId();
        this.dependencyChangeCount = 0; // nr of nodes being observed that have received a new value. If > 0, we should recompute
        this.dependencyStaleCount = 0; // nr of nodes being observed that are currently not ready
        this.value = undefined;
        this.name = name || "ComputedValue@" + utils_1.getNextId();
    }
    ComputedValue.prototype.peek = function () {
        this.isComputing = true;
        var prevAllowStateChanges = action_1.allowStateChangesStart(false);
        var res = this.derivation.call(this.scope);
        action_1.allowStateChangesEnd(prevAllowStateChanges);
        this.isComputing = false;
        return res;
    };
    ;
    ComputedValue.prototype.onBecomeUnobserved = function () {
        derivation_1.clearObserving(this);
        this.isLazy = true;
        this.value = undefined;
    };
    ComputedValue.prototype.onDependenciesReady = function () {
        var changed = this.trackAndCompute();
        return changed;
    };
    /**
     * Returns the current value of this computed value.
     * Will evaluate it's computation first if needed.
     */
    ComputedValue.prototype.get = function () {
        utils_1.invariant(!this.isComputing, "Cycle detected in computation " + this.name, this.derivation);
        observable_1.reportObserved(this);
        if (this.dependencyStaleCount > 0) {
            // This is worst case, somebody is inspecting our value while we are stale.
            // This can happen in two cases:
            // 1) somebody explicitly requests our value during a transaction
            // 2) this computed value is used in another computed value in which it wasn't used
            //    before, and hence it is required now 'too early'. See for an example issue 165.
            // we have no other option than to (possible recursively) forcefully recompute.
            return this.peek();
        }
        if (this.isLazy) {
            if (derivation_1.isComputingDerivation()) {
                // somebody depends on the outcome of this computation
                this.isLazy = false;
                this.trackAndCompute();
            }
            else {
                // nobody depends on this computable;
                // so just compute fresh value and continue to sleep
                return this.peek();
            }
        }
        // we are up to date. Return the value
        return this.value;
    };
    ComputedValue.prototype.set = function (_) {
        throw new Error("[ComputedValue '" + name + "'] It is not possible to assign a new value to a computed value.");
    };
    ComputedValue.prototype.trackAndCompute = function () {
        if (spy_1.isSpyEnabled()) {
            spy_1.spyReport({
                object: this,
                type: "compute",
                fn: this.derivation,
                target: this.scope
            });
        }
        var oldValue = this.value;
        var newValue = this.value = derivation_1.trackDerivedFunction(this, this.peek);
        return utils_1.valueDidChange(this.compareStructural, newValue, oldValue);
    };
    ComputedValue.prototype.observe = function (listener, fireImmediately) {
        var _this = this;
        var firstTime = true;
        var prevValue = undefined;
        return autorun_1.autorun(function () {
            var newValue = _this.get();
            if (!firstTime || fireImmediately) {
                var prevU = derivation_1.untrackedStart();
                listener(newValue, prevValue);
                derivation_1.untrackedEnd(prevU);
            }
            firstTime = false;
            prevValue = newValue;
        });
    };
    ComputedValue.prototype.toJSON = function () {
        return this.get();
    };
    ComputedValue.prototype.toString = function () {
        return this.name + "[" + this.derivation.toString() + "]";
    };
    ComputedValue.prototype.whyRun = function () {
        var isTracking = globalstate_1.globalState.derivationStack.length > 0;
        var observing = utils_1.unique(this.observing).map(function (dep) { return dep.name; });
        var observers = utils_1.unique(this.observers.asArray()).map(function (dep) { return dep.name; });
        var runReason = (this.isComputing
            ? isTracking
                ? this.observers.length > 0 // this computation already had observers
                    ? RunReason.INVALIDATED
                    : RunReason.REQUIRED
                : RunReason.PEEK
            : RunReason.NOT_RUNNING);
        if (runReason === RunReason.REQUIRED) {
            var requiredBy = globalstate_1.globalState.derivationStack[globalstate_1.globalState.derivationStack.length - 2];
            if (requiredBy)
                observers.push(requiredBy.name);
        }
        return (("\nWhyRun? computation '" + this.name + "':\n * Running because: " + exports.runReasonTexts[runReason] + " " + ((runReason === RunReason.NOT_RUNNING) && this.dependencyStaleCount > 0 ? "(a next run is scheduled)" : "") + "\n") +
            (this.isLazy
                ?
                    " * This computation is suspended (not in use by any reaction) and won't run automatically.\n\tDidn't expect this computation to be suspended at this point?\n\t  1. Make sure this computation is used by a reaction (reaction, autorun, observer).\n\t  2. Check whether you are using this computation synchronously (in the same stack as they reaction that needs it).\n"
                :
                    " * This computation will re-run if any of the following observables changes:\n    " + utils_1.joinStrings(observing) + "\n    " + ((this.isComputing && isTracking) ? " (... or any observable accessed during the remainder of the current run)" : "") + "\n\tMissing items in this list?\n\t  1. Check whether all used values are properly marked as observable (use isObservable to verify)\n\t  2. Make sure you didn't dereference values too early. MobX observes props, not primitives. E.g: use 'person.name' instead of 'name' in your computation.\n  * If the outcome of this computation changes, the following observers will be re-run:\n    " + utils_1.joinStrings(observers) + "\n"));
    };
    return ComputedValue;
}());
exports.ComputedValue = ComputedValue;
(function (RunReason) {
    RunReason[RunReason["PEEK"] = 0] = "PEEK";
    RunReason[RunReason["INVALIDATED"] = 1] = "INVALIDATED";
    RunReason[RunReason["REQUIRED"] = 2] = "REQUIRED";
    RunReason[RunReason["NOT_RUNNING"] = 3] = "NOT_RUNNING";
})(exports.RunReason || (exports.RunReason = {}));
var RunReason = exports.RunReason;
exports.runReasonTexts = (_a = {},
    _a[RunReason.PEEK] = "[peek] The value of this computed value was requested outside an reaction",
    _a[RunReason.INVALIDATED] = "[invalidated] Some observables used by this computation did change",
    _a[RunReason.REQUIRED] = "[started] This computation is required by another computed value / reaction",
    _a[RunReason.NOT_RUNNING] = "[idle] This compution is currently not running",
    _a
);
var _a;
