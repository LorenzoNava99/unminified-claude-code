#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

console.log('Phase 3: Applying MEDIUM Confidence Renames');
console.log('='.repeat(60));

// Load mappings
const mappingsPath = path.join(__dirname, '../mappings/medium-confidence-renames.json');
const mappings = JSON.parse(fs.readFileSync(mappingsPath, 'utf8'));

// Input and output paths
const inputFile = path.join(__dirname, '../step2-renamed-high-confidence/deobfuscated-step2.js');
const outputDir = path.join(__dirname, '../step3-renamed-medium-confidence');
const outputFile = path.join(outputDir, 'deobfuscated-step3.js');

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`✓ Created output directory: ${outputDir}`);
}

console.log('Loading source file...');
let code = fs.readFileSync(inputFile, 'utf8');
const originalSize = code.length;
const originalLines = code.split('\n').length;

console.log(`✓ Loaded: ${originalLines.toLocaleString()} lines, ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
console.log('');

// Collect all mappings
const allMappings = [];
let totalMappings = 0;

for (const category in mappings) {
  if (category === 'metadata' || category === 'notes') continue;

  for (const oldName in mappings[category]) {
    const mapping = mappings[category][oldName];
    if (mapping.newName && mapping.newName !== oldName) {
      allMappings.push({
        oldName,
        newName: mapping.newName,
        confidence: mapping.confidence,
        category,
        reason: mapping.reason
      });
      totalMappings++;
    }
  }
}

console.log(`Found ${totalMappings} mappings to apply:`);
console.log(`  - ${allMappings.filter(m => m.confidence === 'HIGH').length} HIGH confidence`);
console.log(`  - ${allMappings.filter(m => m.confidence === 'MEDIUM').length} MEDIUM confidence`);
console.log('');

// Apply renames with word boundaries
let renamedCount = 0;
let skippedCount = 0;
const renameStats = {};

console.log('Applying renames...');

for (const mapping of allMappings) {
  const { oldName, newName, confidence, category } = mapping;

  // Skip if old name is the same as new name
  if (oldName === newName) {
    skippedCount++;
    continue;
  }

  // Create regex with word boundaries
  // Special handling for names starting with $ or _
  let pattern;
  if (oldName.startsWith('$') || oldName.startsWith('_')) {
    // For special characters, use more careful matching
    pattern = new RegExp(`\\b${escapeRegex(oldName)}\\b`, 'g');
  } else {
    pattern = new RegExp(`\\b${escapeRegex(oldName)}\\b`, 'g');
  }

  const beforeCount = (code.match(pattern) || []).length;

  if (beforeCount > 0) {
    code = code.replace(pattern, newName);
    renamedCount++;
    renameStats[category] = (renameStats[category] || 0) + 1;

    if (beforeCount <= 10) {
      console.log(`  ✓ ${oldName} → ${newName} (${beforeCount} occurrences) [${confidence}]`);
    } else if (beforeCount <= 100) {
      console.log(`  ✓ ${oldName} → ${newName} (${beforeCount} occurrences) [${confidence}]`);
    } else {
      console.log(`  ✓ ${oldName} → ${newName} (${beforeCount} occurrences) [${confidence}] ⚠️`);
    }
  } else {
    skippedCount++;
    if (process.argv.includes('--verbose')) {
      console.log(`  ⚠ ${oldName} → ${newName} (0 occurrences - not found)`);
    }
  }
}

console.log('');
console.log('Rename Statistics:');
for (const [category, count] of Object.entries(renameStats)) {
  console.log(`  ${category}: ${count} renames applied`);
}

const newSize = code.length;
const newLines = code.split('\n').length;

console.log('');
console.log('Summary:');
console.log(`  Applied: ${renamedCount} renames`);
console.log(`  Skipped: ${skippedCount} (not found or same name)`);
console.log(`  Original: ${originalLines.toLocaleString()} lines, ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`  New:      ${newLines.toLocaleString()} lines, ${(newSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`  Change:   ${((newSize - originalSize) / 1024 / 1024).toFixed(2)} MB`);

console.log('');
console.log('Writing output file...');
fs.writeFileSync(outputFile, code, 'utf8');
console.log(`✓ Saved to: ${outputFile}`);

console.log('');
console.log('Phase 3 automation complete!');
console.log('='.repeat(60));

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
