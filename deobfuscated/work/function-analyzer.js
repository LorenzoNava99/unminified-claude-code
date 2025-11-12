#!/usr/bin/env node

/**
 * Function Analyzer for High-Frequency Two-Letter Functions
 *
 * Analyzes function definitions and usage patterns to suggest meaningful names
 */

const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'step14-renamed/deobfuscated-renamed-wave8.js');
const twoLetterFile = path.join(__dirname, 'step15-analysis/two-letter-inspection.json');

console.log('🔬 Function Analyzer');
console.log('='.repeat(60));

// Load two-letter inspection results
const twoLetterData = JSON.parse(fs.readFileSync(twoLetterFile, 'utf8'));
const functions = twoLetterData.results.filter(r => r.type === 'function');

console.log(`\n📊 Analyzing ${functions.length} high-frequency functions\n`);

// Load source
console.log('📂 Loading source file...');
const content = fs.readFileSync(inputFile, 'utf8');
console.log(`✅ Loaded ${(content.length / 1024 / 1024).toFixed(2)} MB\n`);

const results = [];

function extractFunctionContext(funcName, content) {
  // Try to find function definition
  const patterns = [
    // var funcName = function
    new RegExp(`var\\s+${funcName}\\s*=\\s*function\\s*\\([^)]*\\)\\s*\\{([\\s\\S]{0,800}?)\\}`, 'm'),
    // function funcName
    new RegExp(`function\\s+${funcName}\\s*\\([^)]*\\)\\s*\\{([\\s\\S]{0,800}?)\\}`, 'm'),
    // const funcName = function
    new RegExp(`const\\s+${funcName}\\s*=\\s*function\\s*\\([^)]*\\)\\s*\\{([\\s\\S]{0,800}?)\\}`, 'm'),
    // const funcName = () =>
    new RegExp(`const\\s+${funcName}\\s*=\\s*\\([^)]*\\)\\s*=>\\s*\\{([\\s\\S]{0,800}?)\\}`, 'm'),
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      return {
        found: true,
        fullMatch: match[0],
        body: match[1],
        index: match.index
      };
    }
  }

  return { found: false };
}

function analyzeCallPatterns(funcName, content) {
  // Find all calls to this function
  const callPattern = new RegExp(`${funcName}\\s*\\(`, 'g');
  const calls = [];
  let match;

  while ((match = callPattern.exec(content)) !== null && calls.length < 10) {
    const start = Math.max(0, match.index - 100);
    const end = Math.min(content.length, match.index + 150);
    calls.push(content.substring(start, end));
  }

  return calls;
}

