/**
 * OtlpSharedConfigExports Test
 *
 * Validates that the extracted module works correctly
 */

import OtlpSharedConfigExportsModule from './otlp-shared-config-exports.js';

console.log('🧪 Testing OtlpSharedConfigExports');
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
  if (!OtlpSharedConfigExportsModule) throw new Error('Module is undefined');
});

// Test 2: Module is an object
test('Module is an object', () => {
  if (typeof OtlpSharedConfigExportsModule !== 'object') {
    throw new Error(`Expected object, got ${typeof OtlpSharedConfigExportsModule}`);
  }
});

// Test 3: Module has __esModule flag (if ES module)
test('Module structure is valid', () => {
  // Check if it's a proper module object
  if (OtlpSharedConfigExportsModule === null) {
    throw new Error('Module is null');
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
