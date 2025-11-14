/**
 * createConstMap Utility Test
 *
 * Validates that the extracted utility module works correctly
 */

import createConstMapModuleExport from './create-const-map.js';

console.log('🧪 Testing createConstMap Utility (ti1)');
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
  if (!createConstMapModuleExport) throw new Error('Module is undefined');
});

// Test 2: Module is an object
test('Module is an object', () => {
  if (typeof createConstMapModuleExport !== 'object') {
    throw new Error(`Expected object, got ${typeof createConstMapModuleExport}`);
  }
});

// Test 3: Module has __esModule flag
test('Module has __esModule flag', () => {
  if (!createConstMapModuleExport.__esModule) {
    throw new Error('Module missing __esModule flag');
  }
});

// Test 4: createConstMap function exists
test('createConstMap function exists', () => {
  if (!createConstMapModuleExport.createConstMap) {
    throw new Error('createConstMap not found');
  }
  if (typeof createConstMapModuleExport.createConstMap !== 'function') {
    throw new Error('createConstMap is not a function');
  }
});

// Test 5: createConstMap works with basic array
test('createConstMap works with basic array', () => {
  const input = ['http.method', 'http.url', 'http.status_code'];
  const result = createConstMapModuleExport.createConstMap(input);

  if (result['HTTP_METHOD'] !== 'http.method') {
    throw new Error(`Expected HTTP_METHOD=http.method, got ${result['HTTP_METHOD']}`);
  }
  if (result['HTTP_URL'] !== 'http.url') {
    throw new Error(`Expected HTTP_URL=http.url, got ${result['HTTP_URL']}`);
  }
  if (result['HTTP_STATUS_CODE'] !== 'http.status_code') {
    throw new Error(`Expected HTTP_STATUS_CODE=http.status_code, got ${result['HTTP_STATUS_CODE']}`);
  }
});

// Test 6: Replaces dots and dashes with underscores in keys
test('Replaces dots and dashes with underscores in keys', () => {
  const input = ['db.system', 'http-method', 'net.peer.name'];
  const result = createConstMapModuleExport.createConstMap(input);

  // Keys have dots/dashes replaced with underscores, values stay original
  if (result['DB_SYSTEM'] !== 'db.system') {
    throw new Error(`Expected DB_SYSTEM=db.system, got ${result['DB_SYSTEM']}`);
  }
  if (result['HTTP_METHOD'] !== 'http-method') {
    throw new Error(`Expected HTTP_METHOD=http-method, got ${result['HTTP_METHOD']}`);
  }
  if (result['NET_PEER_NAME'] !== 'net.peer.name') {
    throw new Error(`Expected NET_PEER_NAME=net.peer.name, got ${result['NET_PEER_NAME']}`);
  }
});

// Test 7: Handles empty strings
test('Handles empty strings', () => {
  const input = ['valid', '', 'also-valid'];
  const result = createConstMapModuleExport.createConstMap(input);

  if (result['VALID'] !== 'valid') {
    throw new Error('Should have VALID key');
  }
  if (result['ALSO_VALID'] !== 'also-valid') {
    throw new Error('Should have ALSO_VALID key');
  }
  // Empty string should not create a key
  const keys = Object.keys(result);
  if (keys.length !== 2) {
    throw new Error(`Expected 2 keys, got ${keys.length}`);
  }
});

// Test 8: Converts to uppercase
test('Converts to uppercase', () => {
  const input = ['LowerCase', 'UPPERCASE', 'MiXeDcAsE'];
  const result = createConstMapModuleExport.createConstMap(input);

  if (result['LOWERCASE'] !== 'LowerCase') {
    throw new Error('Should convert to uppercase');
  }
  if (result['UPPERCASE'] !== 'UPPERCASE') {
    throw new Error('Should preserve uppercase');
  }
  if (result['MIXEDCASE'] !== 'MiXeDcAsE') {
    throw new Error('Should convert mixed case to uppercase');
  }
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