function suggestNameFromContext(funcName, context, calls) {
  const body = context.body || '';
  const fullMatch = context.fullMatch || '';

  let category = 'unknown';
  let suggested = funcName;
  let confidence = 'low';
  let evidence = [];

  // Check for common patterns in function body
  if (body.match(/typeof\s+\w+\s*[!=]==?\s*["']undefined["']/)) {
    category = 'type-checking';
    suggested = 'isUndefined';
    confidence = 'medium';
    evidence.push('checks typeof === undefined');
  }

  if (body.match(/Array\.isArray/)) {
    category = 'type-checking';
    suggested = 'isArray';
    confidence = 'medium';
    evidence.push('uses Array.isArray');
  }

  if (body.match(/instanceof/)) {
    category = 'type-checking';
    suggested = 'isInstanceOf';
    confidence = 'medium';
    evidence.push('uses instanceof');
  }

  if (body.match(/Object\.keys|Object\.entries|Object\.values/)) {
    category = 'object-utils';
    suggested = 'objectIterator';
    confidence = 'medium';
    evidence.push('iterates over object');
  }

  if (body.match(/\.map\(|\.filter\(|\.reduce\(/)) {
    category = 'array-utils';
    suggested = 'arrayTransform';
    confidence = 'medium';
    evidence.push('array transformation');
  }

  if (body.match(/JSON\.parse|JSON\.stringify/)) {
    category = 'serialization';
    suggested = 'jsonHandler';
    confidence = 'medium';
    evidence.push('JSON operations');
  }

  if (body.match(/Promise|async|await|\.then\(|\.catch\(/)) {
    category = 'async';
    suggested = 'asyncHandler';
    confidence = 'medium';
    evidence.push('async/promise operations');
  }

  if (body.match(/Error|throw new/)) {
    category = 'error-handling';
    suggested = 'errorHandler';
    confidence = 'medium';
    evidence.push('error handling');
  }

  if (body.match(/console\.log|console\.warn|console\.error/)) {
    category = 'logging';
    suggested = 'logger';
    confidence = 'medium';
    evidence.push('console logging');
  }

  if (body.match(/\.prototype\.|Object\.create|Object\.assign/)) {
    category = 'object-creation';
    suggested = 'objectCreator';
    confidence = 'medium';
    evidence.push('object creation/manipulation');
  }

  if (body.match(/setTimeout|setInterval|clearTimeout|clearInterval/)) {
    category = 'timing';
    suggested = 'timerHandler';
    confidence = 'medium';
    evidence.push('timing operations');
  }

  if (body.match(/addEventListener|removeEventListener|\.on\(|\.off\(/)) {
    category = 'events';
    suggested = 'eventHandler';
    confidence = 'medium';
    evidence.push('event handling');
  }

  if (body.match(/return\s+\w+\s*[+\-*/%]\s*\w+/)) {
    category = 'math';
    suggested = 'mathOperation';
    confidence = 'low';
    evidence.push('mathematical operation');
  }

  if (body.match(/\.join\(|\.split\(/)) {
    category = 'string-utils';
    suggested = 'stringTransform';
    confidence = 'medium';
    evidence.push('string transformation');
  }

  if (fullMatch.match(/function\s*\([^)]*\)\s*\{\s*return/)) {
    category = 'factory';
    suggested = 'factory';
    confidence = 'low';
    evidence.push('simple return function');
  }

  return { category, suggested, confidence, evidence };
}

console.log('🔍 Analyzing functions...\n');

for (const func of functions.slice(0, 10)) {  // Start with top 10
  const funcName = func.identifier;

  console.log(`Analyzing ${funcName} (${func.occurrences} occurrences)...`);

  // Extract function context
  const context = extractFunctionContext(funcName, content);

  if (!context.found) {
    console.log(`  ⚠️  Definition not found\n`);
    results.push({
      identifier: funcName,
      occurrences: func.occurrences,
      status: 'not-found',
      category: 'unknown'
    });
    continue;
  }

  // Analyze call patterns
  const calls = analyzeCallPatterns(funcName, content);

  // Suggest name based on context
  const analysis = suggestNameFromContext(funcName, context, calls);

  results.push({
    identifier: funcName,
    occurrences: func.occurrences,
    status: 'analyzed',
    category: analysis.category,
    suggested: analysis.suggested,
    confidence: analysis.confidence,
    evidence: analysis.evidence,
    definitionSnippet: context.fullMatch.substring(0, 200),
    sampleCalls: calls.slice(0, 3)
  });

  console.log(`  ✓ Category: ${analysis.category}`);
  console.log(`  ✓ Suggested: ${analysis.suggested}`);
  console.log(`  ✓ Confidence: ${analysis.confidence}`);
  if (analysis.evidence.length > 0) {
    console.log(`  ✓ Evidence: ${analysis.evidence.join(', ')}`);
  }
  console.log();
}

// Save results
const outputDir = path.join(__dirname, 'step16-function-analysis');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputFile = path.join(outputDir, 'function-analysis.json');
fs.writeFileSync(outputFile, JSON.stringify({
  type: 'function-analysis',
  totalFunctions: functions.length,
  analyzed: results.filter(r => r.status === 'analyzed').length,
  results
}, null, 2));

console.log(`💾 Saved to: ${outputFile}\n`);

// Summary
console.log('📊 Summary by category:\n');
const byCategory = {};
for (const r of results) {
  if (!byCategory[r.category]) byCategory[r.category] = [];
  byCategory[r.category].push(r.identifier);
}

for (const [cat, funcs] of Object.entries(byCategory).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`  ${cat}: ${funcs.length} functions`);
  console.log(`    ${funcs.join(', ')}`);
}

console.log('\n✨ Analysis complete!\n');
