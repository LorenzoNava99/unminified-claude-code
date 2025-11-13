/**
 * Tool Execution Helper Functions
 *
 * Helper utilities for tool execution including validation error formatting,
 * message creation, and error handling.
 *
 * Original locations:
 * - formatInputValidationError: line 358886
 * - formatHookError: line 358837
 * - extractErrorMessages: line 358858
 * - createToolCancelledResult: line 493283
 * - createToolProgressMessage: line 493269
 * - createHookMessage: line 490499
 * - isMcpTool (Ev): line 357413
 * - formatValidationPath (faQ): line 358871
 */

// ============================================================================
// Constants
// ============================================================================

/**
 * Message shown when tool execution is cancelled by user
 * Original location: line 494370
 */
const TOOL_CANCELLED_MESSAGE = "The user doesn't want to take this action right now. STOP what you are doing and wait for the user to tell you how to proceed.";

/**
 * Message shown when request is interrupted for tool use
 * Original name: AN (line 494368)
 */
const REQUEST_INTERRUPTED_MESSAGE = "[Request interrupted by user for tool use]";

// ============================================================================
// Error Classes (References - need to be imported from elsewhere)
// ============================================================================

/**
 * Note: These error classes are referenced but defined elsewhere:
 * - nJ: Hook-related error class (line 57754)
 * - RT: Shell/Bash execution error class (line 57770)
 *   - Has properties: stdout, stderr, code, interrupted
 *
 * These will need to be imported from the error module when available.
 */

// ============================================================================
// UUID Generation
// ============================================================================

/**
 * Generates a UUID v4
 *
 * Note: Original functions MR() and C1I() are likely wrappers around
 * uuid.v4() from the uuid npm package. For now, we'll use a simple fallback
 * or require the uuid module.
 *
 * @returns {string} - A UUID v4 string
 */
