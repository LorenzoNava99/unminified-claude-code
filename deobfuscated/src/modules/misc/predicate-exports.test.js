/**
 * PredicateExports Test
 *
 * Validates that the extracted module works correctly
 */

import PredicateExportsModule from './predicate-exports.js';

console.log('🧪 Testing PredicateExports');
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
  if (!PredicateExportsModule) throw new Error('Module is undefined');
});

// Test 2: Module is an object
test('Module is an object', () => {
  if (typeof PredicateExportsModule !== 'object') {
    throw new Error(`Expected object, got ${typeof PredicateExportsModule}`);
  }
});

// Test 3: Module has __esModule flag
test('Module has __esModule flag', () => {
  if (!PredicateExportsModule.__esModule) {
    throw new Error('Module missing __esModule flag');
  }
});

// Test 4: PatternPredicate class exists
test('PatternPredicate class exists', () => {
  if (!PredicateExportsModule.PatternPredicate) {
    throw new Error('PatternPredicate not found');
  }
  if (typeof PredicateExportsModule.PatternPredicate !== 'function') {
    throw new Error('PatternPredicate is not a class/function');
  }
});

// Test 5: ExactPredicate class exists
test('ExactPredicate class exists', () => {
  if (!PredicateExportsModule.ExactPredicate) {
    throw new Error('ExactPredicate not found');
  }
  if (typeof PredicateExportsModule.ExactPredicate !== 'function') {
    throw new Error('ExactPredicate is not a class/function');
  }
});

// Test 6: PatternPredicate wildcard matching works
test('PatternPredicate wildcard matching works', () => {
  const PatternPredicate = PredicateExportsModule.PatternPredicate;
  const predicate = new PatternPredicate('*.js');

  if (!predicate.match('test.js')) {
    throw new Error('Should match *.js pattern');
  }
  if (predicate.match('test.ts')) {
    throw new Error('Should not match non-.js file');
  }
});

// Test 7: PatternPredicate hasWildcard static method works
test('PatternPredicate.hasWildcard static method works', () => {
  const PatternPredicate = PredicateExportsModule.PatternPredicate;

  if (!PatternPredicate.hasWildcard('*.js')) {
    throw new Error('Should detect wildcard in *.js');
  }
  if (PatternPredicate.hasWildcard('test.js')) {
    throw new Error('Should not detect wildcard in test.js');
  }
});

// Test 8: ExactPredicate exact matching works
test('ExactPredicate exact matching works', () => {
  const ExactPredicate = PredicateExportsModule.ExactPredicate;
  const predicate = new ExactPredicate('test.js');

  if (!predicate.match('test.js')) {
    throw new Error('Should match exact string');
  }
  if (predicate.match('other.js')) {
    throw new Error('Should not match different string');
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
