#!/usr/bin/env node

/**
 * Two-Letter Identifier Inspector
 *
 * Inspects high-frequency two-letter identifiers (excluding keywords)
 */

const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'step14-renamed/deobfuscated-renamed-wave8.js');
const freqFile = path.join(__dirname, 'step7-analysis/identifier-frequencies.json');

console.log('🔍 Two-Letter Identifier Inspector');
console.log('='.repeat(60));

// Load frequency data
const freqData = JSON.parse(fs.readFileSync(freqFile, 'utf8'));

// Get high-frequency two-letter identifiers (excluding keywords)
const keywords = ['if', 'in', 'to', 'of', 'is', 'be', 'on', 'or', 'as', 'do', 'an', 'at'];
const candidates = freqData.byCategory.twoLetters
  .filter(([name, count]) => !keywords.includes(name) && count >= 400)
  .map(([name, count]) => ({ name, count }))
  .slice(0, 20); // Top 20

console.log(`\n📊 Inspecting ${candidates.length} two-letter identifiers (400+ occurrences)\n`);

// Load source
console.log('📂 Loading source file...');
const content = fs.readFileSync(inputFile, 'utf8');
console.log(`✅ Loaded ${(content.length / 1024 / 1024).toFixed(2)} MB\n`);

console.log('🔬 Analyzing patterns...\n');

const results = [];
let moduleCount = 0;
let functionCount = 0;
let variableCount = 0;

for (const candidate of candidates) {
  const id = candidate.name;

  // Check if it's a module export parameter
  const modulePattern = new RegExp(
    `createCommonJSModule\\(${id}\\s*=>\\s*\\{[\\s\\S]{0,500}?${id}\\.(\\w+)`,
    'm'
  );

  const moduleMatch = content.match(modulePattern);

  if (moduleMatch) {
    // Found a module! Extract exports
    const moduleStart = moduleMatch.index;
    const moduleCode = content.substring(moduleStart, moduleStart + 2000);

    const exportRegex = new RegExp(`${id}\\.(\\w+)\\s*=`, 'g');
    const exports = [];
    let exportMatch;

    while ((exportMatch = exportRegex.exec(moduleCode)) !== null) {
      const exportName = exportMatch[1];
      if (exportName !== '__esModule' && !exports.includes(exportName)) {
        exports.push(exportName);
      }
    }

    if (exports.length > 0) {
      results.push({
        identifier: id,
        occurrences: candidate.count,
        type: 'module',
        exports: exports.slice(0, 5),
        totalExports: exports.length,
        allExports: exports
      });
      moduleCount++;
      console.log(`✓ ${id.padEnd(6)} (${candidate.count.toString().padStart(4)} occ) → MODULE     | ${exports.slice(0, 3).join(', ')}`);
      continue;
    }
  }

  // Check if it's a function definition
  const functionPattern = new RegExp(
    `(?:function|const|let|var)\\s+${id}\\s*[=\\(]`,
    'm'
  );

  if (functionPattern.test(content)) {
    results.push({
      identifier: id,
      occurrences: candidate.count,
      type: 'function'
    });
    functionCount++;
    console.log(`· ${id.padEnd(6)} (${candidate.count.toString().padStart(4)} occ) → function`);
    continue;
  }

  // Likely a variable
  results.push({
    identifier: id,
    occurrences: candidate.count,
    type: 'variable'
  });
  variableCount++;
  console.log(`  ${id.padEnd(6)} (${candidate.count.toString().padStart(4)} occ) → variable`);
}

console.log(`\n✅ Analysis complete!\n`);
console.log(`📊 Summary:`);
console.log(`   Modules: ${moduleCount}`);
console.log(`   Functions: ${functionCount}`);
console.log(`   Variables: ${variableCount}`);
console.log(`   Total: ${results.length}\n`);

// Save results
const outputFile = path.join(__dirname, 'step15-analysis/two-letter-inspection.json');
const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputFile, JSON.stringify({
  type: 'two-letter-identifiers',
  totalInspected: candidates.length,
  moduleCount,
  functionCount,
  variableCount,
  results: results.sort((a, b) => b.occurrences - a.occurrences)
}, null, 2));

console.log(`💾 Saved to: ${outputFile}\n`);

// Print modules found
const modules = results.filter(r => r.type === 'module');
if (modules.length > 0) {
  console.log('📦 Modules found for potential renaming:');
  modules.forEach(m => {
    console.log(`   ${m.identifier}: ${m.totalExports} exports`);
  });
}

console.log('\n✨ Inspection complete!\n');
