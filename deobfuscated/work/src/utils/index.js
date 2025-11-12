/**
 * Utilities Module
 *
 * Collection of utility functions for type checking, array operations,
 * object manipulation, and general-purpose helpers.
 *
 * @module utils
 */

// ============================================================================
// TYPE CHECKING UTILITIES
// ============================================================================

/**
 * Checks if a value is object-like (not null and typeof === 'object').
 * @param {any} value - The value to check
 * @returns {boolean} True if the value is object-like
 */
export function isObjectLike(value) {
  return value != null && typeof value == "object";
}

/**
 * Checks if a value is an object (including functions).
 * @param {any} value - The value to check
 * @returns {boolean} True if the value is an object or function
 */
export function isObject(value) {
  const type = typeof value;
  return value != null && (type == "object" || type == "function");
}

/**
 * Checks if a value is a Symbol.
 * @param {any} value - The value to check
 * @returns {boolean} True if the value is a Symbol
 */
export function isSymbol(value) {
  return typeof value == "symbol" ||
         (isObjectLike(value) && Object.prototype.toString.call(value) == "[object Symbol]");
}

/**
 * Checks if a value is a function (including async and generator functions).
 * @param {any} value - The value to check
 * @returns {boolean} True if the value is a function
 */
export function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  const tag = Object.prototype.toString.call(value);
  return tag == "[object Function]" ||
         tag == "[object GeneratorFunction]" ||
         tag == "[object AsyncFunction]" ||
         tag == "[object Proxy]";
}

/**
 * Checks if a value is NaN.
 * @param {any} value - The value to check
 * @returns {boolean} True if the value is NaN
 */
export function isNaN(value) {
  return value !== value;
}

/**
 * Checks if a value is a valid array index.
 * @param {any} value - The value to check
 * @param {number} [length] - The maximum length
 * @returns {boolean} True if the value is a valid index
 */
export function isIndex(value, length) {
  const type = typeof value;
  length = length == null ? 9007199254740991 : length;
  return (
    !!length &&
    (type == "number" || (type != "symbol" && /^(?:0|[1-9]\d*)$/.test(value))) &&
    value > -1 &&
    value % 1 == 0 &&
    value < length
  );
}

/**
 * Gets the type tag for a value using Symbol.toStringTag or toString.
 * @param {any} value - The value to get the type for
 * @returns {string} The type tag string
 */
export function getTypeTag(value) {
  if (value == null) {
    return value === undefined ? "[object Undefined]" : "[object Null]";
  }
  const symToStringTag = typeof Symbol !== 'undefined' ? Symbol.toStringTag : undefined;
  if (symToStringTag && symToStringTag in Object(value)) {
    return getRawTag(value);
  }
  return Object.prototype.toString.call(value);
}

/**
 * Gets the raw Object.prototype.toString tag for a value.
 * Temporarily removes Symbol.toStringTag if present.
 * @param {any} value - The value to get the tag for
 * @returns {string} The raw toString tag
 */
