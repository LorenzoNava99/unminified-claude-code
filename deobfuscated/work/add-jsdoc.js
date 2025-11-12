#!/usr/bin/env node

/**
 * Add JSDoc documentation to identified functions
 */

const fs = require('fs');
const path = require('path');

// JSDoc templates for identified functions
const jsdocTemplates = {
  'function getClaudeConfigDir()': `/**
 * Gets the Claude Code configuration directory path.
 * Defaults to ~/.claude if CLAUDE_CONFIG_DIR environment variable is not set.
 * @returns {string} The absolute path to the configuration directory
 */`,

  'function parseBoolean(': `/**
 * Parses a value into a boolean.
 * Accepts boolean values, or strings like "1", "true", "yes", "on" as truthy.
 * @param {any} value - The value to parse
 * @returns {boolean} The parsed boolean value
 */`,

  'function parseBooleanNegative(': `/**
 * Parses a value into a negated boolean.
 * Returns true for "0", "false", "no", "off", or falsy values.
 * @param {any} value - The value to parse
 * @returns {boolean} The negated boolean value
 */`,

  'function parseEnvironmentVariables(': `/**
 * Parses environment variable strings into an object.
 * Expected format: KEY1=value1 KEY2=value2
 * @param {string[]} envVars - Array of environment variable strings
 * @returns {Object.<string, string>} Parsed environment variables
 */`,

  'function getVertexRegionForModel(': `/**
 * Gets the appropriate Google Cloud Vertex AI region for a Claude model.
 * Checks model-specific environment variables, falls back to default region.
 * @param {string} modelName - The Claude model identifier
 * @returns {string} The GCP region for Vertex AI
 */`,

  'function getDefaultCloudMLRegion()': `/**
 * Gets the default Google Cloud ML region.
 * @returns {string} The default region (us-east5) or CLOUD_ML_REGION env var
 */`,

  'function getAWSRegion()': `/**
 * Gets the AWS region for Bedrock API calls.
 * @returns {string} The AWS region from environment or us-east-1
 */`,

  'function shouldMaintainProjectWorkingDir()': `/**
 * Determines if Bash commands should maintain the project working directory.
 * @returns {boolean} True if working directory should be maintained
 */`,

  'class InterceptorManager': `/**
 * Manages HTTP request/response interceptors (Axios library).
 * Allows registering, ejecting, and clearing interceptors.
 */`,

  'class FormDataEntry': `/**
 * Represents a single form data entry for multipart/form-data encoding (Axios library).
 * Handles proper encoding of form field names and values.
 */`,

  'class ParseStatus': `/**
 * Tracks validation status during Zod schema parsing.
 * Can be in states: valid, dirty, or aborted.
 */`,

  'class ParseContext': `/**
 * Provides context during Zod schema validation.
 * Tracks parent context, current data, and path through the schema.
 */`,

  'class ZodType': `/**
 * Base class for all Zod schema types.
 * Provides parsing, validation, and type inference capabilities.
 */`,

  'class Axios': `/**
 * Main Axios HTTP client class.
 * Provides HTTP request functionality with interceptor support.
 */`,

  'var sessionState': `/**
 * Global session state for Claude Code CLI.
 * Tracks metrics, tool usage, session ID, and other session data.
 * @type {SessionState}
 */`,

  'var utils': `/**
 * Utility functions for type checking, object manipulation, and common operations.
 * @type {Object}
 */`,

  'var createCommonJSModule': `/**
 * Creates a CommonJS module wrapper.
 * Lazy-loads the module on first access.
 * @type {Function}
 */`,

  'var createLazyModule': `/**
 * Creates a lazily-evaluated module initializer.
 * The module is only initialized when first accessed.
 * @type {Function}
 */`,

  'var interopRequireWildcard': `/**
 * Handles ES6 module interop for wildcard imports.
 * Creates a namespace object with proper __esModule flag.
 * @type {Function}
 */`,

  'var nodeRequire': `/**
 * Node.js require function for this module.
 * @type {Function}
 */`,

  'function getRawTag(': `/**
 * Gets the raw Object.prototype.toString tag for a value.
 * Temporarily removes Symbol.toStringTag if present.
 * @param {any} value - The value to get the tag for
 * @returns {string} The raw toString tag
 */`,

  'function getTypeTag(': `/**
 * Gets the type tag for a value using Symbol.toStringTag or toString.
 * @param {any} value - The value to get the type for
 * @returns {string} The type tag string
 */`,

  'function isObjectLike(': `/**
 * Checks if a value is object-like (not null and typeof === 'object').
 * @param {any} value - The value to check
 * @returns {boolean} True if the value is object-like
 */`,

  // Additional utility functions
  'function SB9(': `/**
 * Checks if a value is a Symbol.
 * @param {any} value - The value to check
 * @returns {boolean} True if the value is a Symbol
 */`,

  'function yB9(': `/**
 * Maps an array to a new array using a callback function.
 * Similar to Array.prototype.map.
 * @param {Array} array - The array to map
 * @param {Function} callback - The mapping function
 * @returns {Array} The mapped array
 */`,

  'function xB9(': `/**
 * Checks if a value is an object (including functions).
 * @param {any} value - The value to check
 * @returns {boolean} True if the value is an object or function
 */`,

  'function vB9(': `/**
 * Identity function that returns its input unchanged.
 * @param {any} value - The value to return
 * @returns {any} The same value passed in
 */`,

  'function uB9(': `/**
 * Checks if a value is a function (including async and generator functions).
 * @param {any} value - The value to check
 * @returns {boolean} True if the value is a function
 */`,

  'function hQ0(': `/**
 * Converts a value to a string representation.
 * Handles arrays, symbols, and special numeric values like -0.
 * @param {any} value - The value to convert
 * @returns {string} The string representation
 */`,

  'function dB9(': `/**
 * Creates a base function for deep comparison operations.
 * @param {Function} comparator - The comparison function
 * @returns {Function} The base comparison function
 */`,

  'function lB9(': `/**
 * Checks if two values are deeply equal.
 * @param {any} value - The first value
 * @returns {boolean} True if values are deeply equal
 */`,

  // Classes needing documentation
  'class eGA': `/**
 * Message buffer for reading JSON-RPC messages from a stream.
 * Handles buffering and parsing of newline-delimited JSON messages.
 */`,

  'class R81': `/**
 * Stdio client transport for MCP (Model Context Protocol).
 * Manages process spawning and communication via stdin/stdout.
 */`,

  'class oGA': `/**
 * JSON-RPC request/response handler.
 * Manages JSON-RPC protocol communication.
 */`,

  'class _MA': `/**
 * MCP client implementation.
 * Provides Model Context Protocol client functionality.
 */`,

  'class s81': `/**
 * WebSocket transport implementation.
 * Handles WebSocket-based communication.
 */`,

  'class k51': `/**
 * HTTP adapter for Axios requests.
 * Handles HTTP/HTTPS request execution.
 */`,

  'class wI1': `/**
 * Async iterator wrapper.
 * Provides async iteration functionality.
 */`,

  'class xYA': `/**
 * Event emitter implementation.
 * Provides event handling capabilities.
 */`,

  'class AY1': `/**
 * Stream transformer.
 * Transforms data streams between formats.
 */`,

  'class by0': `/**
 * Duplex stream wrapper.
 * Provides bidirectional stream functionality.
 */`,

  'class B0A': `/**
 * Readable stream implementation.
 * Provides readable stream capabilities.
 */`,

  // Configuration functions
  'function fJ9(': `/**
 * Gets environment variables for child processes.
 * Filters out function definitions and sensitive values.
 * @returns {Object} Filtered environment variables
 */`,

  // API/Request functions
  'function FY0(': `/**
 * Validates requested resource against configured resource.
 * @param {Object} params - The validation parameters
 * @param {string} params.requestedResource - The requested resource
 * @param {string} params.configuredResource - The configured resource
 * @returns {boolean} True if resource is valid
 */`,

  // Tool-related functions
  'function Hc1(': `/**
 * Creates tool definitions for Claude API.
 * @param {Object} params - Tool creation parameters
 * @param {Array} params.tools - Array of tool objects
 * @param {boolean} params.isBuiltIn - Whether tools are built-in
 * @param {boolean} params.isAsync - Whether tools are async
 * @returns {Array} Formatted tool definitions
 */`,

  'function PK(': `/**
 * Processes tool permission results.
 * @param {Object} params - Permission parameters
 * @param {string} params.permissionResult - The permission result
 * @param {string} params.toolType - The type of tool
 * @returns {Object} Processed permission result
 */`,

  // Message/Session functions
  'function pT2(': `/**
 * Processes messages for display.
 * @param {Object} params - Message parameters
 * @param {Array} params.messages - Array of message objects
 * @returns {Array} Processed messages
 */`,

  'function YP2(': `/**
 * Handles tool use in session context.
 * @param {Object} params - Tool use parameters
 * @param {Object} params.session - The session object
 * @param {Object} params.toolUseContext - Tool use context
 * @param {Function} params.onDone - Callback when done
 * @returns {Promise} Promise that resolves when tool use is complete
 */`,

  'function $11(': `/**
 * Processes session data.
 * @param {Object} params - Session parameters
 * @param {Object} params.session - The session object
 * @returns {Object} Processed session data
 */`,

  // File operations
  'function qEA(': `/**
 * Validates file path and contents for editing.
 * @param {Object} params - Validation parameters
 * @param {string} params.filePath - Path to the file
 * @param {string} params.fileContents - Current file contents
 * @param {Array} params.edits - Array of edit operations
 * @returns {Object} Validation result
 */`,

  'function DhQ(': `/**
 * Applies edits to a file.
 * @param {Object} params - Edit parameters
 * @param {string} params.file_path - Path to the file
 * @param {Array} params.edits - Array of edit operations
 * @returns {Promise<Object>} Promise with edit result
 */`,

  'function ZgQ(': `/**
 * Displays file diff/patch information.
 * @param {Object} params - Display parameters
 * @param {string} params.file_path - Path to the file
 * @param {string} params.operation - The operation type
 * @param {Object} params.patch - The patch object
 * @param {Object} params.style - Display style
 * @param {boolean} params.verbose - Verbose output flag
 * @returns {void}
 */`,

  'function TtQ(': `/**
 * Writes content to a file with validation.
 * @param {Object} params - Write parameters
 * @param {string} params.file_path - Path to the file
 * @param {string} params.content - Content to write
 * @param {boolean} params.verbose - Verbose output flag
 * @returns {Promise<Object>} Promise with write result
 */`,

  // MCP functions
  'function BB2(': `/**
 * Sends MCP request to server.
 * @param {Object} params - Request parameters
 * @param {string} params.serverName - Name of the MCP server
 * @param {Object} params.request - The request object
 * @param {Function} params.onResponse - Response callback
 * @param {AbortSignal} params.signal - Abort signal
 * @returns {Promise} Promise that resolves when request completes
 */`,

  'function nLQ(': `/**
 * Lists files from MCP server.
 * @param {Object} params - List parameters
 * @param {string} params.serverName - Name of the MCP server
 * @param {Array} params.files - Array of file paths
 * @returns {Array} List of files
 */`,
};

