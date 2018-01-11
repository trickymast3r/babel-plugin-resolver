const path = require('path')
const transform = require('babel-core').transform;
const mrjsResolver = require('../src/index').default;
console.log(mrjsResolver);
const log = console.log;
const rootTransformerOpts = {
    babelrc: false,
    plugins: [
        [mrjsResolver, {
            root: '../../cryptocoin-proxy/',
        }],
    ],
};
function testWithImport(source, output, transformerOpts) {
    const code = `const sth = require("${source}");`;
    const result = transform(code, transformerOpts);
    return '';
}
log(testWithImport(
    '@mrjs/class',
    './test/testproject/src/app',
    rootTransformerOpts,
));
