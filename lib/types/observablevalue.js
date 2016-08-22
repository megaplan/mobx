"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var atom_1 = require("../core/atom");
var derivation_1 = require("../core/derivation");
var modifiers_1 = require("./modifiers");
var utils_1 = require("../utils/utils");
var intercept_utils_1 = require("./intercept-utils");
var listen_utils_1 = require("./listen-utils");
var spy_1 = require("../core/spy");
exports.UNCHANGED = {};
var ObservableValue = (function (_super) {
    __extends(ObservableValue, _super);
    function ObservableValue(value, mode, name, notifySpy) {
        if (name === void 0) { name = "ObservableValue@" + utils_1.getNextId(); }
        if (notifySpy === void 0) { notifySpy = true; }
        _super.call(this, name);
        this.mode = mode;
        this.hasUnreportedChange = false;
        this.value = undefined;
        var _a = modifiers_1.getValueModeFromValue(value, modifiers_1.ValueMode.Recursive), childmode = _a[0], unwrappedValue = _a[1];
        // If the value mode is recursive, modifiers like 'structure', 'reference', or 'flat' could apply
        if (this.mode === modifiers_1.ValueMode.Recursive)
            this.mode = childmode;
        this.value = modifiers_1.makeChildObservable(unwrappedValue, this.mode, this.name);
        if (notifySpy && spy_1.isSpyEnabled()) {
            // only notify spy if this is a stand-alone observable
            spy_1.spyReport({ type: "create", object: this, newValue: this.value });
        }
    }
    ObservableValue.prototype.set = function (newValue) {
        var oldValue = this.value;
        newValue = this.prepareNewValue(newValue);
        if (newValue !== exports.UNCHANGED) {
            var notifySpy = spy_1.isSpyEnabled();
            if (notifySpy) {
                spy_1.spyReportStart({
                    type: "update",
                    object: this,
                    newValue: newValue, oldValue: oldValue
                });
            }
            this.setNewValue(newValue);
            if (notifySpy)
                spy_1.spyReportEnd();
        }
    };
    ObservableValue.prototype.prepareNewValue = function (newValue) {
        modifiers_1.assertUnwrapped(newValue, "Modifiers cannot be used on non-initial values.");
        derivation_1.checkIfStateModificationsAreAllowed();
        if (intercept_utils_1.hasInterceptors(this)) {
            var change = intercept_utils_1.interceptChange(this, { object: this, type: "update", newValue: newValue });
            if (!change)
                return exports.UNCHANGED;
            newValue = change.newValue;
        }
        var changed = utils_1.valueDidChange(this.mode === modifiers_1.ValueMode.Structure, this.value, newValue);
        if (changed)
            return modifiers_1.makeChildObservable(newValue, this.mode, this.name);
        return exports.UNCHANGED;
    };
    ObservableValue.prototype.setNewValue = function (newValue) {
        var oldValue = this.value;
        this.value = newValue;
        this.reportChanged();
        if (listen_utils_1.hasListeners(this))
            listen_utils_1.notifyListeners(this, [newValue, oldValue]); // in 3.0, use an object instead!
    };
    ObservableValue.prototype.get = function () {
        this.reportObserved();
        return this.value;
    };
    ObservableValue.prototype.intercept = function (handler) {
        return intercept_utils_1.registerInterceptor(this, handler);
    };
    ObservableValue.prototype.observe = function (listener, fireImmediately) {
        if (fireImmediately)
            listener(this.value, undefined);
        return listen_utils_1.registerListener(this, listener);
    };
    ObservableValue.prototype.toJSON = function () {
        return this.get();
    };
    ObservableValue.prototype.toString = function () {
        return this.name + "[" + this.value + "]";
    };
    return ObservableValue;
}(atom_1.BaseAtom));
exports.ObservableValue = ObservableValue;
