# Module System

Core module loading and interop utilities for handling CommonJS and ES6 modules.

## Overview

This module provides foundational utilities for module loading, interoperability between CommonJS and ES6 modules, and lazy module evaluation. It's used throughout the codebase to handle dynamic module loading and ensure compatibility across different module systems.

## Key Functions

### `interopRequireWildcard(module, useDefault, namespace)`

Handles ES6 module interop for wildcard imports. Creates a namespace object with proper `__esModule` flag.

**Parameters:**
- `module` - The module to import
- `useDefault` - Whether to use default export
- `namespace` - The namespace object to populate

**Returns:** The namespace object with all module exports

**Example:**
```javascript
import * as module from './some-module';
const ns = interopRequireWildcard(module);
```

### `createCommonJSModule(initializer, cache)`

Creates a CommonJS module wrapper with lazy loading. The module is only initialized on first access.

**Parameters:**
- `initializer` - Function that initializes the module
- `cache` - Cache object for the module exports

**Returns:** Function that returns the module exports

**Example:**
```javascript
const getModule = createCommonJSModule((exports, module) => {
  module.exports = { foo: 'bar' };
});
const mod = getModule(); // Initializes on first call
```

### `defineGetters(target, getters)`

Defines getter properties on an object with enumerable and configurable attributes. Used for lazy property evaluation.

**Parameters:**
- `target` - The target object
- `getters` - Object mapping property names to getter functions

**Example:**
```javascript
const obj = {};
defineGetters(obj, {
  foo: () => expensiveComputation(),
  bar: () => anotherComputation()
});
```

### `createLazyModule(initializer, cache)`

Creates a lazily-evaluated module initializer. The module is only initialized when first accessed.

**Parameters:**
- `initializer` - Function that initializes and returns the module
- `cache` - Cache for the initialized module

**Returns:** Function that returns the cached module

**Example:**
```javascript
const getLazyModule = createLazyModule(() => {
  console.log('Initializing...');
  return { data: 'loaded' };
});
getLazyModule(); // Logs "Initializing..." and returns module
getLazyModule(); // Returns cached module, no log
```

### `nodeRequire`

Node.js require function for this module. Allows requiring CommonJS modules from ES6 modules.

**Example:**
```javascript
const fs = nodeRequire('fs');
```

## Dependencies

- `node:module` - For `createRequire` function

## Usage

```javascript
import {
  interopRequireWildcard,
  createCommonJSModule,
  defineGetters,
  createLazyModule,
  nodeRequire
} from './modules/index.js';

// Use the utilities as needed
```

## Notes

- This is a **foundational module** with no dependencies on other internal modules
- All functions use lazy evaluation patterns to optimize performance
- Handles interop between CommonJS and ES6 module systems seamlessly
