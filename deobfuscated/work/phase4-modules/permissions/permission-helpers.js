/**
 * Permission System - Helper Functions
 *
 * Utility functions for permission checking including:
 * - Path expansion and symlink resolution
 * - Windows-specific security pattern detection
 * - Path safety validation
 * - Working directory verification
 * - Permission rule retrieval and matching
 *
 * Original locations:
 * - HGA (getAllPaths): line 3791
 * - Cr2 (checkSuspiciousWindowsPattern): line 495223
 * - PS1 (checkPathSafety): line 495244
 * - VO (isPathInWorkingDirectory): line 495280
 * - Yv (isPathWithinDirectory): line 495283
 * - d4A (getAllWorkingDirectories): line 495277
 * - Vr2 (getPermissionRules): line 495400
 * - urA (getPermissionSuggestions): line 495652
 */

const path = require('path');
const { PATH_SEPARATOR } = require('./permission-types');

// ============================================================================
// External Dependencies (Placeholders)
// ============================================================================

/**
 * TODO: Import these from appropriate modules when available:
 *
 * - resolveAbsolutePath(path) - Resolve to absolute path
 * - getFs() - Get filesystem module
 * - BC(fs, path) - Resolve symlink (returns {resolvedPath, isSymlink})
 * - UB() - Get platform (returns "windows", "mac", "linux")
 * - PT(path) - Transform path (Windows path normalization)
 * - Fr2(base, target) - Get relative path from base to target
 * - KO(path) - Normalize path (removes /private/var/ prefixes on macOS)
 * - d1A(path) - Check if path looks absolute
 * - g00(path, toolType, defaultBehavior) - Get permission rules from config
 * - b0I(pattern, source) - Break rule into {relativePattern, root}
 * - y0I(path) - Check if path requires approval (custom check)
 * - k0I(path) - Check if path is in sensitive location (custom check)
 * - _0I(path) - Check if path is a sensitive file
 * - wk(path) - Get directory from path (dirname)
 * - ScA(directory, destination) - Create add directory suggestion
 * - getHomedir() - Get home directory
 */

// Placeholder implementations
const resolveAbsolutePath = function(filePath) {
  // TODO: Import from filesystem module
  return path.resolve(filePath);
};

const getFs = function() {
  // TODO: Import from filesystem module
  return require('fs');
};

const BC = function(fs, filePath) {
  // TODO: Import from filesystem/symlink module
  // Resolves symlinks and returns {resolvedPath, isSymlink}
  try {
    const stats = fs.lstatSync(filePath);
    if (stats.isSymbolicLink()) {
      const resolved = fs.realpathSync(filePath);
      return { resolvedPath: resolved, isSymlink: true };
    }
  } catch {}
  return { resolvedPath: filePath, isSymlink: false };
};

const UB = function() {
  // TODO: Import from platform detection module
  if (process.platform === 'win32') return 'windows';
  if (process.platform === 'darwin') return 'mac';
  return 'linux';
};

const PT = function(filePath) {
  // TODO: Import from path transformation module
  // Transforms Windows paths (e.g., backslash to forward slash)
  return filePath.replace(/\\/g, '/');
};

const Fr2 = function(base, target) {
  // TODO: Import from path utilities
  return path.relative(base, target);
};

