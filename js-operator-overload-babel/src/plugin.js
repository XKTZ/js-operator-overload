import {template} from "@babel/core";

const COMMON_JS = "commonjs";
const MODULE = "module";

const requireCore = template(`
const OPERATORS = require("@xktz/js-operator-overload-core");
`);

const importCore = template(`
import * as OPERATORS from "@xktz/js-operator-overload-core";
`);

const unaryExpression = template(`
OPERATORS.executeUnaryExpression(OPERATOR, VARIABLE)
`);

const prefixUpdateExpression = template(`
VARIABLE = OPERATORS.executeUpdateExpression(OPERATOR, VARIABLE)
`);

const commaOperatorPostUpdateExpression = template(`
(TEMPORARY = VARIABLE, TEMPORARY = OPERATORS.executeUpdateExpression(OPERATOR, VARIABLE), TEMPORARY)
`);

const functionPostUpdateExpression = template(`
(() => {let _temporary = VARIABLE; VARIABLE = OPERATORS.executeUpdateExpression(OPERATOR, VARIABLE); return _temporary;})()
`);

const binaryExpression = template(`
OPERATORS.executeBinaryExpression(OPERATOR, LEFT, RIGHT);
`);

/**
 * The statement list, containing all statements need to be executed at the BEGINNING of the file
 * @type {{}}
 */
const preStatements = [];

const PreStatement = (statementGenerator) => {
    preStatements.push(statementGenerator);
}

PreStatement((path, variables, {type}) => {
    variables.core = path.scope.generateUidIdentifier("_OperatorCore");

    let importStmt;
    switch (type) {
        case undefined:
        case null:
        case COMMON_JS:
            importStmt = requireCore({
                OPERATORS: variables.core
            });
            break;
        case MODULE:
            importStmt = importCore({
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
                const operator = {
                    '+': 'positive',
                    '-': 'negative',
                    '~': '~'
                }[originOperator];
                // if it is not defined operator, not consider it
                if (operator === undefined) {
                    return;
                }
                // replace it with unary expression
                path.replaceWith(unaryExpression({
                    OPERATORS: variables.core,
                    OPERATOR: t.StringLiteral(operator),
                    VARIABLE: variable
                }));
            },
            UpdateExpression(path) {
                // get the operator, variable, and check if it is prefix
                const {operator, prefix, argument: variable} = path.node;

                let statement;

                // check if it is prefix
                // if it is prefix, then use prefix option
                if (prefix) {
                    statement = prefixUpdateExpression({
                        OPERATORS: variables.core,
                        OPERATOR: t.StringLiteral(operator),
                        VARIABLE: variable
                    });
                } else {
                    // if it is post, there are two options, the option is to expand post update into function
                    // then use function mode
                    if (options.expandPostUpdateToFunction) {
                        statement = functionPostUpdateExpression({
                            OPERATORS: variables.core,
                            OPERATOR: t.StringLiteral(operator),
                            VARIABLE: variable
                        });
                    }
                    // if it does not expand post update to function, use the temporary + comma operator option
                    else {
                        statement = commaOperatorPostUpdateExpression({
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
                path.replaceWith({

                });
            }
        }
    }
}