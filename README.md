# babel-plugin-sresolver
[![Maintenance Status][status-image]][status-url] [![NPM version][npm-image]][npm-url] [![Build Status Linux][circleci-image]][circleci-url] [![Build Status Windows][appveyor-image]][appveyor-url] [![Coverage Status][coverage-image]][coverage-url]

A [Babel](http://babeljs.io) plugin to add a new resolver for your modules when compiling your code using Babel. 

## Description

Default Node only load modules from `node_modules` folder.
This plugin can autoload all `package.json` files recursively, so you can named your library to require/import every where from your workspace.
For example, instead of using complex relative paths like `../../../../utils/my-utils` you can place use `@utils/my-utils`.
It will allow you to work faster since you won't need to calculate how many levels of directory you have to go up before accessing the file.
```json
{
    "name": "@utils",
    "main": "./"
}
```

```js
// Use this:
import MyUtilFn from '@utils/MyUtilFn';
// Instead of that:
import MyUtilFn from '../../../../utils/MyUtilFn';

// And it also work with require calls
// Use this:
const MyUtilFn = require('@utils/MyUtilFn');
// Instead of that:
const MyUtilFn = require('../../../../utils/MyUtilFn');
```

## Getting started

Install the plugin

```
$ npm install --save-dev @mrjs/babel-plugin-sresolver
```

Specify the plugin in your `.babelrc` .Here's an example:
```json
{
  "plugins": [
    ["@mrjs/babel-plugin-sresolver"]
  ]
}
```
or custom root folder for scan package.json
```json
{
  "plugins": [
    ["@mrjs/babel-plugin-sresolver", {
      "root": ["./src"],
    }]
  ]
}
```
## License

MIT, see [LICENSE.md](/LICENSE.md) for details.

Are you also using it? Send a PR!

[status-image]: https://img.shields.io/badge/status-maintained-brightgreen.svg
[status-url]: https://github.com/trickymast3r/babel-plugin-sresolver

[npm-image]: https://img.shields.io/npm/v/babel-plugin-module-resolver.svg
[npm-url]: https://www.npmjs.com/package/babel-plugin-module-resolver

[coverage-image]: https://codecov.io/gh/tleunen/babel-plugin-module-resolver/branch/master/graph/badge.svg
[coverage-url]: https://codecov.io/gh/tleunen/babel-plugin-module-resolver

[eslint-import-resolver-babel-module]: https://github.com/tleunen/eslint-import-resolver-babel-module
[eslint-plugin-import]: https://github.com/benmosher/eslint-plugin-import
[atom-autocomplete-modules]: https://github.com/nkt/atom-autocomplete-modules
