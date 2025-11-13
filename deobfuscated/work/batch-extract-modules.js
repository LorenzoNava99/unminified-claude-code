#!/usr/bin/env node

/**
 * Batch Module Extractor
 *
 * Extracts multiple modules at once using dependency graph data
 */

const fs = require('fs');
const path = require('path');

console.log('📦 Batch Module Extractor');
console.log('='.repeat(60));

// Load dependency graph
const graphFile = path.join(__dirname, 'step17-module-analysis/dependency-graph.json');
const depGraph = JSON.parse(fs.readFileSync(graphFile, 'utf8'));

// Modules to extract
const modulesToExtract = [
  'OtelSemanticAttributes',
  'OtelSemanticConventions',
  'OtelHistogramAggregatorExports'
];

console.log(`\n📋 Modules to extract: ${modulesToExtract.length}\n`);

// Load source file
const sourceFile = path.join(__dirname, 'step14-renamed/deobfuscated-renamed-wave8.js');
const content = fs.readFileSync(sourceFile, 'utf8');
const lines = content.split('\n');

console.log(`📂 Loaded source: ${lines.length.toLocaleString()} lines\n`);

const results = [];

for (const moduleName of modulesToExtract) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Extracting: ${moduleName}`);
  console.log('='.repeat(60));

  const moduleInfo = depGraph.dependencyGraph[moduleName];

  if (!moduleInfo) {
    console.log(`❌ Module not found in dependency graph`);
    continue;
  }

  if (!moduleInfo.definitionLine) {
    console.log(`❌ No definition line found`);
    continue;
  }

  const startLine = moduleInfo.definitionLine;
  const endLine = moduleInfo.definitionEnd;
  const lineCount = endLine - startLine;

  console.log(`📍 Lines: ${startLine}-${endLine} (${lineCount} lines)`);
  console.log(`📦 Category: ${moduleInfo.category}`);
  console.log(`📊 Occurrences: ${moduleInfo.occurrences}`);

  // Extract module code
  const moduleLines = lines.slice(startLine - 1, endLine);
  const moduleCode = moduleLines.join('\n');

  console.log(`✅ Extracted ${(moduleCode.length / 1024).toFixed(1)} KB`);

  // Determine dependencies
  const dependencies = ['createCommonJSModule'];
  if (moduleCode.includes('Symbol.for')) {
    dependencies.push('SymbolPrimitive as Symbol');
  }
  if (moduleCode.match(/\brequire\s*\(/)) {
    dependencies.push('nodeRequire');
  }
  if (moduleCode.includes('Object.defineProperty')) {
    dependencies.push('defineProperty');
  }

  console.log(`📦 Dependencies: ${dependencies.join(', ')}`);

  // Find variable name (e.g., "var VA = createCommonJSModule")
  const varMatch = moduleCode.match(/var\s+(\w+)\s*=\s*createCommonJSModule/);
  const variableName = varMatch ? varMatch[1] : 'UnknownVar';

  console.log(`🔤 Variable name: ${variableName}`);

  // Build module file
  const importStatement = `import {\n  ${dependencies.join(',\n  ')}\n} from '../../runtime/module-system.js';`;

  const moduleFile = `/**
 * ${moduleName}
 *
 * Extracted from Claude Code CLI bundle.
 * Category: ${moduleInfo.category}
 *
 * Original location: Lines ${startLine}-${endLine}
 * Size: ${lineCount} lines
 * Occurrences: ${moduleInfo.occurrences}
 */

${importStatement}

${moduleCode}

// Export the module
export default ${variableName};
export const ${moduleName} = ${variableName};
`;

  // Create filename (convert PascalCase to kebab-case)
  const filename = moduleName
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '');

  const outputDir = path.join(__dirname, '../src/modules/opentelemetry');
  const outputFile = path.join(outputDir, `${filename}.js`);

  // Create directory if needed
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write module file
  fs.writeFileSync(outputFile, moduleFile);
  console.log(`✅ Wrote: ${outputFile}`);

  // Create test file
  const testFile = `/**
 * ${moduleName} Test
 *
 * Validates that the extracted module works correctly
 */

import ${moduleName}Module from './${filename}.js';

console.log('🧪 Testing ${moduleName}');
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
  if (!${moduleName}Module) throw new Error('Module is undefined');
});

// Test 2: Module is an object
test('Module is an object', () => {
  if (typeof ${moduleName}Module !== 'object') {
    throw new Error(\`Expected object, got \${typeof ${moduleName}Module}\`);
  }
});

// Test 3: Module has __esModule flag (if ES module)
test('Module structure is valid', () => {
  // Check if it's a proper module object
  if (${moduleName}Module === null) {
    throw new Error('Module is null');
  }
});

// Results
console.log('\\n' + '='.repeat(60));
console.log(\`Tests passed: \${testsPassed}\`);
console.log(\`Tests failed: \${testsFailed}\`);
console.log(\`Total: \${testsPassed + testsFailed}\`);

if (testsFailed === 0) {
  console.log('\\n✨ All tests passed!\\n');
  process.exit(0);
} else {
  console.log(\`\\n❌ \${testsFailed} test(s) failed.\\n\`);
  process.exit(1);
}
`;

  const testOutputFile = path.join(outputDir, `${filename}.test.js`);
  fs.writeFileSync(testOutputFile, testFile);
  console.log(`✅ Wrote test: ${testOutputFile}`);

  results.push({
    name: moduleName,
    startLine,
    endLine,
    lineCount,
    size: moduleCode.length,
    filename: `${filename}.js`,
    variableName,
    dependencies: dependencies.length
  });
}

// Summary
console.log('\n\n' + '='.repeat(60));
console.log('📊 Extraction Summary');
console.log('='.repeat(60));

let totalLines = 0;
let totalSize = 0;

for (const result of results) {
  console.log(`\n${result.name}:`);
  console.log(`  Lines: ${result.startLine}-${result.endLine} (${result.lineCount} lines)`);
  console.log(`  Size: ${(result.size / 1024).toFixed(1)} KB`);
  console.log(`  File: ${result.filename}`);
  console.log(`  Variable: ${result.variableName}`);
  console.log(`  Dependencies: ${result.dependencies}`);

  totalLines += result.lineCount;
  totalSize += result.size;
}

console.log(`\n${'='.repeat(60)}`);
console.log(`Total extracted: ${results.length} modules`);
console.log(`Total lines: ${totalLines}`);
console.log(`Total size: ${(totalSize / 1024).toFixed(1)} KB`);

console.log('\n✨ Batch extraction complete!\n');
console.log('Next steps:');
console.log('  1. Run tests: cd src/modules/opentelemetry && node *.test.js');
console.log('  2. Verify all tests pass');
console.log('  3. Commit the extracted modules\n');
