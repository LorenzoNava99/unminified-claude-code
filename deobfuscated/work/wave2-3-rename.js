#!/usr/bin/env node

/**
 * Wave 2+3 Identifier Renaming Script
 *
 * Applies high-confidence renames for OpenTelemetry, React, and other
 * frequently occurring obfuscated identifiers discovered through frequency
 * analysis and code inspection.
 */

const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'step6-renamed/deobfuscated-renamed-comprehensive.js');
const outputFile = path.join(__dirname, 'step8-renamed/deobfuscated-renamed-wave23.js');
const statsFile = path.join(__dirname, 'step8-renamed/wave23-rename-stats.json');
const databaseFile = path.join(__dirname, 'WAVE2_3_SYMBOL_DATABASE.json');

console.log('🌊 Wave 2+3 Identifier Renaming');
console.log('================================\n');

// Load symbol database
console.log('📖 Loading symbol database...');
const database = JSON.parse(fs.readFileSync(databaseFile, 'utf8'));

// Build rename mappings
const renameMappings = [];

// OpenTelemetry modules
console.log('📦 Processing OpenTelemetry modules...');
for (const [oldName, info] of Object.entries(database.opentelemetry)) {
  if (oldName === 'comment') continue;
  renameMappings.push({
    old: oldName,
    new: info.name,
    category: 'opentelemetry',
    purpose: info.purpose
  });
}

// Numbered classes (module exports)
console.log('📦 Processing numbered class exports...');
for (const [oldName, info] of Object.entries(database.numberedClasses)) {
  if (oldName === 'comment') continue;
  renameMappings.push({
    old: oldName,
    new: info.name,
    category: 'numberedClasses',
    confidence: info.confidence,
    occurrences: info.occurrences
  });
}

// Numbered functions
console.log('📦 Processing numbered functions...');
for (const [oldName, info] of Object.entries(database.numberedFunctions)) {
  if (oldName === 'comment') continue;
  renameMappings.push({
    old: oldName,
    new: info.name,
    category: 'numberedFunctions',
    confidence: info.confidence,
    occurrences: info.occurrences
  });
}

console.log(`\n✅ Loaded ${renameMappings.length} mappings\n`);

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
  // Escape special regex characters
  const escaped = oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Use word boundaries to avoid partial replacements
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
      category: mapping.category
    });

    console.log(`  ✓ ${mapping.old.padEnd(25)} → ${mapping.new.padEnd(35)} (${count} replacements)`);
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
  wave: 'Wave 2+3',
  timestamp: new Date().toISOString()
};

// Sort details by replacement count (descending)
stats.details.sort((a, b) => b.replacements - a.replacements);

fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2));
console.log(`✅ Statistics saved: ${statsFile}\n`);

// Summary
console.log('=' .repeat(50));
console.log('Summary:');
console.log('=' .repeat(50));
console.log(`Wave: 2+3 Combined`);
console.log(`Identifiers renamed: ${stats.appliedRenames}`);
console.log(`Total replacements: ${stats.totalReplacements.toLocaleString()}`);
console.log(`File size: ${(originalSize / 1024 / 1024).toFixed(2)} MB → ${(newSize / 1024 / 1024).toFixed(2)} MB`);
console.log('=' .repeat(50));

console.log('\n✨ Wave 2+3 renaming complete!\n');
