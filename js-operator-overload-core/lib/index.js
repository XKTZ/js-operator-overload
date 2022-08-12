"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.executeUpdateExpression = exports.executeUnaryExpression = exports.executeBinaryExpression = void 0;

const {
  executeBinaryExpression: executeBinary
} = require('./BinaryExpression');

const {
  executeUnaryExpression: executeUnary
} = require('./UnaryExpression');

const {
  executeUpdateExpression: executeUpdate
} = require('./UpdateExpression');

const executeBinaryExpression = executeBinary;
exports.executeBinaryExpression = executeBinaryExpression;
const executeUnaryExpression = executeUnary;
exports.executeUnaryExpression = executeUnaryExpression;
const executeUpdateExpression = executeUpdate;
exports.executeUpdateExpression = executeUpdateExpression;