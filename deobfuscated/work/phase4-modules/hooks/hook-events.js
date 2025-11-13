/**
 * Hook System - Event Functions
 *
 * Wrapper functions for each hook event type. These functions prepare
 * hook input data and delegate to the main hook engine (executeHooksStream
 * or executeHooks).
 *
 * Original locations:
 * - iterateToolHooks: line 491885 (PreToolUse) - Already well-named
 * - iteratePostToolHooks (Kc1): line 491902 (PostToolUse)
 * - executeNotificationHooks (sc1): line 491919
 * - executeStopHooks (Dc1): line 491938
 * - executeUserPromptSubmitHooks (dt1): line 491953
 * - executeSessionStartHooks (Bx1): line 491967
 * - executePreCompactHooks (Ix1): line 491981
 * - executeSessionEndHooks (ee1): line 492020
 * - executeStatusLineHook (Ot1): line 492044
 */

const { DEFAULT_HOOK_TIMEOUT_MS } = require('./hook-types');
const { buildHookInput } = require('./hook-helpers');
const { executeHooksStream, executeHooks } = require('./hook-engine');
const { executeHookCommand } = require('./hook-executors');

// ============================================================================
// External Dependencies (Placeholders)
// ============================================================================

/**
 * TODO: Import these from appropriate modules:
 *
 * - m(message, options) - Debug logging
 * - lazyInit$A() - Generate hook UUID
 * - L0() - Get session ID
 * - ml2(setAppState, sessionId) - Clear session hooks
 * - M0() - Get settings
 */

const m = function(message, options) {
  // TODO: Import from debug logging
  // console.log(`[Hook Debug]:`, message);
};

const generateHookUuid = function() {
  // TODO: Import from uuid module
  // Original name: lazyInit$A
  return Math.random().toString(36).substring(7);
};

const getSessionId = function() {
  // TODO: Import from session module
  // Original name: L0
  return "session_" + Date.now();
};

const clearSessionHooks = function(setAppState, sessionId) {
  // TODO: Import from session management
  // Original name: ml2
  // Clears hooks for the given session
};

const getSettings = function() {
  // TODO: Import from settings module
  // Original name: M0
  return {
    disableAllHooks: false,
    statusLine: null
  };
};

// ============================================================================
// PreToolUse Hooks
// ============================================================================

/**
 * Executes PreToolUse hooks before a tool is executed
 *
 * PreToolUse hooks can:
 * - Inspect tool input
 * - Modify tool input
 * - Override permission decisions (allow/deny/ask)
 * - Block tool execution
 * - Add additional context
 *
 * Original location: line 491885
 * Already well-named: iterateToolHooks
 *
 * @param {string} toolName - Name of the tool being executed
 * @param {string} toolUseID - Tool use ID
 * @param {Object} toolInput - Tool input parameters
 * @param {Object} context - Tool execution context
 * @param {string} [permissionMode] - Permission mode (default, bypassPermissions, etc.)
 * @param {AbortSignal} signal - Abort signal
 * @param {number} [timeoutMs] - Timeout in milliseconds
 * @yields {Object} - Hook results
 *
 * @example
 * for await (const result of iterateToolHooks(
 *   "Read",
 *   "tool_123",
 *   { file_path: "test.txt" },
 *   context,
 *   "default",
 *   abortSignal
 * )) {
 *   if (result.permissionBehavior === "deny") {
 *     // Hook denied execution
 *   }
 * }
 */
async function* iterateToolHooks(
  toolName,
  toolUseID,
  toolInput,
  context,
  permissionMode,
  signal,
  timeoutMs = DEFAULT_HOOK_TIMEOUT_MS
) {
  m(`executePreToolHooks called for tool: ${toolName}`);

  const hookInput = {
    ...buildHookInput(permissionMode),
    hook_event_name: "PreToolUse",
    tool_name: toolName,
    tool_input: toolInput
  };

  yield* executeHooksStream({
    hookInput: hookInput,
    toolUseID: toolUseID,
    matchQuery: toolName,
    signal: signal,
    timeoutMs: timeoutMs,
    toolUseContext: context
  });
}

