"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * Used by the transaction manager to signal observers that an atom is ready as soon as the transaction has ended.
 */
function propagateAtomReady(atom) {
    utils_1.invariant(atom.isDirty, "atom not dirty");
    atom.isDirty = false;
    observable_1.propagateReadiness(atom, true);
}
exports.propagateAtomReady = propagateAtomReady;
/**
 * Anything that can be used to _store_ state is an Atom in mobx. Atom's have two important jobs
 *
 * 1) detect when they are being _used_ and report this (using reportObserved). This allows mobx to make the connection between running functions and the data they used
 * 2) they should notify mobx whenever they have _changed_. This way mobx can re-run any functions (derivations) that are using this atom.
 */
var BaseAtom = (function () {
    /**
     * Create a new atom. For debugging purposes it is recommended to give it a name.
     * The onBecomeObserved and onBecomeUnobserved callbacks can be used for resource management.
     */
    function BaseAtom(name) {
        if (name === void 0) { name = "Atom@" + utils_1.getNextId(); }
        this.name = name;
        this.isDirty = false;
        this.staleObservers = [];
        this.observers = new set_1.SimpleSet();
        this.diffValue = 0;
        this.lastAccessedBy = 0;
    }
    BaseAtom.prototype.onBecomeUnobserved = function () {
        // noop
    };
    /**
     * Invoke this method to notify mobx that your atom has been used somehow.
     */
    BaseAtom.prototype.reportObserved = function () {
        observable_1.reportObserved(this);
    };
    /**
     * Invoke this method _after_ this method has changed to signal mobx that all its observers should invalidate.
     */
    BaseAtom.prototype.reportChanged = function () {
        if (!this.isDirty) {
            this.reportStale();
            this.reportReady();
        }
    };
    BaseAtom.prototype.reportStale = function () {
        if (!this.isDirty) {
            this.isDirty = true;
            observable_1.propagateStaleness(this);
        }
    };
    BaseAtom.prototype.reportReady = function () {
        utils_1.invariant(this.isDirty, "atom not dirty");
        if (globalstate_1.globalState.inTransaction > 0)
            globalstate_1.globalState.changedAtoms.push(this);
        else {
            propagateAtomReady(this);
            reaction_1.runReactions();
        }
    };
    BaseAtom.prototype.toString = function () {
        return this.name;
    };
    return BaseAtom;
}());
exports.BaseAtom = BaseAtom;
var Atom = (function (_super) {
    __extends(Atom, _super);
    /**
     * Create a new atom. For debugging purposes it is recommended to give it a name.
     * The onBecomeObserved and onBecomeUnobserved callbacks can be used for resource management.
     */
    function Atom(name, onBecomeObservedHandler, onBecomeUnobservedHandler) {
        if (name === void 0) { name = "Atom@" + utils_1.getNextId(); }
        if (onBecomeObservedHandler === void 0) { onBecomeObservedHandler = utils_1.noop; }
        if (onBecomeUnobservedHandler === void 0) { onBecomeUnobservedHandler = utils_1.noop; }
        _super.call(this, name);
        this.name = name;
        this.onBecomeObservedHandler = onBecomeObservedHandler;
        this.onBecomeUnobservedHandler = onBecomeUnobservedHandler;
        this.isBeingTracked = false;
    }
    Atom.prototype.reportObserved = function () {
        _super.prototype.reportObserved.call(this);
        var tracking = globalstate_1.globalState.isTracking;
        if (tracking && !this.isBeingTracked) {
            this.isBeingTracked = true;
            this.onBecomeObservedHandler();
        }
        return tracking;
    };
    Atom.prototype.onBecomeUnobserved = function () {
        this.isBeingTracked = false;
        this.onBecomeUnobservedHandler();
    };
    return Atom;
}(BaseAtom));
exports.Atom = Atom;
var globalstate_1 = require("./globalstate");
var observable_1 = require("./observable");
var reaction_1 = require("./reaction");
var utils_1 = require("../utils/utils");
var set_1 = require("../utils/set");
