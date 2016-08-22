"use strict";
// ... cause .Set is not available in all browsers..
var SimpleSet = (function () {
    function SimpleSet() {
        this.size = 0;
        this.data = {};
    }
    Object.defineProperty(SimpleSet.prototype, "length", {
        get: function () {
            return this.size;
        },
        enumerable: true,
        configurable: true
    });
    SimpleSet.prototype.asArray = function () {
        var res = new Array(this.size);
        var i = 0;
        for (var key in this.data) {
            res[i] = this.data[key];
            i++;
        }
        return res;
    };
    /**
     * @param {T} value
     * @returns {number} new length
     */
    SimpleSet.prototype.add = function (value) {
        var m = value.__mapid;
        if (!(m in this.data)) {
            this.data[m] = value;
            this.size++;
        }
    };
    SimpleSet.prototype.remove = function (value) {
        if (value.__mapid in this.data) {
            delete this.data[value.__mapid];
            this.size--;
        }
    };
    return SimpleSet;
}());
exports.SimpleSet = SimpleSet;
