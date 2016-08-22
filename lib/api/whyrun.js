"use strict";
var globalstate_1 = require("../core/globalstate");
var computedvalue_1 = require("../core/computedvalue");
var reaction_1 = require("../core/reaction");
var type_utils_1 = require("../types/type-utils");
var utils_1 = require("../utils/utils");
function log(msg) {
    console.log(msg);
    return msg;
}
function whyRun(thing, prop) {
    switch (arguments.length) {
        case 0:
            thing = globalstate_1.globalState.derivationStack[globalstate_1.globalState.derivationStack.length - 1];
            if (!thing)
                return log("whyRun() can only be used if a derivation is active, or by passing an computed value / reaction explicitly. If you invoked whyRun from inside a computation; the computation is currently suspended but re-evaluating because somebody requested it's value.");
            break;
        case 2:
            thing = type_utils_1.getAtom(thing, prop);
            break;
    }
    thing = type_utils_1.getAtom(thing);
    if (thing instanceof computedvalue_1.ComputedValue)
        return log(thing.whyRun());
    else if (thing instanceof reaction_1.Reaction)
        return log(thing.whyRun());
    else
        utils_1.invariant(false, "whyRun can only be used on reactions and computed values");
}
exports.whyRun = whyRun;
