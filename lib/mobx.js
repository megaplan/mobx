/**
 * (c) Michel Weststrate 2015 - 2016
 * MIT Licensed
 *
 * Welcome to the mobx sources! To get an global overview of how MobX internally works,
 * this is a good place to start:
 * https://medium.com/@mweststrate/becoming-fully-reactive-an-in-depth-explanation-of-mobservable-55995262a254#.xvbh6qd74
 *
 * Source folders:
 * ===============
 *
 * - api/     Most of the public static methods exposed by the module can be found here.
 * - core/    Implementation of the MobX algorithm; atoms, derivations, reactions, dependency trees, optimizations. Cool stuff can be found here.
 * - types/   All the magic that is need to have observable objects, arrays and values is in this folder. Including the modifiers like `asFlat`.
 * - utils/   Utility stuff.
 *
 */
"use strict";
var globalstate_1 = require("./core/globalstate");
globalstate_1.registerGlobals();
var atom_1 = require("./core/atom");
exports.Atom = atom_1.Atom;
exports.BaseAtom = atom_1.BaseAtom;
var reaction_1 = require("./core/reaction");
exports.Reaction = reaction_1.Reaction;
var derivation_1 = require("./core/derivation");
exports.untracked = derivation_1.untracked;
var action_1 = require("./core/action");
exports.useStrict = action_1.useStrict;
var spy_1 = require("./core/spy");
exports.spy = spy_1.spy;
var transaction_1 = require("./core/transaction");
exports.transaction = transaction_1.transaction;
var modifiers_1 = require("./types/modifiers");
exports.asReference = modifiers_1.asReference;
exports.asFlat = modifiers_1.asFlat;
exports.asStructure = modifiers_1.asStructure;
exports.asMap = modifiers_1.asMap;
var observableobject_1 = require("./types/observableobject");
exports.isObservableObject = observableobject_1.isObservableObject;
var observablearray_1 = require("./types/observablearray");
exports.isObservableArray = observablearray_1.isObservableArray;
exports.fastArray = observablearray_1.fastArray;
var observablemap_1 = require("./types/observablemap");
exports.ObservableMap = observablemap_1.ObservableMap;
exports.isObservableMap = observablemap_1.isObservableMap;
exports.map = observablemap_1.map;
var observable_1 = require("./api/observable");
exports.observable = observable_1.observable;
var computeddecorator_1 = require("./api/computeddecorator");
exports.computed = computeddecorator_1.computed;
var isobservable_1 = require("./api/isobservable");
exports.isObservable = isobservable_1.isObservable;
var extendobservable_1 = require("./api/extendobservable");
exports.extendObservable = extendobservable_1.extendObservable;
var observe_1 = require("./api/observe");
exports.observe = observe_1.observe;
var intercept_1 = require("./api/intercept");
exports.intercept = intercept_1.intercept;
var autorun_1 = require("./api/autorun");
exports.autorun = autorun_1.autorun;
exports.autorunAsync = autorun_1.autorunAsync;
exports.autorunUntil = autorun_1.autorunUntil;
exports.when = autorun_1.when;
exports.reaction = autorun_1.reaction;
var action_2 = require("./api/action");
exports.action = action_2.action;
exports.isAction = action_2.isAction;
exports.runInAction = action_2.runInAction;
var expr_1 = require("./api/expr");
exports.expr = expr_1.expr;
var tojs_1 = require("./api/tojs");
exports.toJSON = tojs_1.toJSON;
exports.toJS = tojs_1.toJS;
var createtransformer_1 = require("./api/createtransformer");
exports.createTransformer = createtransformer_1.createTransformer;
var whyrun_1 = require("./api/whyrun");
exports.whyRun = whyrun_1.whyRun;
var set_1 = require("./utils/set");
exports.SimpleSet = set_1.SimpleSet;
var simpleeventemitter_1 = require("./utils/simpleeventemitter");
exports.SimpleEventEmitter = simpleeventemitter_1.SimpleEventEmitter;
var globalstate_2 = require("./core/globalstate");
var extras_1 = require("./api/extras");
var type_utils_1 = require("./types/type-utils");
var action_3 = require("./core/action");
var spy_2 = require("./core/spy");
var derivation_2 = require("./core/derivation");
exports.extras = {
    allowStateChanges: action_3.allowStateChanges,
    getAtom: type_utils_1.getAtom,
    getDebugName: type_utils_1.getDebugName,
    getDependencyTree: extras_1.getDependencyTree,
    getObserverTree: extras_1.getObserverTree,
    isComputingDerivation: derivation_2.isComputingDerivation,
    isSpyEnabled: spy_2.isSpyEnabled,
    resetGlobalState: globalstate_2.resetGlobalState,
    spyReport: spy_2.spyReport,
    spyReportEnd: spy_2.spyReportEnd,
    spyReportStart: spy_2.spyReportStart,
    trackTransitions: spy_2.trackTransitions
};
// Experimental or internal api's (exposed for testing for example)
exports._ = {
    getAdministration: type_utils_1.getAdministration,
    resetGlobalState: globalstate_2.resetGlobalState
};
