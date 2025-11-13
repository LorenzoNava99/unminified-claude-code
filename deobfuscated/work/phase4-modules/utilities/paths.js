/**
 * Path Utilities
 *
 * Path manipulation and resolution utilities including:
 * - Absolute path resolution with tilde expansion
 * - Path normalization
 * - Relative path calculation
 * - Windows path handling
 * - Directory extraction
 *
 * Original locations:
 * - resolveAbsolutePath: line 60069
 * - Fr2 (relativePath): line 495165
 * - wk (getDirOrParent): line 60103
 * - d1A (hasParentDirEscape): line 60112
 * - KO (normalizeCasing): line 495162
 * - PT (transformWindowsPath): line 60030
 * - AQ1 (normalizePathForComparison): line 495173
 */

const path = require('path');
const { isWindows, getPlatform } = require('./platform');
const { getCwd, getFs, getUserHomeDir } = require('./filesystem');

// ============================================================================
// External Dependencies (Placeholders)
// ============================================================================

/**
 * TODO: Import these from appropriate modules when available:
 *
 * - $P0() - Get expanded home directory
 * - normalizePath(path) - Normalize path separators and resolve dots
 * - joinPaths(...paths) - Join path segments
 * - wP0(path) - Transform Unix path to Windows (cygpath -w)
 * - zh9(path) - Check if path is absolute
 * - wh9(base, relative) - Resolve relative path from base
 * - $h9(path) - Get directory name (dirname)
 * - N8(args) - Shell escape arguments
 * - KTA(command, options) - Execute shell command synchronously
 * - NG1() - Get default shell
 */

// Placeholder implementations using standard path module
const normalizePath = function(filePath) {
  // TODO: Import from path normalization module
  return path.normalize(filePath);
};

const joinPaths = function(...paths) {
  // TODO: Import from path joining module
  return path.join(...paths);
};

const isAbsolute = function(filePath) {
  // TODO: Import from path checking module (zh9)
  return path.isAbsolute(filePath);
};

const resolvePath = function(base, relative) {
  // TODO: Import from path resolution module (wh9)
  return path.resolve(base, relative);
};

const dirname = function(filePath) {
  // TODO: Import from path manipulation module ($h9)
  return path.dirname(filePath);
};

// ============================================================================
// Path Resolution
// ============================================================================

/**
 * Resolves a path to an absolute path
 *
 * Comprehensive path resolution with support for:
 * - Relative paths (resolved from base directory)
 * - Tilde expansion (~/ becomes home directory)
 * - Windows /c/ style paths
 * - Null byte validation
 * - Type validation
 *
 * Original location: line 60069
 * Original name: resolveAbsolutePath
 *
 * @param {string} filePath - Path to resolve
 * @param {string} [baseDir] - Base directory for relative paths (defaults to cwd)
 * @returns {string} - Absolute path
 * @throws {TypeError} - If path or baseDir is not a string
 * @throws {Error} - If path contains null bytes
 *
 * @example
 * resolveAbsolutePath("./file.txt")
 * // Returns: "/current/working/directory/file.txt"
 *
 * resolveAbsolutePath("~/file.txt")
 * // Returns: "/home/user/file.txt"
 *
 * resolveAbsolutePath("file.txt", "/some/base")
 * // Returns: "/some/base/file.txt"
 */
