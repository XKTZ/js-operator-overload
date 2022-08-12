"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _core = require("@babel/core");

var _fs = require("@babel/core/lib/gensync-utils/fs");

var COMMON_JS = "commonjs";
var MODULE = "module";
var requireCoreTemplate = (0, _core.template)("\nconst OPERATORS = require(\"@xktz/js-operator-overload-core\");\n");
var importCoreTemplate = (0, _core.template)("\nimport * as OPERATORS from \"@xktz/js-operator-overload-core\";\n");
var unaryExpressionTemplate = (0, _core.template)("\nOPERATORS.executeUnaryExpression(OPERATOR, VARIABLE)\n");
var prefixUpdateExpression = (0, _core.template)("\nVARIABLE = OPERATORS.executeUpdateExpression(OPERATOR, VARIABLE)\n");
var commaOperatorPostUpdateExpression = (0, _core.template)("\n(TEMPORARY = VARIABLE, TEMPORARY = OPERATORS.executeUpdateExpression(OPERATOR, VARIABLE), TEMPORARY)\n");
var functionPostUpdateExpression = (0, _core.template)("\n(() => {let _temporary = VARIABLE; VARIABLE = OPERATORS.executeUpdateExpression(OPERATOR, VARIABLE); return _temporary;})()\n");
/**
 * The statement list, containing all statements need to be executed at the BEGINNING of the file
 * @type {{}}
 */

var preStatements = [];

var PreStatement = function PreStatement(statementGenerator) {
  preStatements.push(statementGenerator);
};

PreStatement(function (path, variables, _ref) {
  var type = _ref.type;
  variables.core = path.scope.generateUidIdentifier("_OperatorCore");
  var importStmt;

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
      });
      break;

    default:
      throw new Error("Cannot recognize project type ".concat(options.type));
  }

  return importStmt;
});
PreStatement(function (path, variables, _ref2) {
  var expandPostUpdateToFunction = _ref2.expandPostUpdateToFunction;

  if (expandPostUpdateToFunction === undefined || !expandPostUpdateToFunction) {
    variables.temporary = path.scope.generateUidIdentifier("_temporary");
    return (0, _core.template)("let TEMPORARY;")({
      TEMPORARY: variables.temporary
    });
  } else {
    return null;
  }
});

var _default = function _default(_ref3) {
  var t = _ref3.types;
  var options;
  var variables;
  return {
    visitor: {
      Program: {
        // On entering the program, the babel plugin should add import/require at the beginning of the file
        // and initialize other configurations
        enter: function enter(path, state) {
          // load options & variables
          options = state.opts;
          variables = {}; // the declaration statements

          var declareStmts = preStatements.map(function (f) {
            return f(path, variables, options);
          }).filter(function (x) {
            return x !== null && x !== undefined;
          });
          path.unshiftContainer('body', declareStmts);
        }
      },
      UnaryExpression: function UnaryExpression(path) {
        var _path$node = path.node,
            variable = _path$node.argument,
            originOperator = _path$node.operator;
        var operator = {
          '+': 'positive',
          '-': 'negative',
          '~': '~'
        }[originOperator];

        if (operator === undefined) {
          return;
        }

        path.replaceWith(unaryExpressionTemplate({
          OPERATORS: variables.core,
          OPERATOR: t.StringLiteral(operator),
          VARIABLE: variable
        }));
      },
      UpdateExpression: function UpdateExpression(path) {
        var _path$node2 = path.node,
            operator = _path$node2.operator,
            prefix = _path$node2.prefix,
            variable = _path$node2.argument;
        var statement;

        if (prefix) {
          statement = prefixUpdateExpression({
            OPERATORS: variables.core,
            OPERATOR: t.StringLiteral(operator),
            VARIABLE: variable
          });
        } else {
          if (options.expandPostUpdateToFunction) {
            statement = functionPostUpdateExpression({
              OPERATORS: variables.core,
              OPERATOR: t.StringLiteral(operator),
              VARIABLE: variable
            });
          } else {
            statement = commaOperatorPostUpdateExpression({
              OPERATORS: variables.core,
              OPERATOR: t.StringLiteral(operator),
              VARIABLE: variable,
              TEMPORARY: variables.temporary
            });
          }
        }

        path.replaceWith(statement);
      }
    }
  };
};

exports["default"] = _default;