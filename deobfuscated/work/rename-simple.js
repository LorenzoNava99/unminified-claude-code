#!/usr/bin/env node

/**
 * Simple regex-based identifier renaming script
 * Uses word boundary matching to avoid memory issues with AST parsing
 */

const fs = require('fs');
const path = require('path');

// Load the identifier mapping
const mappingPath = path.join(__dirname, 'analysis', 'identifier-mapping.json');
const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));

// Combine all mappings
const renameMap = {
  ...mapping.mappings,
  ...Object.entries(mapping.classAnalysis)
    .filter(([_, desc]) => !desc.startsWith('Unknown'))
    .reduce((acc, [key, desc]) => {
      const match = desc.match(/^(\w+)/);
      if (match) acc[key] = match[1];
      return acc;
    }, {}),
  ...mapping.additionalMappings
};

console.log(`Loaded ${Object.keys(renameMap).length} identifier mappings\n`);

/**
 * Apply renames to code using regex with word boundaries
 */
function applyRenames(code) {
  let result = code;
  let renameCount = 0;

  // Sort by length (longest first) to avoid partial replacements
  const sortedEntries = Object.entries(renameMap).sort((a, b) => b[0].length - a[0].length);

  for (const [oldName, newName] of sortedEntries) {
    // Create regex with word boundaries to avoid partial matches
    // Skip if the identifier is a substring of another identifier
    const regex = new RegExp(`\\b${escapeRegExp(oldName)}\\b`, 'g');

    const before = result;
    result = result.replace(regex, newName);

    if (result !== before) {
      const matches = (before.match(regex) || []).length;
      renameCount += matches;
      if (matches > 0 && matches < 100) {
        console.log(`  ${oldName} -> ${newName} (${matches} occurrences)`);
      } else if (matches >= 100) {
        console.log(`  ${oldName} -> ${newName} (${matches} occurrences - high frequency)`);
      }
    }
  }

  console.log(`\nTotal renames applied: ${renameCount}`);
  return result;
}

/**
 * Escape special regex characters
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Process file with streaming to handle large files
 */
function processFile(inputPath, outputPath) {
  console.log(`Processing: ${inputPath}`);
  console.log(`Output: ${outputPath}\n`);

  try {
    // Read the entire file (we have enough memory for reading)
    const code = fs.readFileSync(inputPath, 'utf8');
    console.log(`File size: ${(code.length / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Lines: ${code.split('\n').length.toLocaleString()}\n`);

    console.log('Applying identifier renames...\n');
    const renamed = applyRenames(code);

    // Write output
    fs.writeFileSync(outputPath, renamed, 'utf8');
    console.log(`\n✓ Written to: ${outputPath}`);

    return true;
  } catch (error) {
    console.error(`✗ Error processing ${inputPath}:`, error.message);
    return false;
  }
}

/**
 * Main execution
 */
function main() {
  const workDir = __dirname;

  // Process the main deobfuscated file
  const inputFile = path.join(workDir, 'step2-restringer', 'deobfuscated-restringer.js');
  const outputFile = path.join(workDir, 'step4-renamed', 'deobfuscated-renamed.js');

  // Create output directory
  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('========================================');
  console.log('Simple Identifier Renaming Script');
  console.log('========================================\n');

  const success = processFile(inputFile, outputFile);

  if (success) {
    console.log('\n========================================');
    console.log('✓ Renaming completed successfully!');
    console.log('========================================');
  } else {
    console.log('\n========================================');
    console.log('✗ Renaming failed');
    console.log('========================================');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { processFile, renameMap, applyRenames };
