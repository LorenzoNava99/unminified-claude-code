/**
 * Hook System - Helper Functions
 *
 * Utility functions for hook execution including:
 * - Building hook input data
 * - Matching hooks from configuration
 * - Combining abort signals
 * - UUID generation for hooks
 *
 * Original locations:
 * - buildHookInput (DR): line 490983
 * - getMatchingHooks (y00): line 491350
 * - combineAbortSignals (nB1): line 491403
 * - matchesHookPattern (l1I): line 491291
 * - getHooksFromSettings (i1I): line 491308
 */

// ============================================================================
// External Dependencies (Placeholders)
// ============================================================================

/**
 * TODO: Import these from appropriate modules when available:
 *
 * - getCwd() - Get current working directory (from tool-helpers or filesystem module)
 * - m(message) - Debug logging function
 * - createAbortController() - Create abort controller (likely native or polyfill)
 * - L0() - Get session ID (line 4160)
 * - aB1(sessionId) - Get transcript path
 * - ok0() - Get hooks from user settings
 * - _PA() - Get hooks from project settings
 * - YB.sessionId - Session ID storage
 */

// Placeholder implementations
const getCwd = function() {
  // TODO: Import from filesystem module
  return process.cwd();
};

const m = function(message) {
  // TODO: Import from debug logging module
  // console.log(`[Hook Debug]:`, message);
};

const createAbortController = function() {
  // Standard AbortController - available in Node.js 15+
  return new AbortController();
};

const getSessionId = function() {
  // TODO: Import from session module
  // Original name: L0 (line 4160)
  // Returns YB.sessionId
  return "session_" + Date.now();
};

const getTranscriptPath = function(sessionId) {
  // TODO: Import from session/file module
  // Original name: aB1
  return `/tmp/transcript_${sessionId}.json`;
};

const getUserHooks = function() {
  // TODO: Import from config/settings module
  // Original name: ok0
  // Returns hooks from user settings
  return {};
};

const getProjectHooks = function() {
  // TODO: Import from config/settings module
  // Original name: _PA
  // Returns hooks from project-level settings
  return {};
};

// ============================================================================
// Hook Input Builder
// ============================================================================

/**
 * Builds the base hook input object with common fields
 *
 * All hooks receive a base input object containing session information,
 * current directory, and permission mode. Event-specific hooks add
 * additional fields to this base object.
 *
 * Original location: line 490983
 * Original name: DR
 *
 * @param {string} [permissionMode] - Current permission mode (e.g., "default", "bypassPermissions")
 * @param {string} [sessionId] - Session ID (uses current session if not provided)
 * @returns {Object} - Base hook input object
 *
 * @property {string} session_id - Unique session identifier
 * @property {string} transcript_path - Path to session transcript file
 * @property {string} cwd - Current working directory
 * @property {string} permission_mode - Current permission mode
 *
 * @example
 * const hookInput = buildHookInput("default");
 * // Returns: {
 * //   session_id: "abc123",
 * //   transcript_path: "/path/to/transcript.json",
 * //   cwd: "/home/user/project",
 * //   permission_mode: "default"
 * // }
 */
function buildHookInput(permissionMode, sessionId) {
  const actualSessionId = sessionId ?? getSessionId();
  return {
    session_id: actualSessionId,
    transcript_path: getTranscriptPath(actualSessionId),
    cwd: getCwd(),
    permission_mode: permissionMode
  };
}

// ============================================================================
// Hook Pattern Matching
// ============================================================================

/**
 * Checks if a value matches a hook pattern
 *
 * Patterns can be:
 * - "*" or undefined/null: Matches everything
 * - Simple string: Exact match
 * - Pipe-separated: "pattern1|pattern2|pattern3" (OR logic)
 * - Regular expression: Any valid regex pattern
 *
 * Original location: line 491291
 * Original name: l1I
 *
 * @param {string} value - Value to test (e.g., tool name, notification type)
 * @param {string} [pattern] - Pattern to match against
 * @returns {boolean} - True if value matches pattern
 *
 * @example
 * matchesHookPattern("Read", "Read") // true
 * matchesHookPattern("Read", "Read|Write") // true
 * matchesHookPattern("Bash", "^(Bash|Read)$") // true (regex)
 * matchesHookPattern("anything", "*") // true
 * matchesHookPattern("anything", undefined) // true
 */
