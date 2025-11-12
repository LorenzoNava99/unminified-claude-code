#!/usr/bin/env node

/**
 * Batch Module Inspector
 *
 * Efficiently inspects multiple identifiers to find module exports
 * and suggest meaningful names based on export patterns.
 */

const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'step10-renamed/deobfuscated-renamed-wave46.js');
const freqFile = path.join(__dirname, 'step7-analysis/identifier-frequencies.json');

console.log('🔍 Batch Module Inspector for Wave 7+');
console.log('='.repeat(60));

// Load frequency data
const freqData = JSON.parse(fs.readFileSync(freqFile, 'utf8'));

// Get candidates: 5-9 occurrences from numbered classes
const candidates = freqData.byCategory.numberedClass
  .filter(([name, count]) => count >= 5 && count <= 9)
  .map(([name, count]) => ({ name, count }))
  .slice(0, 30); // Top 30

console.log(`\n📊 Inspecting ${candidates.length} candidates (5-9 occurrences)\n`);

// Load source (use streaming/chunked approach for large files)
console.log('📂 Loading source file...');
const content = fs.readFileSync(inputFile, 'utf8');
console.log(`✅ Loaded ${(content.length / 1024 / 1024).toFixed(2)} MB\n`);

console.log('🔬 Analyzing modules...\n');

const results = [];
let foundCount = 0;

for (const candidate of candidates) {
  const id = candidate.name;

  // Try to find module export pattern
  const pattern = new RegExp(
    `createCommonJSModule\\(${id}\\s*=>\\s*\\{[\\s\\S]{0,500}?${id}\\.(\\w+)`,
    'm'
  );

  const match = content.match(pattern);

  if (match) {
    // Found a module! Extract all exports
    const moduleStart = match.index;
    const moduleCode = content.substring(moduleStart, moduleStart + 2000);

    // Extract exports
    const exportRegex = new RegExp(`${id}\\.(\\w+)\\s*=`, 'g');
    const exports = [];
    let exportMatch;

    while ((exportMatch = exportRegex.exec(moduleCode)) !== null) {
      const exportName = exportMatch[1];
      if (exportName !== '__esModule' && !exports.includes(exportName)) {
        exports.push(exportName);
      }
    }

    if (exports.length > 0) {
      // Suggest name based on exports
      const exportStr = exports.join(', ');
      let suggested = id;
      let category = 'unknown';

      // Pattern matching
      if (exportStr.match(/Span|span|Trace|trace/i)) {
        category = 'opentelemetry-span';
        suggested = 'OtelSpanExports';
      } else if (exportStr.match(/Metric|metric/i)) {
        category = 'opentelemetry-metrics';
        suggested = 'OtelMetricExports';
      } else if (exportStr.match(/Attribute|attribute/i)) {
        category = 'opentelemetry-attributes';
        suggested = 'OtelAttributeExports';
      } else if (exportStr.match(/Resource|resource/i)) {
        category = 'opentelemetry-resource';
        suggested = 'OtelResourceExports';
      } else if (exportStr.match(/Context|context/i)) {
        category = 'opentelemetry-context';
        suggested = 'OtelContextExports';
      } else if (exportStr.match(/Propagat|propagat/i)) {
        category = 'opentelemetry-propagation';
        suggested = 'OtelPropagationExports';
      } else if (exportStr.match(/Otlp|OTLP|otlp/)) {
        category = 'opentelemetry-otlp';
        suggested = 'OtlpExports';
      } else if (exportStr.match(/grpc|Grpc|GRPC|Channel|channel/i)) {
        category = 'grpc';
        suggested = 'GrpcExports';
      } else if (exportStr.match(/Http|http|HTTP/)) {
        category = 'http';
        suggested = 'HttpExports';
      } else if (exportStr.match(/Parse|parse|Parser|parser/i)) {
        category = 'parsing';
        suggested = 'ParserExports';
      } else if (exportStr.match(/Format|format|Formatter/i)) {
        category = 'formatting';
        suggested = 'FormatterExports';
      } else if (exportStr.match(/Validat|validat/i)) {
        category = 'validation';
        suggested = 'ValidationExports';
      }

      results.push({
        identifier: id,
        occurrences: candidate.count,
        exports: exports.slice(0, 5),
        totalExports: exports.length,
        category,
        suggested,
        allExports: exports
      });

      foundCount++;
      console.log(`✓ ${id.padEnd(8)} (${candidate.count} occ) → ${category.padEnd(25)} | ${exports.slice(0, 2).join(', ')}`);
    }
  }
}

console.log(`\n✅ Successfully inspected: ${foundCount}/${candidates.length} modules\n`);

// Save results
const outputFile = path.join(__dirname, 'step11-analysis/batch-inspection.json');
const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputFile, JSON.stringify({
  totalCandidates: candidates.length,
  successfullyInspected: foundCount,
  results: results.sort((a, b) => b.occurrences - a.occurrences)
}, null, 2));

console.log(`💾 Saved to: ${outputFile}`);

// Print summary by category
const byCategory = {};
for (const r of results) {
  if (!byCategory[r.category]) byCategory[r.category] = [];
  byCategory[r.category].push(r.identifier);
}

console.log('\n📊 Results by category:\n');
for (const [cat, ids] of Object.entries(byCategory)) {
  console.log(`  ${cat}: ${ids.length} modules`);
  console.log(`    ${ids.slice(0, 5).join(', ')}${ids.length > 5 ? '...' : ''}`);
}

console.log('\n✨ Analysis complete!\n');
