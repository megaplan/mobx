"use strict";
var observablevalue_1 = require("../types/observablevalue");
var modifiers_1 = require("../types/modifiers");
var computeddecorator_1 = require("./computeddecorator");
var utils_1 = require("../utils/utils");
var observabledecorator_1 = require("./observabledecorator");
var isobservable_1 = require("./isobservable");
var observablearray_1 = require("../types/observablearray");
function observable(v, keyOrScope) {
    if (v === void 0) { v = undefined; }
    if (typeof arguments[1] === "string")
        return observabledecorator_1.observableDecorator.apply(null, arguments);
    utils_1.invariant(arguments.length < 3, "observable expects zero, one or two arguments");
    if (isobservable_1.isObservable(v))
        return v;
    var _a = modifiers_1.getValueModeFromValue(v, modifiers_1.ValueMode.Recursive), mode = _a[0], value = _a[1];
    var sourceType = mode === modifiers_1.ValueMode.Reference ? ValueType.Reference : getTypeOfValue(value);
    switch (sourceType) {
        case ValueType.Array:
        case ValueType.PlainObject:
            return modifiers_1.makeChildObservable(value, mode);
        case ValueType.Reference:
        case ValueType.ComplexObject:
            return new observablevalue_1.ObservableValue(value, mode);
        case ValueType.ComplexFunction:
            throw new Error("[mobx.observable] To be able to make a function reactive it should not have arguments. If you need an observable reference to a function, use `observable(asReference(f))`");
        case ValueType.ViewFunction:
            utils_1.deprecated("Use `computed(expr)` instead of `observable(expr)`");
            return computeddecorator_1.computed(v, keyOrScope);
    }
    utils_1.invariant(false, "Illegal State");
}
exports.observable = observable;
(function (ValueType) {
    ValueType[ValueType["Reference"] = 0] = "Reference";
    ValueType[ValueType["PlainObject"] = 1] = "PlainObject";
    ValueType[ValueType["ComplexObject"] = 2] = "ComplexObject";
    ValueType[ValueType["Array"] = 3] = "Array";
    ValueType[ValueType["ViewFunction"] = 4] = "ViewFunction";
    ValueType[ValueType["ComplexFunction"] = 5] = "ComplexFunction";
})(exports.ValueType || (exports.ValueType = {}));
var ValueType = exports.ValueType;
function getTypeOfValue(value) {
    if (value === null || value === undefined)
        return ValueType.Reference;
    if (typeof value === "function")
        return value.length ? ValueType.ComplexFunction : ValueType.ViewFunction;
    if (Array.isArray(value) || value instanceof observablearray_1.ObservableArray)
        return ValueType.Array;
    if (typeof value === "object")
        return utils_1.isPlainObject(value) ? ValueType.PlainObject : ValueType.ComplexObject;
    return ValueType.Reference; // safe default, only refer by reference..
}
exports.getTypeOfValue = getTypeOfValue;
