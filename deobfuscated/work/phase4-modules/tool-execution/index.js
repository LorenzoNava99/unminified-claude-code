/**
 * Tool Execution Module - Main Export
 *
 * This module provides the complete tool execution pipeline for Claude Code CLI.
 *
 * Exports:
 * - Core execution functions (executeToolUse, createToolExecutionStream, executeToolWithValidation)
 * - Hook execution functions (executePreToolUseHooks, executePostToolUseHooks)
 * - Helper functions (formatInputValidationError, formatHookError, etc.)
 * - AsyncQueue class for streaming results
 * - Constants (TOOL_CANCELLED_MESSAGE, etc.)
 */

// Core tool execution
const {
  executeToolUse,
  createToolExecutionStream,
  executeToolWithValidation,
  executePreToolUseHooks,
  executePostToolUseHooks
} = require('./tool-executor');

// Helper functions
const {
  TOOL_CANCELLED_MESSAGE,
  REQUEST_INTERRUPTED_MESSAGE,
  generateUuid,
  formatValidationPath,
  formatInputValidationError,
  extractErrorMessages,
  formatHookError,
  createToolCancelledResult,
  createToolProgressMessage,
  createHookMessage,
  isMcpTool
} = require('./tool-helpers');

// AsyncQueue for streaming
const { AsyncQueue } = require('./async-queue');

module.exports = {
  // Core execution functions
  executeToolUse,
  createToolExecutionStream,
  executeToolWithValidation,
  executePreToolUseHooks,
  executePostToolUseHooks,

  // Helper functions
  formatInputValidationError,
  formatHookError,
  extractErrorMessages,
  formatValidationPath,
  createToolCancelledResult,
  createToolProgressMessage,
  createHookMessage,
  isMcpTool,
  generateUuid,

  // Constants
  TOOL_CANCELLED_MESSAGE,
  REQUEST_INTERRUPTED_MESSAGE,

  // Utilities
  AsyncQueue
};
