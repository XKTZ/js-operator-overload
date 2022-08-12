"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.notNull = exports.isNull = void 0;

const isNull = a => a === undefined || a === null;

exports.isNull = isNull;

const notNull = a => !isNull(a);

exports.notNull = notNull;