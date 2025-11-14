/**
 * Browser Safety Utilities Test
 *
 * Validates that the extracted utility module works correctly
 */

import browserSafetyUtilsExport from './browser-safety.js';

console.log('🧪 Testing Browser Safety Utilities (xl)');
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

// Test 1: Module exports exist
test('Module exports exist', () => {
  if (!browserSafetyUtilsExport) throw new Error('Module is undefined');
});

// Test 2: Module is an object
test('Module is an object', () => {
  if (typeof browserSafetyUtilsExport !== 'object') {
    throw new Error(`Expected object, got ${typeof browserSafetyUtilsExport}`);
  }
});

// Test 3: Module has __esModule flag
test('Module has __esModule flag', () => {
  if (!browserSafetyUtilsExport.__esModule) {
    throw new Error('Module missing __esModule flag');
  }
});

// Test 4: _getWindowSafe exists
test('_getWindowSafe function exists', () => {
  if (typeof browserSafetyUtilsExport._getWindowSafe !== 'function') {
    throw new Error('_getWindowSafe is not a function');
  }
});

// Test 5: _getDocumentSafe exists
test('_getDocumentSafe function exists', () => {
  if (typeof browserSafetyUtilsExport._getDocumentSafe !== 'function') {
    throw new Error('_getDocumentSafe is not a function');
  }
});

// Test 6: _isServerEnv exists
test('_isServerEnv function exists', () => {
  if (typeof browserSafetyUtilsExport._isServerEnv !== 'function') {
    throw new Error('_isServerEnv is not a function');
  }
});

// Test 7: _addWindowEventListenerSafe exists
test('_addWindowEventListenerSafe function exists', () => {
  if (typeof browserSafetyUtilsExport._addWindowEventListenerSafe !== 'function') {
    throw new Error('_addWindowEventListenerSafe is not a function');
  }
});

// Test 8: _addDocumentEventListenerSafe exists
test('_addDocumentEventListenerSafe function exists', () => {
  if (typeof browserSafetyUtilsExport._addDocumentEventListenerSafe !== 'function') {
    throw new Error('_addDocumentEventListenerSafe is not a function');
  }
});

// Test 9: _getCurrentPageUrlSafe exists
test('_getCurrentPageUrlSafe function exists', () => {
  if (typeof browserSafetyUtilsExport._getCurrentPageUrlSafe !== 'function') {
    throw new Error('_getCurrentPageUrlSafe is not a function');
  }
});

// Test 10: _isServerEnv detects Node.js environment
test('_isServerEnv detects Node.js environment', () => {
  const isServer = browserSafetyUtilsExport._isServerEnv();
  // In Node.js, should return true
  if (isServer !== true) {
    throw new Error(`Expected true in Node.js, got ${isServer}`);
  }
});

// Test 11: _getWindowSafe returns null in Node.js
test('_getWindowSafe returns null in Node.js', () => {
  const win = browserSafetyUtilsExport._getWindowSafe();
  if (win !== null) {
    throw new Error(`Expected null in Node.js, got ${win}`);
  }
});

// Test 12: _getDocumentSafe returns null in Node.js
test('_getDocumentSafe returns null in Node.js', () => {
  const doc = browserSafetyUtilsExport._getDocumentSafe();
  if (doc !== null) {
    throw new Error(`Expected null in Node.js, got ${doc}`);
  }
});

// Test 13: _getCurrentPageUrlSafe returns undefined in Node.js
test('_getCurrentPageUrlSafe returns undefined in Node.js', () => {
  const url = browserSafetyUtilsExport._getCurrentPageUrlSafe();
  if (url !== undefined) {
    throw new Error(`Expected undefined in Node.js, got ${url}`);
  }
});

// Test 14: Event listeners don't throw in Node.js
test('Event listeners are safe to call in Node.js', () => {
  // These should not throw even though window/document don't exist
  browserSafetyUtilsExport._addWindowEventListenerSafe('click', () => {});
  browserSafetyUtilsExport._addDocumentEventListenerSafe('load', () => {});
  // If we got here without throwing, test passes
});

// Results
console.log('\n' + '='.repeat(60));
console.log(`Tests passed: ${testsPassed}`);
console.log(`Tests failed: ${testsFailed}`);
console.log(`Total: ${testsPassed + testsFailed}`);

if (testsFailed === 0) {
  console.log('\n✨ All tests passed!\n');
  process.exit(0);
} else {
  console.log(`\n❌ ${testsFailed} test(s) failed.\n`);
  process.exit(1);
}
