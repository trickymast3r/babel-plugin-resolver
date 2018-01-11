'use strict';

exports.__esModule = true;

var _transformer = require('./transformer');

var _transformer2 = _interopRequireDefault(_transformer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _transformer2.default.plug.bind(_transformer2.default);