function getRawTag(value) {
  const symToStringTag = typeof Symbol !== 'undefined' ? Symbol.toStringTag : undefined;
  const hasOwn = Object.prototype.hasOwnProperty.call(value, symToStringTag);
  const tag = value[symToStringTag];
  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}
  const result = Object.prototype.toString.call(value);
  if (unmasked) {
    if (hasOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

// ============================================================================
// STRING UTILITIES
// ============================================================================

/**
 * Converts a value to a string representation.
 * Handles arrays, symbols, and special numeric values like -0.
 * @param {any} value - The value to convert
 * @returns {string} The string representation
 */
export function toString(value) {
  if (typeof value == "string") {
    return value;
  }
  if (Array.isArray(value)) {
    return arrayMap(value, toString) + "";
  }
  if (isSymbol(value)) {
    const symbolProto = typeof Symbol !== 'undefined' ? Symbol.prototype : undefined;
    const symbolToString = symbolProto ? symbolProto.toString : undefined;
    return symbolToString ? symbolToString.call(value) : "";
  }
  const result = value + "";
  return (result == "0" && 1 / value == -Infinity) ? "-0" : result;
}

/**
 * Converts a function to a string.
 * @param {Function} func - The function to convert
 * @returns {string} The string representation
 */
export function funcToString(func) {
  if (func != null) {
    try {
      return Function.prototype.toString.call(func);
    } catch (e) {}
    try {
      return func + "";
    } catch (e) {}
  }
  return "";
}

// ============================================================================
// ARRAY UTILITIES
// ============================================================================

/**
 * Maps an array to a new array using a callback function.
 * Similar to Array.prototype.map.
 * @param {Array} array - The array to map
 * @param {Function} callback - The mapping function
 * @returns {Array} The mapped array
 */
export function arrayMap(array, callback) {
  let index = -1;
  const length = array == null ? 0 : array.length;
  const result = Array(length);
  while (++index < length) {
    result[index] = callback(array[index], index, array);
  }
  return result;
}

/**
 * Copies array values to a new array.
 * @param {Array} source - The source array
 * @param {Array} [array] - The destination array
 * @returns {Array} The copied array
 */
export function copyArray(source, array) {
  let index = -1;
  const length = source.length;
  array ||= Array(length);
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

/**
 * Iterates over an array, invoking a callback for each element.
 * @param {Array} array - The array to iterate over
 * @param {Function} iteratee - The function invoked per iteration
 * @returns {Array} The array
 */
export function arrayEach(array, iteratee) {
  let index = -1;
  const length = array == null ? 0 : array.length;
  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

/**
 * Finds the index of the first element that passes a test.
 * @param {Array} array - The array to search
 * @param {Function} predicate - The test function
 * @param {number} fromIndex - The index to start searching from
 * @param {boolean} fromRight - Whether to search from right to left
 * @returns {number} The index of the found element, or -1
 */
export function baseFindIndex(array, predicate, fromIndex, fromRight) {
  const length = array.length;
  let index = fromIndex + (fromRight ? 1 : -1);
  while (fromRight ? index-- : ++index < length) {
    if (predicate(array[index], index, array)) {
      return index;
    }
  }
  return -1;
}

/**
 * Performs a strict equality search for a value in an array.
 * @param {Array} array - The array to search
 * @param {any} value - The value to search for
 * @param {number} fromIndex - The index to start searching from
 * @returns {number} The index of the found element, or -1
 */
export function strictIndexOf(array, value, fromIndex) {
  const length = array.length;
  let index = fromIndex - 1;
  while (++index < length) {
    if (array[index] === value) {
      return index;
    }
  }
  return -1;
}

/**
 * Base implementation of indexOf that supports NaN.
 * @param {Array} array - The array to search
 * @param {any} value - The value to search for
 * @param {number} fromIndex - The index to start searching from
 * @returns {number} The index of the found element, or -1
 */
export function baseIndexOf(array, value, fromIndex) {
  if (value === value) {
    return strictIndexOf(array, value, fromIndex);
  }
  return baseFindIndex(array, isNaN, fromIndex);
}

/**
 * Checks if a value exists in an array.
 * @param {Array} array - The array to search
 * @param {any} value - The value to search for
 * @returns {boolean} True if the value exists
 */
export function baseIncludes(array, value) {
  const length = array == null ? 0 : array.length;
  return !!length && baseIndexOf(array, value, 0) > -1;
}

// ============================================================================
// OBJECT UTILITIES
// ============================================================================

/**
 * Gets a value from an object by key.
 * @param {Object} object - The object to query
 * @param {string} key - The key of the value to get
 * @returns {any} The value, or undefined
 */
export function getValue(object, key) {
  return object == null ? undefined : object[key];
}

/**
 * Base implementation for assigning a value to an object property.
 * @param {Object} object - The object to modify
 * @param {string} key - The key of the property
 * @param {any} value - The value to assign
 */
export function baseAssignValue(object, key, value) {
  if (key == "__proto__" && Object.defineProperty) {
    Object.defineProperty(object, key, {
      configurable: true,
      enumerable: true,
      value: value,
      writable: true,
    });
  } else {
    object[key] = value;
  }
}

/**
 * Assigns a value to an object property if the current value differs.
 * @param {Object} object - The object to modify
 * @param {string} key - The key of the property
 * @param {any} value - The value to assign
 */
export function assignValue(object, key, value) {
  const objValue = object[key];
  if (!Object.prototype.hasOwnProperty.call(object, key) ||
      !eq(objValue, value) ||
      (value === undefined && !(key in object))) {
    baseAssignValue(object, key, value);
  }
}

/**
 * Creates an object that inherits from a prototype.
 * @param {Object} prototype - The object to inherit from
 * @returns {Object} The new object
 */
export function baseCreate(prototype) {
  if (!isObject(prototype)) {
    return {};
  }
  if (Object.create) {
    return Object.create(prototype);
  }
  function Ctor() {}
  Ctor.prototype = prototype;
  const result = new Ctor();
  Ctor.prototype = undefined;
  return result;
}

/**
 * Performs a shallow equality check between two values.
 * Handles NaN comparison correctly.
 * @param {any} value - The first value
 * @param {any} other - The second value
 * @returns {boolean} True if values are equal
 */
export function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

// ============================================================================
// FUNCTION UTILITIES
// ============================================================================

/**
 * Identity function that returns its input unchanged.
 * @param {any} value - The value to return
 * @returns {any} The same value passed in
 */
export function identity(value) {
  return value;
}

/**
 * Applies a function with arguments using Function.prototype.apply.
 * Optimized for small argument counts.
 * @param {Function} func - The function to apply
 * @param {Object} thisArg - The 'this' binding
 * @param {Array} args - The arguments
 * @returns {any} The result
 */
export function apply(func, thisArg, args) {
  switch (args.length) {
    case 0:
      return func.call(thisArg);
    case 1:
      return func.call(thisArg, args[0]);
    case 2:
      return func.call(thisArg, args[0], args[1]);
    case 3:
      return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}

/**
 * Creates a function that returns a constant value.
 * @param {any} value - The value to return
 * @returns {Function} The new constant function
 */
export function constant(value) {
  return function() {
    return value;
  };
}

/**
 * Creates a function that invokes func with a short circuit if called frequently.
 * Prevents excessive calls within a short time window.
 * @param {Function} func - The function to restrict
 * @returns {Function} The restricted function
 */
export function shortOut(func) {
  let count = 0;
  let lastCalled = 0;
  return function() {
    const stamp = Date.now();
    const remaining = 16 - (stamp - lastCalled);
    lastCalled = stamp;
    if (remaining > 0) {
      if (++count >= 800) {
        return arguments[0];
      }
    } else {
      count = 0;
    }
    return func.apply(undefined, arguments);
  };
}

/**
 * Sets the toString method of a function.
 * @param {Function} func - The function to modify
 * @param {Function} srcFunc - The function whose toString to copy
 * @returns {Function} The modified function
 */
export function baseSetToString(func, srcFunc) {
  if (!Object.defineProperty) {
    return identity;
  }
  return Object.defineProperty(func, "toString", {
    configurable: true,
    enumerable: false,
    value: constant(srcFunc),
    writable: true,
  });
}

/**
 * Sets the toString method with short-out protection.
 * @param {Function} func - The function to modify
 * @param {Function} srcFunc - The function whose toString to copy
 * @returns {Function} The modified function
 */
export function setToString(func, srcFunc) {
  return shortOut(baseSetToString)(func, srcFunc);
}

/**
 * No-op function that does nothing.
 * @returns {void}
 */
export function noop() {}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  // Type checking
  isObjectLike,
  isObject,
  isSymbol,
  isFunction,
  isNaN,
  isIndex,
  getTypeTag,

  // String utilities
  toString,
  funcToString,

  // Array utilities
  arrayMap,
  copyArray,
  arrayEach,
  baseFindIndex,
  strictIndexOf,
  baseIndexOf,
  baseIncludes,

  // Object utilities
  getValue,
  baseAssignValue,
  assignValue,
  baseCreate,
  eq,

  // Function utilities
  identity,
  apply,
  constant,
  shortOut,
  baseSetToString,
  setToString,
  noop,
};
