const {executeBinaryExpression: executeBinary, supportedBinaryExpressionOperators: supportedBinary} = require('./BinaryExpression');
const {executeUnaryExpression: executeUnary, supportedUnaryExpressionOperators: supportedUnary} = require('./UnaryExpression');
const {executeUpdateExpression: executeUpdate, supportedUpdateExpressionOperators: supportedUpdate} = require('./UpdateExpression');

export const supportedBinaryExpressionOperators = supportedBinary;

export const executeBinaryExpression = executeBinary;

export const supportedUnaryExpressionOperators = supportedUnary;

export const executeUnaryExpression = executeUnary;

export const supportedUpdateExpressionOperators = supportedUpdate;

export const executeUpdateExpression = executeUpdate;
