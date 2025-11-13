/**
 * Hook System - Types and Constants
 *
 * Defines the core types, constants, and event names for the hook system.
 * Hooks allow user-defined commands, prompts, or callbacks to execute at
 * specific points in the tool execution lifecycle.
 *
 * Original locations:
 * - HOOK_EVENT_NAMES: line 59500
 * - DEFAULT_HOOK_TIMEOUT_MS (Fy): line 492106
 */

// ============================================================================
// Hook Event Names
// ============================================================================

/**
 * All supported hook event names
 *
 * These define the 9 points in the lifecycle where hooks can be triggered:
 *
 * 1. PreToolUse - Before a tool is executed (can modify input, block execution)
 * 2. PostToolUse - After a tool is executed (can modify output, add context)
 * 3. Notification - When a notification is displayed to the user
 * 4. UserPromptSubmit - Before a user prompt is submitted to Claude
 * 5. SessionStart - At the start of a new session
 * 6. SessionEnd - At the end of a session
 * 7. Stop - When execution is stopped by user or system
 * 8. SubagentStop - When a subagent is stopped
 * 9. PreCompact - Before context is compacted to manage token limits
 *
 * Original location: line 59500
 * Original name: HOOK_EVENT_NAMES (already well-named)
 *
 * @type {Array<string>}
 */
const HOOK_EVENT_NAMES = [
  "PreToolUse",
  "PostToolUse",
  "Notification",
  "UserPromptSubmit",
  "SessionStart",
  "SessionEnd",
  "Stop",
  "SubagentStop",
  "PreCompact"
];

/**
 * Individual hook event name constants for type safety
 */
const HOOK_PRE_TOOL_USE = "PreToolUse";
const HOOK_POST_TOOL_USE = "PostToolUse";
const HOOK_NOTIFICATION = "Notification";
const HOOK_USER_PROMPT_SUBMIT = "UserPromptSubmit";
const HOOK_SESSION_START = "SessionStart";
const HOOK_SESSION_END = "SessionEnd";
const HOOK_STOP = "Stop";
const HOOK_SUBAGENT_STOP = "SubagentStop";
const HOOK_PRE_COMPACT = "PreCompact";

// ============================================================================
// Hook Types
// ============================================================================

/**
 * Hook type identifiers
 *
 * Three types of hooks are supported:
 * - command: Execute a shell command
 * - prompt: Send a prompt to Claude
 * - callback: Execute a JavaScript callback function
 */
const HOOK_TYPE_COMMAND = "command";
const HOOK_TYPE_PROMPT = "prompt";
const HOOK_TYPE_CALLBACK = "callback";

const HOOK_TYPES = [
  HOOK_TYPE_COMMAND,
  HOOK_TYPE_PROMPT,
  HOOK_TYPE_CALLBACK
];

// ============================================================================
// Hook Timeouts
// ============================================================================

/**
 * Default timeout for hook execution in milliseconds
 *
 * Hooks that exceed this timeout will be cancelled.
 * Individual hooks can override this with their own timeout setting.
 *
 * Original location: line 492106
 * Original name: Fy
 *
 * @type {number}
 * @constant
 */
const DEFAULT_HOOK_TIMEOUT_MS = 60000; // 60 seconds

// ============================================================================
// Hook Result Outcomes
// ============================================================================

/**
 * Possible outcomes for hook execution
 */
const HOOK_OUTCOME_SUCCESS = "success";
const HOOK_OUTCOME_NON_BLOCKING_ERROR = "non_blocking_error";
const HOOK_OUTCOME_BLOCKING_ERROR = "blocking_error";
const HOOK_OUTCOME_CANCELLED = "cancelled";

const HOOK_OUTCOMES = [
  HOOK_OUTCOME_SUCCESS,
  HOOK_OUTCOME_NON_BLOCKING_ERROR,
  HOOK_OUTCOME_BLOCKING_ERROR,
  HOOK_OUTCOME_CANCELLED
];

// ============================================================================
// Permission Behaviors
// ============================================================================

