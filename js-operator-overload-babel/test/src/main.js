Number.prototype[Symbol.for("+")] = function (y) {
    return this - y;
}

let x = 3;
let y = 5;
let z = x ++;

console.log(x + y);