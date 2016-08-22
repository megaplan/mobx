"use strict";
var utils_1 = require("../utils/utils");
var type_utils_1 = require("../types/type-utils");
function getDependencyTree(thing, property) {
    return nodeToDependencyTree(type_utils_1.getAtom(thing, property));
}
exports.getDependencyTree = getDependencyTree;
function nodeToDependencyTree(node) {
    var result = {
        name: node.name
    };
    if (node.observing && node.observing.length > 0)
        result.dependencies = utils_1.unique(node.observing).map(nodeToDependencyTree);
    return result;
}
function getObserverTree(thing, property) {
    return nodeToObserverTree(type_utils_1.getAtom(thing, property));
}
exports.getObserverTree = getObserverTree;
function nodeToObserverTree(node) {
    var result = {
        name: node.name
    };
    if (node.observers && node.observers.length > 0)
        result.observers = node.observers.asArray().map(nodeToObserverTree);
    return result;
}
