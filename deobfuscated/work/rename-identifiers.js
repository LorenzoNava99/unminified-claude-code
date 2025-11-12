#!/usr/bin/env node

/**
 * Systematic identifier renaming script using Babel AST transformation
 * This script applies semantic naming based on context analysis
 */

const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

// Load the identifier mapping
const mappingPath = path.join(__dirname, 'analysis', 'identifier-mapping.json');
const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));

// Combine all mappings into a single rename map
const renameMap = {
  ...mapping.mappings,
  ...Object.entries(mapping.classAnalysis)
    .filter(([_, desc]) => !desc.startsWith('Unknown'))
    .reduce((acc, [key, desc]) => {
      // Extract class name from description
      const match = desc.match(/^(\w+)/);
      if (match) {
        acc[key] = match[1];
      }
      return acc;
    }, {}),
  ...mapping.additionalMappings
};

console.log(`Loaded ${Object.keys(renameMap).length} identifier mappings`);

/**
 * Babel plugin to rename identifiers
 */
function createRenamingPlugin() {
  return {
    visitor: {
      Identifier(path) {
        const { node } = path;
        const oldName = node.name;

        // Check if this identifier should be renamed
        if (renameMap[oldName]) {
          const newName = renameMap[oldName];

          // Skip if it's a property key (unless computed)
          if (path.parentPath.isMemberExpression() &&
              path.parentPath.node.property === node &&
              !path.parentPath.node.computed) {
            return;
          }

          // Skip if it's an object property key (unless computed or shorthand)
          if (path.parentPath.isObjectProperty() &&
              path.parentPath.node.key === node &&
              !path.parentPath.node.computed &&
              !path.parentPath.node.shorthand) {
            return;
          }

          // Rename the identifier
          console.log(`Renaming: ${oldName} -> ${newName}`);
          node.name = newName;
        }
      }
    }
  };
}

/**
 * Process a file and apply identifier renaming
 */
function processFile(inputPath, outputPath) {
  console.log(`\nProcessing: ${inputPath}`);

  const code = fs.readFileSync(inputPath, 'utf8');

  try {
    const result = babel.transformSync(code, {
      plugins: [createRenamingPlugin()],
      retainLines: true,
      compact: false,
      comments: true
    });

    fs.writeFileSync(outputPath, result.code, 'utf8');
    console.log(`✓ Written to: ${outputPath}`);
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
  console.log('Identifier Renaming Script');
  console.log('========================================');

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

module.exports = { processFile, renameMap };