function resolveAbsolutePath(filePath, baseDir) {
  // Determine base directory
  const base = baseDir ?? getCwd() ?? getFs().cwd();

  // Type validation
  if (typeof filePath !== 'string') {
    throw TypeError(`Path must be a string, received ${typeof filePath}`);
  }
  if (typeof base !== 'string') {
    throw TypeError(`Base directory must be a string, received ${typeof base}`);
  }

  // Null byte validation (security check)
  if (filePath.includes('\0') || base.includes('\0')) {
    throw Error('Path contains null bytes');
  }

  // Trim and check for empty path
  const trimmedPath = filePath.trim();
  if (!trimmedPath) {
    return normalizePath(base);
  }

  // Handle tilde expansion
  if (trimmedPath === '~') {
    return getUserHomeDir();
  }
  if (trimmedPath.startsWith('~/')) {
    return joinPaths(getUserHomeDir(), trimmedPath.slice(2));
  }

  // Handle Windows /c/ style paths (e.g., /c/Users -> C:\Users)
  let processedPath = trimmedPath;
  if (isWindows() && trimmedPath.match(/^\/[a-z]\//i)) {
    try {
      // Transform using cygpath if available
      // For now, do simple transformation
      const drive = trimmedPath[1].toUpperCase();
      const rest = trimmedPath.slice(3);
      processedPath = `${drive}:/${rest}`;
    } catch {
      processedPath = trimmedPath;
    }
  }

  // If path is already absolute, normalize and return
  if (isAbsolute(processedPath)) {
    return normalizePath(processedPath);
  }

  // Resolve relative path from base
  return resolvePath(base, processedPath);
}

// ============================================================================
// Relative Path Calculation
// ============================================================================

/**
 * Calculates relative path from base to target
 *
 * On Windows, normalizes backslashes to forward slashes before calculation.
 *
 * Original location: line 495165
 * Original name: Fr2
 *
 * @param {string} base - Base path
 * @param {string} target - Target path
 * @returns {string} - Relative path from base to target
 *
 * @example
 * relativePath("/home/user", "/home/user/project/file.txt")
 * // Returns: "project/file.txt"
 *
 * relativePath("/home/user/a", "/home/user/b")
 * // Returns: "../b"
 */
function relativePath(base, target) {
  if (isWindows()) {
    // Normalize Windows paths to forward slashes
    const normalizedBase = transformWindowsPath(base);
    const normalizedTarget = transformWindowsPath(target);
    return path.relative(normalizedBase, normalizedTarget);
  }

  return path.relative(base, target);
}

// ============================================================================
// Windows Path Handling
// ============================================================================

/**
 * Transforms Windows paths by converting backslashes to forward slashes
 *
 * Referenced in original code but implementation varies by context.
 * This version provides simple backslash-to-forward-slash conversion.
 *
 * Note: Original PT (line 60030) used cygpath for WSL/Cygwin environments.
 *
 * @param {string} filePath - Path to transform
 * @returns {string} - Transformed path
 *
 * @example
 * transformWindowsPath("C:\\Users\\file.txt")
 * // Returns: "C:/Users/file.txt"
 */
function transformWindowsPath(filePath) {
  return filePath.replace(/\\/g, '/');
}

/**
 * Normalizes path for comparison (platform-specific)
 *
 * On Windows, transforms backslashes to forward slashes.
 * On other platforms, returns path unchanged.
 *
 * Original location: line 495173
 * Original name: AQ1
 *
 * @param {string} filePath - Path to normalize
 * @returns {string} - Normalized path
 */
function normalizePathForComparison(filePath) {
  if (isWindows()) {
    return transformWindowsPath(filePath);
  }
  return filePath;
}

// ============================================================================
// Case Normalization
// ============================================================================

/**
 * Normalizes path casing (lowercase)
 *
 * Used for case-insensitive path comparisons.
 *
 * Original location: line 495162
 * Original name: KO
 *
 * @param {string} filePath - Path to normalize
 * @returns {string} - Lowercase path
 */
function normalizeCasing(filePath) {
  return filePath.toLowerCase();
}

// ============================================================================
// Directory Extraction
// ============================================================================

/**
 * Gets directory from path, or parent if path is not a directory
 *
 * If path points to a directory, returns that directory.
 * If path points to a file, returns parent directory.
 * If path doesn't exist or stat fails, returns parent directory.
 *
 * Original location: line 60103
 * Original name: wk
 *
 * @param {string} filePath - Path to extract directory from
 * @returns {string} - Directory path
 *
 * @example
 * getDirOrParent("/home/user/file.txt")
 * // Returns: "/home/user"
 *
 * getDirOrParent("/home/user/directory")
 * // Returns: "/home/user/directory" (if it's a directory)
 */
function getDirOrParent(filePath) {
  const absolutePath = resolveAbsolutePath(filePath);

  try {
    if (getFs().statSync(absolutePath).isDirectory()) {
      return absolutePath;
    }
  } catch {
    // Fall through to return parent
  }

  return dirname(absolutePath);
}

// ============================================================================
// Path Validation
// ============================================================================

/**
 * Checks if path contains parent directory escape sequences
 *
 * Detects patterns like "../" or "..\" that escape parent directories.
 * Used for security validation.
 *
 * Original location: line 60112
 * Original name: d1A
 *
 * @param {string} filePath - Path to check
 * @returns {boolean} - True if path contains parent escapes
 *
 * @example
 * hasParentDirEscape("../../../etc/passwd")
 * // Returns: true
 *
 * hasParentDirEscape("./file.txt")
 * // Returns: false
 */
function hasParentDirEscape(filePath) {
  return /(?:^|[\\/])\.\.(?:[\\/]|$)/.test(filePath);
}

/**
 * Checks if path is safe (doesn't escape upward)
 *
 * @param {string} filePath - Path to check
 * @returns {boolean} - True if path is safe
 */
function isPathSafe(filePath) {
  return !hasParentDirEscape(filePath);
}

// ============================================================================
// Path Manipulation
// ============================================================================

/**
 * Joins multiple path segments
 *
 * @param {...string} segments - Path segments to join
 * @returns {string} - Joined path
 */
function join(...segments) {
  return path.join(...segments);
}

/**
 * Gets the basename of a path
 *
 * @param {string} filePath - Path to extract basename from
 * @param {string} [ext] - Optional extension to remove
 * @returns {string} - Base filename
 */
function basename(filePath, ext) {
  return path.basename(filePath, ext);
}

/**
 * Gets the directory name of a path
 *
 * @param {string} filePath - Path to extract directory from
 * @returns {string} - Directory name
 */
function getDirname(filePath) {
  return path.dirname(filePath);
}

/**
 * Gets the extension of a path
 *
 * @param {string} filePath - Path to extract extension from
 * @returns {string} - File extension (including dot)
 */
function extname(filePath) {
  return path.extname(filePath);
}

// ============================================================================
// macOS Path Normalization
// ============================================================================

/**
 * Normalizes macOS /private/ prefix paths
 *
 * macOS has /private/var and /private/tmp that are symlinked to /var and /tmp.
 * This normalizes these paths for consistent comparison.
 *
 * Referenced in isPathWithinDirectory (permission-helpers.js)
 *
 * @param {string} filePath - Path to normalize
 * @returns {string} - Normalized path
 */
function normalizeMacOSPrivatePaths(filePath) {
  return filePath
    .replace(/^\/private\/var\//, '/var/')
    .replace(/^\/private\/tmp(\/|$)/, '/tmp$1');
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  // Path resolution
  resolveAbsolutePath,
  relativePath,

  // Windows path handling
  transformWindowsPath,
  normalizePathForComparison,

  // Case normalization
  normalizeCasing,

  // Directory extraction
  getDirOrParent,

  // Path validation
  hasParentDirEscape,
  isPathSafe,

  // Path manipulation
  join,
  basename,
  getDirname,
  extname,

  // macOS handling
  normalizeMacOSPrivatePaths,

  // Path checks
  isAbsolute
};
