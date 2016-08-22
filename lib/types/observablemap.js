"use strict";
var modifiers_1 = require("./modifiers");
var transaction_1 = require("../core/transaction");
var derivation_1 = require("../core/derivation");
var observablearray_1 = require("./observablearray");
var observablevalue_1 = require("./observablevalue");
var utils_1 = require("../utils/utils");
var action_1 = require("../core/action");
var intercept_utils_1 = require("./intercept-utils");
var listen_utils_1 = require("./listen-utils");
var spy_1 = require("../core/spy");
var iterable_1 = require("../utils/iterable");
var ObservableMapMarker = {};
var ObservableMap = (function () {
    function ObservableMap(initialData, valueModeFunc) {
        var _this = this;
        this.$mobx = ObservableMapMarker;
        this._data = {};
        this._hasMap = {}; // hasMap, not hashMap >-).
        this.name = "ObservableMap@" + utils_1.getNextId();
        this._keys = new observablearray_1.ObservableArray(null, modifiers_1.ValueMode.Reference, this.name + ".keys()", true);
        this.interceptors = null;
        this.changeListeners = null;
        this._valueMode = modifiers_1.getValueModeFromModifierFunc(valueModeFunc);
        if (this._valueMode === modifiers_1.ValueMode.Flat)
            this._valueMode = modifiers_1.ValueMode.Reference; // TODO: modifiers really need a clean up!
        action_1.allowStateChanges(true, function () {
            if (utils_1.isPlainObject(initialData))
                _this.merge(initialData);
            else if (Array.isArray(initialData))
                initialData.forEach(function (_a) {
                    var key = _a[0], value = _a[1];
                    return _this.set(key, value);
                });
        });
    }
    ObservableMap.prototype._has = function (key) {
        return typeof this._data[key] !== "undefined";
    };
    ObservableMap.prototype.has = function (key) {
        if (!this.isValidKey(key))
            return false;
        key = "" + key;
        if (this._hasMap[key])
            return this._hasMap[key].get();
        return this._updateHasMapEntry(key, false).get();
    };
    ObservableMap.prototype.set = function (key, value) {
        this.assertValidKey(key);
        key = "" + key;
        var hasKey = this._has(key);
        modifiers_1.assertUnwrapped(value, "[mobx.map.set] Expected unwrapped value to be inserted to key '" + key + "'. If you need to use modifiers pass them as second argument to the constructor");
        if (intercept_utils_1.hasInterceptors(this)) {
            var change = intercept_utils_1.interceptChange(this, {
                type: hasKey ? "update" : "add",
                object: this,
                newValue: value,
                name: key
            });
            if (!change)
                return;
            value = change.newValue;
        }
        if (hasKey) {
            this._updateValue(key, value);
        }
        else {
            this._addValue(key, value);
        }
    };
    ObservableMap.prototype.delete = function (key) {
        var _this = this;
        this.assertValidKey(key);
        key = "" + key;
        if (intercept_utils_1.hasInterceptors(this)) {
            var change = intercept_utils_1.interceptChange(this, {
                type: "delete",
                object: this,
                name: key
            });
            if (!change)
                return;
        }
        if (this._has(key)) {
            var notifySpy = spy_1.isSpyEnabled();
            var notify = listen_utils_1.hasListeners(this);
            var change = notify || notifySpy ? {
                type: "delete",
                object: this,
                oldValue: this._data[key].value,
                name: key
            } : null;
            if (notifySpy)
                spy_1.spyReportStart(change);
            transaction_1.transaction(function () {
                _this._keys.remove(key);
                _this._updateHasMapEntry(key, false);
                var observable = _this._data[key];
                observable.setNewValue(undefined);
                _this._data[key] = undefined;
            }, undefined, false);
            if (notify)
                listen_utils_1.notifyListeners(this, change);
            if (notifySpy)
                spy_1.spyReportEnd();
        }
    };
    ObservableMap.prototype._updateHasMapEntry = function (key, value) {
        // optimization; don't fill the hasMap if we are not observing, or remove entry if there are no observers anymore
        var entry = this._hasMap[key];
        if (entry) {
            entry.setNewValue(value);
        }
        else {
            entry = this._hasMap[key] = new observablevalue_1.ObservableValue(value, modifiers_1.ValueMode.Reference, this.name + "." + key + "?", false);
        }
        return entry;
    };
    ObservableMap.prototype._updateValue = function (name, newValue) {
        var observable = this._data[name];
        newValue = observable.prepareNewValue(newValue);
        if (newValue !== observablevalue_1.UNCHANGED) {
            var notifySpy = spy_1.isSpyEnabled();
            var notify = listen_utils_1.hasListeners(this);
            var change = notify || notifySpy ? {
                type: "update",
                object: this,
                oldValue: observable.value,
                name: name, newValue: newValue
            } : null;
            if (notifySpy)
                spy_1.spyReportStart(change);
            observable.setNewValue(newValue);
            if (notify)
                listen_utils_1.notifyListeners(this, change);
            if (notifySpy)
                spy_1.spyReportEnd();
        }
    };
    ObservableMap.prototype._addValue = function (name, newValue) {
        var _this = this;
        transaction_1.transaction(function () {
            var observable = _this._data[name] = new observablevalue_1.ObservableValue(newValue, _this._valueMode, _this.name + "." + name, false);
            newValue = observable.value; // value might have been changed
            _this._updateHasMapEntry(name, true);
            _this._keys.push(name);
        }, undefined, false);
        var notifySpy = spy_1.isSpyEnabled();
        var notify = listen_utils_1.hasListeners(this);
        var change = notify || notifySpy ? {
            type: "add",
            object: this,
            name: name, newValue: newValue
        } : null;
        if (notifySpy)
            spy_1.spyReportStart(change);
        if (notify)
            listen_utils_1.notifyListeners(this, change);
        if (notifySpy)
            spy_1.spyReportEnd();
    };
    ObservableMap.prototype.get = function (key) {
        key = "" + key;
        if (this.has(key))
            return this._data[key].get();
        return undefined;
    };
    ObservableMap.prototype.keys = function () {
        return iterable_1.arrayAsIterator(this._keys.slice());
    };
    ObservableMap.prototype.values = function () {
        return iterable_1.arrayAsIterator(this._keys.map(this.get, this));
    };
    ObservableMap.prototype.entries = function () {
        var _this = this;
        return iterable_1.arrayAsIterator(this._keys.map(function (key) { return [key, _this.get(key)]; }));
    };
    ObservableMap.prototype.forEach = function (callback, thisArg) {
        var _this = this;
        this.keys().forEach(function (key) { return callback.call(thisArg, _this.get(key), key); });
    };
    /** Merge another object into this object, returns this. */
    ObservableMap.prototype.merge = function (other) {
        var _this = this;
        transaction_1.transaction(function () {
            if (other instanceof ObservableMap)
                other.keys().forEach(function (key) { return _this.set(key, other.get(key)); });
            else
                Object.keys(other).forEach(function (key) { return _this.set(key, other[key]); });
        }, undefined, false);
        return this;
    };
    ObservableMap.prototype.clear = function () {
        var _this = this;
        transaction_1.transaction(function () {
            derivation_1.untracked(function () {
                _this.keys().forEach(_this.delete, _this);
            });
        }, undefined, false);
    };
    Object.defineProperty(ObservableMap.prototype, "size", {
        get: function () {
            return this._keys.length;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Returns a shallow non observable object clone of this map.
     * Note that the values migth still be observable. For a deep clone use mobx.toJS.
     */
    ObservableMap.prototype.toJS = function () {
        var _this = this;
        var res = {};
        this.keys().forEach(function (key) { return res[key] = _this.get(key); });
        return res;
    };
    ObservableMap.prototype.toJs = function () {
        utils_1.deprecated("toJs is deprecated, use toJS instead");
        return this.toJS();
    };
    ObservableMap.prototype.toJSON = function () {
        // Used by JSON.stringify
        return this.toJS();
    };
    ObservableMap.prototype.isValidKey = function (key) {
        if (key === null || key === undefined)
            return false;
        if (typeof key !== "string" && typeof key !== "number" && typeof key !== "boolean")
            return false;
        return true;
    };
    ObservableMap.prototype.assertValidKey = function (key) {
        if (!this.isValidKey(key))
            throw new Error("[mobx.map] Invalid key: '" + key + "'");
    };
    ObservableMap.prototype.toString = function () {
        var _this = this;
        return this.name + "[{ " + this.keys().map(function (key) { return (key + ": " + ("" + _this.get(key))); }).join(", ") + " }]";
    };
    /**
     * Observes this object. Triggers for the events 'add', 'update' and 'delete'.
     * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/observe
     * for callback details
     */
    ObservableMap.prototype.observe = function (listener, fireImmediately) {
        utils_1.invariant(fireImmediately !== true, "`observe` doesn't support the fire immediately property for observable maps.");
        return listen_utils_1.registerListener(this, listener);
    };
    ObservableMap.prototype.intercept = function (handler) {
        return intercept_utils_1.registerInterceptor(this, handler);
    };
    return ObservableMap;
}());
exports.ObservableMap = ObservableMap;
iterable_1.declareIterator(ObservableMap.prototype, function () {
    return this.entries();
});
/**
 * Creates a map, similar to ES6 maps (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map),
 * yet observable.
 */
function map(initialValues, valueModifier) {
    return new ObservableMap(initialValues, valueModifier);
}
exports.map = map;
function isObservableMap(thing) {
    return thing instanceof ObservableMap;
}
exports.isObservableMap = isObservableMap;
