/**
 * Permission System - Permission Checkers
 *
 * Core permission checking logic for read and write operations.
 *
 * Permission Check Flow:
 * 1. Tool requests permission (Read, Write, Edit, etc.)
 * 2. System calls checkReadOnlyToolPermissions or checkWriteToolPermissions
 * 3. Checks are performed in order of restrictiveness:
 *    a. Check for suspicious patterns (Windows security)
 *    b. Check explicit deny rules
 *    c. Check explicit ask rules
 *    d. Check if path is in working directory
 *    e. Check explicit allow rules
 *    f. Default to ask
 * 4. Returns {behavior, message, decisionReason, suggestions}
 *
 * Original locations:
 * - checkDirectoryPermission: line 495425
 * - checkReadOnlyToolPermissions: line 495469
 * - checkWriteToolPermissions: line 495574
 */

const path = require('path');
const {
  PATH_SEPARATOR,
  PERMISSION_ALLOW,
  PERMISSION_DENY,
  PERMISSION_ASK,
  PERMISSION_MODE_ACCEPT_EDITS
} = require('./permission-types');

const {
  getAllPaths,
  checkSuspiciousWindowsPattern,
  checkPathSafety,
  isPathInWorkingDirectory,
  getPermissionRules,
  getPermissionSuggestions,
  resolveAbsolutePath,
  getCwd
} = require('./permission-helpers');

// ============================================================================
// External Dependencies (Placeholders)
// ============================================================================

/**
 * TODO: Import these from appropriate modules when available:
 *
 * - UB() - Get platform (returns "windows", "mac", "linux")
 * - PT(path) - Path transformation (Windows backslash to forward slash)
 * - Wr2.default() - Ignore pattern matcher (library like 'ignore')
 * - Fr2(base, target) - Get relative path
 * - v$A(...paths) - Join paths (path.join equivalent)
 * - mU(dir) - Normalize directory path
 * - dB() - Get data directory
 * - L0() - Get session ID
 */

const UB = function() {
  // TODO: Import from platform detection module
  if (process.platform === 'win32') return 'windows';
  if (process.platform === 'darwin') return 'mac';
  return 'linux';
};

const PT = function(filePath) {
  // TODO: Import from path transformation module
  return filePath.replace(/\\/g, '/');
};

const Wr2 = {
  // TODO: Import ignore library (npm package 'ignore')
  default: function() {
    // Placeholder for ignore() pattern matcher
    return {
      add: function(patterns) {
        return {
          test: function(filePath) {
            // Returns {ignored: boolean, rule: {pattern: string}}
            return { ignored: false, rule: null };
          }
        };
      }
    };
  }
};

const Fr2 = function(base, target) {
  // TODO: Import from path utilities
  return path.relative(base, target);
};

const v$A = function(...paths) {
  // TODO: Import from path utilities
  return path.join(...paths);
};

const mU = function(dir) {
  // TODO: Import from path normalization
  return dir;
};

const dB = function() {
  // TODO: Import from config/paths module
  // Returns data directory for Claude Code
  return path.join(require('os').homedir(), '.claude-code', 'data');
};

const L0 = function() {
  // TODO: Import from session module
  // Returns current session ID
  return 'session_' + Date.now();
};

const getHomedir = function() {
  // TODO: Import from filesystem module
  return require('os').homedir();
};

// ============================================================================
// Directory Permission Checking
// ============================================================================

/**
 * Checks if a path matches permission rules for a directory
 *
 * Uses ignore-style pattern matching to check if a path matches
 * any configured permission rules. Handles:
 * - Root-relative patterns
 * - Wildcard patterns (e.g., "src/**")
 * - Windows path normalization
 *
 * Returns the matching rule if found, or null if no match.
 *
 * Original location: line 495425
 * Original name: checkDirectoryPermission
 *
 * @param {string} filePath - Path to check
 * @param {PermissionContext} context - Permission context
 * @param {'read'|'edit'} action - Permission action
 * @param {'allow'|'deny'|'ask'} behavior - Behavior to match
 * @returns {PermissionRule|null} - Matching rule or null
 *
 * @example
 * checkDirectoryPermission("/home/user/project/src/file.js", context, "read", "deny")
 * // Returns: { pattern: "src/**", behavior: "deny" } (if rule matches)
 * // Returns: null (if no matching deny rule)
 */
