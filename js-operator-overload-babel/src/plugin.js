import {template} from "@babel/core";
import {supportedBinaryExpressionOperators} from "@xktz/js-operator-overload-core";
import {supportedUnaryExpressionOperators} from "@xktz/js-operator-overload-core";
import {supportedUpdateExpressionOperators} from "@xktz/js-operator-overload-core";

const COMMON_JS = "commonjs";
const MODULE = "module";

const requireCoreTemplate = template(`
const OPERATORS = require("@xktz/js-operator-overload-core");
`);

const importCoreTemplate = template(`
import * as OPERATORS from "@xktz/js-operator-overload-core";
`);

const unaryExpressionTemplate = template(`
OPERATORS.executeUnaryExpression(OPERATOR, VARIABLE)
`);

const prefixUpdateExpressionTemplate = template(`
VARIABLE = OPERATORS.executeUpdateExpression(OPERATOR, VARIABLE)
`);

const commaOperatorPostUpdateExpressionTemplate = template(`
(TEMPORARY = VARIABLE, VARIABLE = OPERATORS.executeUpdateExpression(OPERATOR, VARIABLE), TEMPORARY)
`);

const functionPostUpdateExpressionTemplate = template(`
(() => {let _temporary = VARIABLE; VARIABLE = OPERATORS.executeUpdateExpression(OPERATOR, VARIABLE); return _temporary;})()
`);

const binaryExpressionTemplate = template(`
OPERATORS.executeBinaryExpression(OPERATOR, LEFT, RIGHT);
`);

/**
 * The statement list, containing all statements need to be executed at the BEGINNING of the file
 * @type {{}}
 */
const preStatements = [];

const PreStatement = (statementGenerator) => {
    preStatements.push(statementGenerator);
};

PreStatement((path, variables, {type}) => {
    variables.core = path.scope.generateUidIdentifier("_OperatorCore");

    let importStmt;
    switch (type) {
        case undefined:
        case null:
        case COMMON_JS:
            importStmt = requireCoreTemplate({
                OPERATORS: variables.core
            });
            break;
        case MODULE:
            importStmt = importCoreTemplate({
                OPERATORS: variables.core
            })
            break;
        default:
            throw new Error(`Cannot recognize project type ${options.type}`)
    }

    return importStmt;
});

PreStatement((path, variables, {expandPostUpdateToFunction}) => {
    if (expandPostUpdateToFunction === undefined || !expandPostUpdateToFunction) {
        variables.temporary = path.scope.generateUidIdentifier("_temporary");
        return template(`let TEMPORARY;`)({
            TEMPORARY: variables.temporary
        });
    } else {
        return null;
    }
});

export default ({types: t}) => {
    let options;
    let variables;
    return {
        visitor: {
            Program: {
                // On entering the program, the babel plugin should add import/require at the beginning of the file
                // and initialize other configurations
                enter(path, state) {
                    // load options & variables
                    options = state.opts;
                    variables = {};

                    // the declaration statements
                    let declareStmts = preStatements.map(f => f(path, variables, options)).filter(x => x !== null && x !== undefined);

                    path.unshiftContainer('body', declareStmts);
                }
            },
            UnaryExpression(path) {
                // get the argument and operator of the expression
                const {argument: variable, operator: originOperator} = path.node;
                // if it is not defined operator, not consider it
                const operator = {
                    '+': 'positive',
                    '-': 'negative',
                    '~': '~'
                }[originOperator];
                if (operator === undefined || !supportedUpdateExpressionOperators.has(operator)) {
                    return;
                }
                // replace it with unary expression
                path.replaceWith(unaryExpressionTemplate({
                    OPERATORS: variables.core,
                    OPERATOR: t.StringLiteral(operator),
                    VARIABLE: variable
                }));
            },
            UpdateExpression(path) {
                // get the operator, variable, and check if it is prefix
                const {operator, prefix, argument: variable} = path.node;

                if (!supportedUpdateExpressionOperators.has(operator)) {
                    return;
                }

                let statement;

                // check if it is prefix
                // if it is prefix, then use prefix option
                if (prefix) {
                    statement = prefixUpdateExpressionTemplate({
                        OPERATORS: variables.core,
                        OPERATOR: t.StringLiteral(operator),
                        VARIABLE: variable
                    });
                } else {
                    // if it is post, there are two options, the option is to expand post update into function
                    // then use function mode
                    if (options.expandPostUpdateToFunction) {
                        statement = functionPostUpdateExpressionTemplate({
                            OPERATORS: variables.core,
                            OPERATOR: t.StringLiteral(operator),
                            VARIABLE: variable
                        });
                    }
                    // if it does not expand post update to function, use the temporary + comma operator option
                    else {
                        statement = commaOperatorPostUpdateExpressionTemplate({
                            OPERATORS: variables.core,
                            OPERATOR: t.StringLiteral(operator),
                            VARIABLE: variable,
                            TEMPORARY: variables.temporary
                        })
                    }
                }
                path.replaceWith(statement);
            },
            BinaryExpression(path, state) {
                const {operator, left, right} = path.node;

                if (!supportedBinaryExpressionOperators.has(operator)) {
                    return;
                }

                path.replaceWith(binaryExpressionTemplate({
                    OPERATORS: variables.core,
                    OPERATOR: t.StringLiteral(operator),
                    LEFT: left,
                    RIGHT: right
                }));
            }
        }
    }
}