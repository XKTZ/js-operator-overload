"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _core = require("@babel/core");

var _jsOperatorOverloadCore = require("@xktz/js-operator-overload-core");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var COMMON_JS = "commonjs";
var MODULE = "module";
var requireCoreTemplate = (0, _core.template)("\nconst OPERATORS = require(\"@xktz/js-operator-overload-core\");\n");
var importCoreTemplate = (0, _core.template)("\nimport * as OPERATORS from \"@xktz/js-operator-overload-core\";\n");
var unaryExpressionTemplate = (0, _core.template)("\nOPERATORS.executeUnaryExpression(OPERATOR, VARIABLE)\n");
var prefixUpdateExpressionTemplate = (0, _core.template)("\nVARIABLE = OPERATORS.executeUpdateExpression(OPERATOR, VARIABLE)\n");
var commaOperatorPostUpdateExpressionTemplate = (0, _core.template)("\n(TEMPORARY = VARIABLE, VARIABLE = OPERATORS.executeUpdateExpression(OPERATOR, VARIABLE), TEMPORARY)\n");
var functionPostUpdateExpressionTemplate = (0, _core.template)("\n(() => {let _temporary = VARIABLE; VARIABLE = OPERATORS.executeUpdateExpression(OPERATOR, VARIABLE); return _temporary;})()\n");
var binaryExpressionTemplate = (0, _core.template)("\nOPERATORS.executeBinaryExpression(OPERATOR, LEFT, RIGHT);\n");
var assignmentExpressionTemplate = (0, _core.template)("\n(LEFT = OPERATORS.executeBinaryExpression(OPERATOR, LEFT, RIGHT))\n");
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

var isComparison = function isComparison(x) {
  return x === "===" || x === "==" || x === ">" || x === "<";
};

var assignmentOperatorToBinaryOperatorMapper = _toConsumableArray(_jsOperatorOverloadCore.supportedBinaryExpressionOperators) // comparison operator is not assignment operator
.filter(function (x) {
  return !isComparison(x);
}).reduce(function (mp, obj) {
  // ${op}= to ${op}
  mp[obj + '='] = obj;
  return mp;
}, new Map());

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
        // get the argument and operator of the expression
        var _path$node = path.node,
            variable = _path$node.argument,
            originOperator = _path$node.operator; // if it is not defined operator, not consider it

        var operator = {
          '+': 'positive',
          '-': 'negative',
          '~': '~'
        }[originOperator]; // if it is not in the supported, ignore

        if (operator === undefined || !_jsOperatorOverloadCore.supportedUpdateExpressionOperators.has(operator)) {
          return;
        } // replace it with unary expression


        path.replaceWith(unaryExpressionTemplate({
          OPERATORS: variables.core,
          OPERATOR: t.StringLiteral(operator),
          VARIABLE: variable
        }));
      },
      UpdateExpression: function UpdateExpression(path) {
        // get the operator, variable, and check if it is prefix
        var _path$node2 = path.node,
            operator = _path$node2.operator,
            prefix = _path$node2.prefix,
            variable = _path$node2.argument; // if it is not in the supported, ignore

        if (!_jsOperatorOverloadCore.supportedUpdateExpressionOperators.has(operator)) {
          return;
        }

        var statement; // check if it is prefix
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
          } // if it does not expand post update to function, use the temporary + comma operator option
          else {
            statement = commaOperatorPostUpdateExpressionTemplate({
              OPERATORS: variables.core,
              OPERATOR: t.StringLiteral(operator),
              VARIABLE: variable,
              TEMPORARY: variables.temporary
            });
          }
        }

        path.replaceWith(statement);
      },
      BinaryExpression: function BinaryExpression(path) {
        // get the operator, left, and right
        var _path$node3 = path.node,
            operator = _path$node3.operator,
            left = _path$node3.left,
            right = _path$node3.right; // if it is not in the supported, ignore

        if (!_jsOperatorOverloadCore.supportedBinaryExpressionOperators.has(operator)) {
          return;
        }

        path.replaceWith(binaryExpressionTemplate({
          OPERATORS: variables.core,
          OPERATOR: t.StringLiteral(operator),
          LEFT: left,
          RIGHT: right
        }));
      },
      AssignmentExpression: function AssignmentExpression(path) {
        // get operator, left, and right
        var _path$node4 = path.node,
            operator = _path$node4.operator,
            left = _path$node4.left,
            right = _path$node4.right; // check if the assignment expression in binary form

        var operatorBinary = assignmentOperatorToBinaryOperatorMapper[operator]; // if it is not supported in binary form, not consider it

        if (operatorBinary === undefined || !_jsOperatorOverloadCore.supportedBinaryExpressionOperators.has(operatorBinary)) {
          return;
        } // replace it with assignment template


        path.replaceWith(assignmentExpressionTemplate({
          OPERATORS: variables.core,
          OPERATOR: t.StringLiteral(operatorBinary),
          LEFT: left,
          RIGHT: right
        }));
      }
    }
  };
};

exports["default"] = _default;