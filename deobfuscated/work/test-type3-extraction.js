#!/usr/bin/env node

/**
 * Test Type 3 Module Extraction
 *
 * Attempts to extract Type 3 modules with single dependencies
 * to identify false positives in dependency detection.
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Type 3 Module Test Extraction');
console.log('='.repeat(70));

// Load necessary data files
const boundariesFile = path.join(__dirname, 'step17-module-analysis/module-boundaries.json');
const analysisFile = path.join(__dirname, 'step17-module-analysis/enhanced-dependency-analysis.json');

const boundaries = JSON.parse(fs.readFileSync(boundariesFile, 'utf8'));
const analysis = JSON.parse(fs.readFileSync(analysisFile, 'utf8'));

// Type 3 modules with single dependency (sorted by size, smallest first)
const testCandidates = [
  'PredicateExports',          // 50 lines - hasWildcard likely false positive (static method)
  'GlobalErrorHandlerExports', // 17 lines - depends on oi1
  'OtelSpanProcessorReExports',// 18 lines - depends on zO2
  'ConfigLimitsExports',       // 24 lines - depends on q6
  'OtelAggregationTypeExports',// 44 lines - depends on XJ2
  'DataValidatorExports',      // 47 lines - depends on t2
  'YieldExpressionExports',    // 80 lines - depends on uV
  'OtelAttributeUtilsExports', // 72 lines - depends on t2
];

console.log(`\n📋 Test candidates: ${testCandidates.length} modules\n`);

// Load source file
const sourceFile = path.join(__dirname, 'step14-renamed/deobfuscated-renamed-wave8.js');
const content = fs.readFileSync(sourceFile, 'utf8');
const lines = content.split('\n');

// Helper to find module in boundaries
function findModuleInfo(moduleName) {
  for (const categoryName in boundaries.moduleBoundaries) {
    const category = boundaries.moduleBoundaries[categoryName];
    if (category.symbols) {
      const symbol = category.symbols.find(s => s.name === moduleName);
      if (symbol) {
        return {
          ...symbol,
          category: categoryName
        };
      }
    }
  }
  return null;
}

// Helper to detect dependencies from code
function detectDependencies(code) {
  const deps = new Set();

  // Look for imports from module-system
  if (code.includes('Symbol')) deps.add('SymbolPrimitive');
  if (code.includes('createCommonJSModule')) deps.add('createCommonJSModule');
  if (code.includes('Object.defineProperty')) deps.add('defineProperty');
  if (code.includes('require(')) deps.add('nodeRequire');
  if (code.includes('Object.prototype.hasOwnProperty')) deps.add('hasOwnProperty');
  if (code.includes('Object.create')) deps.add('objectCreate');
  if (code.includes('Object.getPrototypeOf')) deps.add('getPrototypeOf');
  if (code.includes('Object.getOwnPropertyNames')) deps.add('getOwnPropertyNames');

  return Array.from(deps).sort();
}

// Process each candidate
testCandidates.forEach((moduleName, index) => {
  console.log(`\n${index + 1}. ${moduleName}`);
  console.log('-'.repeat(70));

  const moduleInfo = findModuleInfo(moduleName);
  if (!moduleInfo) {
    console.log('❌ Module not found in boundaries');
    return;
  }

  const moduleAnalysis = analysis.type3Modules.find(m => m.name === moduleName);
  if (!moduleAnalysis) {
    console.log('❌ Module not found in analysis');
    return;
  }

  console.log(`📍 Lines: ${moduleInfo.startLine}-${moduleInfo.endLine} (${moduleInfo.lines} lines)`);
  console.log(`🔗 Claimed dependency: ${moduleAnalysis.unnamedDeps.join(', ')}`);
  console.log(`📁 Category: ${moduleInfo.category}`);

  // Extract module code
  const startLine = moduleInfo.startLine;
  const endLine = moduleInfo.endLine;
  const moduleCode = lines.slice(startLine - 1, endLine).join('\n');

  // Find variable name
  const varMatch = moduleCode.match(/var\s+(\w+)\s*=\s*createCommonJSModule/);
  const variableName = varMatch ? varMatch[1] : 'UnknownVar';

  console.log(`🔤 Variable name: ${variableName}`);

  // Detect actual dependencies
  const dependencies = detectDependencies(moduleCode);
  console.log(`📦 Runtime dependencies: ${dependencies.join(', ')}`);

  // Check if claimed dependency is actually in the code
  const claimedDep = moduleAnalysis.unnamedDeps[0];
  const depPattern = new RegExp(`\\b${claimedDep}\\b`);
  const depMatches = moduleCode.match(new RegExp(depPattern, 'g'));

  console.log(`🔍 Occurrences of '${claimedDep}': ${depMatches ? depMatches.length : 0}`);

  // Check if it's a static method
  const staticMethodPattern = new RegExp(`static\\s+${claimedDep}\\s*\\(`);
  const isStaticMethod = staticMethodPattern.test(moduleCode);

  if (isStaticMethod) {
    console.log(`✨ INSIGHT: '${claimedDep}' is a static method defined in the module!`);
    console.log(`📊 Verdict: FALSE POSITIVE - Module is actually Type 1 (Independent)`);
  }

  // Check if it's a method call (has . before it)
  const methodCallPattern = new RegExp(`\\.${claimedDep}\\s*\\(`);
  const isMethodCall = methodCallPattern.test(moduleCode);

  if (isMethodCall) {
    console.log(`📝 Note: '${claimedDep}' used as method call (obj.${claimedDep}())`);
  }

  // Check if it's defined locally
  const localDefPattern = new RegExp(`(function\\s+${claimedDep}\\s*\\(|var\\s+${claimedDep}\\s*=|const\\s+${claimedDep}\\s*=|let\\s+${claimedDep}\\s*=)`);
  const isLocallyDefined = localDefPattern.test(moduleCode);

  if (isLocallyDefined) {
    console.log(`✨ INSIGHT: '${claimedDep}' is defined locally in the module!`);
    console.log(`📊 Verdict: FALSE POSITIVE - Module is actually Type 1 (Independent)`);
  }

  // Check if it's a function call to another module
  const moduleFnCallPattern = new RegExp(`var\\s+\\w+\\s*=\\s*${claimedDep}\\s*\\(\\)`);
  const isModuleCall = moduleFnCallPattern.test(moduleCode);

  if (isModuleCall) {
    console.log(`⚠️  '${claimedDep}' appears to be a module function call`);
    console.log(`📊 Verdict: TRUE DEPENDENCY - Module is Type 2 (depends on other module)`);
  }
});

console.log('\n' + '='.repeat(70));
console.log('Test complete. Review insights above for extraction decisions.');
console.log('');
