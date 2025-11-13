/**
 * Filesystem Utilities
 *
 * Core filesystem operations including:
 * - Current working directory management
 * - Home directory access
 * - Filesystem module access
 * - Symlink resolution
 *
 * Original locations:
 * - getCwd: line 56190
 * - r71 (internal getCwd): line 56187
 * - oy (get stored cwd): line 4173
 * - getHomedir: line 4170
 * - getFs: line 3804
 * - BC (resolveSymlink): line 3771
 */

const fs = require('fs');

// ============================================================================
// External Dependencies (Placeholders)
// ============================================================================

/**
 * TODO: Import these from appropriate modules when available:
 *
 * - YB - Global state object storing:
 *   - YB.originalCwd - Original working directory at startup
 *   - YB.cwd - Current working directory
 *   - YB.sessionId - Current session ID
 *   - Other session/state data
 */

// Placeholder for global state
const YB = {
  originalCwd: process.cwd(),
  cwd: process.cwd(),
  sessionId: 'session_' + Date.now()
};

// ============================================================================
// Filesystem Access
// ============================================================================

/**
 * Gets the Node.js filesystem module
 *
 * Returns the standard fs module. In the original implementation,
 * this may be wrapped or extended with additional functionality.
 *
 * Original location: line 3804
 * Original name: getFs
 *
 * @returns {Object} - Node.js fs module
 */
function getFs() {
  return fs;
}

// ============================================================================
// Working Directory Management
// ============================================================================

/**
 * Gets the stored current working directory
 *
 * Returns the working directory stored in application state.
 * This may differ from process.cwd() if the directory was changed
 * through the application's directory management.
 *
 * Original location: line 4173
 * Original name: oy
 *
 * @returns {string} - Current working directory path
 */
function getStoredCwd() {
  return YB.cwd;
}

/**
 * Internal getCwd implementation
 *
 * Gets the stored current working directory.
 *
 * Original location: line 56187
 * Original name: r71
 *
 * @returns {string} - Current working directory path
 */
function internalGetCwd() {
  return getStoredCwd();
}

/**
 * Gets the current working directory
 *
 * Attempts to get the stored working directory, falling back to
 * the home directory if an error occurs (e.g., directory was deleted).
 *
 * Original location: line 56190
 * Original name: getCwd
 *
 * @returns {string} - Current working directory path
 *
 * @example
 * const cwd = getCwd();
 * console.log(`Current directory: ${cwd}`);
 */
function getCwd() {
  try {
    return internalGetCwd();
  } catch {
    // If stored cwd is invalid, fall back to home directory
    return getHomedir();
  }
}

/**
 * Sets the current working directory in application state
 *
 * Updates the stored working directory. Note: This does NOT change
 * process.cwd() - it only updates the application's state.
 *
 * Original location: line 4176
 * Original name: X50
 *
 * @param {string} newCwd - New working directory path
 */
function setStoredCwd(newCwd) {
  YB.cwd = newCwd;
}

// ============================================================================
// Home Directory
// ============================================================================

/**
 * Gets the home directory (original working directory at startup)
 *
 * Returns the directory that was current when the application started.
 * This is used as a fallback and as the default "home" for the application.
 *
 * Original location: line 4170
 * Original name: getHomedir
 *
 * @returns {string} - Home directory path
 *
 * @example
 * const home = getHomedir();
 * console.log(`Home directory: ${home}`);
 */
function getHomedir() {
  return YB.originalCwd;
}

/**
 * Gets the user's home directory from OS
 *
 * Returns the user's actual home directory (e.g., /home/user or C:\\Users\\user).
 * This is different from getHomedir() which returns the app's original cwd.
 *
 * @returns {string} - User's home directory path
 */
function getUserHomeDir() {
  return require('os').homedir();
}

// ============================================================================
// Symlink Resolution
// ============================================================================

/**
 * Resolves a path to its real path, detecting symlinks
 *
 * If the path exists and is a symlink, returns the resolved real path.
 * Otherwise returns the original path.
 *
 * Original location: line 3771
 * Original name: BC
 *
 * @param {Object} filesystem - Filesystem module (fs)
 * @param {string} filePath - Path to resolve
 * @returns {Object} - Resolution result
 * @property {string} resolvedPath - Real path (or original if not symlink)
 * @property {boolean} isSymlink - True if path was a symlink
 *
 * @example
 * const fs = getFs();
 * const result = resolveSymlink(fs, "/path/to/link");
 * if (result.isSymlink) {
 *   console.log(`Symlink points to: ${result.resolvedPath}`);
 * }
 */
function resolveSymlink(filesystem, filePath) {
  // Check if path exists
  if (!filesystem.existsSync(filePath)) {
    return {
      resolvedPath: filePath,
      isSymlink: false
    };
  }

  try {
    // Resolve to real path
    const realPath = filesystem.realpathSync(filePath);

    return {
      resolvedPath: realPath,
      isSymlink: realPath !== filePath
    };
  } catch (error) {
    // If resolution fails, return original path
    return {
      resolvedPath: filePath,
      isSymlink: false
    };
  }
}

// ============================================================================
// File System Checks
// ============================================================================

/**
 * Checks if a path exists
 *
 * @param {string} filePath - Path to check
 * @returns {boolean} - True if path exists
 */
function pathExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

/**
 * Checks if a path is a directory
 *
 * @param {string} filePath - Path to check
 * @returns {boolean} - True if path is a directory
 */
function isDirectory(filePath) {
  try {
    return fs.statSync(filePath).isDirectory();
  } catch {
    return false;
  }
}

/**
 * Checks if a path is a file
 *
 * @param {string} filePath - Path to check
 * @returns {boolean} - True if path is a file
 */
function isFile(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

/**
 * Checks if a path is a symlink
 *
 * @param {string} filePath - Path to check
 * @returns {boolean} - True if path is a symlink
 */
function isSymlink(filePath) {
  try {
    return fs.lstatSync(filePath).isSymbolicLink();
  } catch {
    return false;
  }
}

// ============================================================================
// Session State Management
// ============================================================================

/**
 * Gets the current session ID
 *
 * Original location: line 4160 (referenced as L0)
 *
 * @returns {string} - Current session ID
 */
function getSessionId() {
  return YB.sessionId;
}

/**
 * Sets the current session ID
 *
 * @param {string} sessionId - New session ID
 */
function setSessionId(sessionId) {
  YB.sessionId = sessionId;
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  // Filesystem access
  getFs,

  // Working directory
  getCwd,
  getStoredCwd,
  setStoredCwd,

  // Home directory
  getHomedir,
  getUserHomeDir,

  // Symlink resolution
  resolveSymlink,

  // File system checks
  pathExists,
  isDirectory,
  isFile,
  isSymlink,

  // Session state
  getSessionId,
  setSessionId,

  // Internal (exported for testing)
  internalGetCwd,
  YB // Global state (for integration)
};