const KO = function(filePath) {
  // TODO: Import from path normalization module
  // Normalizes macOS /private/var/ and /private/tmp/ prefixes
  return filePath
    .replace(/^\/private\/var\//, '/var/')
    .replace(/^\/private\/tmp(\/|$)/, '/tmp$1');
};

const d1A = function(filePath) {
  // TODO: Import from path utilities
  // Checks if path starts with .. (parent directory escape)
  return filePath.startsWith('..');
};

const g00 = function(filePath, toolType, defaultBehavior) {
  // TODO: Import from config/settings module
  // Gets permission rules from user/project config
  // Returns Map of pattern -> rule
  return new Map();
};

const b0I = function(pattern, source) {
  // TODO: Import from permission config module
  // Breaks a rule pattern into relative pattern and root directory
  return {
    relativePattern: pattern,
    root: undefined
  };
};

const y0I = function(filePath) {
  // TODO: Import from file checking module
  // Returns true if path requires manual approval
  return false;
};

const k0I = function(filePath) {
  // TODO: Import from file checking module
  // Returns true if path is in sensitive location
  return false;
};

const _0I = function(filePath) {
  // TODO: Import from file checking module
  // Returns true if file is sensitive (config files, etc.)
  const { SENSITIVE_CONFIG_FILES } = require('./permission-types');
  const basename = path.basename(filePath);
  return SENSITIVE_CONFIG_FILES.includes(basename);
};

const wk = function(filePath) {
  // TODO: Import from path utilities
  return path.dirname(filePath);
};

const ScA = function(directory, destination) {
  // TODO: Import from suggestion builder module
  return {
    type: 'addDirectories',
    directories: [directory],
    destination: destination
  };
};

const getHomedir = function() {
  // TODO: Import from filesystem module
  return require('os').homedir();
};

const getCwd = function() {
  // TODO: Import from filesystem module
  return process.cwd();
};

// ============================================================================
// Path Expansion and Resolution
// ============================================================================

/**
 * Gets all paths that should be checked for permissions
 *
 * Expands a single path into an array containing:
 * 1. The original path
 * 2. The resolved symlink target (if path is a symlink and different from original)
 *
 * This ensures that permission rules apply to both the symlink and its target.
 *
 * Original location: line 3791
 * Original name: HGA
 *
 * @param {string} filePath - Path to expand
 * @returns {Array<string>} - Array of paths to check (includes symlink resolution)
 *
 * @example
 * getAllPaths("/home/user/link-to-file")
 * // Returns: ["/home/user/link-to-file", "/home/user/actual-file"]
 */
function getAllPaths(filePath) {
  const paths = [];
  const fs = getFs();

  // Add original path
  paths.push(filePath);

  // Resolve symlink if applicable
  const { resolvedPath, isSymlink } = BC(fs, filePath);
  if (isSymlink && resolvedPath !== filePath) {
    paths.push(resolvedPath);
  }

  return paths;
}

// ============================================================================
// Windows Security Pattern Detection
// ============================================================================

/**
 * Checks if a path contains suspicious Windows-specific patterns
 *
 * Detects potentially dangerous Windows path patterns that require
 * manual approval:
 *
 * 1. Alternate Data Streams (ADS): "file.txt:hidden:$DATA"
 * 2. 8.3 Short Names: "PROGRA~1" (tilde with digit)
 * 3. Long Path Prefixes: "\\?\\" or "///?/"
 * 4. Device Namespace: "\\.\\" or "//.//"
 * 5. Trailing dots/spaces: Security risk on Windows
 * 6. Reserved device names: CON, PRN, AUX, NUL, COM1-9, LPT1-9
 * 7. Three or more consecutive dots: "../../../" path traversal attempts
 *
 * Original location: line 495223
 * Original name: Cr2
 *
 * @param {string} filePath - Path to check
 * @returns {boolean} - True if path contains suspicious patterns
 *
 * @example
 * checkSuspiciousWindowsPattern("file.txt:hidden") // true (ADS)
 * checkSuspiciousWindowsPattern("PROGRA~1") // true (short name)
 * checkSuspiciousWindowsPattern("normal/path") // false
 */
function checkSuspiciousWindowsPattern(filePath) {
  // Check for Alternate Data Streams (colon after position 2)
  // Position 2 allows for drive letters like "C:"
  if (filePath.indexOf(':', 2) !== -1) {
    return true;
  }

  // Check for 8.3 short names (tilde followed by digit)
  if (/~\d/.test(filePath)) {
    return true;
  }

  // Check for long path prefixes or device namespace
  if (
    filePath.startsWith('\\\\?\\') ||
    filePath.startsWith('\\\\.\\') ||
    filePath.startsWith('//?/') ||
    filePath.startsWith('//.//')
  ) {
    return true;
  }

  // Check for trailing dots or spaces (security risk on Windows)
  if (/[.\s]+$/.test(filePath)) {
    return true;
  }

  // Check for Windows reserved device names
  if (/\.(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i.test(filePath)) {
    return true;
  }

  // Check for three or more consecutive dots (path traversal)
  if (/\.{3,}/.test(filePath)) {
    return true;
  }

  return false;
}

// ============================================================================
// Path Safety Validation
// ============================================================================

/**
 * Checks if a path is safe to write to
 *
 * Performs multiple safety checks:
 * 1. Windows suspicious patterns (ADS, short names, etc.)
 * 2. Custom approval requirements
 * 3. Sensitive file detection
 *
 * Original location: line 495244
 * Original name: PS1
 *
 * @param {string} filePath - Path to check
 * @returns {PathSafetyResult} - Safety result with explanation
 *
 * @example
 * checkPathSafety("/home/user/file.txt")
 * // Returns: { safe: true }
 *
 * checkPathSafety("/home/user/.gitconfig")
 * // Returns: {
 * //   safe: false,
 * //   message: "Claude requested permissions to edit /home/user/.gitconfig which is a sensitive file."
 * // }
 */
function checkPathSafety(filePath) {
  const paths = getAllPaths(filePath);

  // Check for Windows suspicious patterns
  for (const p of paths) {
    if (checkSuspiciousWindowsPattern(p)) {
      return {
        safe: false,
        message: `Claude requested permissions to write to ${filePath}, which contains a suspicious Windows path pattern that requires manual approval.`
      };
    }
  }

  // Check for paths requiring manual approval
  for (const p of paths) {
    if (y0I(p)) {
      return {
        safe: false,
        message: `Claude requested permissions to write to ${filePath}, but you haven't granted it yet.`
      };
    }
  }

  // Check for sensitive locations (k0I check appears to be no-op in original)
  for (const p of paths) {
    if (k0I(p)) {
      // No-op in original code (line 495263)
    }
  }

  // Check for sensitive files
  for (const p of paths) {
    if (_0I(p)) {
      return {
        safe: false,
        message: `Claude requested permissions to edit ${filePath} which is a sensitive file.`
      };
    }
  }

  return { safe: true };
}

// ============================================================================
// Working Directory Verification
// ============================================================================

/**
 * Gets all allowed working directories
 *
 * Returns the set of directories that are considered "working directories"
 * where operations are generally allowed:
 * 1. Home directory
 * 2. Additional working directories from configuration
 *
 * Original location: line 495277
 * Original name: d4A
 *
 * @param {PermissionContext} context - Permission context
 * @returns {Set<string>} - Set of allowed working directory paths
 */
function getAllWorkingDirectories(context) {
  return new Set([
    getHomedir(),
    ...context.additionalWorkingDirectories.keys()
  ]);
}

/**
 * Checks if a path is within a specific directory
 *
 * Performs normalized path comparison to determine if target path
 * is within base directory. Handles macOS /private/ prefix normalization.
 *
 * Original location: line 495283
 * Original name: Yv
 *
 * @param {string} targetPath - Path to check
 * @param {string} baseDirectory - Base directory
 * @returns {boolean} - True if target is within base directory
 *
 * @example
 * isPathWithinDirectory("/home/user/project/file.txt", "/home/user/project")
 * // Returns: true
 *
 * isPathWithinDirectory("/etc/passwd", "/home/user/project")
 * // Returns: false
 */
function isPathWithinDirectory(targetPath, baseDirectory) {
  const resolvedTarget = resolveAbsolutePath(targetPath);
  const resolvedBase = resolveAbsolutePath(baseDirectory);

  // Normalize macOS /private/ prefixes
  const normalizedTarget = resolvedTarget
    .replace(/^\/private\/var\//, '/var/')
    .replace(/^\/private\/tmp(\/|$)/, '/tmp$1');

  const normalizedBase = resolvedBase
    .replace(/^\/private\/var\//, '/var/')
    .replace(/^\/private\/tmp(\/|$)/, '/tmp$1');

  // Further normalize paths
  const finalTarget = KO(normalizedTarget);
  const finalBase = KO(normalizedBase);

  // Calculate relative path
  const relativePath = Fr2(finalBase, finalTarget);

  // Empty string means exact match (target === base)
  if (relativePath === '') {
    return true;
  }

  // Check if relative path escapes parent
  if (d1A(relativePath)) {
    return false;
  }

  // Check if path is relative (not absolute)
  // Absolute paths mean target is not within base
  return !path.isAbsolute(relativePath);
}

/**
 * Checks if a path is within allowed working directories
 *
 * Verifies that all expanded paths (including symlink targets)
 * are within at least one allowed working directory.
 *
 * Original location: line 495280
 * Original name: VO
 *
 * @param {string} filePath - Path to check
 * @param {PermissionContext} context - Permission context
 * @returns {boolean} - True if all paths are within working directories
 *
 * @example
 * isPathInWorkingDirectory("/home/user/project/file.txt", context)
 * // Returns: true (if /home/user is a working directory)
 *
 * isPathInWorkingDirectory("/etc/passwd", context)
 * // Returns: false
 */
function isPathInWorkingDirectory(filePath, context) {
  const paths = getAllPaths(filePath);
  const workingDirs = Array.from(getAllWorkingDirectories(context));

  // All paths (including symlink targets) must be within working directories
  return paths.every(p =>
    workingDirs.some(workingDir =>
      isPathWithinDirectory(p, workingDir)
    )
  );
}

// ============================================================================
// Permission Rules
// ============================================================================

/**
 * Gets permission rules for a path
 *
 * Retrieves and organizes permission rules from configuration,
 * grouping them by root directory for efficient pattern matching.
 *
 * Returns a Map of:
 *   root directory -> Map of (pattern -> rule)
 *
 * Original location: line 495400
 * Original name: Vr2
 *
 * @param {string} filePath - Path to get rules for
 * @param {PermissionContext} context - Permission context
 * @param {'read'|'edit'} action - Permission action type
 * @returns {Map<string, Map<string, PermissionRule>>} - Rules grouped by root
 */
function getPermissionRules(filePath, context, action) {
  // Map action to tool type
  const toolType = (() => {
    switch (action) {
      case 'edit':
        return 'edit'; // TOOL_EDIT
      case 'read':
        return 'read'; // TOOL_READ
    }
  })();

  // Get rules from configuration
  const rules = g00(filePath, toolType, action);

  // Group rules by root directory
  const groupedRules = new Map();

  for (const [pattern, rule] of rules.entries()) {
    const { relativePattern, root } = b0I(pattern, rule.source);

    let rulesForRoot = groupedRules.get(root);
    if (rulesForRoot === undefined) {
      rulesForRoot = new Map();
      groupedRules.set(root, rulesForRoot);
    }

    rulesForRoot.set(relativePattern, rule);
  }

  return groupedRules;
}

// ============================================================================
// Permission Suggestions
// ============================================================================

/**
 * Generates permission suggestions for user
 *
 * When permission is denied, suggests actions user can take to allow the operation:
 * - For reads outside working dir: Suggest adding directory
 * - For writes: Suggest enabling acceptEdits mode and/or adding directory
 *
 * Original location: line 495652
 * Original name: urA
 *
 * @param {string} filePath - Path that was denied
 * @param {'read'|'write'|'create'} action - Action that was denied
 * @param {PermissionContext} context - Permission context
 * @returns {Array<PermissionSuggestion>} - Array of suggestions
 *
 * @example
 * getPermissionSuggestions("/etc/passwd", "read", context)
 * // Returns: [{ type: 'addDirectories', directories: ['/etc'], destination: 'session' }]
 */
function getPermissionSuggestions(filePath, action, context) {
  const outsideWorkingDir = !isPathInWorkingDirectory(filePath, context);

  // Read operations outside working directory
  if (action === 'read' && outsideWorkingDir) {
    const directory = wk(filePath);
    const suggestion = ScA(directory, 'session');
    if (suggestion) {
      return [suggestion];
    } else {
      return [];
    }
  }

  // Write/create operations
  if (action === 'write' || action === 'create') {
    const suggestions = [{
      type: 'setMode',
      mode: 'acceptEdits',
      destination: 'session'
    }];

    // Also suggest adding directory if outside working dir
    if (outsideWorkingDir) {
      const directory = wk(filePath);
      suggestions.push({
        type: 'addDirectories',
        directories: [directory],
        destination: 'session'
      });
    }

    return suggestions;
  }

  // Default suggestion
  return [{
    type: 'setMode',
    mode: 'acceptEdits',
    destination: 'session'
  }];
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  // Path expansion
  getAllPaths,

  // Security checks
  checkSuspiciousWindowsPattern,
  checkPathSafety,

  // Working directory verification
  getAllWorkingDirectories,
  isPathWithinDirectory,
  isPathInWorkingDirectory,

  // Permission rules
  getPermissionRules,

  // Suggestions
  getPermissionSuggestions,

  // Internal helpers (exported for testing)
  resolveAbsolutePath,
  getHomedir,
  getCwd
};
