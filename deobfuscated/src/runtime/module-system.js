/**
 * Module System Runtime
 *
 * Provides core infrastructure for extracted modules from the deobfuscated Claude Code CLI.
 * All extracted modules depend on these primitives.
 *
 * This runtime emulates the CommonJS module system used in the original bundled code,
 * allowing extracted modules to maintain the same semantics while being separated into
 * individual files.
 */

/**
 * Object.defineProperty wrapper
 * Used throughout the codebase for defining properties with specific descriptors
 */
export const defineProperty = Object.defineProperty;

/**
 * Core module factory function
 *
 * Creates a CommonJS-style module by calling an initialization function with an exports object.
 * This is the fundamental pattern used throughout the original bundle:
 *
 * Example:
 *   createCommonJSModule(ModuleExports => {
 *     ModuleExports.functionName = function() { ... };
 *   });
 *
 * @param {Function} initFn - Function that initializes the module exports
 * @returns {Object} The initialized exports object
 */
export const createCommonJSModule = (initFn) => {
  const exports = {};
  initFn(exports);
  return exports;
};

/**
 * Node.js require function
 * Used by modules that need to import Node.js built-in modules or external dependencies
 */
export const nodeRequire = (typeof require !== 'undefined') ? require : null;

/**
 * Object.prototype.hasOwnProperty helper
 * Commonly used for safe property checking
 */
export const hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * JavaScript Symbol primitive
 * Re-exported for consistency (already globally available)
 */
export const SymbolPrimitive = Symbol;

/**
 * Helper to create a module with ES6-style exports
 *
 * Convenience function for modules that use __esModule flag and default/named exports
 *
 * @param {Function} initFn - Function that initializes the module
 * @returns {Object} The module with __esModule flag set
 */
export const createESModule = (initFn) => {
  const exports = {};
  defineProperty(exports, "__esModule", { value: true });
  initFn(exports);
  return exports;
};

/**
 * Interop helper for wildcard imports
 *
 * Handles importing modules that may be CommonJS or ES6 modules
 * This is commonly used in the original bundle for cross-module imports
 *
 * @param {Object} obj - Module to process
 * @returns {Object} Processed module with proper default export handling
 */
export const interopRequireWildcard = (obj) => {
  if (obj && obj.__esModule) {
    return obj;
  }

  if (obj === null || (typeof obj !== "object" && typeof obj !== "function")) {
    return { default: obj };
  }

  const cache = new WeakMap();
  if (cache.has(obj)) {
    return cache.get(obj);
  }

  const newObj = {};
  const hasPropertyDescriptor = defineProperty && Object.getOwnPropertyDescriptor;

  for (const key in obj) {
    if (key !== "default" && hasOwnProperty.call(obj, key)) {
      const desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;

      if (desc && (desc.get || desc.set)) {
        defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }

  newObj.default = obj;
  if (cache) {
    cache.set(obj, newObj);
  }

  return newObj;
};

/**
 * Helper for default export interop
 *
 * @param {Object} obj - Module to process
 * @returns {*} The default export if it exists, otherwise the module itself
 */
export const interopRequireDefault = (obj) => {
  return (obj && obj.__esModule) ? obj : { default: obj };
};

/**
 * Object.create wrapper
 * Used for prototype-based object creation
 */
export const objectCreate = Object.create;

/**
 * Object.getPrototypeOf wrapper
 * Used for prototype chain inspection
 */
export const getPrototypeOf = Object.getPrototypeOf;

/**
 * Object.getOwnPropertyNames wrapper
 * Used for property enumeration
 */
export const getOwnPropertyNames = Object.getOwnPropertyNames;

/**
 * Helper to check if running in Node.js environment
 * @returns {boolean} True if in Node.js, false otherwise
 */
export const isNode = () => {
  return typeof process !== 'undefined' &&
         process.versions != null &&
         process.versions.node != null;
};

/**
 * Helper to check if running in browser environment
 * @returns {boolean} True if in browser, false otherwise
 */
export const isBrowser = () => {
  return typeof window !== 'undefined' && typeof window.document !== 'undefined';
};

/**
 * Default export containing all runtime primitives
 * Useful for CommonJS-style imports
 */
export default {
  defineProperty,
  createCommonJSModule,
  createESModule,
  nodeRequire,
  hasOwnProperty,
  Symbol: SymbolPrimitive,
  interopRequireWildcard,
  interopRequireDefault,
  objectCreate,
  getPrototypeOf,
  getOwnPropertyNames,
  isNode,
  isBrowser
};
