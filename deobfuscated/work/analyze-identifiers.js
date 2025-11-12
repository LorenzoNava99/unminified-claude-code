#!/usr/bin/env node

/**
 * Identifier Frequency Analyzer
 *
 * Analyzes the renamed file to find the most frequent identifiers
 * that still need to be renamed.
 */

const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'step6-renamed/deobfuscated-renamed-comprehensive.js');
const outputFile = path.join(__dirname, 'step7-analysis/identifier-frequencies.json');

console.log('🔍 Analyzing identifier frequencies...\n');

// Read file
const content = fs.readFileSync(inputFile, 'utf8');
console.log(`✅ File loaded: ${(content.length / 1024 / 1024).toFixed(2)} MB\n`);

// Extract identifiers (variable/function names)
// Match: word boundaries, 2+ characters, not all uppercase (constants handled separately)
const identifierRegex = /\b[a-zA-Z_$][a-zA-Z0-9_$]+\b/g;
const matches = content.match(identifierRegex) || [];

console.log(`📊 Found ${matches.length.toLocaleString()} identifier occurrences\n`);

// Count frequencies
const frequencies = new Map();
for (const identifier of matches) {
  frequencies.set(identifier, (frequencies.get(identifier) || 0) + 1);
}

// Filter out already-renamed identifiers (long descriptive names)
const needsRenaming = Array.from(frequencies.entries())
  .filter(([name, count]) => {
    // Keep short names (likely still obfuscated)
    if (name.length <= 4) return true;

    // Keep names with number suffixes (e.g., A1, B2, QI0)
    if (/[0-9]/.test(name) && name.length <= 6) return true;

    // Keep camelCase starting with lowercase single letter (e.g., aB, qC)
    if (/^[a-z][A-Z]/.test(name) && name.length <= 4) return true;

    // Skip clearly renamed (long descriptive names)
    if (name.length > 15) return false;

    // Skip common keywords
    const keywords = ['function', 'return', 'const', 'var', 'let', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'true', 'false', 'null', 'undefined', 'this', 'new', 'typeof', 'instanceof', 'delete', 'void', 'in', 'of'];
    if (keywords.includes(name)) return false;

    // Skip already renamed (from Wave 1)
    const wave1Names = [
      'createCommonJSModule', 'createLazyModule', 'interopRequireWildcard',
      'nodeRequire', 'utils', 'noopFunction', 'sessionState', 'parseBoolean',
      'addIssue', 'errorUtil', 'getClaudeConfigDir', 'ZodType', 'ParseStatus',
      'ParseContext', 'Axios', 'InterceptorManager', 'FormDataEntry',
      'LocalForageStore', 'NetworkCore', 'StatsigClient', 'platformUtils',
      'processCreateParams', 'getParsedType', 'assertOptions', 'validators'
    ];
    if (wave1Names.some(renamed => name.includes(renamed))) return false;

    return true;
  })
  .sort((a, b) => b[1] - a[1]); // Sort by frequency descending

console.log(`🎯 Identifiers needing rename: ${needsRenaming.length.toLocaleString()}\n`);

// Categorize by pattern
const categories = {
  singleLetter: [],           // A, B, Q, I
  twoLetters: [],             // MB, AQ, GQ
  threeLetters: [],           // MB9, AQ9, GQ9
  fourLetters: [],            // MB9A, AQ9B
  numberedClass: [],          // AI0, BI0, QI0 (pattern: [A-Z][A-Z][0-9])
  numberedFunc: [],           // k51, n59, a59
  camelShort: [],             // dB, cL, mp
  other: []
};

for (const [name, count] of needsRenaming) {
  if (name.length === 1) {
    categories.singleLetter.push([name, count]);
  } else if (name.length === 2) {
    categories.twoLetters.push([name, count]);
  } else if (name.length === 3) {
    if (/^[A-Z][A-Z0-9][0-9]$/.test(name)) {
      categories.numberedClass.push([name, count]);
    } else if (/^[a-z][0-9]{2}$/.test(name)) {
      categories.numberedFunc.push([name, count]);
    } else {
      categories.threeLetters.push([name, count]);
    }
  } else if (name.length === 4) {
    categories.fourLetters.push([name, count]);
  } else if (/^[a-z][A-Z]/.test(name) && name.length <= 4) {
    categories.camelShort.push([name, count]);
  } else {
    categories.other.push([name, count]);
  }
}

// Print summary
console.log('📈 Categories:\n');
for (const [category, items] of Object.entries(categories)) {
  if (items.length > 0) {
    console.log(`  ${category}: ${items.length} identifiers`);
    console.log(`    Top 5: ${items.slice(0, 5).map(([n, c]) => `${n}(${c})`).join(', ')}`);
  }
}

// Save detailed analysis
const analysis = {
  totalIdentifiersInFile: frequencies.size,
  totalOccurrences: matches.length,
  needsRenaming: needsRenaming.length,
  top200: needsRenaming.slice(0, 200),
  top500: needsRenaming.slice(0, 500),
  byCategory: Object.fromEntries(
    Object.entries(categories).map(([cat, items]) => [cat, items.slice(0, 100)])
  ),
  statistics: {
    singleLetter: categories.singleLetter.length,
    twoLetters: categories.twoLetters.length,
    threeLetters: categories.threeLetters.length,
    fourLetters: categories.fourLetters.length,
    numberedClass: categories.numberedClass.length,
    numberedFunc: categories.numberedFunc.length,
    camelShort: categories.camelShort.length,
    other: categories.other.length
  }
};

// Create output directory
const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputFile, JSON.stringify(analysis, null, 2));

console.log(`\n💾 Analysis saved to: ${outputFile}`);
console.log(`\n✅ Top 200 candidates identified for Wave 2`);
console.log(`✅ Top 500 candidates identified for Wave 3`);