// ============================================================================
// PostToolUse Hooks
// ============================================================================

/**
 * Executes PostToolUse hooks after a tool is executed
 *
 * PostToolUse hooks can:
 * - Inspect tool output
 * - Modify MCP tool output
 * - Add additional context
 * - Display messages
 *
 * Original location: line 491902
 * Original name: Kc1
 * New name: iteratePostToolHooks
 *
 * @param {string} toolName - Name of the tool that was executed
 * @param {string} toolUseID - Tool use ID
 * @param {Object} toolInput - Tool input parameters
 * @param {*} toolResponse - Tool response/output
 * @param {Object} context - Tool execution context
 * @param {string} [permissionMode] - Permission mode
 * @param {AbortSignal} signal - Abort signal
 * @param {Array} [messages] - Messages for prompt hooks
 * @param {number} [timeoutMs] - Timeout in milliseconds
 * @yields {Object} - Hook results
 */
async function* iteratePostToolHooks(
  toolName,
  toolUseID,
  toolInput,
  toolResponse,
  context,
  permissionMode,
  signal,
  messages,
  timeoutMs = DEFAULT_HOOK_TIMEOUT_MS
) {
  const hookInput = {
    ...buildHookInput(permissionMode),
    hook_event_name: "PostToolUse",
    tool_name: toolName,
    tool_input: toolInput,
    tool_response: toolResponse
  };

  yield* executeHooksStream({
    hookInput: hookInput,
    toolUseID: toolUseID,
    matchQuery: toolName,
    signal: signal,
    timeoutMs: timeoutMs,
    toolUseContext: context
  });
}

// ============================================================================
// Notification Hooks
// ============================================================================

/**
 * Executes Notification hooks when a notification is displayed
 *
 * Notification hooks are non-streaming and execute synchronously.
 *
 * Original location: line 491919
 * Original name: sc1
 * New name: executeNotificationHooks
 *
 * @param {Object} notification - Notification data
 * @param {string} notification.message - Notification message
 * @param {string} notification.title - Notification title
 * @param {string} notification.notificationType - Type (info, warning, error, etc.)
 * @param {number} [timeoutMs] - Timeout in milliseconds
 * @returns {Promise<void>}
 */
async function executeNotificationHooks(
  notification,
  timeoutMs = DEFAULT_HOOK_TIMEOUT_MS
) {
  const { message, title, notificationType } = notification;

  const hookInput = {
    ...buildHookInput(undefined),
    hook_event_name: "Notification",
    message: message,
    title: title,
    notification_type: notificationType
  };

  await executeHooks({
    hookInput: hookInput,
    timeoutMs: timeoutMs,
    matchQuery: notificationType
  });
}

// ============================================================================
// Stop Hooks
// ============================================================================

/**
 * Executes Stop or SubagentStop hooks when execution is stopped
 *
 * Original location: line 491938
 * Original name: Dc1
 * New name: executeStopHooks
 *
 * @param {Object} context - Tool execution context
 * @param {Array} messages - Messages array
 * @param {string} [permissionMode] - Permission mode
 * @param {AbortSignal} signal - Abort signal
 * @param {boolean} stopHookActive - Whether stop hook is active
 * @param {boolean} isSubagent - Whether this is a subagent stop
 * @yields {Object} - Hook results
 */
async function* executeStopHooks(
  context,
  messages,
  permissionMode,
  signal,
  stopHookActive,
  isSubagent
) {
  const hookInput = {
    ...buildHookInput(permissionMode),
    hook_event_name: isSubagent ? "SubagentStop" : "Stop",
    stop_hook_active: stopHookActive
  };

  yield* executeHooksStream({
    hookInput: hookInput,
    toolUseID: generateHookUuid(),
    signal: signal,
    timeoutMs: DEFAULT_HOOK_TIMEOUT_MS,
    toolUseContext: context,
    messages: messages
  });
}

// ============================================================================
// UserPromptSubmit Hooks
// ============================================================================

