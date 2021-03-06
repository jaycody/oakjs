//////////////////////////////
//  Return the `global` / `window` etc object
//
//  Usage:    import global from "oak-roots/util/global"
//
//////////////////////////////

export const global = (function () {
  // the only reliable means to get the global object is
  // `Function('return this')()`
  // However, this causes CSP violations in Chrome apps.
  if (typeof self !== 'undefined') { return self; }
  if (typeof window !== 'undefined') { return window; }
  if (typeof global !== 'undefined') { return global; }
  throw new Error('unable to locate global object');
})()

export default global;