function matchesHookPattern(value, pattern) {
  // No pattern or wildcard - match everything
  if (!pattern || pattern === "*") {
    return true;
  }

  // Simple string or pipe-separated list
  if (/^[a-zA-Z0-9_|]+$/.test(pattern)) {
    if (pattern.includes("|")) {
      // Pipe-separated - OR logic
      return pattern.split("|").map(p => p.trim()).includes(value);
    }
    // Simple exact match
    return value === pattern;
  }

  // Regular expression
  try {
    return new RegExp(pattern).test(value);
  } catch {
    m(`Invalid regex pattern in hook matcher: ${pattern}`);
    return false;
  }
}

// ============================================================================
// Hook Settings Retrieval
// ============================================================================

/**
 * Gets all hooks from settings (user and project level)
 *
 * Combines hooks from:
 * 1. User-level settings (~/.config/claude-code/hooks)
 * 2. Project-level settings (.claude/hooks)
 *
 * Original location: line 491308
 * Original name: i1I
 *
 * @param {Object} [appState] - Application state (unused in current implementation)
 * @returns {Object} - Map of event names to hook matchers
 *
 * Structure:
 * {
 *   "PreToolUse": [
 *     { matcher: "Read", hooks: [...] },
 *     { matcher: "*", hooks: [...] }
 *   ],
 *   "PostToolUse": [...],
 *   ...
 * }
 */
function getHooksFromSettings(appState) {
  const result = {};

  // Get user-level hooks
  const userHooks = getUserHooks();
  if (userHooks) {
    for (const [eventName, matchers] of Object.entries(userHooks)) {
      result[eventName] = matchers.map(matcher => ({
        matcher: matcher.matcher,
        hooks: matcher.hooks
      }));
    }
  }

  // Get project-level hooks
  const projectHooks = getProjectHooks();
  if (projectHooks) {
    for (const [eventName, matchers] of Object.entries(projectHooks)) {
      if (!result[eventName]) {
        result[eventName] = [];
      }
      for (const matcher of matchers) {
        result[eventName].push({
          matcher: matcher.matcher,
          hooks: matcher.hooks
        });
      }
    }
  }

  return result;
}

// ============================================================================
// Hook Matching
// ============================================================================

/**
 * Gets hooks that match the current event and query
 *
 * Filtering logic:
 * 1. Get all hooks for the event type
 * 2. Extract match query from hook input (tool name, source, trigger, etc.)
 * 3. Filter hooks by matcher pattern
 * 4. Deduplicate command and prompt hooks (callbacks kept separate)
 * 5. Return combined list
 *
 * Original location: line 491350
 * Original name: y00
 *
 * @param {Object} [appState] - Application state
 * @param {string} eventName - Hook event name (e.g., "PreToolUse")
 * @param {Object} hookInput - Hook input object with event-specific fields
 * @returns {Array<HookDefinition>} - Array of matching hooks
 *
 * @example
 * const hookInput = {
 *   hook_event_name: "PreToolUse",
 *   tool_name: "Read",
 *   tool_input: { file_path: "test.txt" }
 * };
 * const hooks = getMatchingHooks(appState, "PreToolUse", hookInput);
 * // Returns hooks that match tool "Read" or have wildcard matcher
 */