/**
 * Executes UserPromptSubmit hooks before a user prompt is submitted
 *
 * Original location: line 491953
 * Original name: dt1
 * New name: executeUserPromptSubmitHooks
 *
 * @param {string} prompt - User prompt text
 * @param {string} [permissionMode] - Permission mode
 * @param {Object} context - Execution context with abortController
 * @yields {Object} - Hook results
 */
async function* executeUserPromptSubmitHooks(prompt, permissionMode, context) {
  const hookInput = {
    ...buildHookInput(permissionMode),
    hook_event_name: "UserPromptSubmit",
    prompt: prompt
  };

  yield* executeHooksStream({
    hookInput: hookInput,
    toolUseID: generateHookUuid(),
    signal: context.abortController.signal,
    timeoutMs: DEFAULT_HOOK_TIMEOUT_MS,
    toolUseContext: context
  });
}

// ============================================================================
// SessionStart Hooks
// ============================================================================

/**
 * Executes SessionStart hooks at the beginning of a session
 *
 * Original location: line 491967
 * Original name: Bx1
 * New name: executeSessionStartHooks
 *
 * @param {string} source - Session source (e.g., "cli", "web")
 * @param {string} [sessionId] - Session ID
 * @param {AbortSignal} signal - Abort signal
 * @param {number} [timeoutMs] - Timeout in milliseconds
 * @yields {Object} - Hook results
 */
async function* executeSessionStartHooks(
  source,
  sessionId,
  signal,
  timeoutMs = DEFAULT_HOOK_TIMEOUT_MS
) {
  const hookInput = {
    ...buildHookInput(undefined, sessionId),
    hook_event_name: "SessionStart",
    source: source
  };

  yield* executeHooksStream({
    hookInput: hookInput,
    toolUseID: generateHookUuid(),
    matchQuery: source,
    signal: signal,
    timeoutMs: timeoutMs
  });
}

// ============================================================================
// PreCompact Hooks
// ============================================================================

/**
 * Executes PreCompact hooks before context is compacted
 *
 * PreCompact hooks can return custom instructions to be added before compaction.
 * This is non-streaming and aggregates results from all hooks.
 *
 * Original location: line 491981
 * Original name: Ix1
 * New name: executePreCompactHooks
 *
 * @param {Object} compactInfo - Compact trigger information
 * @param {string} compactInfo.trigger - Trigger reason (e.g., "token_limit")
 * @param {string} [compactInfo.customInstructions] - Existing custom instructions
 * @param {AbortSignal} signal - Abort signal
 * @param {number} [timeoutMs] - Timeout in milliseconds
 * @returns {Promise<Object>} - Result object
 *
 * @property {string} [newCustomInstructions] - Aggregated custom instructions from hooks
 * @property {string} [userDisplayMessage] - Messages to display to user
 */
async function executePreCompactHooks(
  compactInfo,
  signal,
  timeoutMs = DEFAULT_HOOK_TIMEOUT_MS
) {
  const hookInput = {
    ...buildHookInput(undefined),
    hook_event_name: "PreCompact",
    trigger: compactInfo.trigger,
    custom_instructions: compactInfo.customInstructions
  };

  const results = await executeHooks({
    hookInput: hookInput,
    matchQuery: compactInfo.trigger,
    signal: signal,
    timeoutMs: timeoutMs
  });

  if (results.length === 0) {
    return {};
  }

  // Aggregate successful results with non-empty output
  const customInstructions = results
    .filter(r => r.succeeded && r.output.trim().length > 0)
    .map(r => r.output.trim());

  // Build user display messages
  const displayMessages = [];
  for (const result of results) {
    if (result.succeeded) {
      if (result.output.trim()) {
        displayMessages.push(
          `PreCompact [${result.command}] completed successfully: ${result.output.trim()}`
        );
      } else {
        displayMessages.push(
          `PreCompact [${result.command}] completed successfully`
        );
      }
    } else if (result.output.trim()) {
      displayMessages.push(
        `PreCompact [${result.command}] failed: ${result.output.trim()}`
      );
    } else {
      displayMessages.push(
        `PreCompact [${result.command}] failed`
      );
    }
  }

  return {
    newCustomInstructions: customInstructions.length > 0
      ? customInstructions.join("\n\n")
      : undefined,
    userDisplayMessage: displayMessages.length > 0
      ? displayMessages.join("\n")
      : undefined
  };
}

