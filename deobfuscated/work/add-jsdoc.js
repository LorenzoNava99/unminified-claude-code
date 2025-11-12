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

  // OAuth 2.0 functions
  'async function n81(': `/**
 * Refreshes an OAuth 2.0 access token using a refresh token.
 * @param {URL} serverUrl - The authorization server URL
 * @param {Object} options - Refresh options
 * @param {Object} options.metadata - Server metadata
 * @param {Object} options.clientInformation - Client information
 * @param {string} options.refreshToken - The refresh token
 * @param {URL} options.resource - Target resource URL
 * @param {Function} options.addClientAuthentication - Auth callback
 * @param {Function} options.fetchFn - Custom fetch function
 * @returns {Promise<Object>} Token response with new access token
 */`,

  'async function YX9(': `/**
 * Registers a dynamic OAuth 2.0 client with the authorization server.
 * @param {URL} serverUrl - The authorization server URL
 * @param {Object} options - Registration options
 * @param {Object} options.metadata - Server metadata
 * @param {Object} options.clientMetadata - Client metadata for registration
 * @param {Function} options.fetchFn - Custom fetch function
 * @returns {Promise<Object>} Registered client information
 */`,

  'async function eJ9(': `/**
 * Fetches OAuth 2.0 Protected Resource Metadata.
 * @param {URL} resourceUrl - The protected resource URL
 * @param {Object} options - Fetch options
 * @param {Function} fetchFn - Custom fetch function
 * @returns {Promise<Object>} Resource metadata
 */`,

  'async function QX9(': `/**
 * Fetches well-known metadata from an OAuth/MCP server.
 * @param {URL} url - The server URL
 * @param {string} wellKnownType - Type of well-known resource
 * @param {Function} fetchFn - Custom fetch function
 * @param {Object} options - Additional options
 * @returns {Promise<Response>} Server response with metadata
 */`,

  'async function i81(': `/**
 * Performs a fetch request with MCP protocol headers and fallback handling.
 * @param {URL} url - The request URL
 * @param {Object} headers - Request headers
 * @param {Function} fetchFn - Custom fetch function
 * @returns {Promise<Response>} Fetch response
 */`,

  'async function KY0(': `/**
 * Fetches a resource with MCP protocol version header.
 * @param {URL} url - The request URL
 * @param {string} protocolVersion - MCP protocol version
 * @param {Function} fetchFn - Custom fetch function
 * @returns {Promise<Response>} Fetch response
 */`,

  // Async iterator functions
  'async function* G50(': `/**
 * Async generator for streaming data processing.
 * @param {AsyncIterable} source - Source async iterable
 * @yields {any} Processed data chunks
 */`,

  'async function* IK9(': `/**
 * Async generator for Axios response streaming.
 * @param {Response} response - HTTP response object
 * @yields {Buffer} Data chunks from response stream
 */`,

  'async function* jK9(': `/**
 * Async generator for stream transformation.
 * @param {AsyncIterable} source - Source stream
 * @param {Function} transform - Transformation function
 * @yields {any} Transformed data chunks
 */`,

  'async function* SK9(': `/**
 * Async generator for SSE (Server-Sent Events) parsing.
 * @param {AsyncIterable} source - Source event stream
 * @yields {Object} Parsed SSE events
 */`,

  // Other async functions
  'async function HI0()': `/**
 * Initializes the application or subsystem.
 * @returns {Promise<void>}
 */`,

  'async function A39(': `/**
 * Performs application-level asynchronous operation.
 * @param {Object} config - Configuration object
 * @returns {Promise<any>} Operation result
 */`,

  'async function wI0(': `/**
 * Handles async workflow with multiple parameters.
 * @param {any} param1 - First parameter
 * @param {any} param2 - Second parameter
 * @param {any} param3 - Third parameter
 * @returns {Promise<any>} Workflow result
 */`,

  'async function ll(': `/**
 * Async utility function for list operations.
 * @param {Array} list - Input list
 * @returns {Promise<any>} Processed list result
 */`,

  'async function gG1(': `/**
 * Async graph/data structure operation.
 * @param {Object} graph - Graph data structure
 * @param {Object} options - Operation options
 * @returns {Promise<any>} Operation result
 */`,

  // Utility string/conversion functions
  'function hQ0(': `/**
 * Converts a value to a string representation.
 * Handles arrays, symbols, and special numeric values like -0.
 * @param {any} value - The value to convert
 * @returns {string} The string representation
 */`,

  'function AX9(': `/**
 * Constructs a well-known URL path for OAuth/MCP discovery.
 * @param {string} wellKnownType - Type of well-known resource
 * @param {string} basePath - Base path
 * @param {Object} options - URL construction options
 * @returns {string} Constructed well-known URL path
 */`,

  'function BX9(': `/**
 * Checks if a response indicates a client error or not found.
 * @param {Response} response - HTTP response
 * @param {string} pathname - Request pathname
 * @returns {boolean} True if client error or not found
 */`,

  'function IX9(': `/**
 * Generates OAuth discovery URL variations for fallback.
 * @param {string|URL} url - Base URL
 * @returns {Array<Object>} Array of discovery URL options
 */`,

  // Stream/Buffer functions
  'function DMA(': `/**
 * Encodes data to JSON-RPC message format with newline.
 * @param {Object} data - Data to encode
 * @returns {string} JSON-RPC formatted string
 */`,

  'function xJ9(': `/**
 * Decodes JSON-RPC message from string.
 * @param {string} message - JSON-RPC message string
 * @returns {Object} Parsed message object
 */`,

  // Display/Rendering functions
  'function PYQ(': `/**
 * Renders content with formatting options.
 * @param {any} content - Content to render
 * @param {Object} options - Rendering options
 * @param {boolean} options.verbose - Verbose output flag
 * @param {Object} options.theme - Theme configuration
 * @param {Array} options.tools - Available tools
 * @param {Object} options.style - Style configuration
 * @returns {string} Rendered output
 */`,

  'function jYQ(': `/**
 * Processes and displays messages with tool information.
 * @param {Object} message - Message to process
 * @param {Object} options - Processing options
 * @param {boolean} options.verbose - Verbose output
 * @param {Array} options.progressMessagesForMessage - Progress messages
 * @param {Array} options.tools - Tool definitions
 * @returns {any} Processed message
 */`,

  'function iT6(': `/**
 * Handles in-progress tool calls with verbose logging.
 * @param {any} param1 - First parameter
 * @param {any} param2 - Second parameter
 * @param {any} param3 - Third parameter
 * @param {any} param4 - Fourth parameter
 * @param {any} param5 - Fifth parameter
 * @param {Object} options - Tool call options
 * @param {boolean} options.verbose - Verbose flag
 * @param {number} options.inProgressToolCallCount - Count of in-progress calls
 * @param {any} param7 - Seventh parameter
 * @returns {any} Tool call result
 */`,

  // UI/Interaction functions
  'function E10(': `/**
 * Displays tool selection UI.
 * @param {Object} params - UI parameters
 * @param {Object} params.server - MCP server object
 * @param {Function} params.onSelectTool - Tool selection callback
 * @param {Function} params.onBack - Back button callback
 * @returns {void}
 */`,

  'function z10(': `/**
 * Displays tool details UI.
 * @param {Object} params - UI parameters
 * @param {Object} params.tool - Tool object
 * @param {Object} params.server - MCP server object
 * @param {Function} params.onBack - Back button callback
 * @returns {void}
 */`,

  'function Hi2(': `/**
 * Displays tool exit confirmation UI.
 * @param {Object} params - UI parameters
 * @param {Array} params.toolNames - Names of tools
 * @param {Function} params.onExit - Exit callback
 * @returns {void}
 */`,

  'function TB1(': `/**
 * Manages tool selection with confirmation flow.
 * @param {Object} params - Tool management parameters
 * @param {Array} params.tools - Available tools
 * @param {Array} params.initialTools - Initially selected tools
 * @param {Function} params.onComplete - Completion callback
 * @param {Function} params.onCancel - Cancellation callback
 * @returns {void}
 */`,

  'function M9I(': `/**
 * Displays welcome message with theme.
 * @param {Object} params - Display parameters
 * @param {Object} params.theme - Theme configuration
 * @param {string} params.welcomeMessage - Welcome message text
 * @returns {void}
 */`,

  // Base/Core utility functions
  'function baseGetTag(': `/**
 * Gets base toString tag without Symbol.toStringTag.
 * @param {any} value - The value to check
 * @returns {string} The base toString tag
 */`,

  'function dB9(': `/**
 * Creates a base function for deep comparison operations.
 * @param {Function} comparator - The comparison function
 * @returns {Function} The base comparison function
 */`,

  'function lB9(': `/**
 * Checks if two values are deeply equal.
 * @param {any} value1 - The first value
 * @param {any} value2 - The second value
 * @returns {boolean} True if values are deeply equal
 */`,

  'function eB9(': `/**
 * Base implementation for comparing values.
 * @param {any} value - The value to compare
 * @returns {boolean} Comparison result
 */`,

  // Validation functions
  'function zQ9(': `/**
 * Validates value against constraints.
 * @param {any} value - Value to validate
 * @returns {boolean} True if valid
 */`,

  'function wQ9(': `/**
 * Validates and processes input.
 * @param {any} value - Value to validate
 * @param {Object} options - Validation options
 * @param {Object} context - Validation context
 * @returns {any} Validated value
 */`,

  // String functions
  'function yQ9(': `/**
 * Processes string value.
 * @param {string} str - String to process
 * @param {Object} options - Processing options
 * @returns {string} Processed string
 */`,

  'function xQ9(': `/**
 * Transforms string value.
 * @param {string} str - String to transform
 * @returns {string} Transformed string
 */`,

  'function vQ9(': `/**
 * Validates and normalizes string.
 * @param {string} str - String to normalize
 * @param {Object} options - Normalization options
 * @param {Object} context - Processing context
 * @returns {string} Normalized string
 */`,

  // Object functions
  'function bQ9(': `/**
 * Deep clones an object.
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */`,

  'function hQ9(': `/**
 * Merges objects deeply.
 * @param {Object} target - Target object
 * @returns {Object} Merged object
 */`,

  'function gQ9(': `/**
 * Gets nested property from object.
 * @param {Object} obj - Source object
 * @param {string} path - Property path
 * @returns {any} Property value
 */`,

  'function mQ9(': `/**
 * Sets nested property on object.
 * @param {Object} obj - Target object
 * @returns {Object} Modified object
 */`,

  'function lQ9()': `/**
 * Creates empty object with prototype.
 * @returns {Object} New object
 */`,

  // Array functions
  'function w29(': `/**
 * Filters array by predicate.
 * @param {Array} arr - Array to filter
 * @returns {Array} Filtered array
 */`,

  'function y29(': `/**
 * Maps array values.
 * @param {Array} arr - Array to map
 * @returns {Array} Mapped array
 */`,

  'function k29(': `/**
 * Reduces array to single value.
 * @param {Array} arr - Array to reduce
 * @returns {any} Reduced value
 */`,

  'function b29(': `/**
 * Finds element in array.
 * @param {Array} arr - Array to search
 * @returns {any} Found element
 */`,

  'function f29(': `/**
 * Checks if array includes value.
 * @param {Array} arr - Array to check
 * @returns {boolean} True if includes
 */`,

  'function u29(': `/**
 * Sorts array by comparator.
 * @param {Array} arr - Array to sort
 * @param {Function} comparator - Sort function
 * @returns {Array} Sorted array
 */`,

  'function d29()': `/**
 * Creates new empty array.
 * @returns {Array} New array
 */`,

  'function c29(': `/**
 * Flattens nested array.
 * @param {Array} arr - Array to flatten
 * @returns {Array} Flattened array
 */`,

  'function n29(': `/**
 * Concatenates arrays.
 * @param {Array} arr - Array to concatenate
 * @returns {Array} Concatenated array
 */`,

  'function r29(': `/**
 * Slices array.
 * @param {Array} arr - Array to slice
 * @returns {Array} Sliced array
 */`,

  'function t29(': `/**
 * Splices array.
 * @param {Array} arr - Array to splice
 * @param {number} start - Start index
 * @returns {Array} Spliced elements
 */`,

  'function e29()': `/**
 * Gets array iterator.
 * @returns {Iterator} Array iterator
 */`,

  // Comparison functions
  'function z99(': `/**
 * Checks strict equality.
 * @param {any} a - First value
 * @returns {boolean} True if equal
 */`,

  'function q99(': `/**
 * Checks loose equality.
 * @param {any} a - First value
 * @returns {boolean} True if equal
 */`,

  'function j99(': `/**
 * Compares values for sorting.
 * @param {any} a - First value
 * @returns {number} Comparison result (-1, 0, 1)
 */`,

  'function f99(': `/**
 * Checks if value is less than.
 * @param {any} a - First value
 * @returns {boolean} True if less than
 */`,

  'function h99(': `/**
 * Checks if value is greater than.
 * @param {any} a - First value
 * @param {any} b - Second value
 * @param {Object} options - Comparison options
 * @returns {boolean} True if greater than
 */`,

  'function g99(': `/**
 * Checks value range.
 * @param {any} value - Value to check
 * @param {any} min - Minimum value
 * @param {any} max - Maximum value
 * @returns {boolean} True if in range
 */`,

  'function a99(': `/**
 * Normalizes comparison value.
 * @param {any} value - Value to normalize
 * @returns {any} Normalized value
 */`,

  'function s99(': `/**
 * Gets comparison key.
 * @param {any} value - Value to get key for
 * @returns {string} Comparison key
 */`,

  // Number/Math functions
  'function v90(': `/**
 * Performs mathematical operation.
 * @param {number} a - First operand
 * @param {number} b - Second operand
 * @param {Object} options - Operation options
 * @param {number} precision - Result precision
 * @param {number} scale - Scale factor
 * @returns {number} Operation result
 */`,

  'function o21(': `/**
 * Rounds number to precision.
 * @param {number} num - Number to round
 * @param {number} precision - Decimal places
 * @returns {number} Rounded number
 */`,

  // Path/File functions
  'function w49(': `/**
 * Resolves file path.
 * @param {string} path - Path to resolve
 * @param {Object} options - Resolution options
 * @returns {string} Resolved path
 */`,

  'function y49(': `/**
 * Normalizes file path.
 * @param {string} path - Path to normalize
 * @param {Object} options - Normalization options
 * @returns {string} Normalized path
 */`,

  'function k49(': `/**
 * Joins path segments.
 * @param {string} path1 - First path segment
 * @param {string} path2 - Second path segment
 * @param {Object} options - Join options
 * @returns {string} Joined path
 */`,

  'function x49(': `/**
 * Gets directory name from path.
 * @param {string} path - File path
 * @returns {string} Directory name
 */`,

  'function i49(': `/**
 * Gets base name from path.
 * @param {string} path - File path
 * @returns {string} Base name
 */`,

  'function a49(': `/**
 * Gets file extension.
 * @param {string} path - File path
 * @returns {string} File extension
 */`,

  'function s49(': `/**
 * Checks if path is absolute.
 * @param {string} path - Path to check
 * @param {Object} options - Check options
 * @returns {boolean} True if absolute
 */`,

  'function o49(': `/**
 * Checks if path exists.
 * @param {string} path - Path to check
 * @returns {boolean} True if exists
 */`,

  'function t49(': `/**
 * Gets path statistics.
 * @param {string} path - Path to stat
 * @returns {Object} Path statistics
 */`,

  'function e49(': `/**
 * Reads directory contents.
 * @param {string} path - Directory path
 * @param {Object} options - Read options
 * @returns {Array<string>} Directory entries
 */`,

  // Buffer functions
  'function b69(': `/**
 * Creates buffer from data.
 * @param {any} data - Data to buffer
 * @returns {Buffer} Created buffer
 */`,

  'function f69(': `/**
 * Converts buffer to string.
 * @param {Buffer} buffer - Buffer to convert
 * @returns {string} String representation
 */`,

  'function h69(': `/**
 * Concatenates buffers.
 * @param {Buffer} buf1 - First buffer
 * @param {Buffer} buf2 - Second buffer
 * @returns {Buffer} Concatenated buffer
 */`,

  'function g69(': `/**
 * Slices buffer.
 * @param {Buffer} buffer - Buffer to slice
 * @returns {Buffer} Sliced buffer
 */`,

  'function u69(': `/**
 * Copies buffer.
 * @param {Buffer} source - Source buffer
 * @param {Buffer} target - Target buffer
 * @returns {number} Bytes copied
 */`,

  'function m69(': `/**
 * Compares buffers.
 * @param {Buffer} buf1 - First buffer
 * @param {Buffer} buf2 - Second buffer
 * @param {Object} options - Comparison options
 * @returns {number} Comparison result
 */`,

  // Stream functions
  'function d69(': `/**
 * Creates readable stream.
 * @param {any} source - Stream source
 * @param {Object} options - Stream options
 * @returns {ReadableStream} Readable stream
 */`,

  'function l69(': `/**
 * Creates writable stream.
 * @param {any} target - Stream target
 * @param {Object} options - Stream options
 * @returns {WritableStream} Writable stream
 */`,

  'function i69(': `/**
 * Pipes streams together.
 * @param {Stream} source - Source stream
 * @returns {Stream} Destination stream
 */`,

  'function n69(': `/**
 * Transforms stream data.
 * @param {any} data - Data to transform
 * @returns {any} Transformed data
 */`,

  'function a69(': `/**
 * Ends stream.
 * @param {Stream} stream - Stream to end
 * @returns {void}
 */`,

  'function s69(': `/**
 * Destroys stream.
 * @param {Stream} stream - Stream to destroy
 * @returns {void}
 */`,

  // Error functions
  'function r69(': `/**
 * Creates error object.
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @param {Object} options - Error options
 * @param {Object} context - Error context
 * @returns {Error} Error object
 */`,

  'function o69(': `/**
 * Handles error.
 * @param {Error} error - Error to handle
 * @returns {void}
 */`,

  'function e69(': `/**
 * Formats error message.
 * @param {Error} error - Error to format
 * @param {Object} options - Format options
 * @returns {string} Formatted message
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