function checkDirectoryPermission(filePath, context, action, behavior) {
  // Resolve to absolute path
  let resolvedPath = resolveAbsolutePath(filePath);

  // On Windows, normalize backslashes to forward slashes
  if (UB() === 'windows' && resolvedPath.includes('\\')) {
    resolvedPath = PT(resolvedPath);
  }

  // Get permission rules grouped by root directory
  const rulesByRoot = getPermissionRules(context, action, behavior);

  // Check each root directory's rules
  for (const [root, rulesMap] of rulesByRoot.entries()) {
    // Extract patterns from rules
    const patterns = Array.from(rulesMap.keys()).map(pattern => {
      let normalizedPattern = pattern;

      // Handle root-relative patterns (starting with PATH_SEPARATOR)
      if (root === PATH_SEPARATOR && pattern.startsWith(PATH_SEPARATOR)) {
        normalizedPattern = pattern.slice(1);
      }

      // Remove trailing /** for directory matching
      if (normalizedPattern.endsWith('/**')) {
        normalizedPattern = normalizedPattern.slice(0, -3);
      }

      return normalizedPattern;
    });

    // Create ignore pattern matcher
    const matcher = Wr2.default().add(patterns);

    // Calculate relative path from root to target
    const relativePath = Fr2(root ?? getCwd(), resolvedPath ?? getCwd());

    // Skip if path escapes parent directory
    if (relativePath.startsWith(`..${PATH_SEPARATOR}`)) {
      continue;
    }

    // Skip empty relative paths
    if (!relativePath) {
      continue;
    }

    // Test if path matches any pattern
    const matchResult = matcher.test(relativePath);

    if (matchResult.ignored && matchResult.rule) {
      // Found a matching rule
      let matchedPattern = matchResult.rule.pattern;

      // Try to find the rule with /** suffix first
      const patternWithWildcard = matchedPattern + '/**';
      if (rulesMap.has(patternWithWildcard)) {
        return rulesMap.get(patternWithWildcard) ?? null;
      }

      // Handle root-relative patterns
      if (root === PATH_SEPARATOR && !matchedPattern.startsWith(PATH_SEPARATOR)) {
        matchedPattern = PATH_SEPARATOR + matchedPattern;
        const rootRelativeWithWildcard = matchedPattern + '/**';
        if (rulesMap.has(rootRelativeWithWildcard)) {
          return rulesMap.get(rootRelativeWithWildcard) ?? null;
        }
      }

      // Return the exact pattern match
      return rulesMap.get(matchedPattern) ?? null;
    }
  }

  return null;
}

// ============================================================================
// Read Permission Checking
// ============================================================================

/**
 * Checks permissions for read-only tool operations
 *
 * Performs comprehensive permission checks for read operations:
 * 1. Verify tool has getPath method
 * 2. Check for suspicious Windows patterns
 * 3. Check explicit deny rules
 * 4. Check explicit ask rules
 * 5. Check if write permissions allow (writes imply reads)
 * 6. Check if path is in working directory
 * 7. Allow bash output files from current session
 * 8. Allow session memory files
 * 9. Check explicit allow rules
 * 10. Default to ask with suggestions
 *
 * Original location: line 495469
 * Original name: checkReadOnlyToolPermissions
 *
 * @param {Object} tool - Tool definition with getPath method
 * @param {Object} toolInput - Tool input parameters
 * @param {PermissionContext} context - Permission context
 * @returns {PermissionResult} - Permission decision
 *
 * @example
 * checkReadOnlyToolPermissions(
 *   { name: "Read", getPath: (input) => input.file_path },
 *   { file_path: "/home/user/file.txt" },
 *   context
 * )
 * // Returns: { behavior: "allow", updatedInput: {...}, decisionReason: {...} }
 */
