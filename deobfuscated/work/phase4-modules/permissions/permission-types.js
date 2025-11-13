/**
 * Permission System - Types and Constants
 *
 * Defines the core types and constants for the permission system.
 * The permission system controls access to read and write operations
 * on files and directories based on user-configured rules and safety checks.
 *
 * Original locations:
 * - VE (path separator): line 495708
 * - hS1 (sensitive files): line 495706
 * - gS1 (sensitive directories): line 495707
 * - TOOL_READ, TOOL_EDIT: referenced in line 495404-495406
 */

const path = require('path');

// ============================================================================
// Path Constants
// ============================================================================

/**
 * Platform-specific path separator
 *
 * Original location: line 495708
 * Original name: VE
 *
 * @type {string}
 * @constant
 */
const PATH_SEPARATOR = path.sep;

// ============================================================================
// Sensitive Files and Directories
// ============================================================================

/**
 * Sensitive configuration files that require manual approval for writes
 *
 * These files can alter system behavior or security settings and
 * require explicit user permission before modification.
 *
 * Original location: line 495706
 * Original name: hS1
 *
 * @type {Array<string>}
 * @constant
 */
const SENSITIVE_CONFIG_FILES = [
  '.gitconfig',      // Git global configuration
  '.gitmodules',     // Git submodule configuration
  '.bashrc',         // Bash shell configuration
  '.bash_profile',   // Bash login shell configuration
  '.zshrc',          // Zsh shell configuration
  '.zprofile',       // Zsh login shell configuration
  '.profile',        // POSIX shell profile
  '.ripgreprc',      // Ripgrep configuration
  '.mcp.json'        // MCP configuration
];

/**
 * Sensitive directories that require careful permission handling
 *
 * Original location: line 495707
 * Original name: gS1
 *
 * @type {Array<string>}
 * @constant
 */
const SENSITIVE_DIRECTORIES = [
  '.git',      // Git repository data
  '.vscode',   // VS Code configuration
  '.idea'      // JetBrains IDE configuration
];

// ============================================================================
// Permission Types
// ============================================================================

/**
 * Permission action types
 */
const PERMISSION_ACTION_READ = 'read';
const PERMISSION_ACTION_EDIT = 'edit';

/**
 * Tool category constants for permission rules
 *
 * Original location: referenced at lines 495404-495406
 * Original names: TOOL_READ, TOOL_EDIT
 */
const TOOL_READ = 'read';
const TOOL_EDIT = 'edit';

// ============================================================================
// Permission Behaviors
// ============================================================================

/**
 * Permission decision behaviors
 *
 * These match the hook system permission behaviors:
 * - allow: Grant permission without asking
 * - deny: Deny permission
 * - ask: Prompt user for decision
 */
const PERMISSION_ALLOW = 'allow';
const PERMISSION_DENY = 'deny';
const PERMISSION_ASK = 'ask';

const PERMISSION_BEHAVIORS = [
  PERMISSION_ALLOW,
  PERMISSION_DENY,
  PERMISSION_ASK
];

// ============================================================================
// Permission Decision Reason Types
// ============================================================================

/**
 * Types of decision reasons for permission results
 */
const DECISION_TYPE_RULE = 'rule';         // Matched a permission rule
const DECISION_TYPE_MODE = 'mode';         // Based on permission mode
const DECISION_TYPE_WORKING_DIR = 'workingDir';  // Working directory check
const DECISION_TYPE_OTHER = 'other';       // Other reason

// ============================================================================
// Permission Modes
// ============================================================================

/**
 * Permission modes that affect how tools are allowed to run
 */
const PERMISSION_MODE_DEFAULT = 'default';
const PERMISSION_MODE_ACCEPT_EDITS = 'acceptEdits';
const PERMISSION_MODE_BYPASS = 'bypassPermissions';

// ============================================================================
// Suggestion Types
// ============================================================================

/**
 * Types of permission suggestions that can be offered to users
 */
