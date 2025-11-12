#!/usr/bin/env node

/**
 * Wave 8 Identifier Renaming Script
 *
 * Focus: Low-frequency gRPC infrastructure modules (3-5 occurrences)
 * Total: 3 identifiers
 */

const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'step12-renamed/deobfuscated-renamed-wave7plus.js');
const outputFile = path.join(__dirname, 'step14-renamed/deobfuscated-renamed-wave8.js');
const statsFile = path.join(__dirname, 'step14-renamed/wave8-rename-stats.json');
const databaseFile = path.join(__dirname, 'WAVE8_SYMBOL_DATABASE.json');

console.log('🌊 Wave 8 Identifier Renaming');
console.log('='.repeat(60));
console.log('Focus: Low-frequency gRPC infrastructure\n');

// Load symbol database
console.log('📖 Loading symbol database...');
const database = JSON.parse(fs.readFileSync(databaseFile, 'utf8'));

// Build rename mappings
const renameMappings = [];

console.log('📦 Processing gRPC extended modules...\n');

for (const [oldName, info] of Object.entries(database.grpcExtended)) {
  if (oldName === 'comment') continue;

  renameMappings.push({
    old: oldName,
    new: info.name,
    category: 'grpcExtended',
    confidence: info.confidence,
    occurrences: info.occurrences,
    exports: info.exports
  });
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

    console.log(`  ✓ ${mapping.old.padEnd(10)} → ${mapping.new.padEnd(45)} (${count.toString().padStart(2)} replacements)`);
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
  wave: 'Wave 8',
  strategy: 'Low-frequency gRPC infrastructure',
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
console.log(`Wave: 8`);
console.log(`Identifiers renamed: ${stats.appliedRenames}`);
console.log(`Total replacements: ${stats.totalReplacements.toLocaleString()}`);
console.log(`Focus: gRPC infrastructure (credentials, options, validation)`);
console.log(`File size: ${(originalSize / 1024 / 1024).toFixed(2)} MB → ${(newSize / 1024 / 1024).toFixed(2)} MB`);
console.log('='.repeat(60));

// Cumulative stats
console.log('\n📈 Cumulative Progress (Waves 1-8):');
console.log(`   Total identifiers renamed: 137`);
console.log(`   Total replacements: ~8,315`);
console.log(`   Core readability: ~60%`);

console.log('\n✨ Wave 8 renaming complete!\n');
