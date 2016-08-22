"use strict";
var observableobject_1 = require("../types/observableobject");
var observable_1 = require("./observable");
var utils_1 = require("../utils/utils");
var extendobservable_1 = require("./extendobservable");
var type_utils_1 = require("../types/type-utils");
function observe(thing, propOrCb, cbOrFire, fireImmediately) {
    if (typeof cbOrFire === "function")
        return observeObservableProperty(thing, propOrCb, cbOrFire, fireImmediately);
    else
        return observeObservable(thing, propOrCb, cbOrFire);
}
exports.observe = observe;
function observeObservable(thing, listener, fireImmediately) {
    if (utils_1.isPlainObject(thing) && !observableobject_1.isObservableObject(thing)) {
        utils_1.deprecated("Passing plain objects to intercept / observe is deprecated and will be removed in 3.0");
        return type_utils_1.getAdministration(observable_1.observable(thing)).observe(listener, fireImmediately);
    }
    return type_utils_1.getAdministration(thing).observe(listener, fireImmediately);
}
function observeObservableProperty(thing, property, listener, fireImmediately) {
    if (utils_1.isPlainObject(thing) && !observableobject_1.isObservableObject(thing)) {
        utils_1.deprecated("Passing plain objects to intercept / observe is deprecated and will be removed in 3.0");
        extendobservable_1.extendObservable(thing, {
            property: thing[property]
        });
        return observeObservableProperty(thing, property, listener, fireImmediately);
    }
    return type_utils_1.getAdministration(thing, property).observe(listener, fireImmediately);
}
