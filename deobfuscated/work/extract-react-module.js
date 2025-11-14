#!/usr/bin/env node

/**
 * Module Extractor - ReactExports
 *
 * Extracts ReactExports module from the monolithic file
 */

const fs = require('fs');
const path = require('path');

console.log('📦 Extracting ReactExports Module');
console.log('='.repeat(60));

const sourceFile = path.join(__dirname, 'step14-renamed/deobfuscated-renamed-wave8.js');
const outputDir = path.join(__dirname, '../src/modules');
const outputFile = path.join(outputDir, 'react-exports.js');

// ReactExports is at lines 25218-25667
const START_LINE = 25218;
const END_LINE = 25667;

console.log(`\n📂 Loading source file...`);
const content = fs.readFileSync(sourceFile, 'utf8');
const lines = content.split('\n');
console.log(`✅ Loaded ${lines.length.toLocaleString()} lines\n`);

console.log(`📍 Extracting lines ${START_LINE}-${END_LINE}...`);

// Extract the module code (subtract 1 because array is 0-indexed)
const moduleLines = lines.slice(START_LINE - 1, END_LINE);
const moduleCode = moduleLines.join('\n');

console.log(`✅ Extracted ${moduleLines.length} lines (${(moduleCode.length / 1024).toFixed(1)} KB)\n`);

// Build the new module file
const moduleFile = `/**
 * React Exports Module
 *
 * Extracted from Claude Code CLI bundle.
 * React 18.3.1 - Terminal rendering infrastructure
 *
 * Original location: Lines ${START_LINE}-${END_LINE}
 * Size: ${moduleLines.length} lines
 */

import {
  createCommonJSModule,
  SymbolPrimitive as Symbol
} from '../runtime/module-system.js';

${moduleCode}

export default VA;
export { ReactExports };
`;

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`📁 Created directory: ${outputDir}`);
}

// Write the module file
fs.writeFileSync(outputFile, moduleFile);
console.log(`✅ Wrote module to: ${outputFile}`);
console.log(`   Size: ${(moduleFile.length / 1024).toFixed(1)} KB`);

// Create a test file to validate the extraction
const testFile = `/**
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
    console.log(\`✅ \${name}\`);
    testsPassed++;
  } catch (error) {
    console.log(\`❌ \${name}: \${error.message}\`);
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
    throw new Error(\`Expected 18.3.1, got \${ReactModule.version}\`);
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
      throw new Error(\`Missing API: \${api}\`);
    }
  }
});

// Test 4: createElement works
test('createElement works', () => {
  const element = ReactModule.createElement('div', { className: 'test' }, 'Hello');
  if (!element) throw new Error('createElement returned falsy value');
  if (element.type !== 'div') throw new Error(\`Expected type 'div', got \${element.type}\`);
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
      throw new Error(\`Hook \${hook} is not a function\`);
    }
  }
});

// Results
console.log('\\n' + '='.repeat(60));
console.log(\`Tests passed: \${testsPassed}\`);
console.log(\`Tests failed: \${testsFailed}\`);
console.log(\`Total: \${testsPassed + testsFailed}\`);

if (testsFailed === 0) {
  console.log('\\n✨ All tests passed! React module extracted successfully.\\n');
  process.exit(0);
} else {
  console.log(\`\\n❌ \${testsFailed} test(s) failed.\\n\`);
  process.exit(1);
}
`;

const testOutputFile = path.join(outputDir, 'react-exports.test.js');
fs.writeFileSync(testOutputFile, testFile);
console.log(`✅ Wrote test file: ${testOutputFile}\n`);

console.log('📊 Extraction Summary:');
console.log(`  Module: ReactExports (React 18.3.1)`);
console.log(`  Lines: ${START_LINE}-${END_LINE} (${moduleLines.length} lines)`);
console.log(`  Size: ${(moduleFile.length / 1024).toFixed(1)} KB`);
console.log(`  Output: ${outputFile}`);
console.log(`  Test: ${testOutputFile}`);

console.log('\n✨ Extraction complete!\n');
console.log('Next steps:');
console.log('  1. Run tests: node src/modules/react-exports.test.js');
console.log('  2. Update main file to import this module');
console.log('  3. Test that CLI still works\n');
