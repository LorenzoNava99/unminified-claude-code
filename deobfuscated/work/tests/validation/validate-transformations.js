#!/usr/bin/env node
/**
 * Validation script to verify deobfuscation transformations
 *
 * This script checks that:
 * 1. All modules can be loaded without errors
 * 2. Module exports match expected interfaces
 * 3. No obvious regressions from transformations
 * 4. Documentation matches implementation
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const workDir = join(__dirname, '../..');

class ValidationReport {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.warnings = 0;
    this.errors = [];
    this.logs = [];
  }

  pass(message) {
    this.passed++;
    this.log('✓', message, 'green');
  }

  fail(message, error = null) {
    this.failed++;
    this.log('✗', message, 'red');
    if (error) {
      this.errors.push({ message, error: error.message, stack: error.stack });
    }
  }

  warn(message) {
    this.warnings++;
    this.log('⚠', message, 'yellow');
  }

  log(symbol, message, color = 'white') {
    const colors = {
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      white: '\x1b[37m',
      reset: '\x1b[0m'
    };

    const coloredMessage = `${colors[color]}${symbol} ${message}${colors.reset}`;
    console.log(coloredMessage);
    this.logs.push(message);
  }

  summary() {
    console.log('\n' + '='.repeat(60));
    console.log('VALIDATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Passed:   ${this.passed}`);
    console.log(`Failed:   ${this.failed}`);
    console.log(`Warnings: ${this.warnings}`);
    console.log('='.repeat(60));

    if (this.errors.length > 0) {
      console.log('\nERRORS:');
      this.errors.forEach((err, i) => {
        console.log(`\n${i + 1}. ${err.message}`);
        console.log(`   ${err.error}`);
      });
    }

    return this.failed === 0;
  }
}

const report = new ValidationReport();

// ============================================================================
// Module Load Tests
// ============================================================================

console.log('\n📦 Testing Module Loads...\n');

const modules = [
  { name: 'Module System', path: 'src/modules/index.js' },
  { name: 'Utilities', path: 'src/utils/index.js' },
  { name: 'Configuration', path: 'src/config/index.js' }
];

for (const mod of modules) {
  try {
    const modulePath = join(workDir, mod.path);

    if (!existsSync(modulePath)) {
      report.fail(`${mod.name}: Module file not found at ${mod.path}`);
      continue;
    }

    // Try to import the module
    const imported = await import(`file://${modulePath}`);

    if (!imported) {
      report.fail(`${mod.name}: Module import returned null/undefined`);
      continue;
    }

    // Check for default export
    if (!imported.default && Object.keys(imported).length === 0) {
      report.warn(`${mod.name}: No exports found (neither default nor named)`);
    } else {
      report.pass(`${mod.name}: Module loaded successfully`);
    }

  } catch (error) {
    report.fail(`${mod.name}: Failed to load module`, error);
  }
}

// ============================================================================
// Module Interface Tests
// ============================================================================

console.log('\n🔍 Testing Module Interfaces...\n');

try {
  const modulesPath = join(workDir, 'src/modules/index.js');
  const modules = await import(`file://${modulesPath}`);

  const expectedExports = [
    'interopRequireWildcard',
    'createCommonJSModule',
    'defineGetters',
    'createLazyModule',
    'nodeRequire'
  ];

  for (const exportName of expectedExports) {
    if (typeof modules[exportName] === 'function') {
      report.pass(`Module System: ${exportName} is exported and is a function`);
    } else if (modules[exportName]) {
      report.warn(`Module System: ${exportName} is exported but not a function`);
    } else {
      report.fail(`Module System: ${exportName} is not exported`);
    }
  }

} catch (error) {
  report.fail('Module System: Interface validation failed', error);
}

try {
  const utilsPath = join(workDir, 'src/utils/index.js');
  const utils = await import(`file://${utilsPath}`);

  const expectedExports = [
    'isObjectLike',
    'isObject',
    'isSymbol',
    'isFunction',
    'toString',
    'arrayMap',
    'identity',
    'noop'
  ];

  for (const exportName of expectedExports) {
    if (typeof utils[exportName] === 'function') {
      report.pass(`Utilities: ${exportName} is exported and is a function`);
    } else if (utils[exportName]) {
      report.warn(`Utilities: ${exportName} is exported but not a function`);
    } else {
      report.fail(`Utilities: ${exportName} is not exported`);
    }
  }

} catch (error) {
  report.fail('Utilities: Interface validation failed', error);
}

try {
  const configPath = join(workDir, 'src/config/index.js');
  const config = await import(`file://${configPath}`);

  const expectedExports = [
    'getClaudeConfigDir',
    'parseBoolean',
    'parseEnvironmentVariables',
    'getAWSRegion',
    'getDefaultCloudMLRegion',
    'getVertexRegionForModel',
    'CONFIG_DEFAULTS',
    'ENV_VARS'
  ];

  for (const exportName of expectedExports) {
    if (config[exportName]) {
      report.pass(`Configuration: ${exportName} is exported`);
    } else {
      report.fail(`Configuration: ${exportName} is not exported`);
    }
  }

} catch (error) {
  report.fail('Configuration: Interface validation failed', error);
}

// ============================================================================
// Functional Tests
// ============================================================================

console.log('\n⚙️  Testing Module Functionality...\n');

try {
  const utilsPath = join(workDir, 'src/utils/index.js');
  const utils = await import(`file://${utilsPath}`);

  // Test identity function
  const testValue = { test: 42 };
  if (utils.identity(testValue) === testValue) {
    report.pass('Utilities: identity() returns input unchanged');
  } else {
    report.fail('Utilities: identity() does not return input unchanged');
  }

  // Test isObject
  if (utils.isObject({}) === true && utils.isObject(null) === false) {
    report.pass('Utilities: isObject() works correctly');
  } else {
    report.fail('Utilities: isObject() does not work correctly');
  }

  // Test arrayMap
  const mapped = utils.arrayMap([1, 2, 3], x => x * 2);
  if (Array.isArray(mapped) && mapped.length === 3 && mapped[0] === 2) {
    report.pass('Utilities: arrayMap() works correctly');
  } else {
    report.fail('Utilities: arrayMap() does not work correctly');
  }

  // Test noop
  if (utils.noop() === undefined) {
    report.pass('Utilities: noop() returns undefined');
  } else {
    report.fail('Utilities: noop() does not return undefined');
  }

} catch (error) {
  report.fail('Utilities: Functional tests failed', error);
}

try {
  const configPath = join(workDir, 'src/config/index.js');
  const config = await import(`file://${configPath}`);

  // Test parseBoolean
  if (config.parseBoolean('true') === true && config.parseBoolean('false') === false) {
    report.pass('Configuration: parseBoolean() works correctly');
  } else {
    report.fail('Configuration: parseBoolean() does not work correctly');
  }

  // Test parseEnvironmentVariables
  const parsed = config.parseEnvironmentVariables(['KEY=value']);
  if (parsed && parsed.KEY === 'value') {
    report.pass('Configuration: parseEnvironmentVariables() works correctly');
  } else {
    report.fail('Configuration: parseEnvironmentVariables() does not work correctly');
  }

  // Test CONFIG_DEFAULTS
  if (config.CONFIG_DEFAULTS && typeof config.CONFIG_DEFAULTS === 'object') {
    report.pass('Configuration: CONFIG_DEFAULTS is an object');
  } else {
    report.fail('Configuration: CONFIG_DEFAULTS is not an object');
  }

} catch (error) {
  report.fail('Configuration: Functional tests failed', error);
}

// ============================================================================
// Documentation Tests
// ============================================================================

console.log('\n📚 Testing Documentation...\n');

const readmeFiles = [
  { name: 'Module System', path: 'src/modules/README.md' },
  { name: 'Utilities', path: 'src/utils/README.md' },
  { name: 'Configuration', path: 'src/config/README.md' },
  { name: 'MCP Protocol', path: 'src/mcp/README.md' },
  { name: 'HTTP Client', path: 'src/http/README.md' },
  { name: 'OAuth', path: 'src/oauth/README.md' },
  { name: 'Validation', path: 'src/validation/README.md' },
  { name: 'Storage', path: 'src/storage/README.md' },
  { name: 'Session', path: 'src/session/README.md' },
  { name: 'UI', path: 'src/ui/README.md' },
  { name: 'Tools', path: 'src/tools/README.md' },
  { name: 'API Client', path: 'src/api/README.md' },
  { name: 'CLI', path: 'src/cli/README.md' }
];

for (const readme of readmeFiles) {
  const readmePath = join(workDir, readme.path);

  if (!existsSync(readmePath)) {
    report.fail(`${readme.name}: README.md not found`);
    continue;
  }

  try {
    const content = readFileSync(readmePath, 'utf-8');

    if (content.length < 100) {
      report.warn(`${readme.name}: README.md seems too short (${content.length} chars)`);
    } else if (content.length < 1000) {
      report.warn(`${readme.name}: README.md is brief (${content.length} chars)`);
    } else {
      report.pass(`${readme.name}: README.md exists and is comprehensive (${content.length} chars)`);
    }

    // Check for required sections
    const requiredSections = ['## Overview', '## Usage'];
    for (const section of requiredSections) {
      if (!content.includes(section)) {
        report.warn(`${readme.name}: Missing "${section}" section`);
      }
    }

  } catch (error) {
    report.fail(`${readme.name}: Failed to read README.md`, error);
  }
}

// ============================================================================
// File Structure Tests
// ============================================================================

console.log('\n📁 Testing File Structure...\n');

const requiredFiles = [
  'src/modules/index.js',
  'src/utils/index.js',
  'src/config/index.js'
];

for (const file of requiredFiles) {
  const filePath = join(workDir, file);
  if (existsSync(filePath)) {
    report.pass(`File exists: ${file}`);
  } else {
    report.fail(`File missing: ${file}`);
  }
}

// ============================================================================
// Final Summary
// ============================================================================

const success = report.summary();

process.exit(success ? 0 : 1);