/**
 * Add JSDoc to code
 */
function addJSDoc(code) {
  let result = code;
  let addedCount = 0;

  // Sort by length to avoid nested replacements
  const sortedEntries = Object.entries(jsdocTemplates).sort((a, b) => b[0].length - a[0].length);

  for (const [pattern, jsdoc] of sortedEntries) {
    // Find occurrences that don't already have JSDoc
    const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`^(\\s*)(${escapedPattern}[^{]*\\{)`, 'gm');

    result = result.replace(regex, (match, indent, declaration) => {
      // Check if there's already a JSDoc comment above (look back a few lines)
      const beforeMatch = result.substring(Math.max(0, result.indexOf(match) - 200), result.indexOf(match));
      if (beforeMatch.includes('/**') && beforeMatch.includes('*/')) {
        return match; // Already has JSDoc
      }

      addedCount++;
      // Indent the JSDoc to match the declaration
      const indentedJSDoc = jsdoc.split('\n').map(line => indent + line).join('\n');
      return `${indentedJSDoc}\n${indent}${declaration}`;
    });
  }

  console.log(`Added ${addedCount} JSDoc comments`);
  return result;
}

/**
 * Main execution
 */
function main() {
  const workDir = __dirname;
  const inputFile = path.join(workDir, 'step4-renamed', 'deobfuscated-renamed.js');
  const outputFile = path.join(workDir, 'step5-documented', 'deobfuscated-documented.js');

  // Create output directory
  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('========================================');
  console.log('JSDoc Documentation Script');
  console.log('========================================\n');

  console.log(`Processing: ${inputFile}`);
  console.log(`Output: ${outputFile}\n`);

  try {
    const code = fs.readFileSync(inputFile, 'utf8');
    console.log(`File size: ${(code.length / 1024 / 1024).toFixed(2)} MB\n`);

    console.log('Adding JSDoc comments...\n');
    const documented = addJSDoc(code);

    fs.writeFileSync(outputFile, documented, 'utf8');
    console.log(`\n✓ Written to: ${outputFile}`);

    console.log('\n========================================');
    console.log('✓ Documentation completed!');
    console.log('========================================');
  } catch (error) {
    console.error(`✗ Error:`, error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { addJSDoc, jsdocTemplates };
