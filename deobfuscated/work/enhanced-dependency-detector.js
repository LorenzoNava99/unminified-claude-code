#!/usr/bin/env node

/**
 * Enhanced Dependency Detector
 *
 * Detects ALL dependencies in modules, including unrenamed function calls.
 * Classifies modules into Type 1 (independent), Type 2 (renamed deps),
 * or Type 3 (unrenamed deps).
 */

const fs = require('fs');
const path = require('path');

console.log('🔬 Enhanced Dependency Detector');
console.log('='.repeat(60));

// Load dependency graph
const graphFile = path.join(__dirname, 'step17-module-analysis/dependency-graph.json');
const depGraph = JSON.parse(fs.readFileSync(graphFile, 'utf8'));

// Load source file
const sourceFile = path.join(__dirname, 'step14-renamed/deobfuscated-renamed-wave8.js');
const content = fs.readFileSync(sourceFile, 'utf8');

console.log(`\n✅ Loaded dependency graph: ${Object.keys(depGraph.dependencyGraph).length} modules`);
console.log(`✅ Loaded source file: ${(content.length / 1024 / 1024).toFixed(2)} MB\n`);

// Build set of all renamed symbols
const renamedSymbols = new Set(Object.keys(depGraph.dependencyGraph));

// Common built-in functions and methods that are safe
const builtIns = new Set([
  'Object', 'Array', 'String', 'Number', 'Boolean', 'Symbol', 'Date',
  'Math', 'JSON', 'Promise', 'Error', 'RegExp', 'Map', 'Set', 'WeakMap',
  'WeakSet', 'Proxy', 'Reflect', 'parseInt', 'parseFloat', 'isNaN',
  'isFinite', 'decodeURI', 'encodeURI', 'decodeURIComponent',
  'encodeURIComponent', 'eval', 'console', 'setTimeout', 'setInterval',
  'clearTimeout', 'clearInterval', 'Buffer', 'process', 'require',
  '__dirname', '__filename', 'module', 'exports', 'global', 'window',
  'document', 'navigator', 'location', 'undefined', 'null', 'Infinity',
  'NaN', 'this', 'arguments',
  // Module system runtime functions (these are safe - provided by our runtime)
  'createCommonJSModule', 'defineProperty', 'hasOwnProperty',
  'nodeRequire', 'interopRequireWildcard', 'interopRequireDefault',
  'objectCreate', 'getPrototypeOf', 'getOwnPropertyNames'
]);

// Common safe patterns
const safePatterns = [
  /^[a-z]+$/,  // Single lowercase word (likely parameter)
  /^[A-Z]$/,   // Single uppercase letter (likely parameter)
  /^\d+$/      // Number
];

