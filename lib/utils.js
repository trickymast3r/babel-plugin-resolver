'use strict';

exports.__esModule = true;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Utils {
  static getDir(sourcePath) {
    try {
      if (!Utils.isString(sourcePath)) return false;
      if (!_fs2.default.statSync(_path2.default.resolve(sourcePath)).isFile()) return _fs2.default.realpathSync(sourcePath);
      return _fs2.default.realpathSync(_path2.default.dirname(_path2.default.resolve(sourcePath)));
    } catch (e) {
      if (process.env.NODE_ENV === 'production') return false;
      throw new Error(e);
    }
  }
  static objectLenght(obj) {
    if (obj instanceof Object) {
      return Object.keys(obj).length;
    }
    return 0;
  }
  static getRelativePath(sourcePath, targetPath) {
    try {
      return _path2.default.relative(Utils.getDir(sourcePath), Utils.getDir(targetPath));
    } catch (e) {
      if (process.env.NODE_ENV === 'production') return false;
      throw new Error(e);
    }
  }
  static getAbsolutePath(sourcePath, filePath) {
    try {
      return _path2.default.resolve(Utils.getDir(sourcePath), filePath || '');
    } catch (e) {
      if (process.env.NODE_ENV === 'production') return false;
      throw new Error(e);
    }
  }
  static getType(value) {
    return Object.prototype.toString.call(Object(value));
  }
  static isString(v) {
    const t = typeof v;
    return t === 'string' || t === 'object' && v != null && !Array.isArray(v) && Utils.getType(v) === '[object String]';
  }
  static getJSON(filePath) {
    try {
      if (_fs2.default.existsSync(filePath) || _fs2.default.existsSync(`${filePath}/package.json`)) {
        return JSON.parse(_fs2.default.readFileSync(`${this.getDir(filePath)}/package.json`));
      }
      return false;
    } catch (e) {
      if (process.env.NODE_ENV === 'production') return false;
      throw new Error(e);
    }
  }
}
exports.default = Utils;