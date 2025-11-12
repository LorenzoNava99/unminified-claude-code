# Utilities Module

Comprehensive collection of utility functions for type checking, array operations, object manipulation, string processing, and general-purpose helpers.

## Overview

This module provides low-level utility functions that are used throughout the codebase. These utilities handle common operations like type checking, array manipulation, object property access, and functional programming patterns.

## Type Checking Utilities

### `isObjectLike(value)`
Checks if a value is object-like (not null and typeof === 'object').

```javascript
isObjectLike({});        // true
isObjectLike([]);        // true
isObjectLike(null);      // false
isObjectLike(() => {});  // false
```

### `isObject(value)`
Checks if a value is an object (including functions).

```javascript
isObject({});          // true
isObject([]);          // true
isObject(() => {});    // true
isObject(null);        // false
```

### `isSymbol(value)`
Checks if a value is a Symbol.

```javascript
isSymbol(Symbol('foo'));  // true
isSymbol('foo');          // false
```

### `isFunction(value)`
Checks if a value is a function (including async and generator functions).

```javascript
isFunction(() => {});                    // true
isFunction(async () => {});              // true
isFunction(function* () {});             // true
isFunction({});                          // false
```

### `isNaN(value)`
Checks if a value is NaN.

```javascript
isNaN(NaN);   // true
isNaN(1);     // false
isNaN('foo'); // false
```

### `isIndex(value, [length])`
Checks if a value is a valid array index.

```javascript
isIndex(0);           // true
isIndex(5, 10);       // true
isIndex(-1);          // false
isIndex('0');         // true
isIndex('foo');       // false
```

### `getTypeTag(value)`
Gets the type tag for a value using Symbol.toStringTag or toString.

```javascript
getTypeTag({});              // "[object Object]"
getTypeTag([]);              // "[object Array]"
getTypeTag(null);            // "[object Null]"
getTypeTag(undefined);       // "[object Undefined]"
```

## String Utilities

### `toString(value)`
Converts a value to a string representation. Handles arrays, symbols, and special numeric values like -0.

```javascript
toString('foo');           // 'foo'
toString([1, 2, 3]);       // '1,2,3'
toString(-0);              // '-0'
toString(Symbol('foo'));   // 'Symbol(foo)'
```

### `funcToString(func)`
Converts a function to a string representation.

```javascript
funcToString(() => {});  // '() => {}'
funcToString(null);      // ''
```

## Array Utilities

### `arrayMap(array, callback)`
Maps an array to a new array using a callback function. Similar to Array.prototype.map.

```javascript
arrayMap([1, 2, 3], x => x * 2);  // [2, 4, 6]
```

### `copyArray(source, [array])`
Copies array values to a new array.

```javascript
copyArray([1, 2, 3]);              // [1, 2, 3]
copyArray([1, 2, 3], [0, 0, 0]);   // [1, 2, 3]
```

### `arrayEach(array, iteratee)`
Iterates over an array, invoking a callback for each element.

```javascript
arrayEach([1, 2, 3], (value, index) => {
  console.log(value, index);
});
```

### `baseFindIndex(array, predicate, fromIndex, fromRight)`
Finds the index of the first element that passes a test.

```javascript
baseFindIndex([1, 2, 3, 4], x => x > 2, 0, false);  // 2
```

### `strictIndexOf(array, value, fromIndex)`
Performs a strict equality search for a value in an array.

```javascript
strictIndexOf([1, 2, 3], 2, 0);  // 1
strictIndexOf([1, 2, 3], 4, 0);  // -1
```

### `baseIndexOf(array, value, fromIndex)`
Base implementation of indexOf that supports NaN.

```javascript
baseIndexOf([1, NaN, 3], NaN, 0);  // 1
```

### `baseIncludes(array, value)`
Checks if a value exists in an array.

```javascript
baseIncludes([1, 2, 3], 2);    // true
baseIncludes([1, 2, 3], 4);    // false
baseIncludes([1, NaN, 3], NaN); // true
```

## Object Utilities

### `getValue(object, key)`
Gets a value from an object by key.

```javascript
getValue({ a: 1, b: 2 }, 'a');  // 1
getValue(null, 'a');             // undefined
```

### `baseAssignValue(object, key, value)`
Base implementation for assigning a value to an object property.

```javascript
const obj = {};
baseAssignValue(obj, 'foo', 'bar');
// obj is now { foo: 'bar' }
```

### `assignValue(object, key, value)`
Assigns a value to an object property if the current value differs.

```javascript
const obj = { foo: 'bar' };
assignValue(obj, 'foo', 'bar');  // No change (value is same)
assignValue(obj, 'foo', 'baz');  // Changes to 'baz'
```

### `baseCreate(prototype)`
Creates an object that inherits from a prototype.

```javascript
const proto = { foo: 'bar' };
const obj = baseCreate(proto);
obj.foo;  // 'bar'
```

### `eq(value, other)`
Performs a shallow equality check between two values. Handles NaN comparison correctly.

```javascript
eq(1, 1);       // true
eq(NaN, NaN);   // true (unlike ===)
eq(1, 2);       // false
```

## Function Utilities

### `identity(value)`
Identity function that returns its input unchanged.

```javascript
identity(5);     // 5
identity('foo'); // 'foo'
```

### `apply(func, thisArg, args)`
Applies a function with arguments. Optimized for small argument counts.

```javascript
apply(Math.max, null, [1, 2, 3]);  // 3
```

### `constant(value)`
Creates a function that returns a constant value.

```javascript
const getTrue = constant(true);
getTrue();  // true
```

### `shortOut(func)`
Creates a function that invokes func with a short circuit if called frequently.

```javascript
const throttled = shortOut(expensiveFunction);
// Prevents excessive calls within short time window
```

### `baseSetToString(func, srcFunc)`
Sets the toString method of a function.

```javascript
const wrapper = () => {};
baseSetToString(wrapper, originalFunc);
wrapper.toString();  // Returns originalFunc's toString
```

### `setToString(func, srcFunc)`
Sets the toString method with short-out protection.

```javascript
const wrapper = () => {};
setToString(wrapper, originalFunc);
```

### `noop()`
No-op function that does nothing.

```javascript
noop();  // Does nothing
```

## Dependencies

None - this is a foundational module with no internal dependencies.

## Usage

```javascript
import {
  isObject,
  isFunction,
  arrayMap,
  getValue,
  identity,
  toString
} from './utils/index.js';

// Use the utilities
if (isObject(value)) {
  const mapped = arrayMap(value.items, identity);
}
```

## Notes

- All utilities are designed for performance and correctness
- Type checking utilities handle edge cases (NaN, -0, Symbol, etc.)
- Array utilities provide functional programming patterns
- Object utilities safely handle `__proto__` and other special properties
- Function utilities include throttling and composition helpers
