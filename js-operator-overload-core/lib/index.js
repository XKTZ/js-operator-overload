"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.supportedUpdateExpressionOperators = exports.supportedUnaryExpressionOperators = exports.supportedBinaryExpressionOperators = exports.executeUpdateExpression = exports.executeUnaryExpression = exports.executeBinaryExpression = void 0;

const {
  executeBinaryExpression: executeBinary,
  supportedBinaryExpressionOperators: supportedBinary
} = require('./BinaryExpression');

const {
  executeUnaryExpression: executeUnary,
  supportedUnaryExpressionOperators: supportedUnary
} = require('./UnaryExpression');

const {
  executeUpdateExpression: executeUpdate,
  supportedUpdateExpressionOperators: supportedUpdate
} = require('./UpdateExpression');

const supportedBinaryExpressionOperators = supportedBinary;
exports.supportedBinaryExpressionOperators = supportedBinaryExpressionOperators;
const executeBinaryExpression = executeBinary;
exports.executeBinaryExpression = executeBinaryExpression;
const supportedUnaryExpressionOperators = supportedUnary;
exports.supportedUnaryExpressionOperators = supportedUnaryExpressionOperators;
const executeUnaryExpression = executeUnary;
exports.executeUnaryExpression = executeUnaryExpression;
const supportedUpdateExpressionOperators = supportedUpdate;
exports.supportedUpdateExpressionOperators = supportedUpdateExpressionOperators;
const executeUpdateExpression = executeUpdate;
exports.executeUpdateExpression = executeUpdateExpression;