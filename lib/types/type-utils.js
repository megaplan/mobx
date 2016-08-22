"use strict";
var utils_1 = require("../utils/utils");
var decorators_1 = require("../utils/decorators");
var atom_1 = require("../core/atom");
var computedvalue_1 = require("../core/computedvalue");
var reaction_1 = require("../core/reaction");
var observablearray_1 = require("../types/observablearray");
var observablemap_1 = require("../types/observablemap");
var observableobject_1 = require("../types/observableobject");
function getAtom(thing, property) {
    if (typeof thing === "object" && thing !== null) {
        if (observablearray_1.isObservableArray(thing)) {
            utils_1.invariant(property === undefined, "It is not possible to get index atoms from arrays");
            return thing.$mobx.atom;
        }
        if (observablemap_1.isObservableMap(thing)) {
            if (property === undefined)
                return getAtom(thing._keys);
            var observable = thing._data[property] || thing._hasMap[property];
            utils_1.invariant(!!observable, "the entry '" + property + "' does not exist in the observable map '" + getDebugName(thing) + "'");
            return observable;
        }
        // Initializers run lazily when transpiling to babel, so make sure they are run...
        decorators_1.runLazyInitializers(thing);
        if (observableobject_1.isObservableObject(thing)) {
            utils_1.invariant(!!property, "please specify a property");
            var observable = thing.$mobx.values[property];
            utils_1.invariant(!!observable, "no observable property '" + property + "' found on the observable object '" + getDebugName(thing) + "'");
            return observable;
        }
        if (thing instanceof atom_1.BaseAtom || thing instanceof computedvalue_1.ComputedValue || thing instanceof reaction_1.Reaction) {
            return thing;
        }
    }
    else if (typeof thing === "function") {
        if (thing.$mobx instanceof reaction_1.Reaction) {
            // disposer function
            return thing.$mobx;
        }
    }
    utils_1.invariant(false, "Cannot obtain atom from " + thing);
}
exports.getAtom = getAtom;
function getAdministration(thing, property) {
    utils_1.invariant(thing, "Expection some object");
    if (property !== undefined)
        return getAdministration(getAtom(thing, property));
    if (thing instanceof atom_1.BaseAtom || thing instanceof computedvalue_1.ComputedValue || thing instanceof reaction_1.Reaction)
        return thing;
    if (observablemap_1.isObservableMap(thing))
        return thing;
    // Initializers run lazily when transpiling to babel, so make sure they are run...
    decorators_1.runLazyInitializers(thing);
    if (thing.$mobx)
        return thing.$mobx;
    utils_1.invariant(false, "Cannot obtain administration from " + thing);
}
exports.getAdministration = getAdministration;
function getDebugName(thing, property) {
    var named;
    if (property !== undefined)
        named = getAtom(thing, property);
    else if (observableobject_1.isObservableObject(thing) || observablemap_1.isObservableMap(thing))
        named = getAdministration(thing);
    else
        named = getAtom(thing); // valid for arrays as well
    return named.name;
}
exports.getDebugName = getDebugName;
