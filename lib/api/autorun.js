"use strict";
var utils_1 = require("../utils/utils");
var modifiers_1 = require("../types/modifiers");
var reaction_1 = require("../core/reaction");
var derivation_1 = require("../core/derivation");
var action_1 = require("../api/action");
function autorun(arg1, arg2, arg3) {
    var name, view, scope;
    if (typeof arg1 === "string") {
        name = arg1;
        view = arg2;
        scope = arg3;
    }
    else if (typeof arg1 === "function") {
        name = arg1.name || ("Autorun@" + utils_1.getNextId());
        view = arg1;
        scope = arg2;
    }
    modifiers_1.assertUnwrapped(view, "autorun methods cannot have modifiers");
    utils_1.invariant(typeof view === "function", "autorun expects a function");
    if (scope)
        view = view.bind(scope);
    var reaction = new reaction_1.Reaction(name, function () {
        this.track(reactionRunner);
    });
    function reactionRunner() {
        view(reaction);
    }
    reaction.schedule();
    return reaction.getDisposer();
}
exports.autorun = autorun;
function when(arg1, arg2, arg3, arg4) {
    var name, predicate, effect, scope;
    if (typeof arg1 === "string") {
        name = arg1;
        predicate = arg2;
        effect = arg3;
        scope = arg4;
    }
    else if (typeof arg1 === "function") {
        name = ("When@" + utils_1.getNextId());
        predicate = arg1;
        effect = arg2;
        scope = arg3;
    }
    var disposer = autorun(name, function (r) {
        if (predicate.call(scope)) {
            r.dispose();
            var prevUntracked = derivation_1.untrackedStart();
            effect.call(scope);
            derivation_1.untrackedEnd(prevUntracked);
        }
    });
    return disposer;
}
exports.when = when;
function autorunUntil(predicate, effect, scope) {
    utils_1.deprecated("`autorunUntil` is deprecated, please use `when`.");
    return when.apply(null, arguments);
}
exports.autorunUntil = autorunUntil;
function autorunAsync(arg1, arg2, arg3, arg4) {
    var name, func, delay, scope;
    if (typeof arg1 === "string") {
        name = arg1;
        func = arg2;
        delay = arg3;
        scope = arg4;
    }
    else if (typeof arg1 === "function") {
        name = arg1.name || ("AutorunAsync@" + utils_1.getNextId());
        func = arg1;
        delay = arg2;
        scope = arg3;
    }
    if (delay === void 0)
        delay = 1;
    if (scope)
        func = func.bind(scope);
    var isScheduled = false;
    var r = new reaction_1.Reaction(name, function () {
        if (!isScheduled) {
            isScheduled = true;
            setTimeout(function () {
                isScheduled = false;
                if (!r.isDisposed)
                    r.track(reactionRunner);
            }, delay);
        }
    });
    function reactionRunner() { func(r); }
    r.schedule();
    return r.getDisposer();
}
exports.autorunAsync = autorunAsync;
function reaction(arg1, arg2, arg3, arg4, arg5, arg6) {
    var name, expression, effect, fireImmediately, delay, scope;
    if (typeof arg1 === "string") {
        name = arg1;
        expression = arg2;
        effect = arg3;
        fireImmediately = arg4;
        delay = arg5;
        scope = arg6;
    }
    else {
        name = arg1.name || arg2.name || ("Reaction@" + utils_1.getNextId());
        expression = arg1;
        effect = arg2;
        fireImmediately = arg3;
        delay = arg4;
        scope = arg5;
    }
    if (fireImmediately === void 0)
        fireImmediately = false;
    if (delay === void 0)
        delay = 0;
    var _a = modifiers_1.getValueModeFromValue(expression, modifiers_1.ValueMode.Reference), valueMode = _a[0], unwrappedExpression = _a[1];
    var compareStructural = valueMode === modifiers_1.ValueMode.Structure;
    if (scope) {
        unwrappedExpression = unwrappedExpression.bind(scope);
        effect = action_1.action(name, effect.bind(scope));
    }
    var firstTime = true;
    var isScheduled = false;
    var nextValue = undefined;
    var r = new reaction_1.Reaction(name, function () {
        if (delay < 1) {
            reactionRunner();
        }
        else if (!isScheduled) {
            isScheduled = true;
            setTimeout(function () {
                isScheduled = false;
                reactionRunner();
            }, delay);
        }
    });
    function reactionRunner() {
        if (r.isDisposed)
            return;
        var changed = false;
        r.track(function () {
            var v = unwrappedExpression(r);
            changed = utils_1.valueDidChange(compareStructural, nextValue, v);
            nextValue = v;
        });
        if (firstTime && fireImmediately)
            effect(nextValue, r);
        if (!firstTime && changed === true)
            effect(nextValue, r);
        if (firstTime)
            firstTime = false;
    }
    r.schedule();
    return r.getDisposer();
}
exports.reaction = reaction;
