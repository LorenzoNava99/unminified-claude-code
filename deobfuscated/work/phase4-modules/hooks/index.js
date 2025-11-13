/**
 * Hook System - Main Export
 *
 * Central export point for all hook system functionality.
 *
 * Modules:
 * - hook-types: Constants, type definitions, validation
 * - hook-helpers: Utility functions for hook management
 * - hook-executors: Functions that execute different hook types
 * - hook-engine: Core execution coordination (streaming and non-streaming)
 * - hook-events: Event-specific hook functions
 */

// Types and constants
const hookTypes = require('./hook-types');

// Helper functions
const hookHelpers = require('./hook-helpers');

// Hook executors
const hookExecutors = require('./hook-executors');

// Main engine
const hookEngine = require('./hook-engine');

// Event functions
const hookEvents = require('./hook-events');

// ============================================================================
// Re-export everything for convenience
// ============================================================================

module.exports = {
  // === Types and Constants ===
  // Hook event names
  HOOK_EVENT_NAMES: hookTypes.HOOK_EVENT_NAMES,
  HOOK_PRE_TOOL_USE: hookTypes.HOOK_PRE_TOOL_USE,
  HOOK_POST_TOOL_USE: hookTypes.HOOK_POST_TOOL_USE,
  HOOK_NOTIFICATION: hookTypes.HOOK_NOTIFICATION,
  HOOK_USER_PROMPT_SUBMIT: hookTypes.HOOK_USER_PROMPT_SUBMIT,
  HOOK_SESSION_START: hookTypes.HOOK_SESSION_START,
  HOOK_SESSION_END: hookTypes.HOOK_SESSION_END,
  HOOK_STOP: hookTypes.HOOK_STOP,
  HOOK_SUBAGENT_STOP: hookTypes.HOOK_SUBAGENT_STOP,
  HOOK_PRE_COMPACT: hookTypes.HOOK_PRE_COMPACT,

  // Hook types
  HOOK_TYPES: hookTypes.HOOK_TYPES,
  HOOK_TYPE_COMMAND: hookTypes.HOOK_TYPE_COMMAND,
  HOOK_TYPE_PROMPT: hookTypes.HOOK_TYPE_PROMPT,
  HOOK_TYPE_CALLBACK: hookTypes.HOOK_TYPE_CALLBACK,

  // Timeouts
  DEFAULT_HOOK_TIMEOUT_MS: hookTypes.DEFAULT_HOOK_TIMEOUT_MS,

  // Outcomes
  HOOK_OUTCOMES: hookTypes.HOOK_OUTCOMES,
  HOOK_OUTCOME_SUCCESS: hookTypes.HOOK_OUTCOME_SUCCESS,
  HOOK_OUTCOME_NON_BLOCKING_ERROR: hookTypes.HOOK_OUTCOME_NON_BLOCKING_ERROR,
  HOOK_OUTCOME_BLOCKING_ERROR: hookTypes.HOOK_OUTCOME_BLOCKING_ERROR,
  HOOK_OUTCOME_CANCELLED: hookTypes.HOOK_OUTCOME_CANCELLED,

  // Permission behaviors
  PERMISSION_BEHAVIORS: hookTypes.PERMISSION_BEHAVIORS,
  PERMISSION_ALLOW: hookTypes.PERMISSION_ALLOW,
  PERMISSION_DENY: hookTypes.PERMISSION_DENY,
  PERMISSION_ASK: hookTypes.PERMISSION_ASK,

  // Hook message types
  HOOK_MESSAGE_TYPE_PROGRESS: hookTypes.HOOK_MESSAGE_TYPE_PROGRESS,
  HOOK_MESSAGE_TYPE_CANCELLED: hookTypes.HOOK_MESSAGE_TYPE_CANCELLED,
  HOOK_MESSAGE_TYPE_BLOCKING_ERROR: hookTypes.HOOK_MESSAGE_TYPE_BLOCKING_ERROR,
  HOOK_MESSAGE_TYPE_ERROR: hookTypes.HOOK_MESSAGE_TYPE_ERROR,
  HOOK_MESSAGE_TYPE_STOPPED: hookTypes.HOOK_MESSAGE_TYPE_STOPPED,
  HOOK_MESSAGE_TYPE_CONTEXT: hookTypes.HOOK_MESSAGE_TYPE_CONTEXT,

  // Type validation helpers
  isValidHookEvent: hookTypes.isValidHookEvent,
  isValidHookType: hookTypes.isValidHookType,
  isValidOutcome: hookTypes.isValidOutcome,
  isValidPermissionBehavior: hookTypes.isValidPermissionBehavior,
  getHookEventDescription: hookTypes.getHookEventDescription,

  // === Helper Functions ===
  buildHookInput: hookHelpers.buildHookInput,
  getMatchingHooks: hookHelpers.getMatchingHooks,
  combineAbortSignals: hookHelpers.combineAbortSignals,
  matchesHookPattern: hookHelpers.matchesHookPattern,
  getHooksFromSettings: hookHelpers.getHooksFromSettings,
  formatHookBlockingError: hookHelpers.formatHookBlockingError,

  // === Hook Executors ===
  executeHookCommand: hookExecutors.executeHookCommand,
  executePromptHook: hookExecutors.executePromptHook,
  executeCallbackHook: hookExecutors.executeCallbackHook,

  // === Main Engine ===
  executeHooksStream: hookEngine.executeHooksStream,
  executeHooks: hookEngine.executeHooks,

  // === Event Functions ===
  // PreToolUse and PostToolUse
  iterateToolHooks: hookEvents.iterateToolHooks,
  iteratePostToolHooks: hookEvents.iteratePostToolHooks,

  // Notification
  executeNotificationHooks: hookEvents.executeNotificationHooks,

  // Stop/SubagentStop
  executeStopHooks: hookEvents.executeStopHooks,

  // UserPromptSubmit
  executeUserPromptSubmitHooks: hookEvents.executeUserPromptSubmitHooks,

  // SessionStart and SessionEnd
  executeSessionStartHooks: hookEvents.executeSessionStartHooks,
  executeSessionEndHooks: hookEvents.executeSessionEndHooks,

  // PreCompact
  executePreCompactHooks: hookEvents.executePreCompactHooks,

  // StatusLine (special)
  executeStatusLineHook: hookEvents.executeStatusLineHook
};
