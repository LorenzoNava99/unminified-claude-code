/**
 * Permission System - Main Export
 *
 * Central export point for all permission system functionality.
 *
 * The permission system controls access to file read and write operations,
 * ensuring that Claude Code only operates on files that users have explicitly
 * allowed or are within configured working directories.
 *
 * Modules:
 * - permission-types: Constants, type definitions, sensitive files list
 * - permission-helpers: Path expansion, security checks, working directory verification
 * - permission-checker: Main permission checking logic for read/write operations
 *
 * Permission Flow:
 * 1. Tool execution requests permission check
 * 2. Tool input is analyzed to extract file path
 * 3. Permission rules are matched against path
 * 4. Security checks are performed (Windows patterns, sensitive files)
 * 5. Working directory verification
 * 6. Result returned: {behavior: 'allow'|'deny'|'ask', message, suggestions}
 */

// Types and constants
const permissionTypes = require('./permission-types');

// Helper functions
const permissionHelpers = require('./permission-helpers');

// Permission checkers
const permissionChecker = require('./permission-checker');

// ============================================================================
// Re-export everything for convenience
// ============================================================================

module.exports = {
  // === Types and Constants ===
  // Path constants
  PATH_SEPARATOR: permissionTypes.PATH_SEPARATOR,

  // Sensitive files and directories
  SENSITIVE_CONFIG_FILES: permissionTypes.SENSITIVE_CONFIG_FILES,
  SENSITIVE_DIRECTORIES: permissionTypes.SENSITIVE_DIRECTORIES,

  // Permission types
  PERMISSION_ACTION_READ: permissionTypes.PERMISSION_ACTION_READ,
  PERMISSION_ACTION_EDIT: permissionTypes.PERMISSION_ACTION_EDIT,
  TOOL_READ: permissionTypes.TOOL_READ,
  TOOL_EDIT: permissionTypes.TOOL_EDIT,

  // Permission behaviors
  PERMISSION_ALLOW: permissionTypes.PERMISSION_ALLOW,
  PERMISSION_DENY: permissionTypes.PERMISSION_DENY,
  PERMISSION_ASK: permissionTypes.PERMISSION_ASK,
  PERMISSION_BEHAVIORS: permissionTypes.PERMISSION_BEHAVIORS,

  // Decision reason types
  DECISION_TYPE_RULE: permissionTypes.DECISION_TYPE_RULE,
  DECISION_TYPE_MODE: permissionTypes.DECISION_TYPE_MODE,
  DECISION_TYPE_WORKING_DIR: permissionTypes.DECISION_TYPE_WORKING_DIR,
  DECISION_TYPE_OTHER: permissionTypes.DECISION_TYPE_OTHER,

  // Permission modes
  PERMISSION_MODE_DEFAULT: permissionTypes.PERMISSION_MODE_DEFAULT,
  PERMISSION_MODE_ACCEPT_EDITS: permissionTypes.PERMISSION_MODE_ACCEPT_EDITS,
  PERMISSION_MODE_BYPASS: permissionTypes.PERMISSION_MODE_BYPASS,

  // Suggestion types
  SUGGESTION_TYPE_SET_MODE: permissionTypes.SUGGESTION_TYPE_SET_MODE,
  SUGGESTION_TYPE_ADD_DIRECTORIES: permissionTypes.SUGGESTION_TYPE_ADD_DIRECTORIES,

  // Type validation
  isValidPermissionBehavior: permissionTypes.isValidPermissionBehavior,
  getPermissionActionDescription: permissionTypes.getPermissionActionDescription,

  // === Helper Functions ===
  // Path expansion
  getAllPaths: permissionHelpers.getAllPaths,

  // Security checks
  checkSuspiciousWindowsPattern: permissionHelpers.checkSuspiciousWindowsPattern,
  checkPathSafety: permissionHelpers.checkPathSafety,

  // Working directory verification
  getAllWorkingDirectories: permissionHelpers.getAllWorkingDirectories,
  isPathWithinDirectory: permissionHelpers.isPathWithinDirectory,
  isPathInWorkingDirectory: permissionHelpers.isPathInWorkingDirectory,

  // Permission rules
  getPermissionRules: permissionHelpers.getPermissionRules,

  // Suggestions
  getPermissionSuggestions: permissionHelpers.getPermissionSuggestions,

  // === Permission Checkers ===
  checkDirectoryPermission: permissionChecker.checkDirectoryPermission,
  checkReadOnlyToolPermissions: permissionChecker.checkReadOnlyToolPermissions,
  checkWriteToolPermissions: permissionChecker.checkWriteToolPermissions
};
