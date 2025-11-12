#!/usr/bin/env node

/**
 * Module Inspector for Wave 4-6
 *
 * Intelligently analyzes obfuscated module identifiers by examining their exports
 * to determine meaningful names.
 */

const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'step8-renamed/deobfuscated-renamed-wave23.js');
const freqFile = path.join(__dirname, 'step7-analysis/identifier-frequencies.json');

console.log('🔍 Module Inspector for Wave 4-6');
console.log('='.repeat(50));

// Load frequency data
const freqData = JSON.parse(fs.readFileSync(freqFile, 'utf8'));

// Get next tier numbered classes (6-10 occurrences)
const numberedClass = freqData.byCategory.numberedClass
  .filter(([name, count]) => count >= 6 && count <= 10)
  .map(([name, count]) => ({ name, count, type: 'numberedClass' }));

console.log(`\n📊 Found ${numberedClass.length} numbered class identifiers (6-10 occurrences)`);

// Load source file
console.log('\n📂 Loading source file...');
const content = fs.readFileSync(inputFile, 'utf8');
console.log(`✅ Loaded ${(content.length / 1024 / 1024).toFixed(2)} MB\n`);

// Function to extract module exports
function extractModuleExports(identifier) {
  // Pattern: createCommonJSModule(IDENTIFIER => {
  const modulePattern = new RegExp(
    `createCommonJSModule\\(${identifier}\\s*=>\\s*\\{[\\s\\S]{0,2000}?(?:${identifier}\\.\\w+|Object\\.defineProperty\\(${identifier})`,
    'g'
  );

  const matches = content.match(modulePattern);
  if (!matches || matches.length === 0) {
    return null;
  }

  const match = matches[0];

  // Extract all exports (IDENTIFIER.exportName =)
  const exportPattern = new RegExp(`${identifier}\\.(\\w+)\\s*=`, 'g');
  const exports = [];
  let exportMatch;

  while ((exportMatch = exportPattern.exec(match)) !== null) {
    const exportName = exportMatch[1];
    if (exportName !== '__esModule' && !exports.includes(exportName)) {
      exports.push(exportName);
    }
  }

  return exports.length > 0 ? exports : null;
}

// Analyze each identifier
console.log('🔬 Analyzing modules...\n');
const results = [];

for (const item of numberedClass.slice(0, 50)) { // Top 50
  const exports = extractModuleExports(item.name);

  if (exports && exports.length > 0) {
    // Infer purpose from export names
    let purpose = 'unknown';
    let suggestedName = item.name;

    const exportStr = exports.join(', ');

    // Pattern matching for common modules
    if (exportStr.includes('Attribute') && exportStr.includes('Processor')) {
      purpose = 'OpenTelemetry Attributes Processor';
      suggestedName = 'OtelAttributesProcessor';
    } else if (exportStr.includes('Otlp') || exportStr.includes('OTLP')) {
      purpose = 'OTLP Configuration/Exporter';
      suggestedName = 'OtlpConfig';
    } else if (exportStr.includes('LoadBalancer') || exportStr.includes('loadBalancer')) {
      purpose = 'Load Balancer';
      suggestedName = 'LoadBalancerExports';
    } else if (exportStr.includes('Metric') || exportStr.includes('metric')) {
      purpose = 'Metrics';
      suggestedName = 'MetricsExports';
    } else if (exportStr.includes('Span') || exportStr.includes('span')) {
      purpose = 'Span/Tracing';
      suggestedName = 'SpanExports';
    } else if (exportStr.includes('Resource') || exportStr.includes('resource')) {
      purpose = 'Resource';
      suggestedName = 'ResourceExports';
    } else if (exportStr.includes('grpc') || exportStr.includes('Grpc') || exportStr.includes('Channel')) {
      purpose = 'gRPC';
      suggestedName = 'GrpcExports';
    } else if (exportStr.includes('Http') || exportStr.includes('http')) {
      purpose = 'HTTP';
      suggestedName = 'HttpExports';
    } else if (exportStr.includes('Context') || exportStr.includes('context')) {
      purpose = 'Context';
      suggestedName = 'ContextExports';
    } else if (exportStr.includes('Propagat') || exportStr.includes('propagat')) {
      purpose = 'Propagation';
      suggestedName = 'PropagationExports';
    }

    results.push({
      identifier: item.name,
      occurrences: item.count,
      exports: exports.slice(0, 5), // First 5 exports
      totalExports: exports.length,
      purpose,
      suggestedName
    });

    console.log(`${item.name.padEnd(8)} (${item.count.toString().padStart(2)} occ) → ${purpose}`);
    console.log(`  Exports: ${exports.slice(0, 3).join(', ')}${exports.length > 3 ? '...' : ''}`);
    console.log(`  Suggested: ${suggestedName}\n`);
  }
}

// Save results
const outputFile = path.join(__dirname, 'step9-analysis/module-inspection.json');
const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputFile, JSON.stringify({
  totalAnalyzed: numberedClass.length,
  successfullyInspected: results.length,
  results
}, null, 2));

console.log(`\n✅ Analysis complete!`);
console.log(`📊 Analyzed: ${numberedClass.length} identifiers`);
console.log(`✅ Successfully inspected: ${results.length} modules`);
console.log(`💾 Saved to: ${outputFile}\n`);
