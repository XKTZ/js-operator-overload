"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.supportedUnaryExpressionOperators = exports.executeUnaryExpression = void 0;

const {
  isNull,
  notNull
} = require('./Util');

const operatorFunctions = new Map();
const supportedUnaryExpressionOperators = new Set();
exports.supportedUnaryExpressionOperators = supportedUnaryExpressionOperators;

const UnaryExpression = (operator, defaults) => {
  const op = Symbol.for(operator);

  const func = a => {
    if (notNull(a) && notNull(a[op])) {
      return a[op]();
    } else {
      return defaults(a);
    }
  };

  operatorFunctions[operator] = func;
  supportedUnaryExpressionOperators.add(operator);
  return func;
};

const Positive = UnaryExpression('positive', a => +a);
const Negative = UnaryExpression('negative', a => -a);
const BitNot = UnaryExpression('~', a => ~a);

const executeUnaryExpression = (op, a) => {
  return operatorFunctions[op](a);
};

exports.executeUnaryExpression = executeUnaryExpression;