#!/usr/bin/env node

/**
 * Wave 4-6 Identifier Renaming Script
 *
 * Conservative approach: Only renames identifiers with verified purpose
 * through actual code inspection.
 *
 * Identifiers (4 total):
 * - VF2 → OtelAttributesProcessorExports
 * - ZC2 → OtlpSharedConfigExports
 * - ZK2 → OtlpSpanTransformExports
 * - IE2 → GrpcLoadBalancerExports
 */

const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'step8-renamed/deobfuscated-renamed-wave23.js');
const outputFile = path.join(__dirname, 'step10-renamed/deobfuscated-renamed-wave46.js');
const statsFile = path.join(__dirname, 'step10-renamed/wave46-rename-stats.json');
const databaseFile = path.join(__dirname, 'WAVE4_6_SYMBOL_DATABASE.json');

console.log('🌊 Wave 4-6 Identifier Renaming (Conservative)');
console.log('='.repeat(50));
console.log('Strategy: High-confidence, verified identifiers only\n');

// Load symbol database
console.log('📖 Loading symbol database...');
const database = JSON.parse(fs.readFileSync(databaseFile, 'utf8'));

// Build rename mappings
const renameMappings = [];

// OpenTelemetry extended modules
console.log('📦 Processing OpenTelemetry extended modules...');
for (const [oldName, info] of Object.entries(database.opentelemetryExtended)) {
  if (oldName === 'comment') continue;
  renameMappings.push({
    old: oldName,
    new: info.name,
    category: 'opentelemetryExtended',
    confidence: info.confidence,
    occurrences: info.occurrences,
    verified: info.verified
  });
}

// gRPC and networking
console.log('📦 Processing gRPC and networking modules...');
for (const [oldName, info] of Object.entries(database.grpcAndNetworking)) {
  if (oldName === 'comment') continue;
  renameMappings.push({
    old: oldName,
    new: info.name,
    category: 'grpcAndNetworking',
    confidence: info.confidence,
    occurrences: info.occurrences,
    verified: info.verified
  });
}

console.log(`\n✅ Loaded ${renameMappings.length} verified mappings\n`);

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
      category: mapping.category,
      verified: mapping.verified
    });

    const verifiedMark = mapping.verified ? ' ✓' : '';
    console.log(`  ✓ ${mapping.old.padEnd(10)} → ${mapping.new.padEnd(35)} (${count.toString().padStart(2)} replacements)${verifiedMark}`);
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
  wave: 'Wave 4-6',
  strategy: 'Conservative - verified identifiers only',
  timestamp: new Date().toISOString()
};

// Sort details by replacement count (descending)
stats.details.sort((a, b) => b.replacements - a.replacements);

fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2));
console.log(`✅ Statistics saved: ${statsFile}\n`);

// Summary
console.log('='.repeat(50));
console.log('Summary:');
console.log('='.repeat(50));
console.log(`Wave: 4-6 (Conservative)`);
console.log(`Identifiers renamed: ${stats.appliedRenames}`);
console.log(`Total replacements: ${stats.totalReplacements.toLocaleString()}`);
console.log(`All verified: ${stats.details.every(d => d.verified) ? 'Yes ✓' : 'No'}`);
console.log(`File size: ${(originalSize / 1024 / 1024).toFixed(2)} MB → ${(newSize / 1024 / 1024).toFixed(2)} MB`);
console.log('='.repeat(50));

console.log('\n✨ Wave 4-6 renaming complete!\n');
