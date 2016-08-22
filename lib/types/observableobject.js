"use strict";
var observablevalue_1 = require("./observablevalue");
var computedvalue_1 = require("../core/computedvalue");
var action_1 = require("../api/action");
var modifiers_1 = require("./modifiers");
var utils_1 = require("../utils/utils");
var decorators_1 = require("../utils/decorators");
var computeddecorator_1 = require("../api/computeddecorator");
var intercept_utils_1 = require("./intercept-utils");
var listen_utils_1 = require("./listen-utils");
var spy_1 = require("../core/spy");
var ObservableObjectAdministration = (function () {
    function ObservableObjectAdministration(target, name, mode) {
        this.target = target;
        this.name = name;
        this.mode = mode;
        this.values = {};
        this.changeListeners = null;
        this.interceptors = null;
    }
    /**
        * Observes this object. Triggers for the events 'add', 'update' and 'delete'.
        * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/observe
        * for callback details
        */
    ObservableObjectAdministration.prototype.observe = function (callback, fireImmediately) {
        utils_1.invariant(fireImmediately !== true, "`observe` doesn't support the fire immediately property for observable objects.");
        return listen_utils_1.registerListener(this, callback);
    };
    ObservableObjectAdministration.prototype.intercept = function (handler) {
        return intercept_utils_1.registerInterceptor(this, handler);
    };
    return ObservableObjectAdministration;
}());
exports.ObservableObjectAdministration = ObservableObjectAdministration;
function asObservableObject(target, name, mode) {
    if (mode === void 0) { mode = modifiers_1.ValueMode.Recursive; }
    if (isObservableObject(target))
        return target.$mobx;
    if (!utils_1.isPlainObject(target))
        name = target.constructor.name + "@" + utils_1.getNextId();
    if (!name)
        name = "ObservableObject@" + utils_1.getNextId();
    var adm = new ObservableObjectAdministration(target, name, mode);
    utils_1.addHiddenFinalProp(target, "$mobx", adm);
    return adm;
}
exports.asObservableObject = asObservableObject;
function setObservableObjectInstanceProperty(adm, propName, value) {
    if (adm.values[propName])
        adm.target[propName] = value; // the property setter will make 'value' reactive if needed.
    else
        defineObservableProperty(adm, propName, value, true);
}
exports.setObservableObjectInstanceProperty = setObservableObjectInstanceProperty;
function defineObservableProperty(adm, propName, newValue, asInstanceProperty) {
    if (asInstanceProperty)
        utils_1.assertPropertyConfigurable(adm.target, propName);
    var observable;
    var name = adm.name + "." + propName;
    var isComputed = true;
    if (typeof newValue === "function" && newValue.length === 0 && !action_1.isAction(newValue))
        observable = new computedvalue_1.ComputedValue(newValue, adm.target, false, name);
    else if (newValue instanceof modifiers_1.AsStructure && typeof newValue.value === "function" && newValue.value.length === 0)
        observable = new computedvalue_1.ComputedValue(newValue.value, adm.target, true, name);
    else {
        isComputed = false;
        if (intercept_utils_1.hasInterceptors(adm)) {
            var change = intercept_utils_1.interceptChange(adm, {
                object: adm.target,
                name: propName,
                type: "add",
                newValue: newValue
            });
            if (!change)
                return;
            newValue = change.newValue;
        }
        observable = new observablevalue_1.ObservableValue(newValue, adm.mode, name, false);
        newValue = observable.value; // observableValue might have changed it
    }
    adm.values[propName] = observable;
    if (asInstanceProperty) {
        Object.defineProperty(adm.target, propName, isComputed ? generateComputedPropConfig(propName) : generateObservablePropConfig(propName));
    }
    if (!isComputed)
        notifyPropertyAddition(adm, adm.target, propName, newValue);
}
exports.defineObservableProperty = defineObservableProperty;
var observablePropertyConfigs = {};
var computedPropertyConfigs = {};
function generateObservablePropConfig(propName) {
    var config = observablePropertyConfigs[propName];
    if (config)
        return config;
    return observablePropertyConfigs[propName] = {
        configurable: true,
        enumerable: true,
        get: function () {
            return this.$mobx.values[propName].get();
        },
        set: function (v) {
            setPropertyValue(this, propName, v);
        }
    };
}
exports.generateObservablePropConfig = generateObservablePropConfig;
function generateComputedPropConfig(propName) {
    var config = computedPropertyConfigs[propName];
    if (config)
        return config;
    return computedPropertyConfigs[propName] = {
        configurable: true,
        enumerable: false,
        get: function () {
            return this.$mobx.values[propName].get();
        },
        set: computeddecorator_1.throwingComputedValueSetter
    };
}
exports.generateComputedPropConfig = generateComputedPropConfig;
function setPropertyValue(instance, name, newValue) {
    var adm = instance.$mobx;
    var observable = adm.values[name];
    // intercept
    if (intercept_utils_1.hasInterceptors(adm)) {
        var change = intercept_utils_1.interceptChange(adm, {
            type: "update",
            object: instance,
            name: name, newValue: newValue
        });
        if (!change)
            return;
        newValue = change.newValue;
    }
    newValue = observable.prepareNewValue(newValue);
    // notify spy & observers
    if (newValue !== observablevalue_1.UNCHANGED) {
        var notify = listen_utils_1.hasListeners(adm);
        var notifySpy = spy_1.isSpyEnabled();
        var change = listen_utils_1.notifyListeners || listen_utils_1.hasListeners ? {
            type: "update",
            object: instance,
            oldValue: observable.value,
            name: name, newValue: newValue
        } : null;
        if (notifySpy)
            spy_1.spyReportStart(change);
        observable.setNewValue(newValue);
        if (notify)
            listen_utils_1.notifyListeners(adm, change);
        if (notifySpy)
            spy_1.spyReportEnd();
    }
}
exports.setPropertyValue = setPropertyValue;
function notifyPropertyAddition(adm, object, name, newValue) {
    var notify = listen_utils_1.hasListeners(adm);
    var notifySpy = spy_1.isSpyEnabled();
    var change = notify || notifySpy ? {
        type: "add",
        object: object, name: name, newValue: newValue
    } : null;
    if (notifySpy)
        spy_1.spyReportStart(change);
    if (notify)
        listen_utils_1.notifyListeners(adm, change);
    if (notifySpy)
        spy_1.spyReportEnd();
}
function isObservableObject(thing) {
    if (typeof thing === "object" && thing !== null) {
        // Initializers run lazily when transpiling to babel, so make sure they are run...
        decorators_1.runLazyInitializers(thing);
        return thing.$mobx instanceof ObservableObjectAdministration;
    }
    return false;
}
exports.isObservableObject = isObservableObject;
