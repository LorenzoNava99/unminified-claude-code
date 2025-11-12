/**
 * Module System Runtime Tests
 *
 * Validates that the module system runtime provides correct behavior
 * for extracted modules.
 */

import {
  defineProperty,
  createCommonJSModule,
  createESModule,
  hasOwnProperty,
  interopRequireWildcard,
  interopRequireDefault,
  objectCreate,
  getPrototypeOf
} from './module-system.js';

console.log('🧪 Testing Module System Runtime');
console.log('='.repeat(60));

let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    testsPassed++;
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    testsFailed++;
  }
}

// Test 1: defineProperty
test('defineProperty works', () => {
  const obj = {};
  defineProperty(obj, 'test', { value: 42, writable: false });
  if (obj.test !== 42) throw new Error('Value not set');
  if (Object.getOwnPropertyDescriptor(obj, 'test').writable !== false) {
    throw new Error('Property descriptor not set');
  }
});

// Test 2: createCommonJSModule
test('createCommonJSModule creates module', () => {
  const module = createCommonJSModule(exports => {
    exports.hello = 'world';
    exports.add = (a, b) => a + b;
  });

  if (module.hello !== 'world') throw new Error('String export failed');
  if (module.add(2, 3) !== 5) throw new Error('Function export failed');
});

// Test 3: createESModule
test('createESModule sets __esModule flag', () => {
  const module = createESModule(exports => {
    exports.default = 'default value';
    exports.named = 'named export';
  });

  if (!module.__esModule) throw new Error('__esModule flag not set');
  if (module.default !== 'default value') throw new Error('Default export failed');
  if (module.named !== 'named export') throw new Error('Named export failed');
});

// Test 4: hasOwnProperty
test('hasOwnProperty works correctly', () => {
  const obj = { own: true };
  Object.setPrototypeOf(obj, { inherited: true });

  if (!hasOwnProperty.call(obj, 'own')) throw new Error('Own property not detected');
  if (hasOwnProperty.call(obj, 'inherited')) throw new Error('Inherited property incorrectly detected');
});

// Test 5: interopRequireDefault with ES module
test('interopRequireDefault handles ES modules', () => {
  const esModule = { __esModule: true, default: 'value' };
  const result = interopRequireDefault(esModule);

  if (result !== esModule) throw new Error('ES module not returned as-is');
});

// Test 6: interopRequireDefault with CommonJS module
test('interopRequireDefault handles CommonJS modules', () => {
  const cjsModule = { value: 'test' };
  const result = interopRequireDefault(cjsModule);

  if (result.default !== cjsModule) throw new Error('CommonJS module not wrapped correctly');
});

// Test 7: interopRequireWildcard with ES module
test('interopRequireWildcard handles ES modules', () => {
  const esModule = { __esModule: true, named: 'value' };
  const result = interopRequireWildcard(esModule);

  if (result !== esModule) throw new Error('ES module not returned as-is');
});

// Test 8: interopRequireWildcard with CommonJS module
test('interopRequireWildcard handles CommonJS modules', () => {
  const cjsModule = { value: 'test', func: () => 'result' };
  const result = interopRequireWildcard(cjsModule);

  if (result.default !== cjsModule) throw new Error('Default not set to module');
  if (result.value !== 'test') throw new Error('Named export not copied');
  if (result.func() !== 'result') throw new Error('Function export not copied');
});

// Test 9: objectCreate
test('objectCreate works', () => {
  const proto = { inherited: true };
  const obj = objectCreate(proto);

  if (!obj.inherited) throw new Error('Prototype not inherited');
  if (obj.hasOwnProperty('inherited')) throw new Error('Property should be inherited, not own');
});

// Test 10: getPrototypeOf
test('getPrototypeOf works', () => {
  const proto = { test: true };
  const obj = Object.create(proto);
  const result = getPrototypeOf(obj);

  if (result !== proto) throw new Error('Prototype not retrieved correctly');
});

// Test 11: Nested module creation
test('Nested module creation works', () => {
  const outer = createCommonJSModule(OuterExports => {
    const inner = createCommonJSModule(InnerExports => {
      InnerExports.value = 42;
    });

    OuterExports.inner = inner;
    OuterExports.doubled = () => inner.value * 2;
  });

  if (outer.inner.value !== 42) throw new Error('Nested module value incorrect');
  if (outer.doubled() !== 84) throw new Error('Nested module function incorrect');
});

// Test 12: Module with defineProperty usage
test('Module with defineProperty works', () => {
  const module = createCommonJSModule(exports => {
    defineProperty(exports, 'readOnly', {
      value: 'immutable',
      writable: false,
      enumerable: true
    });

    defineProperty(exports, 'getter', {
      get: () => 'computed',
      enumerable: true
    });
  });

  if (module.readOnly !== 'immutable') throw new Error('Read-only value incorrect');
  if (module.getter !== 'computed') throw new Error('Getter value incorrect');

  try {
    module.readOnly = 'changed';
    if (module.readOnly === 'changed') throw new Error('Read-only property was changed');
  } catch (e) {
    // Expected in strict mode
  }
});

// Results
console.log('\n' + '='.repeat(60));
console.log(`Tests passed: ${testsPassed}`);
console.log(`Tests failed: ${testsFailed}`);
console.log(`Total: ${testsPassed + testsFailed}`);

if (testsFailed === 0) {
  console.log('\n✨ All tests passed! Module system runtime is working correctly.\n');
  process.exit(0);
} else {
  console.log(`\n❌ ${testsFailed} test(s) failed. Module system needs fixes.\n`);
  process.exit(1);
}
