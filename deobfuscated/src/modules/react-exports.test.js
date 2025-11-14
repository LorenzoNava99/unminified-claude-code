/**
 * React Exports Module Test
 *
 * Validates that the extracted React module works correctly
 */

import ReactModule from './react-exports.js';

console.log('🧪 Testing React Exports Module');
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
  if (!ReactModule) throw new Error('ReactModule is undefined');
});

// Test 2: React version is correct
test('React version is 18.3.1', () => {
  if (ReactModule.version !== '18.3.1') {
    throw new Error(`Expected 18.3.1, got ${ReactModule.version}`);
  }
});

// Test 3: Core React APIs exist
test('Core React APIs exist', () => {
  const requiredAPIs = [
    'createElement',
    'Component',
    'PureComponent',
    'useState',
    'useEffect',
    'useMemo',
    'useCallback',
    'useRef',
    'Fragment'
  ];

  for (const api of requiredAPIs) {
    if (!(api in ReactModule)) {
      throw new Error(`Missing API: ${api}`);
    }
  }
});

// Test 4: createElement works
test('createElement works', () => {
  const element = ReactModule.createElement('div', { className: 'test' }, 'Hello');
  if (!element) throw new Error('createElement returned falsy value');
  if (element.type !== 'div') throw new Error(`Expected type 'div', got ${element.type}`);
  if (element.props.className !== 'test') throw new Error('Props not set correctly');
});

// Test 5: Fragment exists
test('Fragment exists', () => {
  if (!ReactModule.Fragment) throw new Error('Fragment is undefined');
});

// Test 6: Hooks exist
test('All hooks exist', () => {
  const hooks = [
    'useState',
    'useEffect',
    'useContext',
    'useReducer',
    'useCallback',
    'useMemo',
    'useRef',
    'useImperativeHandle',
    'useLayoutEffect',
    'useDebugValue',
    'useDeferredValue',
    'useTransition',
    'useId',
    'useSyncExternalStore'
  ];

  for (const hook of hooks) {
    if (typeof ReactModule[hook] !== 'function') {
      throw new Error(`Hook ${hook} is not a function`);
    }
  }
});

// Results
console.log('\n' + '='.repeat(60));
console.log(`Tests passed: ${testsPassed}`);
console.log(`Tests failed: ${testsFailed}`);
console.log(`Total: ${testsPassed + testsFailed}`);

if (testsFailed === 0) {
  console.log('\n✨ All tests passed! React module extracted successfully.\n');
  process.exit(0);
} else {
  console.log(`\n❌ ${testsFailed} test(s) failed.\n`);
  process.exit(1);
}
