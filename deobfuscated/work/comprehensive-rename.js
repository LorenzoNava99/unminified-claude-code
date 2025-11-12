#!/usr/bin/env node

/**
 * Comprehensive Identifier Renaming Script
 *
 * Systematically renames obfuscated identifiers in deobfuscated.js
 * using the comprehensive symbol database.
 *
 * Strategy:
 * 1. Load symbol database
 * 2. Apply HIGH CONFIDENCE renames first (130+ mappings)
 * 3. Use word boundaries to avoid partial matches
 * 4. Track statistics for validation
 * 5. Create backup before modifications
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  inputFile: path.join(__dirname, '../deobfuscated.js'),
  outputFile: path.join(__dirname, 'step6-renamed/deobfuscated-renamed-comprehensive.js'),
  backupFile: path.join(__dirname, 'step6-renamed/deobfuscated-renamed-comprehensive.js.backup'),
  symbolDbFile: path.join(__dirname, 'COMPREHENSIVE_SYMBOL_DATABASE.json'),
  statsFile: path.join(__dirname, 'step6-renamed/rename-stats.json'),
  chunkSize: 1024 * 1024 * 5, // 5MB chunks for processing
  dryRun: false, // Set to true to see what would be renamed
};

// Statistics tracking
const stats = {
  totalReplacements: 0,
  byIdentifier: {},
  byType: {
    function: 0,
    class: 0,
    variable: 0,
    constant: 0
  },
  warnings: [],
  startTime: Date.now(),
  fileSize: 0
};

/**
 * Load symbol database
 */
function loadSymbolDatabase() {
  console.log('📚 Loading symbol database...');
  const db = JSON.parse(fs.readFileSync(CONFIG.symbolDbFile, 'utf8'));
  console.log(`✅ Loaded ${Object.keys(db.coreIdentifiers).length + Object.keys(db.configIdentifiers).length} mappings`);
  return db;
}

/**
 * Build rename mapping from symbol database
 * Only include HIGH CONFIDENCE mappings
 */
function buildRenameMap(symbolDb) {
  const renameMap = new Map();

  // Core identifiers (HIGH CONFIDENCE)
  for (const [oldName, info] of Object.entries(symbolDb.coreIdentifiers)) {
    if (info.name) {
      renameMap.set(oldName, {
        newName: info.name,
        type: info.type || 'identifier',
        confidence: 'high',
        module: info.module
      });
    }
  }

  // Config identifiers (HIGH CONFIDENCE)
  for (const [oldName, info] of Object.entries(symbolDb.configIdentifiers)) {
    if (info.name) {
      renameMap.set(oldName, {
        newName: info.name,
        type: info.type || 'identifier',
        confidence: 'high',
        line: info.line
      });
    }
  }

  // Library classes (HIGH CONFIDENCE)
  for (const [library, classes] of Object.entries(symbolDb.libraryClasses)) {
    for (const [oldName, info] of Object.entries(classes)) {
      if (info.name) {
        renameMap.set(oldName, {
          newName: info.name,
          type: 'class',
          confidence: 'high',
          library: library
        });
      }
    }
  }

  // Storage identifiers (HIGH CONFIDENCE)
  for (const [oldName, info] of Object.entries(symbolDb.storageIdentifiers)) {
    if (info.name) {
      renameMap.set(oldName, {
        newName: info.name,
        type: 'class',
        confidence: 'high',
        module: info.module
      });
    }
  }

  // API identifiers (MEDIUM CONFIDENCE - only clear ones)
  const apiIdents = {
    'Yz0': 'NetworkCore',
    'CRA': 'StatsigClient'
  };
  for (const [oldName, newName] of Object.entries(apiIdents)) {
    renameMap.set(oldName, {
      newName: newName,
      type: 'class',
      confidence: 'medium'
    });
  }

  console.log(`🗺️  Built rename map with ${renameMap.size} mappings`);
  return renameMap;
}

/**
 * Create safe regex for renaming
 * Uses word boundaries to avoid partial matches
 */
function createSafeRegex(oldName) {
  // Escape special regex characters
  const escaped = oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Word boundary pattern
  // Match the identifier only when it's not part of another word
  // Handles: function oldName(, var oldName =, oldName.method, etc.
  return new RegExp(`\\b${escaped}\\b`, 'g');
}

/**
 * Apply renames to content
 */
