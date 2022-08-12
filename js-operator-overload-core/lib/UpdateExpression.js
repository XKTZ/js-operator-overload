"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.executeUpdateExpression = void 0;

const {
  isNull,
  notNull
} = require('./Util');

const operatorFunctions = new Map();

const UpdateExpression = (operator, defaults) => {
  const op = Symbol.for(operator);

  const func = a => {
    if (notNull(a) && notNull(a[op])) {
      return a[op]();
    } else {
      return defaults(a);
    }
  };

  operatorFunctions[operator] = func;
  return func;
};

const Increment = UpdateExpression('++', a => ++a);
const Decrement = UpdateExpression('--', a => --a);

const executeUpdateExpression = (op, a) => {
  return operatorFunctions[op](a);
};

exports.executeUpdateExpression = executeUpdateExpression;