const {isNull, notNull} = require('./Util');

const operatorFunctions = new Map();

const BinaryExpression = (operator, defaults) => {
    const op = Symbol.for(operator);
    const func = (a, b) => {
        if (notNull(a) && notNull(a[op])) {
            return a[op](b);
        } else {
            return defaults(a, b);
        }
    }
    operatorFunctions[operator] = func;
    return func;
}

const Plus = BinaryExpression('+', (a, b) => a + b);

const Subtract = BinaryExpression('-', (a, b) => a - b);

const Multiply = BinaryExpression('*', (a, b) => a * b);

const Divide = BinaryExpression('/', (a, b) => a / b);

const Modular = BinaryExpression('%', (a, b) => a % b);

const Power = BinaryExpression('**', (a, b) => a ** b);

const BitAnd = BinaryExpression('&', (a, b) => a & b);

const BitOr = BinaryExpression('|', (a, b) => a | b);

const BitXor = BinaryExpression('^', (a, b) => a ^ b);

const BitLeftShift = BinaryExpression('<<', (a, b) => a << b);

const BitRightShift = BinaryExpression('>>', (a, b) => a >> b);

const BitRightShiftUnsigned = BinaryExpression('>>>', (a, b) => a >>> b);

const Equal = BinaryExpression('==', (a, b) => a == b);

const Less = BinaryExpression('<', (a, b) => a < b);

const Greater = BinaryExpression('>', (a, b) => a > b);

export const executeBinaryExpression = (operator, a, b) => {
    return operatorFunctions[operator](a, b);
}