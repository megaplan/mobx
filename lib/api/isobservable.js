"use strict";
var observablearray_1 = require("../types/observablearray");
var observablemap_1 = require("../types/observablemap");
var observableobject_1 = require("../types/observableobject");
var atom_1 = require("../core/atom");
var computedvalue_1 = require("../core/computedvalue");
var reaction_1 = require("../core/reaction");
/**
    * Returns true if the provided value is reactive.
    * @param value object, function or array
    * @param propertyName if propertyName is specified, checkes whether value.propertyName is reactive.
    */
function isObservable(value, property) {
    if (value === null || value === undefined)
        return false;
    if (property !== undefined) {
        if (value instanceof observablemap_1.ObservableMap || value instanceof observablearray_1.ObservableArray)
            throw new Error("[mobx.isObservable] isObservable(object, propertyName) is not supported for arrays and maps. Use map.has or array.length instead.");
        else if (observableobject_1.isObservableObject(value)) {
            var o = value.$mobx;
            return o.values && !!o.values[property];
        }
        return false;
    }
    return !!value.$mobx || value instanceof atom_1.BaseAtom || value instanceof reaction_1.Reaction || value instanceof computedvalue_1.ComputedValue;
}
exports.isObservable = isObservable;
