#!/usr/bin/env node

/**
 * Wave 7+ Identifier Renaming Script
 *
 * High-confidence approach: 19 verified identifiers through batch inspection
 *
 * Categories:
 * - OpenTelemetry Advanced (8 identifiers)
 * - DOM and Parsing (1 identifier)
 * - CRC and Hashing (1 identifier)
 * - gRPC Extended (1 identifier)
 * - Protobuf (1 identifier)
 * - Statsig (1 identifier)
 * - AWS Services (1 identifier)
 * - Error Handling (1 identifier)
 * - Platform Utils (1 identifier)
 * - Predicates (1 identifier)
 * - Config (1 identifier)
 */

const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'step10-renamed/deobfuscated-renamed-wave46.js');
const outputFile = path.join(__dirname, 'step12-renamed/deobfuscated-renamed-wave7plus.js');
const statsFile = path.join(__dirname, 'step12-renamed/wave7plus-rename-stats.json');
const databaseFile = path.join(__dirname, 'WAVE7_PLUS_SYMBOL_DATABASE.json');

console.log('🌊 Wave 7+ Identifier Renaming');
console.log('='.repeat(60));
console.log('Strategy: High-confidence via batch inspection\n');

// Load symbol database
console.log('📖 Loading symbol database...');
const database = JSON.parse(fs.readFileSync(databaseFile, 'utf8'));

// Build rename mappings
const renameMappings = [];
const categories = [
  'opentelemetryAdvanced',
  'domAndParsing',
  'crcAndHashing',
  'grpcExtended',
  'protobuf',
  'statsig',
  'awsServices',
  'errorHandling',
  'platformUtils',
  'predicates',
  'config'
];

console.log('📦 Processing all categories...\n');

for (const category of categories) {
  if (!database[category]) continue;

  for (const [oldName, info] of Object.entries(database[category])) {
    if (oldName === 'comment') continue;

    renameMappings.push({
      old: oldName,
      new: info.name,
      category,
      confidence: info.confidence,
      occurrences: info.occurrences,
      exports: info.exports
    });
  }
}

console.log(`✅ Loaded ${renameMappings.length} verified mappings\n`);

// Read source file
console.log('📂 Reading source file...');
let content = fs.readFileSync(inputFile, 'utf8');
const originalSize = content.length;
console.log(`✅ File loaded: ${(originalSize / 1024 / 1024).toFixed(2)} MB\n`);

// Apply renames with statistics
console.log('🔄 Applying renames...\n');
const stats = {
  totalMappings: renameMappings.length,
  appliedRenames: 0,
  totalReplacements: 0,
  byCategory: {},
  details: []
};

function createSafeRegex(oldName) {
  const escaped = oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escaped}\\b`, 'g');
}

for (const mapping of renameMappings) {
  const regex = createSafeRegex(mapping.old);
  const matches = content.match(regex);
  const count = matches ? matches.length : 0;

  if (count > 0) {
    content = content.replace(regex, mapping.new);
    stats.appliedRenames++;
    stats.totalReplacements += count;

    // Track by category
    if (!stats.byCategory[mapping.category]) {
      stats.byCategory[mapping.category] = {
        mappings: 0,
        replacements: 0
      };
    }
    stats.byCategory[mapping.category].mappings++;
    stats.byCategory[mapping.category].replacements += count;

    // Store details
    stats.details.push({
      old: mapping.old,
      new: mapping.new,
      replacements: count,
      category: mapping.category,
      exports: mapping.exports
    });

    console.log(`  ✓ ${mapping.old.padEnd(10)} → ${mapping.new.padEnd(40)} (${count.toString().padStart(2)} replacements)`);
  }
}

console.log(`\n✅ Renamed ${stats.appliedRenames} identifiers`);
console.log(`✅ Total replacements: ${stats.totalReplacements.toLocaleString()}\n`);

// Category breakdown
console.log('📊 Breakdown by category:\n');
for (const [category, data] of Object.entries(stats.byCategory)) {
  console.log(`  ${category}:`);
  console.log(`    Mappings: ${data.mappings}`);
  console.log(`    Replacements: ${data.replacements.toLocaleString()}`);
}

// Create output directory
const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`\n📁 Created output directory: ${outputDir}`);
}

// Write output file
console.log('\n💾 Writing renamed file...');
fs.writeFileSync(outputFile, content);
const newSize = content.length;
console.log(`✅ Output written: ${(newSize / 1024 / 1024).toFixed(2)} MB`);

// Write statistics
console.log('💾 Writing statistics...');
stats.meta = {
  inputFile: path.basename(inputFile),
  outputFile: path.basename(outputFile),
  originalSize,
  newSize,
  wave: 'Wave 7+',
  strategy: 'High-confidence via batch inspection',
  timestamp: new Date().toISOString()
};

// Sort details by replacement count (descending)
stats.details.sort((a, b) => b.replacements - a.replacements);

fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2));
console.log(`✅ Statistics saved: ${statsFile}\n`);

// Summary
console.log('='.repeat(60));
console.log('Summary:');
console.log('='.repeat(60));
console.log(`Wave: 7+`);
console.log(`Identifiers renamed: ${stats.appliedRenames}`);
console.log(`Total replacements: ${stats.totalReplacements.toLocaleString()}`);
console.log(`OpenTelemetry modules: ${stats.byCategory.opentelemetryAdvanced?.mappings || 0}`);
console.log(`File size: ${(originalSize / 1024 / 1024).toFixed(2)} MB → ${(newSize / 1024 / 1024).toFixed(2)} MB`);
console.log('='.repeat(60));

console.log('\n✨ Wave 7+ renaming complete!\n');
