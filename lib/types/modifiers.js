"use strict";
var utils_1 = require("../utils/utils");
var isobservable_1 = require("../api/isobservable");
var extendobservable_1 = require("../api/extendobservable");
var observablearray_1 = require("../types/observablearray");
var observablemap_1 = require("../types/observablemap");
(function (ValueMode) {
    ValueMode[ValueMode["Recursive"] = 0] = "Recursive";
    ValueMode[ValueMode["Reference"] = 1] = "Reference";
    ValueMode[ValueMode["Structure"] = 2] = "Structure";
    // No observers will be triggered if a new value is assigned (to a part of the tree) that deeply equals the old value.
    ValueMode[ValueMode["Flat"] = 3] = "Flat"; // If the value is an plain object, it will be made reactive, and so will all its future children.
})(exports.ValueMode || (exports.ValueMode = {}));
var ValueMode = exports.ValueMode;
/**
    * Can be used in combination with makeReactive / extendReactive.
    * Enforces that a reference to 'value' is stored as property,
    * but that 'value' itself is not turned into something reactive.
    * Future assignments to the same property will inherit this behavior.
    * @param value initial value of the reactive property that is being defined.
    */
function asReference(value) {
    // unsound typecast, but in combination with makeReactive, the end result should be of the correct type this way
    // e.g: makeReactive({ x : asReference(number)}) -> { x : number }
    return new AsReference(value);
}
exports.asReference = asReference;
/**
    * Can be used in combination with makeReactive / extendReactive.
    * Enforces that values that are deeply equalled identical to the previous are considered to unchanged.
    * (the default equality used by mobx is reference equality).
    * Values that are still reference equal, but not deep equal, are considered to be changed.
    * asStructure can only be used incombinations with arrays or objects.
    * It does not support cyclic structures.
    * Future assignments to the same property will inherit this behavior.
    * @param value initial value of the reactive property that is being defined.
    */
function asStructure(value) {
    return new AsStructure(value);
}
exports.asStructure = asStructure;
/**
    * Can be used in combination with makeReactive / extendReactive.
    * The value will be made reactive, but, if the value is an object or array,
    * children will not automatically be made reactive as well.
    */
function asFlat(value) {
    return new AsFlat(value);
}
exports.asFlat = asFlat;
var AsReference = (function () {
    function AsReference(value) {
        this.value = value;
        assertUnwrapped(value, "Modifiers are not allowed to be nested");
    }
    return AsReference;
}());
exports.AsReference = AsReference;
var AsStructure = (function () {
    function AsStructure(value) {
        this.value = value;
        assertUnwrapped(value, "Modifiers are not allowed to be nested");
    }
    return AsStructure;
}());
exports.AsStructure = AsStructure;
var AsFlat = (function () {
    function AsFlat(value) {
        this.value = value;
        assertUnwrapped(value, "Modifiers are not allowed to be nested");
    }
    return AsFlat;
}());
exports.AsFlat = AsFlat;
function asMap(data, modifierFunc) {
    return observablemap_1.map(data, modifierFunc);
}
exports.asMap = asMap;
function getValueModeFromValue(value, defaultMode) {
    if (value instanceof AsReference)
        return [ValueMode.Reference, value.value];
    if (value instanceof AsStructure)
        return [ValueMode.Structure, value.value];
    if (value instanceof AsFlat)
        return [ValueMode.Flat, value.value];
    return [defaultMode, value];
}
exports.getValueModeFromValue = getValueModeFromValue;
function getValueModeFromModifierFunc(func) {
    if (func === asReference)
        return ValueMode.Reference;
    else if (func === asStructure)
        return ValueMode.Structure;
    else if (func === asFlat)
        return ValueMode.Flat;
    utils_1.invariant(func === undefined, "Cannot determine value mode from function. Please pass in one of these: mobx.asReference, mobx.asStructure or mobx.asFlat, got: " + func);
    return ValueMode.Recursive;
}
exports.getValueModeFromModifierFunc = getValueModeFromModifierFunc;
function makeChildObservable(value, parentMode, name) {
    var childMode;
    if (isobservable_1.isObservable(value))
        return value;
    switch (parentMode) {
        case ValueMode.Reference:
            return value;
        case ValueMode.Flat:
            assertUnwrapped(value, "Items inside 'asFlat' cannot have modifiers");
            childMode = ValueMode.Reference;
            break;
        case ValueMode.Structure:
            assertUnwrapped(value, "Items inside 'asStructure' cannot have modifiers");
            childMode = ValueMode.Structure;
            break;
        case ValueMode.Recursive:
            _a = getValueModeFromValue(value, ValueMode.Recursive), childMode = _a[0], value = _a[1];
            break;
        default:
            utils_1.invariant(false, "Illegal State");
    }
    if (Array.isArray(value))
        return observablearray_1.createObservableArray(value, childMode, name);
    if (utils_1.isPlainObject(value) && Object.isExtensible(value))
        return extendobservable_1.extendObservableHelper(value, value, childMode, name);
    return value;
    var _a;
}
exports.makeChildObservable = makeChildObservable;
function assertUnwrapped(value, message) {
    if (value instanceof AsReference || value instanceof AsStructure || value instanceof AsFlat)
        throw new Error("[mobx] asStructure / asReference / asFlat cannot be used here. " + message);
}
exports.assertUnwrapped = assertUnwrapped;
