import Transformer from './transformer';

const resolver = new Transformer();

export default (...args) => {
  if (args[0] instanceof Object) {
    return resolver.babelResolver(...args);
  }
  return resolver.eslintResolver.apply(this, ...args);
};
