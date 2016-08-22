"use strict";
var observableobject_1 = require("../types/observableobject");
var observable_1 = require("./observable");
var utils_1 = require("../utils/utils");
var extendobservable_1 = require("./extendobservable");
var type_utils_1 = require("../types/type-utils");
function intercept(thing, propOrHandler, handler) {
    if (typeof handler === "function")
        return interceptProperty(thing, propOrHandler, handler);
    else
        return interceptInterceptable(thing, propOrHandler);
}
exports.intercept = intercept;
function interceptInterceptable(thing, handler) {
    if (utils_1.isPlainObject(thing) && !observableobject_1.isObservableObject(thing)) {
        utils_1.deprecated("Passing plain objects to intercept / observe is deprecated and will be removed in 3.0");
        return type_utils_1.getAdministration(observable_1.observable(thing)).intercept(handler);
    }
    return type_utils_1.getAdministration(thing).intercept(handler);
}
function interceptProperty(thing, property, handler) {
    if (utils_1.isPlainObject(thing) && !observableobject_1.isObservableObject(thing)) {
        utils_1.deprecated("Passing plain objects to intercept / observe is deprecated and will be removed in 3.0");
        extendobservable_1.extendObservable(thing, {
            property: thing[property]
        });
        return interceptProperty(thing, property, handler);
    }
    return type_utils_1.getAdministration(thing, property).intercept(handler);
}