function generateUuid() {
  // Fallback implementation - in production, use uuid.v4()
  // For now, this matches the expected format
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ============================================================================
// Path and Validation Helpers
// ============================================================================

/**
 * Formats a validation error path array into a dot-notation string
 *
 * Converts Zod error paths like ["field", "nested", 0] into "field.nested[0]"
 *
 * Original name: faQ (line 358871)
 *
 * @param {Array<string|number>} path - Array of path segments
 * @returns {string} - Formatted path string
 *
 * @example
 * formatValidationPath(["user", "address", "zip"]) // "user.address.zip"
 * formatValidationPath(["items", 0, "name"]) // "items[0].name"
 */
function formatValidationPath(path) {
  if (path.length === 0) {
    return "";
  }
  return path.reduce((formatted, segment, index) => {
    if (typeof segment === "number") {
      return `${formatted}[${segment}]`;
    }
    if (index === 0) {
      return segment;
    } else {
      return `${formatted}.${segment}`;
    }
  }, "");
}

/**
 * Formats a Zod input validation error into a human-readable message
 *
 * Handles three types of validation errors:
 * 1. Missing required parameters
 * 2. Unexpected parameters
 * 3. Type mismatches
 *
 * Original location: line 358886
 *
 * @param {string} toolName - Name of the tool that failed validation
 * @param {ZodError} zodError - Zod validation error object
 * @returns {string} - Formatted error message
 *
 * @example
 * formatInputValidationError("Read", zodError)
 * // "Read failed due to the following issue:
 * // The required parameter `file_path` is missing"
 */
function formatInputValidationError(toolName, zodError) {
  // Find missing required parameters
  const missingParams = zodError.errors
    .filter(err =>
      err.code === "invalid_type" &&
      err.received === "undefined" &&
      err.message === "Required"
    )
    .map(err => formatValidationPath(err.path));

  // Find unexpected parameters
  const unexpectedParams = zodError.errors
    .filter(err => err.code === "unrecognized_keys")
    .flatMap(err => err.keys);

  // Find type mismatches
  const typeMismatches = zodError.errors
    .filter(err =>
      err.code === "invalid_type" &&
      "received" in err &&
      err.received !== "undefined" &&
      err.message !== "Required"
    )
    .map(err => {
      const typedErr = err;
      return {
        param: formatValidationPath(err.path),
        expected: typedErr.expected,
        received: typedErr.received
      };
    });

  let message = zodError.message;
  const errorMessages = [];

  // Format missing parameters
  if (missingParams.length > 0) {
    const messages = missingParams.map(
      param => `The required parameter \`${param}\` is missing`
    );
    errorMessages.push(...messages);
  }

  // Format unexpected parameters
  if (unexpectedParams.length > 0) {
    const messages = unexpectedParams.map(
      param => `An unexpected parameter \`${param}\` was provided`
    );
    errorMessages.push(...messages);
  }

  // Format type mismatches
  if (typeMismatches.length > 0) {
    const messages = typeMismatches.map(
      ({ param, expected, received }) =>
        `The parameter \`${param}\` type is expected as \`${expected}\` but provided as \`${received}\``
    );
    errorMessages.push(...messages);
  }

  // Build final message
  if (errorMessages.length > 0) {
    const plural = errorMessages.length > 1 ? "issues" : "issue";
    message = `${toolName} failed due to the following ${plural}:\n${errorMessages.join('\n')}`;
  }

  return message;
}

// ============================================================================
// Error Message Extraction
// ============================================================================

/**
 * Extracts error messages from various error types
 *
 * Handles shell execution errors (RT class) and generic errors.
 *
 * Original location: line 358858
 *
 * @param {Error} error - The error object
 * @returns {Array<string>} - Array of error message components
 */
function extractErrorMessages(error) {
  // Handle shell/bash execution errors (RT class)
  // Note: RT is defined elsewhere and has properties: code, interrupted, stderr, stdout
  if (error.constructor.name === 'RT' || ('code' in error && 'stderr' in error)) {
    return [
      `Exit code ${error.code}`,
      error.interrupted ? REQUEST_INTERRUPTED_MESSAGE : "",
      error.stderr,
      error.stdout
    ];
  }

  // Handle generic errors
  const messages = [error.message];

  if ("stderr" in error && typeof error.stderr === "string") {
    messages.push(error.stderr);
  }

  if ("stdout" in error && typeof error.stdout === "string") {
    messages.push(error.stdout);
  }

  return messages;
}

/**
 * Formats hook errors into user-friendly messages
 *
 * Handles special error types (nJ hook errors, RT shell errors) and
 * truncates long error messages.
 *
 * Original location: line 358837
 *
 * @param {Error|any} error - The error to format
 * @returns {string} - Formatted error message
 */
function formatHookError(error) {
  // Handle hook-specific errors (nJ class)
  // Note: nJ is defined elsewhere (line 57754)
  if (error.constructor.name === 'nJ') {
    return error.message || REQUEST_INTERRUPTED_MESSAGE;
  }

  // Handle non-Error objects
  if (!(error instanceof Error)) {
    return String(error);
  }

  // Extract and join error messages
  let message = extractErrorMessages(error)
    .filter(Boolean)
    .join('\n')
    .trim() || "Command failed with no output";

  // Truncate if too long (keep first 5000 and last 5000 chars)
  if (message.length <= 10000) {
    return message;
  }

  const headLength = 5000;
  const head = message.slice(0, headLength);
  const tail = message.slice(-headLength);

  return `${head}\n\n... [${message.length - 10000} characters truncated] ...\n\n${tail}`;
}

// ============================================================================
// Message Creation Functions
// ============================================================================

/**
 * Creates a tool cancelled result message
 *
 * Used when a tool execution is cancelled by the user or system.
 *
 * Original location: line 493283
 *
 * @param {string} toolUseId - The ID of the cancelled tool use
 * @returns {Object} - Tool result block with error flag
 */
function createToolCancelledResult(toolUseId) {
  return {
    type: "tool_result",
    content: TOOL_CANCELLED_MESSAGE,
    is_error: true,
    tool_use_id: toolUseId
  };
}

/**
 * Creates a tool progress message
 *
 * Used to stream progress updates during tool execution.
 *
 * Original location: line 493269
 *
 * @param {Object} params - Progress message parameters
 * @param {string} params.toolUseID - ID of the tool being executed
 * @param {string} [params.parentToolUseID] - ID of parent tool (for nested tools)
 * @param {*} params.data - Progress data payload
 * @returns {Object} - Progress message object
 */
function createToolProgressMessage({ toolUseID, parentToolUseID, data }) {
  return {
    type: "progress",
    data: data,
    toolUseID: toolUseID,
    parentToolUseID: parentToolUseID,
    uuid: generateUuid(),
    timestamp: new Date().toISOString()
  };
}

/**
 * Creates a hook message (wrapper for hook attachments)
 *
 * Wraps hook-related data in a message envelope.
 *
 * Original location: line 490499
 *
 * @param {Object} hookData - Hook attachment data
 * @returns {Object} - Hook message with attachment
 */
function createHookMessage(hookData) {
  return {
    attachment: hookData,
    type: "attachment",
    uuid: generateUuid(),
    timestamp: new Date().toISOString()
  };
}

// ============================================================================
// MCP Tool Detection
// ============================================================================

/**
 * Checks if a tool is an MCP (Model Context Protocol) tool
 *
 * MCP tools have names starting with "mcp__" or an isMcp flag set to true.
 *
 * Original name: Ev (line 357413)
 *
 * @param {Object} tool - Tool object
 * @param {string} [tool.name] - Tool name
 * @param {boolean} [tool.isMcp] - Explicit MCP flag
 * @returns {boolean} - True if tool is an MCP tool
 */
function isMcpTool(tool) {
  return tool.name?.startsWith("mcp__") || tool.isMcp === true;
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  // Constants
  TOOL_CANCELLED_MESSAGE,
  REQUEST_INTERRUPTED_MESSAGE,

  // UUID generation
  generateUuid,

  // Validation helpers
  formatValidationPath,
  formatInputValidationError,

  // Error handling
  extractErrorMessages,
  formatHookError,

  // Message creation
  createToolCancelledResult,
  createToolProgressMessage,
  createHookMessage,

  // Tool detection
  isMcpTool
};
