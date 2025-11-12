#!/usr/bin/env node
// Rename tool for applying HIGH confidence mappings
// Uses careful regex with word boundaries to avoid false matches

const fs = require('fs');
const path = require('path');

// Load mappings from JSON
const mappingsPath = path.join(__dirname, '../mappings/high-confidence-renames.json');
const mappings = JSON.parse(fs.readFileSync(mappingsPath, 'utf8'));

// Input and output files
const inputFile = path.join(__dirname, '../step2-renamed-high-confidence/deobfuscated-step2.js');
const outputFile = path.join(__dirname, '../step2-renamed-high-confidence/deobfuscated-step2.js');

console.log('Loading file...');
let code = fs.readFileSync(inputFile, 'utf8');
const originalSize = code.length;

// Flatten mappings from all categories
const allMappings = {};
let totalMappings = 0;

for (const category in mappings) {
  if (category === 'metadata' || category === 'notes') continue;

  for (const oldName in mappings[category]) {
    const mapping = mappings[category][oldName];
    if (mapping.confidence === 'HIGH' && mapping.newName) {
      allMappings[oldName] = mapping.newName;
      totalMappings++;
    }
  }
}

console.log(`Found ${totalMappings} HIGH confidence mappings to apply`);

// Apply renames with word boundaries
let renamedCount = 0;
for (const [oldName, newName] of Object.entries(allMappings)) {
  // Use word boundary regex to avoid partial matches
  // \\b${oldName}\\b matches whole words only
  const regex = new RegExp(`\\b${escapeRegex(oldName)}\\b`, 'g');
  const beforeCount = (code.match(regex) || []).length;

  if (beforeCount > 0) {
    code = code.replace(regex, newName);
    console.log(`  ✓ ${oldName} → ${newName} (${beforeCount} occurrences)`);
    renamedCount++;
  } else {
    console.log(`  ⚠ ${oldName} → ${newName} (0 occurrences - may be unused)`);
  }
}

console.log(`\nApplied ${renamedCount} renames`);
console.log(`Original size: ${originalSize} bytes`);
console.log(`New size: ${code.length} bytes`);
console.log(`Writing to: ${outputFile}`);

fs.writeFileSync(outputFile, code, 'utf8');
console.log('✓ Done!');

// Helper to escape special regex characters
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