// ============================================================================
// SessionEnd Hooks
// ============================================================================

/**
 * Executes SessionEnd hooks at the end of a session
 *
 * Original location: line 492020
 * Original name: ee1
 * New name: executeSessionEndHooks
 *
 * @param {string} reason - Reason for session end (e.g., "user_exit", "error")
 * @param {Object} [options] - Execution options
 * @param {Function} [options.getAppState] - Function to get app state
 * @param {Function} [options.setAppState] - Function to set app state
 * @param {AbortSignal} [options.signal] - Abort signal
 * @param {number} [options.timeoutMs] - Timeout in milliseconds
 * @returns {Promise<void>}
 */
async function executeSessionEndHooks(reason, options) {
  const {
    getAppState,
    setAppState,
    signal,
    timeoutMs = DEFAULT_HOOK_TIMEOUT_MS
  } = options || {};

  const hookInput = {
    ...buildHookInput(undefined),
    hook_event_name: "SessionEnd",
    reason: reason
  };

  await executeHooks({
    getAppState: getAppState,
    hookInput: hookInput,
    matchQuery: reason,
    signal: signal,
    timeoutMs: timeoutMs
  });

  // Clear session hooks if setAppState provided
  if (setAppState) {
    const sessionId = getSessionId();
    clearSessionHooks(setAppState, sessionId);
  }
}

// ============================================================================
// StatusLine Hook (Special)
// ============================================================================

/**
 * Executes the status line hook to get custom status line content
 *
 * This is a special hook that runs frequently to update the status line display.
 * It has a short timeout and returns the stdout directly.
 *
 * Original location: line 492044
 * Original name: Ot1
 * New name: executeStatusLineHook
 *
 * @param {Object} statusData - Status data to pass to hook
 * @param {AbortSignal} [signal] - Abort signal
 * @param {number} [timeoutMs] - Timeout in milliseconds (default: 5000)
 * @returns {Promise<string|undefined>} - Status line content or undefined
 */
async function executeStatusLineHook(
  statusData,
  signal,
  timeoutMs = 5000
) {
  const settings = getSettings();
  const statusLineConfig = settings?.statusLine;

  // Check if hooks disabled
  if (settings?.disableAllHooks === true) {
    return;
  }

  // Check if status line configured
  if (!statusLineConfig || statusLineConfig.type !== "command") {
    return;
  }

  const abortSignal = signal || AbortSignal.timeout(timeoutMs);

  try {
    const hookInputJSON = JSON.stringify(statusData);

    const result = await executeHookCommand(
      statusLineConfig,
      "StatusLine",
      "statusLine",
      hookInputJSON,
      abortSignal
    );

    if (result.aborted) {
      return;
    }

    if (result.status === 0) {
      // Clean up output - split by newlines, trim, filter empty, rejoin
      const cleaned = result.stdout
        .trim()
        .split("\n")
        .flatMap(line => line.trim() || [])
        .join("\n");

      if (cleaned) {
        return cleaned;
      }
    }

    return;
  } catch (err) {
    m(`Status hook failed: ${err}`, { level: "error" });
    return;
  }
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  // PreToolUse and PostToolUse
  iterateToolHooks,
  iteratePostToolHooks,

  // Notification
  executeNotificationHooks,

  // Stop/SubagentStop
  executeStopHooks,

  // UserPromptSubmit
  executeUserPromptSubmitHooks,

  // SessionStart and SessionEnd
  executeSessionStartHooks,
  executeSessionEndHooks,

  // PreCompact
  executePreCompactHooks,

  // StatusLine (special)
  executeStatusLineHook
};