const SUGGESTION_TYPE_SET_MODE = 'setMode';
const SUGGESTION_TYPE_ADD_DIRECTORIES = 'addDirectories';

// ============================================================================
// Type Definitions (JSDoc)
// ============================================================================

/**
 * @typedef {Object} PermissionRule
 * @property {string} pattern - File pattern (glob or path)
 * @property {'allow'|'deny'|'ask'} behavior - Permission behavior
 * @property {string} [source] - Source of the rule (user/project)
 * @property {string} [root] - Root directory for the rule
 */

/**
 * @typedef {Object} PermissionContext
 * @property {string} mode - Current permission mode
 * @property {Map<string, any>} additionalWorkingDirectories - Additional allowed directories
 * @property {Object} [other] - Other context-specific data
 */

/**
 * @typedef {Object} PermissionResult
 * @property {'allow'|'deny'|'ask'} behavior - Permission decision
 * @property {string} [message] - Message to display to user
 * @property {Object} [updatedInput] - Modified tool input (if behavior is allow)
 * @property {PermissionDecisionReason} [decisionReason] - Reason for decision
 * @property {Array<PermissionSuggestion>} [suggestions] - Suggestions for user
 */

/**
 * @typedef {Object} PermissionDecisionReason
 * @property {'rule'|'mode'|'workingDir'|'other'} type - Type of reason
 * @property {PermissionRule} [rule] - Rule that triggered decision (if type is 'rule')
 * @property {string} [mode] - Permission mode (if type is 'mode')
 * @property {string} [reason] - Human-readable reason (if type is 'other')
 */

/**
 * @typedef {Object} PermissionSuggestion
 * @property {'setMode'|'addDirectories'} type - Type of suggestion
 * @property {string} [mode] - Mode to set (for setMode)
 * @property {Array<string>} [directories] - Directories to add (for addDirectories)
 * @property {'session'|'project'|'user'} destination - Where to apply suggestion
 */

/**
 * @typedef {Object} PathSafetyResult
 * @property {boolean} safe - Whether the path is safe to write to
 * @property {string} [message] - Message explaining why path is unsafe
 */

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Checks if a permission behavior is valid
 *
 * @param {string} behavior - Behavior to check
 * @returns {boolean} - True if valid
 */
function isValidPermissionBehavior(behavior) {
  return PERMISSION_BEHAVIORS.includes(behavior);
}

/**
 * Gets a human-readable description of a permission action
 *
 * @param {string} action - Permission action
 * @returns {string} - Human-readable description
 */
function getPermissionActionDescription(action) {
  const descriptions = {
    [PERMISSION_ACTION_READ]: 'Read access',
    [PERMISSION_ACTION_EDIT]: 'Write/edit access'
  };
  return descriptions[action] || action;
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  // Path constants
  PATH_SEPARATOR,

  // Sensitive files and directories
  SENSITIVE_CONFIG_FILES,
  SENSITIVE_DIRECTORIES,

  // Permission types
  PERMISSION_ACTION_READ,
  PERMISSION_ACTION_EDIT,
  TOOL_READ,
  TOOL_EDIT,

  // Permission behaviors
  PERMISSION_ALLOW,
  PERMISSION_DENY,
  PERMISSION_ASK,
  PERMISSION_BEHAVIORS,

  // Decision reason types
  DECISION_TYPE_RULE,
  DECISION_TYPE_MODE,
  DECISION_TYPE_WORKING_DIR,
  DECISION_TYPE_OTHER,

  // Permission modes
  PERMISSION_MODE_DEFAULT,
  PERMISSION_MODE_ACCEPT_EDITS,
  PERMISSION_MODE_BYPASS,

  // Suggestion types
  SUGGESTION_TYPE_SET_MODE,
  SUGGESTION_TYPE_ADD_DIRECTORIES,

  // Helper functions
  isValidPermissionBehavior,
  getPermissionActionDescription
};
