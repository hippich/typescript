var m1 = require("./ref/m1");
exports.m1 = m1;
exports.a1 = 10;
var c1 = (function () {
    function c1() {
    }
    return c1;
})();
exports.c1 = c1;

exports.instance1 = new c1();
function f1() {
    return exports.instance1;
}
exports.f1 = f1;

exports.a2 = exports.m1.m1_c1;
