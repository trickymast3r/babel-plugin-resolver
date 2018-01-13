# pkgsolver - Smarter Resolver for your NodeJS project !

## Description

Default Node only load modules from `node_modules` folder.
This plugin can autoload all `package.json` files recursively, so you can named your library to require/import every where from your workspace.
For example, instead of using complex relative paths like `../../../../shared/utils` you can place use `@shared/utils`.
It will allow you to work faster since you won't need to calculate how many levels of directory you have to go up before accessing the file.
```json
{
    "name": "@shared",
    "main": "./"
}
```

```js
// Use this:
import MyUtilFn from '@shared/utils';
// Instead of that:
import MyUtilFn from '../../../../shared/utils';

// And it also work with require calls
// Use this:
const MyUtilFn = require('@shared/utils');
// Instead of that:
const MyUtilFn = require('../../../../shared/utils');
```

## Getting started

Install the plugin

```
$ npm install --save-dev @mrjs/pkgsolver
```

Specify the plugin in your `.babelrc` .Here's an example:
```json
{
  "plugins": [
    ["@mrjs/pkgsolver"]
  ]
}
```
or custom root folder for scan package.json
```json
{
  "plugins": [
    ["@mrjs/pkgsolver", {
      "root": ["../packages/"],
    }]
  ]
}
```
## License

MIT, see [LICENSE](/LICENSE) for details.

Are you also using it? Send a PR!
