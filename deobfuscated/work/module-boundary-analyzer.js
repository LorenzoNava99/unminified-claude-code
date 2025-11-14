#!/usr/bin/env node

/**
 * Module Boundary Analyzer
 *
 * Uses Wave 1-8 symbol databases to identify clear module boundaries
 * in the monolithic file, preparing for module extraction.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Module Boundary Analyzer');
console.log('='.repeat(60));

// Load all wave symbol databases
const waveFiles = [
  'COMPREHENSIVE_SYMBOL_DATABASE.json',
  'WAVE2_3_SYMBOL_DATABASE.json',
  'WAVE4_6_SYMBOL_DATABASE.json',
  'WAVE7_PLUS_SYMBOL_DATABASE.json',
  'WAVE8_SYMBOL_DATABASE.json'
];

const allSymbols = {};
const categoryToModule = {
  // OpenTelemetry modules
  'opentelemetry-core': 'opentelemetry-core',
  'opentelemetry-semantic': 'opentelemetry-semantic',
  'opentelemetry-api': 'opentelemetry-api',
  'opentelemetry-metrics': 'opentelemetry-metrics',
  'opentelemetry-aggregation': 'opentelemetry-aggregation',
  'opentelemetry-resources': 'opentelemetry-resources',
  'opentelemetry-instrumentation': 'opentelemetry-instrumentation',
  'opentelemetry-span': 'opentelemetry-span',
  'opentelemetry-context': 'opentelemetry-context',
  'opentelemetry-otlp': 'opentelemetry-otlp',
  'opentelemetryExtended': 'opentelemetry-extended',
  'opentelemetryAdvanced': 'opentelemetry-advanced',

  // gRPC modules
  'grpc-core': 'grpc-core',
  'grpc-client': 'grpc-client',
  'grpc-channel': 'grpc-channel',
  'grpcExtended': 'grpc-extended',

  // Module system
  'module-system': 'module-system',
  'interop': 'module-system',

  // Other infrastructure
  'validation': 'validation',
  'http-client': 'http-client',
  'protobuf': 'protobuf',
  'aws': 'aws-services'
};

console.log('\n📂 Loading symbol databases...\n');

// Load all wave databases
for (const waveFile of waveFiles) {
  const wavePath = path.join(__dirname, waveFile);
  if (!fs.existsSync(wavePath)) {
    console.log(`  ⚠️  ${waveFile} not found, skipping`);
    continue;
  }

  const waveData = JSON.parse(fs.readFileSync(wavePath, 'utf8'));
  console.log(`  ✓ Loaded ${waveFile}`);

  // Extract all symbols from all categories
  for (const [category, symbols] of Object.entries(waveData)) {
    if (typeof symbols === 'object' && !Array.isArray(symbols)) {
      for (const [symbolName, symbolData] of Object.entries(symbols)) {
        if (symbolData.name && symbolData.occurrences) {
          const moduleName = categoryToModule[category] || 'uncategorized';

          if (!allSymbols[moduleName]) {
            allSymbols[moduleName] = [];
          }

          allSymbols[moduleName].push({
            oldName: symbolName,
            newName: symbolData.name,
            category,
            occurrences: symbolData.occurrences,
            confidence: symbolData.confidence || 'high',
            exports: symbolData.exports || []
          });
        }
      }
    }
  }
}

console.log(`\n✅ Loaded symbols from ${waveFiles.length} wave files\n`);

// Load the renamed source file
const sourceFile = path.join(__dirname, 'step14-renamed/deobfuscated-renamed-wave8.js');
console.log('📂 Loading source file...');
const content = fs.readFileSync(sourceFile, 'utf8');
const lines = content.split('\n');
console.log(`✅ Loaded ${(content.length / 1024 / 1024).toFixed(2)} MB (${lines.length.toLocaleString()} lines)\n`);

// Find module boundaries by locating symbol definitions
console.log('🔍 Analyzing module boundaries...\n');

const moduleBoundaries = {};

for (const [moduleName, symbols] of Object.entries(allSymbols)) {
  console.log(`Module: ${moduleName} (${symbols.length} symbols)`);

  const boundaries = {
    moduleName,
    symbolCount: symbols.length,
    symbols: [],
    lineRanges: [],
    totalOccurrences: 0
  };

  for (const symbol of symbols) {
    // Find where this symbol is defined (createCommonJSModule pattern)
    const pattern = new RegExp(`createCommonJSModule\\s*\\(\\s*${symbol.newName}\\s*=>`, 'g');
    let match;

    while ((match = pattern.exec(content)) !== null) {
      // Find line number
      const beforeMatch = content.substring(0, match.index);
      const lineNum = beforeMatch.split('\n').length;

      // Find the end of this module (next createCommonJSModule or end of file)
      const afterMatch = content.substring(match.index + 100);
      const nextModuleMatch = afterMatch.match(/createCommonJSModule\s*\(/);
      const endOffset = nextModuleMatch ? match.index + 100 + nextModuleMatch.index : content.length;
      const endLineNum = content.substring(0, endOffset).split('\n').length;

      boundaries.symbols.push({
        name: symbol.newName,
        oldName: symbol.oldName,
        startLine: lineNum,
        endLine: endLineNum,
        lines: endLineNum - lineNum,
        occurrences: symbol.occurrences,
        exports: symbol.exports
      });

      boundaries.totalOccurrences += symbol.occurrences;

      console.log(`  ✓ ${symbol.newName}: Lines ${lineNum}-${endLineNum} (${endLineNum - lineNum} lines)`);
    }
  }

  // Sort symbols by line number
  boundaries.symbols.sort((a, b) => a.startLine - b.startLine);

  // Identify contiguous ranges
  if (boundaries.symbols.length > 0) {
    let currentRange = {
      start: boundaries.symbols[0].startLine,
      end: boundaries.symbols[0].endLine,
      symbols: [boundaries.symbols[0].name]
    };

    for (let i = 1; i < boundaries.symbols.length; i++) {
      const symbol = boundaries.symbols[i];

      // If this symbol is within 100 lines of the previous range, extend it
      if (symbol.startLine - currentRange.end < 100) {
        currentRange.end = symbol.endLine;
        currentRange.symbols.push(symbol.name);
      } else {
        // New range
        boundaries.lineRanges.push(currentRange);
        currentRange = {
          start: symbol.startLine,
          end: symbol.endLine,
          symbols: [symbol.name]
        };
      }
    }

    boundaries.lineRanges.push(currentRange);
  }

  moduleBoundaries[moduleName] = boundaries;
  console.log(`  → ${boundaries.lineRanges.length} contiguous ranges identified`);
  console.log();
}

// Generate summary
console.log('📊 Module Boundary Summary:\n');
console.log('='.repeat(60));

const sortedModules = Object.entries(moduleBoundaries)
  .sort((a, b) => b[1].totalOccurrences - a[1].totalOccurrences);

for (const [moduleName, data] of sortedModules) {
  console.log(`\n${moduleName.toUpperCase()}`);
  console.log(`  Symbols: ${data.symbolCount}`);
  console.log(`  Total occurrences: ${data.totalOccurrences}`);
  console.log(`  Contiguous ranges: ${data.lineRanges.length}`);

  if (data.lineRanges.length > 0) {
    console.log(`  Line ranges:`);
    for (const range of data.lineRanges) {
      const rangeSize = range.end - range.start;
      console.log(`    Lines ${range.start.toLocaleString()}-${range.end.toLocaleString()} (${rangeSize.toLocaleString()} lines, ${range.symbols.length} symbols)`);
    }
  }
}

// Calculate extraction priorities
console.log('\n\n🎯 Extraction Priority Ranking:\n');
console.log('='.repeat(60));

const priorities = sortedModules.map(([moduleName, data]) => {
  // Score based on:
  // 1. Number of symbols (more = higher priority)
  // 2. Total occurrences (more = higher impact)
  // 3. Contiguous ranges (fewer = easier to extract)
  const symbolScore = data.symbolCount * 10;
  const occurrenceScore = Math.log10(data.totalOccurrences + 1) * 100;
  const contiguityScore = data.lineRanges.length > 0 ? (1 / data.lineRanges.length) * 50 : 0;
  const totalScore = symbolScore + occurrenceScore + contiguityScore;

  return {
    moduleName,
    score: totalScore,
    symbols: data.symbolCount,
    occurrences: data.totalOccurrences,
    ranges: data.lineRanges.length
  };
}).sort((a, b) => b.score - a.score);

let rank = 1;
for (const priority of priorities) {
  console.log(`${rank}. ${priority.moduleName}`);
  console.log(`   Score: ${priority.score.toFixed(1)} | Symbols: ${priority.symbols} | Occurrences: ${priority.occurrences} | Ranges: ${priority.ranges}`);
  rank++;
}

// Save results
const outputDir = path.join(__dirname, 'step17-module-analysis');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputFile = path.join(outputDir, 'module-boundaries.json');
fs.writeFileSync(outputFile, JSON.stringify({
  type: 'module-boundaries',
  sourceFile: 'step14-renamed/deobfuscated-renamed-wave8.js',
  totalLines: lines.length,
  moduleBoundaries,
  extractionPriorities: priorities
}, null, 2));

console.log(`\n\n💾 Saved analysis to: ${outputFile}`);
console.log('\n✨ Analysis complete!\n');
