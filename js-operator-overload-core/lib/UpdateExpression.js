"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.supportedUpdateExpressionOperators = exports.executeUpdateExpression = void 0;

const {
  isNull,
  notNull
} = require('./Util');

const operatorFunctions = new Map();
const supportedUpdateExpressionOperators = new Set();
exports.supportedUpdateExpressionOperators = supportedUpdateExpressionOperators;

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
  supportedUpdateExpressionOperators.add(operator);
  return func;
};

const Increment = UpdateExpression('++', a => ++a);
const Decrement = UpdateExpression('--', a => --a);

const executeUpdateExpression = (op, a) => {
  return operatorFunctions[op](a);
};

exports.executeUpdateExpression = executeUpdateExpression;