function analyzeModule(moduleName, moduleInfo) {
  if (!moduleInfo.codeBlock || moduleInfo.codeBlock.length === 0) {
    return {
      type: 'unknown',
      reason: 'No code block found',
      unnamedDeps: [],
      renamedDeps: [],
      extractable: false
    };
  }

  const code = moduleInfo.codeBlock;

  // Find all function calls: functionName(
  const functionCallPattern = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
  const functionCalls = new Set();

  let match;
  while ((match = functionCallPattern.exec(code)) !== null) {
    functionCalls.add(match[1]);
  }

  // Categorize function calls
  const renamedDeps = [];
  const unnamedDeps = [];
  const builtInCalls = [];

  for (const funcName of functionCalls) {
    // Skip if it's a safe pattern
    if (safePatterns.some(pattern => pattern.test(funcName))) {
      continue;
    }

    // Check if it's a built-in
    if (builtIns.has(funcName)) {
      builtInCalls.push(funcName);
      continue;
    }

    // Check if it's a renamed symbol
    if (renamedSymbols.has(funcName)) {
      renamedDeps.push(funcName);
      continue;
    }

    // Check if it's defined within the module itself
    // Look for "function funcName(" or "var funcName = ..." or "funcName.prototype"
    const definedInModule = new RegExp(`(function\\s+${funcName}\\s*\\(|var\\s+${funcName}\\s*=|const\\s+${funcName}\\s*=|let\\s+${funcName}\\s*=|${funcName}\\.prototype)`).test(code);

    if (definedInModule) {
      // It's defined locally, safe
      continue;
    }

    // Check if it's a method call (has . before it)
    const methodCallPattern = new RegExp(`\\.${funcName}\\s*\\(`);
    if (methodCallPattern.test(code)) {
      // It's a method call like obj.funcName(), likely safe
      continue;
    }

    // Check if it's in the module parameter name
    // e.g., createCommonJSModule(ModuleExports => { ... ModuleExports.foo })
    const paramMatch = code.match(/createCommonJSModule\s*\(\s*(\w+)\s*=>/);
    if (paramMatch && funcName === paramMatch[1]) {
      // It's the parameter name, safe
      continue;
    }

    // Otherwise, it's an unrenamed external dependency
    unnamedDeps.push(funcName);
  }

  // Determine module type
  let type, extractable, reason;

  if (unnamedDeps.length === 0 && renamedDeps.length === 0) {
    type = 'Type 1 (Independent)';
    extractable = true;
    reason = 'No external dependencies';
  } else if (unnamedDeps.length === 0 && renamedDeps.length > 0) {
    type = 'Type 2 (Renamed Deps)';
    extractable = 'conditional';
    reason = `Depends on ${renamedDeps.length} renamed modules`;
  } else {
    type = 'Type 3 (Unrenamed Deps)';
    extractable = false;
    reason = `Depends on ${unnamedDeps.length} unrenamed functions`;
  }

  return {
    type,
    extractable,
    reason,
    unnamedDeps: unnamedDeps.slice(0, 10), // Limit to first 10
    renamedDeps: renamedDeps.slice(0, 10),
    stats: {
      totalFunctionCalls: functionCalls.size,
      unnamedDepsCount: unnamedDeps.length,
      renamedDepsCount: renamedDeps.length,
      builtInCallsCount: builtInCalls.length
    }
  };
}

console.log('🔍 Analyzing modules...\n');

const results = [];

for (const [moduleName, moduleInfo] of Object.entries(depGraph.dependencyGraph)) {
  const analysis = analyzeModule(moduleName, moduleInfo);

  results.push({
    name: moduleName,
    lines: moduleInfo.definitionEnd - moduleInfo.definitionLine,
    occurrences: moduleInfo.occurrences,
    category: moduleInfo.category,
    ...analysis
  });
}

// Sort by type and then by extractability
results.sort((a, b) => {
  // Type 1 first, then Type 2, then Type 3
  const typeOrder = { 'Type 1 (Independent)': 0, 'Type 2 (Renamed Deps)': 1, 'Type 3 (Unrenamed Deps)': 2, 'unknown': 3 };
  const aOrder = typeOrder[a.type] || 3;
  const bOrder = typeOrder[b.type] || 3;

  if (aOrder !== bOrder) return aOrder - bOrder;

  // Within same type, sort by line count (larger first)
  return b.lines - a.lines;
});

// Print results by type
const type1 = results.filter(r => r.type === 'Type 1 (Independent)');
const type2 = results.filter(r => r.type === 'Type 2 (Renamed Deps)');
const type3 = results.filter(r => r.type === 'Type 3 (Unrenamed Deps)');
const unknown = results.filter(r => r.type === 'unknown');

console.log('📊 Analysis Results:\n');
console.log('='.repeat(60));

console.log(`\n✅ TYPE 1 - INDEPENDENT (${type1.length} modules)`);
console.log('These modules can be extracted immediately!\n');

for (const module of type1.slice(0, 15)) {
  console.log(`  ${module.name}`);
  console.log(`    Lines: ${module.lines} | Occurrences: ${module.occurrences}`);
  console.log(`    Category: ${module.category}`);
  console.log(`    Reason: ${module.reason}`);
  if (module.stats) {
    console.log(`    Function calls: ${module.stats.totalFunctionCalls} (${module.stats.builtInCallsCount} built-ins)`);
  }
  console.log();
}

if (type1.length > 15) {
  console.log(`  ... and ${type1.length - 15} more\n`);
}

console.log(`\n⚠️  TYPE 2 - RENAMED DEPENDENCIES (${type2.length} modules)`);
console.log('Can be extracted if dependencies are extracted first\n');

for (const module of type2.slice(0, 10)) {
  console.log(`  ${module.name}`);
  console.log(`    Lines: ${module.lines} | Deps: ${module.renamedDepsCount}`);
  console.log(`    Depends on: ${module.renamedDeps.join(', ')}`);
  console.log();
}

if (type2.length > 10) {
  console.log(`  ... and ${type2.length - 10} more\n`);
}

console.log(`\n❌ TYPE 3 - UNRENAMED DEPENDENCIES (${type3.length} modules)`);
console.log('Cannot be extracted without also extracting utility functions\n');

for (const module of type3.slice(0, 10)) {
  console.log(`  ${module.name}`);
  console.log(`    Lines: ${module.lines} | Unrenamed deps: ${module.unnamedDepsCount}`);
  console.log(`    Depends on: ${module.unnamedDeps.slice(0, 5).join(', ')}${module.unnamedDepsCount > 5 ? '...' : ''}`);
  console.log();
}

if (type3.length > 10) {
  console.log(`  ... and ${type3.length - 10} more\n`);
}

// Summary statistics
console.log('\n' + '='.repeat(60));
console.log('📈 Summary Statistics:\n');

const totalLines = {
  type1: type1.reduce((sum, m) => sum + m.lines, 0),
  type2: type2.reduce((sum, m) => sum + m.lines, 0),
  type3: type3.reduce((sum, m) => sum + m.lines, 0)
};

console.log(`Type 1 (Independent):      ${type1.length} modules, ${totalLines.type1.toLocaleString()} lines`);
console.log(`Type 2 (Renamed Deps):     ${type2.length} modules, ${totalLines.type2.toLocaleString()} lines`);
console.log(`Type 3 (Unrenamed Deps):   ${type3.length} modules, ${totalLines.type3.toLocaleString()} lines`);
console.log(`Unknown:                   ${unknown.length} modules`);
console.log(`\nTotal Extractable (Type 1): ${type1.length} modules (${totalLines.type1.toLocaleString()} lines)`);
console.log(`Conditionally Extractable (Type 2): ${type2.length} modules (${totalLines.type2.toLocaleString()} lines)`);

// Save results
const outputDir = path.join(__dirname, 'step17-module-analysis');
const outputFile = path.join(outputDir, 'enhanced-dependency-analysis.json');

fs.writeFileSync(outputFile, JSON.stringify({
  type: 'enhanced-dependency-analysis',
  timestamp: new Date().toISOString(),
  summary: {
    type1: type1.length,
    type2: type2.length,
    type3: type3.length,
    unknown: unknown.length,
    totalLines: {
      type1: totalLines.type1,
      type2: totalLines.type2,
      type3: totalLines.type3
    }
  },
  type1Modules: type1,
  type2Modules: type2,
  type3Modules: type3
}, null, 2));

console.log(`\n💾 Saved to: ${outputFile}`);

// Create extraction recommendations
console.log('\n\n🎯 EXTRACTION RECOMMENDATIONS:\n');
console.log('='.repeat(60));
console.log('\nPhase 1: Extract these Type 1 modules immediately:\n');

const top10Type1 = type1.slice(0, 10);
for (let i = 0; i < top10Type1.length; i++) {
  const module = top10Type1[i];
  console.log(`${i + 1}. ${module.name} (${module.lines} lines)`);
  console.log(`   Category: ${module.category}`);
  console.log(`   Occurrences: ${module.occurrences}`);
}

console.log('\n✨ Analysis complete!\n');