function checkReadOnlyToolPermissions(tool, toolInput, context) {
  // Verify tool has getPath method
  if (typeof tool.getPath !== 'function') {
    return {
      behavior: PERMISSION_ASK,
      message: `Claude requested permissions to use ${tool.name}, but you haven't granted it yet.`
    };
  }

  const filePath = tool.getPath(toolInput);
  const allPaths = getAllPaths(filePath);

  // Check for suspicious Windows patterns
  for (const p of allPaths) {
    if (checkSuspiciousWindowsPattern(p)) {
      return {
        behavior: PERMISSION_ASK,
        message: `Claude requested permissions to read from ${filePath}, which contains a suspicious Windows path pattern that requires manual approval.`,
        decisionReason: {
          type: 'other',
          reason: 'Path contains suspicious Windows-specific patterns (alternate data streams, short names, long path prefixes, or three or more consecutive dots) that require manual verification'
        }
      };
    }
  }

  // Check explicit deny rules
  for (const p of allPaths) {
    const denyRule = checkDirectoryPermission(p, context, 'read', 'deny');
    if (denyRule) {
      return {
        behavior: PERMISSION_DENY,
        message: `Permission to read ${filePath} has been denied.`,
        decisionReason: {
          type: 'rule',
          rule: denyRule
        }
      };
    }
  }

  // Check explicit ask rules
  for (const p of allPaths) {
    const askRule = checkDirectoryPermission(p, context, 'read', 'ask');
    if (askRule) {
      return {
        behavior: PERMISSION_ASK,
        message: `Claude requested permissions to read from ${filePath}, but you haven't granted it yet.`,
        decisionReason: {
          type: 'rule',
          rule: askRule
        }
      };
    }
  }

  // Check if write permissions allow (writes imply reads)
  const writePermission = checkWriteToolPermissions(tool, toolInput, context);
  if (writePermission.behavior === PERMISSION_ALLOW) {
    return writePermission;
  }

  // Check if path is in working directory
  if (isPathInWorkingDirectory(filePath, context)) {
    return {
      behavior: PERMISSION_ALLOW,
      updatedInput: toolInput,
      decisionReason: {
        type: 'mode',
        mode: 'default'
      }
    };
  }

  // Allow bash output files from current session
  const resolvedPath = resolveAbsolutePath(filePath);
  const bashOutputDir = v$A(mU(getHomedir()), 'bash-outputs', L0());
  if (resolvedPath.startsWith(bashOutputDir)) {
    return {
      behavior: PERMISSION_ALLOW,
      updatedInput: toolInput,
      decisionReason: {
        type: 'other',
        reason: 'Bash output files from current session are allowed for reading'
      }
    };
  }

  // Allow session memory files
  const sessionMemoryDir = v$A(dB(), 'session-memory');
  if (resolvedPath.startsWith(sessionMemoryDir)) {
    return {
      behavior: PERMISSION_ALLOW,
      updatedInput: toolInput,
      decisionReason: {
        type: 'other',
        reason: 'Session memory files are allowed for reading'
      }
    };
  }

  // Check explicit allow rules
  const allowRule = checkDirectoryPermission(filePath, context, 'read', 'allow');
  if (allowRule) {
    return {
      behavior: PERMISSION_ALLOW,
      updatedInput: toolInput,
      decisionReason: {
        type: 'rule',
        rule: allowRule
      }
    };
  }

  // Default to ask with suggestions
  return {
    behavior: PERMISSION_ASK,
    message: `Claude requested permissions to read from ${filePath}, but you haven't granted it yet.`,
    suggestions: getPermissionSuggestions(filePath, 'read', context),
    decisionReason: {
      type: 'workingDir',
      reason: 'Path is outside allowed working directories'
    }
  };
}

