/**
 * Module System
 *
 * Core module loading and interop utilities for handling CommonJS and ES6 modules.
 * This is the foundational module system used throughout the codebase.
 *
 * @module modules
 */

import { createRequire as createRequire } from "node:module";

const objectCreate = Object.create;
const {
  getPrototypeOf: getPrototypeOf,
  defineProperty: defineProperty,
  getOwnPropertyNames: getOwnPropertyNames,
} = Object;
const objectHasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Handles ES6 module interop for wildcard imports.
 * Creates a namespace object with proper __esModule flag.
 *
 * @param {any} module - The module to import
 * @param {boolean} useDefault - Whether to use default export
 * @param {Object} namespace - The namespace object to populate
 * @returns {Object} The namespace object with all module exports
 */
export const interopRequireWildcard = (module, useDefault, namespace) => {
  namespace = module != null ? objectCreate(getPrototypeOf(module)) : {};
  let result =
    useDefault || !module || !module.__esModule
      ? defineProperty(namespace, "default", {
          value: module,
          enumerable: true,
        })
      : namespace;
  for (let prop of getOwnPropertyNames(module)) {
    if (!objectHasOwnProperty.call(result, prop)) {
      defineProperty(result, prop, {
        get: () => module[prop],
        enumerable: true,
      });
    }
  }
  return result;
};

/**
 * Creates a CommonJS module wrapper.
 * Lazy-loads the module on first access.
 *
 * @param {Function} initializer - Function that initializes the module
 * @param {Object} cache - Cache object for the module exports
 * @returns {Function} Function that returns the module exports
 */
export const createCommonJSModule = (initializer, cache) => () => {
  if (!cache) {
    initializer(
      (cache = {
        exports: {},
      }).exports,
      cache,
    );
  }
  return cache.exports;
};

/**
 * Defines getter properties on an object with enumerable and configurable attributes.
 * Used for lazy property evaluation.
 *
 * @param {Object} target - The target object
 * @param {Object} getters - Object mapping property names to getter functions
 */
export const defineGetters = (target, getters) => {
  for (var prop in getters) {
    defineProperty(target, prop, {
      get: getters[prop],
      enumerable: true,
      configurable: true,
      set: (value) => (getters[prop] = () => value),
    });
  }
};

/**
 * Creates a lazily-evaluated module initializer.
 * The module is only initialized when first accessed.
 *
 * @param {Function} initializer - Function that initializes and returns the module
 * @param {any} cache - Cache for the initialized module
 * @returns {Function} Function that returns the cached module
 */
export const createLazyModule = (initializer, cache) => () => {
  if (initializer) {
    cache = initializer((initializer = 0));
  }
  return cache;
};

/**
 * Node.js require function for this module.
 * Allows requiring CommonJS modules from ES6 modules.
 *
 * @type {Function}
 */
export const nodeRequire = createRequire(import.meta.url);

/**
 * Default export containing all module system utilities
 */
export default {
  interopRequireWildcard,
  createCommonJSModule,
  defineGetters,
  createLazyModule,
  nodeRequire,
};
