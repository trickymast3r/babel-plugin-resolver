'use strict';

exports.__esModule = true;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const debug = require('debug')('sresolver:transformer');

class Transformer {
  constructor() {
    this.defaultOpts = {
      root: _fs2.default.realpathSync('.'),
      extensions: ['.js', '.jsx', '.es', '.es6', '.mjs'],
      patterns: ['require', 'require.resolve', 'System.import',
      // Jest methods
      'jest.genMockFromModule', 'jest.mock', 'jest.unmock', 'jest.doMock', 'jest.dontMock', 'jest.setMock', 'require.requireActual', 'require.requireMock']
    };
    this.currentFile = null;
  }
  getPackages() {
    try {
      this.packages = {};
      this.options.root = _fs2.default.realpathSync(this.options.root);
      debug(`Find All 'packages.json' At '${this.options.root}'`);
      _glob2.default.sync('**/package.json', {
        cwd: this.options.root,
        ignore: '**/node_modules/**',
        absolute: true
      }).filter(_utils2.default.getDir).sort((a, b) => a.length < b.length).forEach(packagePath => {
        const pkgInfo = _utils2.default.getJSON(packagePath);
        if (!pkgInfo) return false;
        if (pkgInfo.name === undefined) return false;
        if (!(pkgInfo.name in this.packages)) {
          this.packages[pkgInfo.name] = _utils2.default.getAbsolutePath(packagePath, pkgInfo.main);
        }
        return true;
      });
      debug(`Found ${_utils2.default.objectLenght(this.packages)} packages`);
      return this.packages;
    } catch (e) {
      if (process.env.NODE_ENV === 'production') return false;
      throw new Error(e);
    }
  }
  findPackageName(nodePath) {
    let foundName;
    let packageName;
    debug('Find Package Name from AST Tree');
    if (!this.types.isCallExpression(nodePath)) {
      debug('Not Found');
      return false;
    }
    if (this.types.isMemberExpression(nodePath.get('callee'))) {
      foundName = nodePath.get('callee.property.name').node;
    }
    if (this.types.isIdentifier(nodePath.get('callee'))) {
      foundName = nodePath.get('callee.name').node;
    }
    if (!this.types.isStringLiteral(nodePath.get('arguments.0'))) {
      debug('Not Found xx', foundName);
      return false;
    }
    if (this.options.patterns.indexOf(foundName) > -1) {
      packageName = nodePath.get('arguments.0.value');
      debug(`Found ${packageName.node}`);
      return packageName.node;
    }
    debug('Not Found');
    return false;
  }
  resolvePackage(currentFile, packageName) {
    debug(`Resolve Package ${packageName} of ${currentFile}`);
    let replacedPackageName = null;
    Object.entries(this.packages).some(([name, path]) => {
      if (packageName.indexOf(name) > -1) {
        debug(`Found ${name} with path ${path}`);
        replacedPackageName = packageName.replace(name, _utils2.default.getRelativePath(currentFile, path));
        return true;
      }
      return false;
    });
    return replacedPackageName;
  }
  transformCall(nodePath, state) {
    if (!this.options) this.options = Object.assign({}, this.defaultOpts, state.opts);
    if (!this.packages) this.getPackages();
    const currentFile = state.file.opts.filename;
    const packageName = this.findPackageName(nodePath);
    if (!!packageName && packageName[0] !== '.') {
      debug(`Transforming File: ${state.file.opts.filename}`);
      const newPath = this.resolvePackage(currentFile, packageName);
      nodePath.get('arguments.0').replaceWith(this.types.stringLiteral(newPath || packageName));
      debug(`Transformed File: ${state.file.opts.filename}`);
    }
  }
  plug(state) {
    this.types = state.types;
    debug('Plugged in Babel module');
    return {
      name: 'module-resolver',
      visitor: {
        CallExpression: this.transformCall.bind(this)
      }
    };
  }
}
exports.default = new Transformer();