/**
 * Permission behaviors that hooks can return (PreToolUse only)
 *
 * - allow: Allow the tool to execute
 * - deny: Deny tool execution
 * - ask: Defer to normal permission checking
 */
const PERMISSION_ALLOW = "allow";
const PERMISSION_DENY = "deny";
const PERMISSION_ASK = "ask";

const PERMISSION_BEHAVIORS = [
  PERMISSION_ALLOW,
  PERMISSION_DENY,
  PERMISSION_ASK
];

// ============================================================================
// Hook Message Types
// ============================================================================

/**
 * Types of messages that hooks can generate
 */
const HOOK_MESSAGE_TYPE_PROGRESS = "hook_progress";
const HOOK_MESSAGE_TYPE_CANCELLED = "hook_cancelled";
const HOOK_MESSAGE_TYPE_BLOCKING_ERROR = "hook_blocking_error";
const HOOK_MESSAGE_TYPE_ERROR = "hook_error_during_execution";
const HOOK_MESSAGE_TYPE_STOPPED = "hook_stopped_continuation";
const HOOK_MESSAGE_TYPE_CONTEXT = "hook_additional_context";

// ============================================================================
// Type Definitions (JSDoc)
// ============================================================================

/**
 * @typedef {Object} HookDefinition
 * @property {'command'|'prompt'|'callback'} type - Type of hook
 * @property {string} [command] - Shell command to execute (for command hooks)
 * @property {string} [prompt] - Prompt text (for prompt hooks)
 * @property {Function} [callback] - Callback function (for callback hooks)
 * @property {number} [timeout] - Custom timeout in seconds (optional)
 * @property {string} [name] - Hook name for identification
 */

/**
 * @typedef {Object} HookInput
 * @property {string} hook_event_name - Name of the hook event
 * @property {string} [cwd] - Current working directory
 * @property {string} [mode] - Agent mode (default, plan, etc.)
 * @property {string} [tool_name] - Tool name (for PreToolUse/PostToolUse)
 * @property {Object} [tool_input] - Tool input (for PreToolUse/PostToolUse)
 * @property {Object} [tool_response] - Tool output (for PostToolUse)
 * @property {string} [prompt] - User prompt (for UserPromptSubmit)
 * @property {string} [message] - Notification message (for Notification)
 * @property {string} [title] - Notification title (for Notification)
 * @property {string} [notification_type] - Notification type (for Notification)
 * @property {string} [source] - Session source (for SessionStart)
 * @property {boolean} [stop_hook_active] - Whether stop hook is active (for Stop)
 * @property {string} [trigger] - Trigger reason (for PreCompact)
 * @property {string} [custom_instructions] - Custom instructions (for PreCompact)
 */

/**
 * @typedef {Object} HookResult
 * @property {Object} [message] - Hook message to display
 * @property {'success'|'non_blocking_error'|'blocking_error'|'cancelled'} [outcome] - Execution outcome
 * @property {HookDefinition} [hook] - Reference to hook definition
 * @property {boolean} [succeeded] - Whether hook succeeded
 * @property {string} [output] - Hook output (for command hooks)
 * @property {'allow'|'deny'|'ask'} [permissionBehavior] - Permission override (PreToolUse only)
 * @property {string} [hookPermissionDecisionReason] - Reason for permission decision
 * @property {Object} [updatedInput] - Modified tool input (PreToolUse only)
 * @property {*} [updatedMCPToolOutput] - Modified tool output (PostToolUse, MCP tools)
 * @property {string} [blockingError] - Error that blocks execution
 * @property {boolean} [preventContinuation] - Flag to stop execution
 * @property {string} [stopReason] - Reason for stopping
 * @property {Array} [additionalContexts] - Additional context to inject
 * @property {boolean} [aborted] - Whether hook was aborted
 */

/**
 * @typedef {Object} HookExecutionOptions
 * @property {HookInput} hookInput - Input data for the hook
 * @property {string} [toolUseID] - Tool use ID for tracking
 * @property {string} [matchQuery] - Query to match hooks (e.g., tool name)
 * @property {AbortSignal} [signal] - Abort signal for cancellation
 * @property {number} [timeoutMs] - Timeout in milliseconds
 * @property {Object} [toolUseContext] - Tool execution context
 * @property {Array} [messages] - Messages array for prompt hooks
 * @property {Function} [getAppState] - Function to get app state
 */

