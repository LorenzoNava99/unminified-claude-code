#!/usr/bin/env node

/**
 * Dependency Analyzer
 *
 * Analyzes dependencies between the 137 renamed symbols to understand:
 * - What each module uses (imports)
 * - What each module provides (exports)
 * - Which modules depend on which others
 * - Which modules are independent (extraction candidates)
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Dependency Analyzer');
console.log('='.repeat(60));

// Load all wave symbol databases
const waveFiles = [
  'COMPREHENSIVE_SYMBOL_DATABASE.json',
  'WAVE2_3_SYMBOL_DATABASE.json',
  'WAVE4_6_SYMBOL_DATABASE.json',
  'WAVE7_PLUS_SYMBOL_DATABASE.json',
  'WAVE8_SYMBOL_DATABASE.json'
];

const allSymbols = [];
const symbolMap = {}; // Quick lookup: oldName/newName -> symbol

console.log('\n📂 Loading symbol databases...\n');

// Load all symbols
for (const waveFile of waveFiles) {
  const wavePath = path.join(__dirname, waveFile);
  if (!fs.existsSync(wavePath)) continue;

  const waveData = JSON.parse(fs.readFileSync(wavePath, 'utf8'));
  console.log(`  ✓ Loaded ${waveFile}`);

  for (const [category, symbols] of Object.entries(waveData)) {
    if (typeof symbols === 'object' && !Array.isArray(symbols)) {
      for (const [symbolName, symbolData] of Object.entries(symbols)) {
        if (symbolData.name) {
          const symbol = {
            oldName: symbolName,
            newName: symbolData.name,
            category,
            occurrences: symbolData.occurrences || 0,
            exports: symbolData.exports || []
          };

          allSymbols.push(symbol);
          symbolMap[symbolName] = symbol;
          symbolMap[symbolData.name] = symbol;
        }
      }
    }
  }
}

console.log(`\n✅ Loaded ${allSymbols.length} symbols\n`);

// Load source file
const sourceFile = path.join(__dirname, 'step14-renamed/deobfuscated-renamed-wave8.js');
console.log('📂 Loading source file...');
const content = fs.readFileSync(sourceFile, 'utf8');
console.log(`✅ Loaded ${(content.length / 1024 / 1024).toFixed(2)} MB\n`);

// For each symbol, find:
// 1. Where it's defined (createCommonJSModule pattern)
// 2. Where it's referenced (usage within other symbols' definitions)

console.log('🔍 Analyzing dependencies...\n');

const dependencyGraph = {};

for (const symbol of allSymbols) {
  console.log(`Analyzing ${symbol.newName}...`);

  const symbolInfo = {
    name: symbol.newName,
    oldName: symbol.oldName,
    category: symbol.category,
    occurrences: symbol.occurrences,
    exports: symbol.exports,

    // Dependencies
    imports: [],  // Other symbols this module uses
    usedBy: [],   // Other symbols that use this module

    // Location info
    definitionLine: null,
    definitionEnd: null,
    codeBlock: ''
  };

  // Find definition - look for createCommonJSModule(SymbolName =>
  const defPattern = new RegExp(
    `createCommonJSModule\\s*\\(\\s*${symbol.newName}\\s*=>`,
    'g'
  );

  const defMatch = defPattern.exec(content);
  if (defMatch) {
    const startIndex = defMatch.index;
    symbolInfo.definitionLine = content.substring(0, startIndex).split('\n').length;

    // Find the matching closing brace using a brace counter
    // Start after the "=>" part
    let braceCount = 0;
    let pos = startIndex + defMatch[0].length;
    let foundOpenBrace = false;

    while (pos < content.length && pos < startIndex + 100000) {
      const char = content[pos];

      if (char === '{') {
        braceCount++;
        foundOpenBrace = true;
      } else if (char === '}') {
        braceCount--;
        if (foundOpenBrace && braceCount === 0) {
          // Found the end
          break;
        }
      }

      pos++;
    }

    const endIndex = pos;
    symbolInfo.definitionEnd = content.substring(0, endIndex).split('\n').length;

    // Extract code block (limit to 10KB for analysis)
    const fullBlock = content.substring(startIndex, endIndex);
    symbolInfo.codeBlock = fullBlock.substring(0, 10000);

    // Analyze imports within this code block
    // Look for references to other renamed symbols
    for (const otherSymbol of allSymbols) {
      if (otherSymbol.newName === symbol.newName) continue;

      // Check if this symbol references the other symbol
      const refPattern = new RegExp(`\\b${otherSymbol.newName}\\b`, 'g');
      const matches = symbolInfo.codeBlock.match(refPattern);

      if (matches && matches.length > 0) {
        symbolInfo.imports.push({
          symbol: otherSymbol.newName,
          references: matches.length
        });
      }
    }

    console.log(`  ✓ Definition: Lines ${symbolInfo.definitionLine}-${symbolInfo.definitionEnd}`);
    console.log(`  ✓ Imports: ${symbolInfo.imports.length} other symbols`);
  } else {
    console.log(`  ⚠️  Definition not found`);
  }

  dependencyGraph[symbol.newName] = symbolInfo;
  console.log();
}

// Build reverse dependencies (usedBy)
console.log('🔗 Building reverse dependencies...\n');

for (const [symbolName, info] of Object.entries(dependencyGraph)) {
  for (const imported of info.imports) {
    if (dependencyGraph[imported.symbol]) {
      dependencyGraph[imported.symbol].usedBy.push({
        symbol: symbolName,
        references: imported.references
      });
    }
  }
}

// Analyze independence
console.log('🎯 Analyzing module independence...\n');

const independentModules = [];
const lightDependencyModules = [];
const heavyDependencyModules = [];

for (const [symbolName, info] of Object.entries(dependencyGraph)) {
  const importCount = info.imports.length;
  const usedByCount = info.usedBy.length;

  if (importCount === 0 && info.definitionLine) {
    independentModules.push({
      name: symbolName,
      usedBy: usedByCount,
      lines: info.definitionEnd - info.definitionLine,
      exports: info.exports.length
    });
  } else if (importCount > 0 && importCount <= 3) {
    lightDependencyModules.push({
      name: symbolName,
      imports: importCount,
      usedBy: usedByCount,
      lines: info.definitionEnd - info.definitionLine,
      dependencies: info.imports.map(i => i.symbol)
    });
  } else if (importCount > 3) {
    heavyDependencyModules.push({
      name: symbolName,
      imports: importCount,
      usedBy: usedByCount,
      lines: info.definitionEnd ? info.definitionLine - info.definitionEnd : 0
    });
  }
}

// Sort by extraction value
independentModules.sort((a, b) => {
  // Score: prefer larger modules that are used by many others
  const scoreA = a.lines * 10 + a.usedBy * 50;
  const scoreB = b.lines * 10 + b.usedBy * 50;
  return scoreB - scoreA;
});

lightDependencyModules.sort((a, b) => {
  // Score: prefer modules with few imports, many users, and large size
  const scoreA = a.lines * 10 + a.usedBy * 50 - a.imports * 30;
  const scoreB = b.lines * 10 + b.usedBy * 50 - b.imports * 30;
  return scoreB - scoreA;
});

// Output results
console.log('📊 Dependency Analysis Results:\n');
console.log('='.repeat(60));

console.log(`\n✨ INDEPENDENT MODULES (${independentModules.length})`);
console.log('No imports - ideal extraction candidates\n');

for (const module of independentModules.slice(0, 10)) {
  console.log(`  ${module.name}`);
  console.log(`    Size: ${module.lines} lines`);
  console.log(`    Used by: ${module.usedBy} modules`);
  console.log(`    Exports: ${module.exports} functions`);
  console.log();
}

console.log(`\n🟢 LIGHT DEPENDENCY MODULES (${lightDependencyModules.length})`);
console.log('1-3 imports - good extraction candidates\n');

for (const module of lightDependencyModules.slice(0, 10)) {
  console.log(`  ${module.name}`);
  console.log(`    Size: ${module.lines} lines`);
  console.log(`    Imports: ${module.imports} (${module.dependencies.slice(0, 3).join(', ')})`);
  console.log(`    Used by: ${module.usedBy} modules`);
  console.log();
}

console.log(`\n🔴 HEAVY DEPENDENCY MODULES (${heavyDependencyModules.length})`);
console.log('4+ imports - extract later\n');

for (const module of heavyDependencyModules.slice(0, 10)) {
  console.log(`  ${module.name}`);
  console.log(`    Imports: ${module.imports} modules`);
  console.log(`    Used by: ${module.usedBy} modules`);
  console.log();
}

// Generate extraction recommendations
console.log('\n🎯 EXTRACTION RECOMMENDATIONS:\n');
console.log('='.repeat(60));

console.log('\n**Phase 1: Independent Modules (Weeks 1-2)**\n');
const phase1 = independentModules.slice(0, 3);
for (let i = 0; i < phase1.length; i++) {
  const module = phase1[i];
  console.log(`${i + 1}. ${module.name}`);
  console.log(`   ${module.lines} lines, used by ${module.usedBy} modules`);
  console.log(`   Rationale: No dependencies, ${module.usedBy > 5 ? 'high' : module.usedBy > 2 ? 'moderate' : 'low'} impact`);
}

console.log('\n**Phase 2: Light Dependencies (Weeks 3-4)**\n');
const phase2 = lightDependencyModules.slice(0, 3);
for (let i = 0; i < phase2.length; i++) {
  const module = phase2[i];
  console.log(`${i + 1}. ${module.name}`);
  console.log(`   ${module.lines} lines, ${module.imports} dependencies`);
  console.log(`   Dependencies: ${module.dependencies.slice(0, 3).join(', ')}`);
}

console.log('\n**Phase 3: Core Libraries (Weeks 5-8)**\n');
console.log('After Phase 1-2, extract larger modules with their dependency clusters');

// Save results
const outputDir = path.join(__dirname, 'step17-module-analysis');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputFile = path.join(outputDir, 'dependency-graph.json');
fs.writeFileSync(outputFile, JSON.stringify({
  type: 'dependency-graph',
  totalSymbols: allSymbols.length,
  analyzed: Object.keys(dependencyGraph).length,
  dependencyGraph,
  statistics: {
    independent: independentModules.length,
    lightDependency: lightDependencyModules.length,
    heavyDependency: heavyDependencyModules.length
  },
  extractionCandidates: {
    phase1: phase1,
    phase2: phase2
  }
}, null, 2));

console.log(`\n\n💾 Saved to: ${outputFile}`);
console.log('\n✨ Analysis complete!\n');
