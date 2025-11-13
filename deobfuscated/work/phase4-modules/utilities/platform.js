/**
 * Platform Detection Utilities
 *
 * Provides platform detection and platform-specific behavior.
 * Detects operating system and environment (macOS, Windows, Linux, WSL).
 *
 * Original location: line 59395-59421
 * Original name: UB (memoized platform detector)
 */

const fs = require('fs');

// ============================================================================
// External Dependencies (Placeholders)
// ============================================================================

/**
 * TODO: Import these from appropriate modules when available:
 *
 * - I0(fn) - Memoization function (caches result of fn on first call)
 * - logError(error, context) - Error logging function
 */

const I0 = function(fn) {
  // TODO: Import from memoization module
  // Simple memoization implementation
  let cached = undefined;
  let called = false;
  return function() {
    if (!called) {
      cached = fn();
      called = true;
    }
    return cached;
  };
};

const logError = function(error, context) {
  // TODO: Import from logging module
  console.error('[Platform Error]:', error.message);
};

// Error contexts
const nX0 = 'platform_detection_wsl';
const iX0 = 'platform_detection_general';

// ============================================================================
// Platform Detection
// ============================================================================

/**
 * Platform types that can be detected
 */
const PLATFORM_MACOS = 'macos';
const PLATFORM_WINDOWS = 'windows';
const PLATFORM_LINUX = 'linux';
const PLATFORM_WSL = 'wsl';
const PLATFORM_UNKNOWN = 'unknown';

/**
 * All supported platform types
 */
const PLATFORMS = [
  PLATFORM_MACOS,
  PLATFORM_WINDOWS,
  PLATFORM_LINUX,
  PLATFORM_WSL,
  PLATFORM_UNKNOWN
];

/**
 * Detects the current platform
 *
 * Detection logic:
 * 1. Check process.platform for basic OS
 * 2. On Linux, check /proc/version for WSL indicators
 * 3. Return appropriate platform identifier
 *
 * Result is memoized - platform detection happens once per process.
 *
 * Original location: line 59395-59421
 * Original name: UB (memoized)
 *
 * @returns {string} - Platform identifier: 'macos', 'windows', 'linux', 'wsl', or 'unknown'
 *
 * @example
 * const platform = getPlatform();
 * if (platform === PLATFORM_WINDOWS) {
 *   // Windows-specific code
 * }
 */
const getPlatform = I0(() => {
  try {
    // macOS detection
    if (process.platform === 'darwin') {
      return PLATFORM_MACOS;
    }

    // Windows detection
    if (process.platform === 'win32') {
      return PLATFORM_WINDOWS;
    }

    // Linux/WSL detection
    if (process.platform === 'linux') {
      try {
        // Read /proc/version to detect WSL
        const versionInfo = fs.readFileSync('/proc/version', {
          encoding: 'utf8'
        });

        const lowerVersion = versionInfo.toLowerCase();
        if (lowerVersion.includes('microsoft') || lowerVersion.includes('wsl')) {
          return PLATFORM_WSL;
        }
      } catch (error) {
        logError(
          error instanceof Error ? error : Error(String(error)),
          nX0
        );
      }

      return PLATFORM_LINUX;
    }

    return PLATFORM_UNKNOWN;
  } catch (error) {
    logError(
      error instanceof Error ? error : Error(String(error)),
      iX0
    );
    return PLATFORM_UNKNOWN;
  }
});

// ============================================================================
// Platform Checks
// ============================================================================

/**
 * Checks if current platform is Windows
 *
 * @returns {boolean} - True if Windows
 *
 * @example
 * if (isWindows()) {
 *   // Use Windows-specific path handling
 * }
 */
function isWindows() {
  return getPlatform() === PLATFORM_WINDOWS;
}

/**
 * Checks if current platform is macOS
 *
 * @returns {boolean} - True if macOS
 */
function isMacOS() {
  return getPlatform() === PLATFORM_MACOS;
}

/**
 * Checks if current platform is Linux (not WSL)
 *
 * @returns {boolean} - True if Linux
 */
function isLinux() {
  return getPlatform() === PLATFORM_LINUX;
}

/**
 * Checks if current platform is WSL (Windows Subsystem for Linux)
 *
 * @returns {boolean} - True if WSL
 */
function isWSL() {
  return getPlatform() === PLATFORM_WSL;
}

/**
 * Checks if current platform is Unix-like (macOS, Linux, or WSL)
 *
 * @returns {boolean} - True if Unix-like
 */
function isUnixLike() {
  const platform = getPlatform();
  return (
    platform === PLATFORM_MACOS ||
    platform === PLATFORM_LINUX ||
    platform === PLATFORM_WSL
  );
}

// ============================================================================
// Platform-Specific Path Separators
// ============================================================================

/**
 * Gets the platform-specific path separator
 *
 * @returns {string} - Path separator ('/' or '\\')
 */
function getPathSeparator() {
  return require('path').sep;
}

/**
 * Gets the platform-specific path delimiter (for PATH environment variable)
 *
 * @returns {string} - Path delimiter (':' or ';')
 */
function getPathDelimiter() {
  return require('path').delimiter;
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  // Platform constants
  PLATFORM_MACOS,
  PLATFORM_WINDOWS,
  PLATFORM_LINUX,
  PLATFORM_WSL,
  PLATFORM_UNKNOWN,
  PLATFORMS,

  // Platform detection
  getPlatform,

  // Platform checks
  isWindows,
  isMacOS,
  isLinux,
  isWSL,
  isUnixLike,

  // Path separators
  getPathSeparator,
  getPathDelimiter
};
