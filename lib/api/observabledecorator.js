"use strict";
var modifiers_1 = require("../types/modifiers");
var action_1 = require("../core/action");
var observableobject_1 = require("../types/observableobject");
var utils_1 = require("../utils/utils");
var decorators_1 = require("../utils/decorators");
var decoratorImpl = decorators_1.createClassPropertyDecorator(function (target, name, baseValue) {
    // might happen lazily (on first read), so temporarily allow state changes..
    var prevA = action_1.allowStateChangesStart(true);
    if (typeof baseValue === "function")
        baseValue = modifiers_1.asReference(baseValue);
    var adm = observableobject_1.asObservableObject(target, undefined, modifiers_1.ValueMode.Recursive);
    observableobject_1.defineObservableProperty(adm, name, baseValue, true);
    action_1.allowStateChangesEnd(prevA);
}, function (name) {
    return this.$mobx.values[name].get();
}, function (name, value) {
    observableobject_1.setPropertyValue(this, name, value);
}, true, false);
/**
 * ESNext / Typescript decorator which can to make class properties and getter functions reactive.
 * Use this annotation to wrap properties of an object in an observable, for example:
 * class OrderLine {
 *   @observable amount = 3;
 *   @observable price = 2;
 *   @observable total() {
 *      return this.amount * this.price;
 *   }
 * }
 */
function observableDecorator(target, key, baseDescriptor) {
    utils_1.invariant(arguments.length >= 2 && arguments.length <= 3, "Illegal decorator config", key);
    utils_1.assertPropertyConfigurable(target, key);
    utils_1.invariant(!baseDescriptor || !baseDescriptor.get, "@observable can not be used on getters, use @computed instead");
    return decoratorImpl.apply(null, arguments);
}
exports.observableDecorator = observableDecorator;
