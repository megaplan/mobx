"use strict";
/**
 * These values will persist if global state is reset
 */
var persistentKeys = ["mobxGuid", "resetId", "spyListeners", "strictMode", "runId"];
var MobXGlobals = (function () {
    function MobXGlobals() {
        /**
         * MobXGlobals version.
         * MobX compatiblity with other versions loaded in memory as long as this version matches.
         * It indicates that the global state still stores similar information
         */
        this.version = 3;
        /**
         * Stack of currently running derivations
         */
        this.derivationStack = [];
        /**
         * Each time a derivation is tracked, it is assigned a unique run-id
         */
        this.runId = 0;
        /**
         * 'guid' for general purpose. Will be persisted amongst resets.
         */
        this.mobxGuid = 0;
        /**
         * Are we in a transaction block? (and how many of them)
         */
        this.inTransaction = 0;
        /**
         * Are we in an (un)tracked block?
         */
        this.isTracking = false;
        /**
         * Are we currently running reactions?
         * Reactions are run after derivations using a trampoline.
         */
        this.isRunningReactions = false;
        /**
         * List of observables that have changed in a transaction.
         * After completing the transaction(s) these atoms will notify their observers.
         */
        this.changedAtoms = [];
        /**
         * List of scheduled, not yet executed, reactions.
         */
        this.pendingReactions = [];
        /**
         * Is it allowed to change observables at this point?
         * In general, MobX doesn't allow that when running computations and React.render.
         * To ensure that those functions stay pure.
         */
        this.allowStateChanges = true;
        /**
         * If strict mode is enabled, state changes are by default not allowed
         */
        this.strictMode = false;
        /**
         * Used by createTransformer to detect that the global state has been reset.
         */
        this.resetId = 0;
        /**
         * Spy callbacks
         */
        this.spyListeners = [];
    }
    return MobXGlobals;
}());
exports.MobXGlobals = MobXGlobals;
exports.globalState = (function () {
    var res = new MobXGlobals();
    /**
     * Backward compatibility check
     */
    if (global.__mobservableTrackingStack || global.__mobservableViewStack)
        throw new Error("[mobx] An incompatible version of mobservable is already loaded.");
    if (global.__mobxGlobal && global.__mobxGlobal.version !== res.version)
        throw new Error("[mobx] An incompatible version of mobx is already loaded.");
    if (global.__mobxGlobal)
        return global.__mobxGlobal;
    return global.__mobxGlobal = res;
})();
function registerGlobals() {
    // no-op to make explicit why this file is loaded
}
exports.registerGlobals = registerGlobals;
/**
 * For testing purposes only; this will break the internal state of existing observables,
 * but can be used to get back at a stable state after throwing errors
 */
function resetGlobalState() {
    exports.globalState.resetId++;
    var defaultGlobals = new MobXGlobals();
    for (var key in defaultGlobals)
        if (persistentKeys.indexOf(key) === -1)
            exports.globalState[key] = defaultGlobals[key];
    exports.globalState.allowStateChanges = !exports.globalState.strictMode;
}
exports.resetGlobalState = resetGlobalState;
