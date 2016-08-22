"use strict";
var observablearray_1 = require("../types/observablearray");
var observablemap_1 = require("../types/observablemap");
var observablevalue_1 = require("../types/observablevalue");
var isobservable_1 = require("../api/isobservable");
var utils_1 = require("../utils/utils");
/**
    * Basically, a deep clone, so that no reactive property will exist anymore.
    */
function toJS(source, detectCycles, __alreadySeen) {
    if (detectCycles === void 0) { detectCycles = true; }
    if (__alreadySeen === void 0) { __alreadySeen = null; }
    // optimization: using ES6 map would be more efficient!
    function cache(value) {
        if (detectCycles)
            __alreadySeen.push([source, value]);
        return value;
    }
    if (source instanceof Date || source instanceof RegExp)
        return source;
    if (detectCycles && __alreadySeen === null)
        __alreadySeen = [];
    if (detectCycles && source !== null && typeof source === "object") {
        for (var i = 0, l = __alreadySeen.length; i < l; i++)
            if (__alreadySeen[i][0] === source)
                return __alreadySeen[i][1];
    }
    if (!source)
        return source;
    if (Array.isArray(source) || source instanceof observablearray_1.ObservableArray) {
        var res = cache([]);
        var toAdd = source.map(function (value) { return toJS(value, detectCycles, __alreadySeen); });
        res.length = toAdd.length;
        for (var i = 0, l = toAdd.length; i < l; i++)
            res[i] = toAdd[i];
        return res;
    }
    if (source instanceof observablemap_1.ObservableMap) {
        var res_1 = cache({});
        source.forEach(function (value, key) { return res_1[key] = toJS(value, detectCycles, __alreadySeen); });
        return res_1;
    }
    if (isobservable_1.isObservable(source) && source.$mobx instanceof observablevalue_1.ObservableValue)
        return toJS(source(), detectCycles, __alreadySeen);
    if (source instanceof observablevalue_1.ObservableValue)
        return toJS(source.get(), detectCycles, __alreadySeen);
    if (typeof source === "object") {
        var res = cache({});
        for (var key in source)
            res[key] = toJS(source[key], detectCycles, __alreadySeen);
        return res;
    }
    return source;
}
exports.toJS = toJS;
function toJSON(source, detectCycles, __alreadySeen) {
    if (detectCycles === void 0) { detectCycles = true; }
    if (__alreadySeen === void 0) { __alreadySeen = null; }
    utils_1.deprecated("toJSON is deprecated. Use toJS instead");
    return toJS.apply(null, arguments);
}
exports.toJSON = toJSON;
