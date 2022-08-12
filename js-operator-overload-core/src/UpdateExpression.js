const {isNull, notNull} = require('./Util');

const operatorFunctions = new Map();

export const supportedUpdateExpressionOperators = new Set();

const UpdateExpression = (operator, defaults) => {
    const op = Symbol.for(operator);
    const func = (a) => {
        if (notNull(a) && notNull(a[op])) {
            return a[op]();
        } else {
            return defaults(a);
        }
    }
    operatorFunctions[operator] = func;
    supportedUpdateExpressionOperators.add(operator);
    return func;
}

const Increment = UpdateExpression('++', a => ++a);

const Decrement = UpdateExpression('--', a => --a);

export const executeUpdateExpression = (op, a) => {
    return operatorFunctions[op](a);
}