function getMatchingHooks(appState, eventName, hookInput) {
  try {
    // Get all hook matchers for this event
    const eventHooks = getHooksFromSettings(appState)?.[eventName] ?? [];

    // Extract the match query based on event type
    let matchQuery = undefined;
    switch (hookInput.hook_event_name) {
      case "PreToolUse":
      case "PostToolUse":
        matchQuery = hookInput.tool_name;
        break;
      case "SessionStart":
        matchQuery = hookInput.source;
        break;
      case "PreCompact":
        matchQuery = hookInput.trigger;
        break;
      case "Notification":
        matchQuery = hookInput.notification_type;
        break;
      case "SessionEnd":
        matchQuery = hookInput.reason;
        break;
      default:
        break;
    }

    m(`Getting matching hook commands for ${eventName} with query: ${matchQuery}`);
    m(`Found ${eventHooks.length} hook matchers in settings`);

    // Filter hooks by matcher pattern
    let allMatchingHooks;
    if (!matchQuery) {
      // No query - return all hooks
      allMatchingHooks = eventHooks.flatMap(matcher => matcher.hooks);
    } else {
      // Filter by matcher pattern
      allMatchingHooks = eventHooks
        .filter(matcher => !matcher.matcher || matchesHookPattern(matchQuery, matcher.matcher))
        .flatMap(matcher => matcher.hooks);
    }

    // Deduplicate hooks by type
    // Commands and prompts are deduplicated by their content
    // Callbacks are kept separate (may have same function but different contexts)

    const uniqueCommands = Array.from(
      new Map(
        allMatchingHooks
          .filter(hook => hook.type === "command")
          .map(hook => [hook.command, hook])
      ).values()
    );

    const uniquePrompts = Array.from(
      new Map(
        allMatchingHooks
          .filter(hook => hook.type === "prompt")
          .map(hook => [hook.prompt, hook])
      ).values()
    );

    const callbacks = allMatchingHooks.filter(hook => hook.type === "callback");

    const result = [...uniqueCommands, ...uniquePrompts, ...callbacks];

    m(`Matched ${result.length} unique hooks for query "${matchQuery || "no match query"}" (${allMatchingHooks.length} before deduplication)`);

    return result;
  } catch {
    return [];
  }
}

// ============================================================================
// Abort Signal Management
// ============================================================================

/**
 * Combines multiple abort signals into a single signal
 *
 * Creates a new AbortController that will abort when any of the input
 * signals abort. Returns both the combined signal and a cleanup function
 * to remove event listeners.
 *
 * Original location: line 491403
 * Original name: nB1
 *
 * @param {AbortSignal} signal1 - First abort signal
 * @param {AbortSignal} [signal2] - Second abort signal (optional)
 * @returns {Object} - Object with abortSignal and cleanup function
 *
 * @property {AbortSignal} abortSignal - Combined abort signal
 * @property {Function} cleanup - Function to remove event listeners
 *
 * @example
 * const timeout = AbortSignal.timeout(5000);
 * const userSignal = context.abortController.signal;
 * const { abortSignal, cleanup } = combineAbortSignals(timeout, userSignal);
 *
 * try {
 *   await someOperation(abortSignal);
 * } finally {
 *   cleanup();
 * }
 */
function combineAbortSignals(signal1, signal2) {
  const controller = createAbortController();

  const abortHandler = () => {
    controller.abort();
  };

  // Listen to both signals
  signal1.addEventListener("abort", abortHandler);
  signal2?.addEventListener("abort", abortHandler);

  // Cleanup function to remove listeners
  const cleanup = () => {
    signal1.removeEventListener("abort", abortHandler);
    signal2?.removeEventListener("abort", abortHandler);
  };

  return {
    abortSignal: controller.signal,
    cleanup: cleanup
  };
}

// ============================================================================
// Hook Error Formatting
// ============================================================================

/**
 * Formats a blocking error from a hook
 *
 * Original location: line 491392
 * Already extracted in analysis
 *
 * @param {string} hookName - Name of the hook (e.g., "PreToolUse:Read")
 * @param {Object} error - Error object
 * @param {string} error.blockingError - Blocking error message
 * @returns {string} - Formatted error message
 */
function formatHookBlockingError(hookName, error) {
  return `${hookName} hook error: ${error.blockingError}`;
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  // Core helpers
  buildHookInput,
  getMatchingHooks,
  combineAbortSignals,

  // Pattern matching
  matchesHookPattern,
  getHooksFromSettings,

  // Error formatting
  formatHookBlockingError,

  // Internal helpers (exported for testing)
  getSessionId,
  getTranscriptPath,
  getUserHooks,
  getProjectHooks
};
