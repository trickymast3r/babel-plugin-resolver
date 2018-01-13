import fs from 'fs';
import path from 'path';

class Utils {
  static getDir(sourcePath) {
    try {
      if (!Utils.isString(sourcePath)) return false;
      if (!fs.statSync(path.resolve(sourcePath)).isFile()) return fs.realpathSync(sourcePath);
      return fs.realpathSync(path.dirname(path.resolve(sourcePath)));
    } catch (e) {
      if (process.env.NODE_ENV === 'production') return false;
      throw new Error(e);
    }
  }
  static getRelativePath(sourcePath, targetPath) {
    try {
      return path.relative(Utils.getDir(sourcePath), Utils.getDir(targetPath));
    } catch (e) {
      if (process.env.NODE_ENV === 'production') return false;
      throw new Error(e);
    }
  }
  static getAbsolutePath(sourcePath, filePath) {
    try {
      return path.resolve(Utils.getDir(sourcePath), filePath || '');
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
    return (t === 'string' || (t === 'object' && v != null && !Array.isArray(v) && Utils.getType(v) === '[object String]'));
  }
  static getJSON(filePath) {
    try {
      if (fs.existsSync(filePath) || fs.existsSync(`${filePath}/package.json`)) {
        return JSON.parse(fs.readFileSync(`${this.getDir(filePath)}/package.json`));
      }
      return false;
    } catch (e) {
      if (process.env.NODE_ENV === 'production') return false;
      throw new Error(e);
    }
  }
}
export default Utils;
