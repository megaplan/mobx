"use strict";
var utils_1 = require("./utils");
function iteratorSymbol() {
    return (typeof Symbol === "function" && Symbol.iterator) || "@@iterator";
}
exports.IS_ITERATING_MARKER = "__$$iterating";
function arrayAsIterator(array) {
    // TODO: this should be removed in the next major version of MobX
    // returning an array for entries(), values() etc for maps was a mis-interpretation of the specs..
    utils_1.invariant(array[exports.IS_ITERATING_MARKER] !== true, "Illegal state: cannot recycle array as iterator");
    utils_1.addHiddenFinalProp(array, exports.IS_ITERATING_MARKER, true);
    var idx = -1;
    utils_1.addHiddenFinalProp(array, "next", function next() {
        idx++;
        return {
            done: idx >= this.length,
            value: idx < this.length ? this[idx] : undefined
        };
    });
    return array;
}
exports.arrayAsIterator = arrayAsIterator;
function declareIterator(prototType, iteratorFactory) {
    utils_1.addHiddenFinalProp(prototType, iteratorSymbol(), iteratorFactory);
}
exports.declareIterator = declareIterator;