/**
 * @typedef {Object} PreCompactResult
 * @property {string} [newCustomInstructions] - New custom instructions from hooks
 * @property {string} [userDisplayMessage] - Messages to display to user
 */

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Checks if a given event name is a valid hook event
 *
 * @param {string} eventName - Event name to check
 * @returns {boolean} - True if valid hook event
 */
function isValidHookEvent(eventName) {
  return HOOK_EVENT_NAMES.includes(eventName);
}

/**
 * Checks if a given hook type is valid
 *
 * @param {string} hookType - Hook type to check
 * @returns {boolean} - True if valid hook type
 */
function isValidHookType(hookType) {
  return HOOK_TYPES.includes(hookType);
}

/**
 * Checks if a given outcome is valid
 *
 * @param {string} outcome - Outcome to check
 * @returns {boolean} - True if valid outcome
 */
function isValidOutcome(outcome) {
  return HOOK_OUTCOMES.includes(outcome);
}

/**
 * Checks if a given permission behavior is valid
 *
 * @param {string} behavior - Permission behavior to check
 * @returns {boolean} - True if valid permission behavior
 */
function isValidPermissionBehavior(behavior) {
  return PERMISSION_BEHAVIORS.includes(behavior);
}

/**
 * Gets a human-readable description of a hook event
 *
 * @param {string} eventName - Hook event name
 * @returns {string} - Human-readable description
 */
function getHookEventDescription(eventName) {
  const descriptions = {
    [HOOK_PRE_TOOL_USE]: "Before tool execution",
    [HOOK_POST_TOOL_USE]: "After tool execution",
    [HOOK_NOTIFICATION]: "When notification is displayed",
    [HOOK_USER_PROMPT_SUBMIT]: "Before user prompt is submitted",
    [HOOK_SESSION_START]: "At session start",
    [HOOK_SESSION_END]: "At session end",
    [HOOK_STOP]: "When execution is stopped",
    [HOOK_SUBAGENT_STOP]: "When subagent is stopped",
    [HOOK_PRE_COMPACT]: "Before context compaction"
  };
  return descriptions[eventName] || eventName;
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  // Hook event names
  HOOK_EVENT_NAMES,
  HOOK_PRE_TOOL_USE,
  HOOK_POST_TOOL_USE,
  HOOK_NOTIFICATION,
  HOOK_USER_PROMPT_SUBMIT,
  HOOK_SESSION_START,
  HOOK_SESSION_END,
  HOOK_STOP,
  HOOK_SUBAGENT_STOP,
  HOOK_PRE_COMPACT,

  // Hook types
  HOOK_TYPES,
  HOOK_TYPE_COMMAND,
  HOOK_TYPE_PROMPT,
  HOOK_TYPE_CALLBACK,

  // Timeouts
  DEFAULT_HOOK_TIMEOUT_MS,

  // Outcomes
  HOOK_OUTCOMES,
  HOOK_OUTCOME_SUCCESS,
  HOOK_OUTCOME_NON_BLOCKING_ERROR,
  HOOK_OUTCOME_BLOCKING_ERROR,
  HOOK_OUTCOME_CANCELLED,

  // Permission behaviors
  PERMISSION_BEHAVIORS,
  PERMISSION_ALLOW,
  PERMISSION_DENY,
  PERMISSION_ASK,

  // Hook message types
  HOOK_MESSAGE_TYPE_PROGRESS,
  HOOK_MESSAGE_TYPE_CANCELLED,
  HOOK_MESSAGE_TYPE_BLOCKING_ERROR,
  HOOK_MESSAGE_TYPE_ERROR,
  HOOK_MESSAGE_TYPE_STOPPED,
  HOOK_MESSAGE_TYPE_CONTEXT,

  // Helper functions
  isValidHookEvent,
  isValidHookType,
  isValidOutcome,
  isValidPermissionBehavior,
  getHookEventDescription
};
