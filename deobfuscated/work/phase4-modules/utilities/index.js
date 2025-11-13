/**
 * Utilities - Main Export
 *
 * Central export point for all utility functionality.
 *
 * Modules:
 * - platform: Platform detection (Windows, macOS, Linux, WSL)
 * - filesystem: Filesystem operations (cwd, home directory, symlinks)
 * - paths: Path manipulation and resolution
 *
 * These utilities provide the foundational operations needed by:
 * - Hook system (path resolution, platform detection)
 * - Permission system (path validation, directory checking)
 * - Tool execution (filesystem access, path handling)
 */

// Import all utility modules
const platform = require('./platform');
const filesystem = require('./filesystem');
const paths = require('./paths');

// ============================================================================
// Re-export everything for convenience
// ============================================================================

module.exports = {
  // === Platform Detection ===
  // Constants
  PLATFORM_MACOS: platform.PLATFORM_MACOS,
  PLATFORM_WINDOWS: platform.PLATFORM_WINDOWS,
  PLATFORM_LINUX: platform.PLATFORM_LINUX,
  PLATFORM_WSL: platform.PLATFORM_WSL,
  PLATFORM_UNKNOWN: platform.PLATFORM_UNKNOWN,
  PLATFORMS: platform.PLATFORMS,

  // Platform detection
  getPlatform: platform.getPlatform,

  // Platform checks
  isWindows: platform.isWindows,
  isMacOS: platform.isMacOS,
  isLinux: platform.isLinux,
  isWSL: platform.isWSL,
  isUnixLike: platform.isUnixLike,

  // Path separators
  getPathSeparator: platform.getPathSeparator,
  getPathDelimiter: platform.getPathDelimiter,

  // === Filesystem ===
  // Filesystem access
  getFs: filesystem.getFs,

  // Working directory
  getCwd: filesystem.getCwd,
  getStoredCwd: filesystem.getStoredCwd,
  setStoredCwd: filesystem.setStoredCwd,

  // Home directory
  getHomedir: filesystem.getHomedir,
  getUserHomeDir: filesystem.getUserHomeDir,

  // Symlink resolution
  resolveSymlink: filesystem.resolveSymlink,

  // File system checks
  pathExists: filesystem.pathExists,
  isDirectory: filesystem.isDirectory,
  isFile: filesystem.isFile,
  isSymlink: filesystem.isSymlink,

  // Session state
  getSessionId: filesystem.getSessionId,
  setSessionId: filesystem.setSessionId,

  // === Paths ===
  // Path resolution
  resolveAbsolutePath: paths.resolveAbsolutePath,
  relativePath: paths.relativePath,

  // Windows path handling
  transformWindowsPath: paths.transformWindowsPath,
  normalizePathForComparison: paths.normalizePathForComparison,

  // Case normalization
  normalizeCasing: paths.normalizeCasing,

  // Directory extraction
  getDirOrParent: paths.getDirOrParent,

  // Path validation
  hasParentDirEscape: paths.hasParentDirEscape,
  isPathSafe: paths.isPathSafe,

  // Path manipulation
  join: paths.join,
  basename: paths.basename,
  getDirname: paths.getDirname,
  extname: paths.extname,

  // macOS handling
  normalizeMacOSPrivatePaths: paths.normalizeMacOSPrivatePaths,

  // Path checks
  isAbsolute: paths.isAbsolute
};
