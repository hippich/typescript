//// [assignments.js]
// In this file:
//  Assign to a module
//  Assign to a class
//  Assign to an enum
//  Assign to a function
//  Assign to a variable
//  Assign to a parameter
//  Assign to an interface
M = null; // Error

var C = (function () {
    function C() {
    }
    return C;
})();
C = null; // Error

var E;
(function (E) {
    E[E["A"] = 0] = "A";
})(E || (E = {}));
E = null; // Error
0 /* A */ = null; // OK per spec, Error per implementation (509581)

function fn() {
}
fn = null; // Should be error

var v;
v = null; // OK

function fn2(p) {
    p = null; // OK
}

I = null; // Error