// ============================================================================
// Write Permission Checking
// ============================================================================

/**
 * Checks permissions for write/edit tool operations
 *
 * Performs comprehensive permission checks for write operations:
 * 1. Verify tool has getPath method
 * 2. Check explicit deny rules
 * 3. Check path safety (suspicious patterns, sensitive files)
 * 4. Check explicit ask rules
 * 5. Check if in acceptEdits mode and within working directory
 * 6. Check explicit allow rules
 * 7. Default to ask with suggestions
 *
 * Original location: line 495574
 * Original name: checkWriteToolPermissions
 *
 * @param {Object} tool - Tool definition with getPath method
 * @param {Object} toolInput - Tool input parameters
 * @param {PermissionContext} context - Permission context
 * @returns {PermissionResult} - Permission decision
 *
 * @example
 * checkWriteToolPermissions(
 *   { name: "Write", getPath: (input) => input.file_path },
 *   { file_path: "/home/user/file.txt" },
 *   context
 * )
 * // Returns: { behavior: "ask", message: "...", suggestions: [...] }
 */
function checkWriteToolPermissions(tool, toolInput, context) {
  // Verify tool has getPath method
  if (typeof tool.getPath !== 'function') {
    return {
      behavior: PERMISSION_ASK,
      message: `Claude requested permissions to use ${tool.name}, but you haven't granted it yet.`
    };
  }

  const filePath = tool.getPath(toolInput);
  const allPaths = getAllPaths(filePath);

  // Check explicit deny rules
  for (const p of allPaths) {
    const denyRule = checkDirectoryPermission(p, context, 'edit', 'deny');
    if (denyRule) {
      return {
        behavior: PERMISSION_DENY,
        message: `Permission to edit ${filePath} has been denied.`,
        decisionReason: {
          type: 'rule',
          rule: denyRule
        }
      };
    }
  }

  // Check path safety
  const safetyCheck = checkPathSafety(filePath);
  if (!safetyCheck.safe) {
    return {
      behavior: PERMISSION_ASK,
      message: safetyCheck.message,
      decisionReason: {
        type: 'other',
        reason: safetyCheck.message
      }
    };
  }

  // Check explicit ask rules
  for (const p of allPaths) {
    const askRule = checkDirectoryPermission(p, context, 'edit', 'ask');
    if (askRule) {
      return {
        behavior: PERMISSION_ASK,
        message: `Claude requested permissions to write to ${filePath}, but you haven't granted it yet.`,
        decisionReason: {
          type: 'rule',
          rule: askRule
        }
      };
    }
  }

  // Check if in acceptEdits mode and within working directory
  const inWorkingDirectory = isPathInWorkingDirectory(filePath, context);
  if (context.mode === PERMISSION_MODE_ACCEPT_EDITS && inWorkingDirectory) {
    return {
      behavior: PERMISSION_ALLOW,
      updatedInput: toolInput,
      decisionReason: {
        type: 'mode',
        mode: context.mode
      }
    };
  }

  // Check explicit allow rules
  const allowRule = checkDirectoryPermission(filePath, context, 'edit', 'allow');
  if (allowRule) {
    return {
      behavior: PERMISSION_ALLOW,
      updatedInput: toolInput,
      decisionReason: {
        type: 'rule',
        rule: allowRule
      }
    };
  }

  // Default to ask with suggestions
  return {
    behavior: PERMISSION_ASK,
    message: `Claude requested permissions to write to ${filePath}, but you haven't granted it yet.`,
    suggestions: getPermissionSuggestions(filePath, 'write', context),
    decisionReason: !inWorkingDirectory ? {
      type: 'workingDir',
      reason: 'Path is outside allowed working directories'
    } : undefined
  };
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  checkDirectoryPermission,
  checkReadOnlyToolPermissions,
  checkWriteToolPermissions
};
