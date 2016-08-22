"use strict";
var modifiers_1 = require("../types/modifiers");
var observableobject_1 = require("../types/observableobject");
var utils_1 = require("../utils/utils");
var decorators_1 = require("../utils/decorators");
var computedvalue_1 = require("../core/computedvalue");
var computedDecorator = decorators_1.createClassPropertyDecorator(function (target, name, _, decoratorArgs, originalDescriptor) {
    utils_1.invariant(typeof originalDescriptor !== "undefined", "@computed can only be used on getter functions, like: '@computed get myProps() { return ...; }'. It looks like it was used on a property.");
    var baseValue = originalDescriptor.get;
    utils_1.invariant(typeof baseValue === "function", "@computed can only be used on getter functions, like: '@computed get myProps() { return ...; }'");
    var compareStructural = false;
    if (decoratorArgs && decoratorArgs.length === 1 && decoratorArgs[0].asStructure === true)
        compareStructural = true;
    var adm = observableobject_1.asObservableObject(target, undefined, modifiers_1.ValueMode.Recursive);
    observableobject_1.defineObservableProperty(adm, name, compareStructural ? modifiers_1.asStructure(baseValue) : baseValue, false);
}, function (name) {
    return this.$mobx.values[name].get();
}, throwingComputedValueSetter, false, true);
function computed(targetOrExpr, keyOrScope, baseDescriptor, options) {
    if (arguments.length < 3 && typeof targetOrExpr === "function")
        return computedExpr(targetOrExpr, keyOrScope);
    utils_1.invariant(!baseDescriptor || !baseDescriptor.set, "@observable properties cannot have a setter: " + keyOrScope);
    return computedDecorator.apply(null, arguments);
}
exports.computed = computed;
function computedExpr(expr, scope) {
    var _a = modifiers_1.getValueModeFromValue(expr, modifiers_1.ValueMode.Recursive), mode = _a[0], value = _a[1];
    return new computedvalue_1.ComputedValue(value, scope, mode === modifiers_1.ValueMode.Structure, value.name);
}
function throwingComputedValueSetter() {
    throw new Error("[ComputedValue] It is not allowed to assign new values to computed properties.");
}
exports.throwingComputedValueSetter = throwingComputedValueSetter;
