#!/usr/bin/env node

/**
 * Batch Inspector for Wave 8
 *
 * Targets identifiers with 4-5 occurrences
 */

const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'step12-renamed/deobfuscated-renamed-wave7plus.js');
const freqFile = path.join(__dirname, 'step7-analysis/identifier-frequencies.json');

console.log('🔍 Wave 8 Batch Inspector (4-5 occurrences)');
console.log('='.repeat(60));

// Load frequency data
const freqData = JSON.parse(fs.readFileSync(freqFile, 'utf8'));

// Get candidates: 4-5 occurrences from numbered classes
const candidates = freqData.byCategory.numberedClass
  .filter(([name, count]) => count >= 4 && count <= 5)
  .map(([name, count]) => ({ name, count }))
  .slice(0, 40); // Top 40

console.log(`\n📊 Inspecting ${candidates.length} candidates (4-5 occurrences)\n`);

// Load source
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
      let confidence = 'medium';

      // Pattern matching
      if (exportStr.match(/Span|span|Trace|trace/i)) {
        category = 'opentelemetry-span';
        suggested = `Otel${id}SpanExports`;
        confidence = 'high';
      } else if (exportStr.match(/Metric|metric/i)) {
        category = 'opentelemetry-metrics';
        suggested = `Otel${id}MetricExports`;
        confidence = 'high';
      } else if (exportStr.match(/Attribute|attribute/i)) {
        category = 'opentelemetry-attributes';
        suggested = `Otel${id}AttributeExports`;
        confidence = 'high';
      } else if (exportStr.match(/Resource|resource/i)) {
        category = 'opentelemetry-resource';
        suggested = `Otel${id}ResourceExports`;
        confidence = 'high';
      } else if (exportStr.match(/Logger|logger|Log\b/i)) {
        category = 'opentelemetry-logging';
        suggested = `Otel${id}LoggerExports`;
        confidence = 'high';
      } else if (exportStr.match(/Exporter|exporter|Export/i)) {
        category = 'opentelemetry-exporter';
        suggested = `Otel${id}ExporterExports`;
        confidence = 'high';
      } else if (exportStr.match(/Otlp|OTLP|otlp/)) {
        category = 'opentelemetry-otlp';
        suggested = `Otlp${id}Exports`;
        confidence = 'high';
      } else if (exportStr.match(/Context|context/i)) {
        category = 'context';
        suggested = `${id}ContextExports`;
        confidence = 'high';
      } else if (exportStr.match(/grpc|Grpc|GRPC|Channel|channel/i)) {
        category = 'grpc';
        suggested = `Grpc${id}Exports`;
        confidence = 'medium';
      } else if (exportStr.match(/Http|http|HTTP|Request|request/i)) {
        category = 'http';
        suggested = `Http${id}Exports`;
        confidence = 'medium';
      } else if (exportStr.match(/Stream|stream/i)) {
        category = 'streaming';
        suggested = `Stream${id}Exports`;
        confidence = 'medium';
      } else if (exportStr.match(/Parse|parse|Parser|parser/i)) {
        category = 'parsing';
        suggested = `Parser${id}Exports`;
        confidence = 'medium';
      } else if (exportStr.match(/Format|format|Formatter/i)) {
        category = 'formatting';
        suggested = `Formatter${id}Exports`;
        confidence = 'medium';
      } else if (exportStr.match(/Validat|validat/i)) {
        category = 'validation';
        suggested = `Validation${id}Exports`;
        confidence = 'medium';
      } else if (exportStr.match(/Error|error/i)) {
        category = 'error-handling';
        suggested = `Error${id}Exports`;
        confidence = 'medium';
      } else if (exportStr.match(/Config|config|Setting/i)) {
        category = 'config';
        suggested = `Config${id}Exports`;
        confidence = 'medium';
      }

      results.push({
        identifier: id,
        occurrences: candidate.count,
        exports: exports.slice(0, 5),
        totalExports: exports.length,
        category,
        suggested,
        confidence,
        allExports: exports
      });

      foundCount++;
      const confidenceMark = confidence === 'high' ? '✓' : '·';
      console.log(`${confidenceMark} ${id.padEnd(8)} (${candidate.count} occ) → ${category.padEnd(25)} | ${exports.slice(0, 2).join(', ')}`);
    }
  }
}

console.log(`\n✅ Successfully inspected: ${foundCount}/${candidates.length} modules\n`);

// Save results
const outputFile = path.join(__dirname, 'step13-analysis/wave8-inspection.json');
const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputFile, JSON.stringify({
  wave: 8,
  occurrenceRange: '4-5',
  totalCandidates: candidates.length,
  successfullyInspected: foundCount,
  results: results.sort((a, b) => b.occurrences - a.occurrences)
}, null, 2));

console.log(`💾 Saved to: ${outputFile}`);

// Print summary by category
const byCategory = {};
const highConfidence = results.filter(r => r.confidence === 'high');

for (const r of results) {
  if (!byCategory[r.category]) byCategory[r.category] = [];
  byCategory[r.category].push(r.identifier);
}

console.log('\n📊 Results by category:\n');
for (const [cat, ids] of Object.entries(byCategory).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`  ${cat}: ${ids.length} modules`);
  console.log(`    ${ids.slice(0, 5).join(', ')}${ids.length > 5 ? '...' : ''}`);
}

console.log(`\n🎯 High confidence identifiers: ${highConfidence.length}/${foundCount}`);
console.log(`📈 Recommended for Wave 8: ${highConfidence.length} identifiers`);

console.log('\n✨ Analysis complete!\n');
