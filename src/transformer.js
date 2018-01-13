import fs from 'fs';
import glob from 'glob';
import Utils from './utils';

const debug = require('debug')('sresolver:transformer');

class Transformer {
  constructor() {
    this.defaultOpts = {
      root: fs.realpathSync('.'),
      extensions: ['.js', '.jsx', '.es', '.es6', '.mjs'],
      patterns: [
        'require',
        'require.resolve',
        'System.import',
        // Jest methods
        'jest.genMockFromModule',
        'jest.mock',
        'jest.unmock',
        'jest.doMock',
        'jest.dontMock',
        'jest.setMock',
        'require.requireActual',
        'require.requireMock',
      ],
    };
    this.currentFile = null;
  }
  getPackages() {
    try {
      this.packages = {};
      this.options.root = fs.realpathSync(this.options.root);
      debug(`Find All 'packages.json' At '${this.options.root}'`);
      glob
        .sync('**/package.json', {
          cwd: this.options.root,
          ignore: '**/node_modules/**',
          absolute: true,
        })
        .filter(Utils.getDir)
        .sort((a, b) => a.length < b.length)
        .forEach((packagePath) => {
          const pkgInfo = Utils.getJSON(packagePath);
          if (!pkgInfo) return false;
          if (pkgInfo.name === undefined) return false;
          if (!(pkgInfo.name in this.packages)) {
            this.packages[pkgInfo.name] = Utils.getAbsolutePath(packagePath, pkgInfo.main);
          }
          return true;
        });
      debug(`Found ${Utils.length(this.packages)} packages`);
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
    Object.entries(this.packages).some(([pName, pPath]) => {
      if (packageName.indexOf(pName) > -1) {
        debug(`Found ${pName} with path ${pPath}`);
        replacedPackageName = packageName.replace(pName, Utils.getRelativePath(currentFile, pPath));
        if (replacedPackageName.slice(0, 1) !== '.') {
          replacedPackageName = `./${replacedPackageName}`;
        }
        return true;
      }
      return false;
    });
    return replacedPackageName;
  }
  eslintResolver(requestName, requestFile, options) {
    debug('Plugged in Babel module');
    if (!this.options) {
      this.options = Object.assign({}, this.defaultOpts, options);
    }
    if (!this.packages) this.getPackages();
    const newPath = this.resolvePackage(requestFile, requestName);
    if (newPath) {
      return {
        found: true,
        path: `${Utils.getAbsolutePath(requestFile, newPath)}.js`,
      };
    }
    return { found: false };
  }
  transformCall(nodePath, state) {
    if (!this.options) {
      this.options = Object.assign({}, this.defaultOpts, state.opts);
    }
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

  babelResolver(state) {
    this.types = state.types;
    debug('Plugged in Babel module');
    return {
      name: '@mrjs/pkgsolver',
      visitor: {
        CallExpression: this.transformCall.bind(this),
      },
      // manipulateOptions: () => { },
      // pre: () => { },
      // post: () => { },
      // inherits: () => { },
      // parserOverride: () => { },
      // generatorOverride: () => { },
    };
  }
}

export default Transformer;