function applyRenames(content, renameMap) {
  let result = content;
  const appliedRenames = [];

  for (const [oldName, info] of renameMap.entries()) {
    const regex = createSafeRegex(oldName);
    let matches = 0;

    result = result.replace(regex, (match) => {
      matches++;
      return info.newName;
    });

    if (matches > 0) {
      appliedRenames.push({
        oldName,
        newName: info.newName,
        matches,
        type: info.type,
        confidence: info.confidence
      });

      // Update statistics
      stats.totalReplacements += matches;
      stats.byIdentifier[oldName] = matches;
      if (stats.byType[info.type] !== undefined) {
        stats.byType[info.type] += matches;
      }
    }
  }

  return { result, appliedRenames };
}

/**
 * Process file in chunks (for very large files)
 */
function processFileInChunks(inputPath, outputPath, renameMap) {
  console.log('📄 Reading input file...');
  const content = fs.readFileSync(inputPath, 'utf8');
  stats.fileSize = content.length;
  console.log(`✅ File size: ${(stats.fileSize / 1024 / 1024).toFixed(2)} MB`);

  console.log('🔄 Applying renames...');
  const { result, appliedRenames } = applyRenames(content, renameMap);

  if (CONFIG.dryRun) {
    console.log('\n🔍 DRY RUN - Would apply these renames:');
    appliedRenames.forEach(r => {
      console.log(`  ${r.oldName} → ${r.newName} (${r.matches} occurrences, ${r.confidence} confidence)`);
    });
    console.log(`\n📊 Total: ${stats.totalReplacements} replacements`);
    return;
  }

  // Create output directory
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('💾 Writing output file...');
  fs.writeFileSync(outputPath, result, 'utf8');

  return appliedRenames;
}

/**
 * Generate statistics report
 */
function generateStatsReport(appliedRenames) {
  const report = {
    ...stats,
    duration: ((Date.now() - stats.startTime) / 1000).toFixed(2) + 's',
    appliedRenames: appliedRenames.sort((a, b) => b.matches - a.matches).slice(0, 50), // Top 50
    summary: {
      totalIdentifiersRenamed: appliedRenames.length,
      totalOccurrencesReplaced: stats.totalReplacements,
      avgReplacementsPerIdentifier: (stats.totalReplacements / appliedRenames.length).toFixed(2),
      fileSizeMB: (stats.fileSize / 1024 / 1024).toFixed(2),
      replacementsPerMB: (stats.totalReplacements / (stats.fileSize / 1024 / 1024)).toFixed(2)
    }
  };

  fs.writeFileSync(CONFIG.statsFile, JSON.stringify(report, null, 2));
  return report;
}

/**
 * Print summary
 */
function printSummary(report) {
  console.log('\n✨ RENAMING COMPLETE ✨\n');
  console.log('📊 Summary:');
  console.log(`  ├─ Identifiers renamed: ${report.summary.totalIdentifiersRenamed}`);
  console.log(`  ├─ Total replacements: ${report.summary.totalOccurrencesReplaced}`);
  console.log(`  ├─ Average per identifier: ${report.summary.avgReplacementsPerIdentifier}`);
  console.log(`  ├─ File size: ${report.summary.fileSizeMB} MB`);
  console.log(`  ├─ Replacements/MB: ${report.summary.replacementsPerMB}`);
  console.log(`  └─ Duration: ${report.duration}`);

  console.log('\n🏆 Top 10 Renamed:');
  report.appliedRenames.slice(0, 10).forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.oldName} → ${r.newName} (${r.matches} occurrences)`);
  });

  console.log('\n📈 By Type:');
  for (const [type, count] of Object.entries(stats.byType)) {
    if (count > 0) {
      console.log(`  ├─ ${type}: ${count}`);
    }
  }

  console.log(`\n💾 Output: ${CONFIG.outputFile}`);
  console.log(`📋 Stats: ${CONFIG.statsFile}`);
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Comprehensive Identifier Renaming');
  console.log('=====================================\n');

  try {
    // Load symbol database
    const symbolDb = loadSymbolDatabase();

    // Build rename map
    const renameMap = buildRenameMap(symbolDb);

    // Apply renames
    const appliedRenames = processFileInChunks(
      CONFIG.inputFile,
      CONFIG.outputFile,
      renameMap
    );

    if (CONFIG.dryRun) {
      console.log('\n✅ Dry run complete');
      return;
    }

    // Generate and save statistics
    const report = generateStatsReport(appliedRenames);

    // Print summary
    printSummary(report);

    console.log('\n✅ Renaming complete!');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { applyRenames, createSafeRegex };
