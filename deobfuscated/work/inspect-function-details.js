#!/usr/bin/env node

/**
 * Detailed Function Inspector
 *
 * Shows actual code snippets for manual categorization
 */

const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'step14-renamed/deobfuscated-renamed-wave8.js');
const twoLetterFile = path.join(__dirname, 'step15-analysis/two-letter-inspection.json');

console.log('🔍 Detailed Function Inspector');
console.log('='.repeat(60));

// Load two-letter inspection results
const twoLetterData = JSON.parse(fs.readFileSync(twoLetterFile, 'utf8'));
const functions = twoLetterData.results.filter(r => r.type === 'function');

console.log(`\n📊 Inspecting ${functions.length} functions\n`);

// Load source
console.log('📂 Loading source file...');
const content = fs.readFileSync(inputFile, 'utf8');
const lines = content.split('\n');
console.log(`✅ Loaded ${(content.length / 1024 / 1024).toFixed(2)} MB\n`);

const results = [];

function findFunctionDefinition(funcName) {
  // Build regex patterns for different definition styles
  const patterns = [
    `var\\s+${funcName}\\s*=`,
    `const\\s+${funcName}\\s*=`,
    `let\\s+${funcName}\\s*=`,
    `function\\s+${funcName}\\s*\\(`
  ];

  const combinedPattern = new RegExp(patterns.join('|'), 'g');
  let match;
  const locations = [];

  while ((match = combinedPattern.exec(content)) !== null && locations.length < 3) {
    // Find line number
    const beforeMatch = content.substring(0, match.index);
    const lineNum = beforeMatch.split('\n').length;

    // Extract surrounding context (5 lines before, 15 lines after)
    const startLine = Math.max(0, lineNum - 5);
    const endLine = Math.min(lines.length, lineNum + 15);
    const snippet = lines.slice(startLine, endLine).join('\n');

    locations.push({
      line: lineNum,
      snippet,
      matchType: match[0]
    });
  }

  return locations;
}

function findUsageExamples(funcName) {
  // Find function calls
  const callPattern = new RegExp(`${funcName}\\s*\\(`, 'g');
  const usages = [];
  let match;

  while ((match = callPattern.exec(content)) !== null && usages.length < 5) {
    // Find line number
    const beforeMatch = content.substring(0, match.index);
    const lineNum = beforeMatch.split('\n').length;

    // Extract context (2 lines around)
    const startLine = Math.max(0, lineNum - 2);
    const endLine = Math.min(lines.length, lineNum + 3);
    const snippet = lines.slice(startLine, endLine).join('\n');

    usages.push({
      line: lineNum,
      snippet
    });
  }

  return usages;
}

// Process each function
for (const func of functions) {
  const funcName = func.identifier;

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Function: ${funcName}`);
  console.log(`Occurrences: ${func.occurrences}`);
  console.log('='.repeat(60));

  // Find definitions
  const definitions = findFunctionDefinition(funcName);

  if (definitions.length === 0) {
    console.log('\n⚠️  No definition found\n');
    results.push({
      identifier: funcName,
      occurrences: func.occurrences,
      status: 'not-found'
    });
    continue;
  }

  console.log(`\n📍 Definitions found: ${definitions.length}`);

  definitions.forEach((def, idx) => {
    console.log(`\n--- Definition ${idx + 1} (Line ${def.line}) ---`);
    console.log(def.snippet.substring(0, 500));
    if (def.snippet.length > 500) console.log('... (truncated)');
  });

  // Find usage examples
  const usages = findUsageExamples(funcName);

  console.log(`\n📍 Usage examples: ${usages.length}`);

  usages.slice(0, 3).forEach((usage, idx) => {
    console.log(`\n--- Usage ${idx + 1} (Line ${usage.line}) ---`);
    console.log(usage.snippet.substring(0, 300));
  });

  results.push({
    identifier: funcName,
    occurrences: func.occurrences,
    status: 'found',
    definitionCount: definitions.length,
    usageCount: usages.length,
    definitions: definitions.map(d => ({
      line: d.line,
      matchType: d.matchType,
      snippet: d.snippet.substring(0, 1000)
    })),
    usages: usages.slice(0, 5).map(u => ({
      line: u.line,
      snippet: u.snippet.substring(0, 500)
    }))
  });
}

// Save results
const outputDir = path.join(__dirname, 'step16-function-analysis');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputFile = path.join(outputDir, 'function-details.json');
fs.writeFileSync(outputFile, JSON.stringify({
  type: 'function-details',
  totalFunctions: functions.length,
  found: results.filter(r => r.status === 'found').length,
  notFound: results.filter(r => r.status === 'not-found').length,
  results
}, null, 2));

console.log(`\n\n💾 Saved detailed results to: ${outputFile}`);
console.log('\n✨ Inspection complete!\n');
