"use strict";
var derivation_1 = require("./derivation");
var globalstate_1 = require("./globalstate");
var utils_1 = require("../utils/utils");
var spy_1 = require("./spy");
var set_1 = require("../utils/set");
/**
 * Reactions are a special kind of derivations. Several things distinguishes them from normal reactive computations
 *
 * 1) They will always run, whether they are used by other computations or not.
 * This means that they are very suitable for triggering side effects like logging, updating the DOM and making network requests.
 * 2) They are not observable themselves
 * 3) They will always run after any 'normal' derivations
 * 4) They are allowed to change the state and thereby triggering themselves again, as long as they make sure the state propagates to a stable state in a reasonable amount of iterations.
 *
 * The state machine of a Reaction is as follows:
 *
 * 1) after creating, the reaction should be started by calling `runReaction` or by scheduling it (see also `autorun`)
 * 2) the `onInvalidate` handler should somehow result in a call to `this.track(someFunction)`
 * 3) all observables accessed in `someFunction` will be observed by this reaction.
 * 4) as soon as some of the dependencies has changed the Reaction will be rescheduled for another run (after the current mutation or transaction). `isScheduled` will yield true once a dependency is stale and during this period
 * 5) `onInvalidate` will be called, and we are back at step 1.
 *
 */
var EMPTY_DERIVATION_SET;
var Reaction = (function () {
    function Reaction(name, onInvalidate) {
        if (name === void 0) { name = "Reaction@" + utils_1.getNextId(); }
        this.name = name;
        this.onInvalidate = onInvalidate;
        this.staleObservers = utils_1.EMPTY_ARRAY; // Won't change
        this.observers = EMPTY_DERIVATION_SET || (EMPTY_DERIVATION_SET = new set_1.SimpleSet()); // Won't change
        this.observing = []; // nodes we are looking at. Our value depends on these nodes
        this.diffValue = 0;
        this.runId = 0;
        this.lastAccessedBy = 0;
        this.unboundDepsCount = 0;
        this.__mapid = "#" + utils_1.getNextId(); // use strings for map distribution, just nrs will result in accidental sparse arrays...
        this.dependencyChangeCount = 0; // nr of nodes being observed that have received a new value. If > 0, we should recompute
        this.dependencyStaleCount = 0; // nr of nodes being observed that are currently not ready
        this.isDisposed = false;
        this._isScheduled = false;
        this._isTrackPending = false;
        this._isRunning = false;
    }
    Reaction.prototype.onBecomeUnobserved = function () {
        // noop, reaction is always unobserved
    };
    Reaction.prototype.onDependenciesReady = function () {
        this.schedule();
        return false; // reactions never propagate changes
    };
    Reaction.prototype.schedule = function () {
        if (!this._isScheduled) {
            this._isScheduled = true;
            globalstate_1.globalState.pendingReactions.push(this);
            runReactions();
        }
    };
    Reaction.prototype.isScheduled = function () {
        return this.dependencyStaleCount > 0 || this._isScheduled;
    };
    /**
     * internal, use schedule() if you intend to kick off a reaction
     */
    Reaction.prototype.runReaction = function () {
        if (!this.isDisposed) {
            this._isScheduled = false;
            this._isTrackPending = true;
            this.onInvalidate();
            if (this._isTrackPending && spy_1.isSpyEnabled()) {
                // onInvalidate didn't trigger track right away..
                spy_1.spyReport({
                    object: this,
                    type: "scheduled-reaction"
                });
            }
        }
    };
    Reaction.prototype.track = function (fn) {
        var notify = spy_1.isSpyEnabled();
        var startTime;
        if (notify) {
            startTime = Date.now();
            spy_1.spyReportStart({
                object: this,
                type: "reaction",
                fn: fn
            });
        }
        this._isRunning = true;
        derivation_1.trackDerivedFunction(this, fn);
        this._isRunning = false;
        this._isTrackPending = false;
        if (this.isDisposed) {
            // disposed during last run. Clean up everything that was bound after the dispose call.
            derivation_1.clearObserving(this);
        }
        if (notify) {
            spy_1.spyReportEnd({
                time: Date.now() - startTime
            });
        }
    };
    Reaction.prototype.dispose = function () {
        if (!this.isDisposed) {
            this.isDisposed = true;
            if (!this._isRunning)
                derivation_1.clearObserving(this); // if disposed while running, clean up later. Maybe not optimal, but rare case
        }
    };
    Reaction.prototype.getDisposer = function () {
        var r = this.dispose.bind(this);
        r.$mobx = this;
        return r;
    };
    Reaction.prototype.toString = function () {
        return "Reaction[" + this.name + "]";
    };
    Reaction.prototype.whyRun = function () {
        var observing = utils_1.unique(this.observing).map(function (dep) { return dep.name; });
        return ("\nWhyRun? reaction '" + this.name + "':\n * Status: [" + (this.isDisposed ? "stopped" : this._isRunning ? "running" : this.isScheduled() ? "scheduled" : "idle") + "]\n * This reaction will re-run if any of the following observables changes:\n    " + utils_1.joinStrings(observing) + "\n    " + ((this._isRunning) ? " (... or any observable accessed during the remainder of the current run)" : "") + "\n\tMissing items in this list?\n\t  1. Check whether all used values are properly marked as observable (use isObservable to verify)\n\t  2. Make sure you didn't dereference values too early. MobX observes props, not primitives. E.g: use 'person.name' instead of 'name' in your computation.\n");
    };
    return Reaction;
}());
exports.Reaction = Reaction;
/**
 * Magic number alert!
 * Defines within how many times a reaction is allowed to re-trigger itself
 * until it is assumed that this is gonna be a never ending loop...
 */
var MAX_REACTION_ITERATIONS = 100;
function runReactions() {
    if (globalstate_1.globalState.isRunningReactions === true || globalstate_1.globalState.inTransaction > 0)
        return;
    globalstate_1.globalState.isRunningReactions = true;
    var allReactions = globalstate_1.globalState.pendingReactions;
    var iterations = 0;
    // While running reactions, new reactions might be triggered.
    // Hence we work with two variables and check whether
    // we converge to no remaining reactions after a while.
    while (allReactions.length > 0) {
        if (++iterations === MAX_REACTION_ITERATIONS)
            throw new Error(("Reaction doesn't converge to a stable state after " + MAX_REACTION_ITERATIONS + " iterations.")
                + (" Probably there is a cycle in the reactive function: " + allReactions[0]));
        var remainingReactions = allReactions.splice(0);
        for (var i = 0, l = remainingReactions.length; i < l; i++)
            remainingReactions[i].runReaction();
    }
    globalstate_1.globalState.isRunningReactions = false;
}
exports.runReactions = runReactions;
