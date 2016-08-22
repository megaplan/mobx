"use strict";
var modifiers_1 = require("../types/modifiers");
var observablemap_1 = require("../types/observablemap");
var observableobject_1 = require("../types/observableobject");
var utils_1 = require("../utils/utils");
/**
 * Extends an object with reactive capabilities.
 * @param target the object to which reactive properties should be added
 * @param properties the properties that should be added and made reactive
 * @returns targer
 */
function extendObservable(target) {
    var properties = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        properties[_i - 1] = arguments[_i];
    }
    utils_1.invariant(arguments.length >= 2, "extendObservable expected 2 or more arguments");
    utils_1.invariant(typeof target === "object", "extendObservable expects an object as first argument");
    utils_1.invariant(!(target instanceof observablemap_1.ObservableMap), "extendObservable should not be used on maps, use map.merge instead");
    properties.forEach(function (propSet) {
        utils_1.invariant(typeof propSet === "object", "all arguments of extendObservable should be objects");
        extendObservableHelper(target, propSet, modifiers_1.ValueMode.Recursive, null);
    });
    return target;
}
exports.extendObservable = extendObservable;
function extendObservableHelper(target, properties, mode, name) {
    var adm = observableobject_1.asObservableObject(target, name, mode);
    for (var key in properties)
        if (properties.hasOwnProperty(key)) {
            if (target === properties && !utils_1.isPropertyConfigurable(target, key))
                continue; // see #111, skip non-configurable or non-writable props for `observable(object)`.
            observableobject_1.setObservableObjectInstanceProperty(adm, key, properties[key]);
        }
    return target;
}
exports.extendObservableHelper = extendObservableHelper;
