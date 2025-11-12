/**
 * Configuration Module
 *
 * Handles application configuration, environment variables, and system settings.
 * Provides functions for accessing configuration directories, regions, and boolean flags.
 *
 * @module config
 */

import { join } from "path";
import { homedir } from "os";

// ============================================================================
// DIRECTORY & PATH CONFIGURATION
// ============================================================================

/**
 * Gets the Claude Code configuration directory path.
 * Defaults to ~/.claude if CLAUDE_CONFIG_DIR environment variable is not set.
 * @returns {string} The absolute path to the configuration directory
 */
export function getClaudeConfigDir() {
  return process.env.CLAUDE_CONFIG_DIR ?? join(homedir(), ".claude");
}

// ============================================================================
// BOOLEAN PARSING UTILITIES
// ============================================================================

/**
 * Parses a value into a boolean.
 * Accepts boolean values, or strings like "1", "true", "yes", "on" as truthy.
 * @param {any} value - The value to parse
 * @returns {boolean} The parsed boolean value
 */
export function parseBoolean(value) {
  if (!value) {
    return false;
  }
  if (typeof value === "boolean") {
    return value;
  }
  const normalized = value.toLowerCase().trim();
  return ["1", "true", "yes", "on"].includes(normalized);
}

/**
 * Parses a value into a negated boolean.
 * Returns true for "0", "false", "no", "off", or falsy values.
 * @param {any} value - The value to parse
 * @returns {boolean} The negated boolean value
 */
export function parseBooleanNegative(value) {
  if (value === undefined) {
    return false;
  }
  if (typeof value === "boolean") {
    return !value;
  }
  if (!value) {
    return false;
  }
  const normalized = value.toLowerCase().trim();
  return ["0", "false", "no", "off"].includes(normalized);
}

// ============================================================================
// ENVIRONMENT VARIABLE PARSING
// ============================================================================

/**
 * Parses environment variable strings into an object.
 * Expected format: KEY1=value1 KEY2=value2
 * @param {string[]} envVars - Array of environment variable strings
 * @returns {Object.<string, string>} Parsed environment variables
 * @throws {Error} If environment variable format is invalid
 */
export function parseEnvironmentVariables(envVars) {
  const result = {};
  if (envVars) {
    for (const envVar of envVars) {
      const [key, ...valueParts] = envVar.split("=");
      if (!key || valueParts.length === 0) {
        throw Error(
          `Invalid environment variable format: ${envVar}, environment variables should be added as: -e KEY1=value1 -e KEY2=value2`,
        );
      }
      result[key] = valueParts.join("=");
    }
  }
  return result;
}

// ============================================================================
// CLOUD REGION CONFIGURATION
// ============================================================================

/**
 * Gets the AWS region for Bedrock API calls.
 * @returns {string} The AWS region from environment or us-east-1
 */
export function getAWSRegion() {
  return (
    process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "us-east-1"
  );
}

/**
 * Gets the default Google Cloud ML region.
 * @returns {string} The default region (us-east5) or CLOUD_ML_REGION env var
 */
export function getDefaultCloudMLRegion() {
  return process.env.CLOUD_ML_REGION || "us-east5";
}

/**
 * Gets the appropriate Google Cloud Vertex AI region for a Claude model.
 * Checks model-specific environment variables, falls back to default region.
 * @param {string} modelName - The Claude model identifier
 * @returns {string} The GCP region for Vertex AI
 */
export function getVertexRegionForModel(modelName) {
  if (modelName?.startsWith("claude-haiku-4-5")) {
    return (
      process.env.VERTEX_REGION_CLAUDE_HAIKU_4_5 || getDefaultCloudMLRegion()
    );
  }
  if (modelName?.startsWith("claude-3-5-haiku")) {
    return (
      process.env.VERTEX_REGION_CLAUDE_3_5_HAIKU || getDefaultCloudMLRegion()
    );
  }
  if (modelName?.startsWith("claude-3-5-sonnet")) {
    return (
      process.env.VERTEX_REGION_CLAUDE_3_5_SONNET || getDefaultCloudMLRegion()
    );
  }
  if (modelName?.startsWith("claude-3-7-sonnet")) {
    return (
      process.env.VERTEX_REGION_CLAUDE_3_7_SONNET || getDefaultCloudMLRegion()
    );
  }
  if (modelName?.startsWith("claude-opus-4-1")) {
    return (
      process.env.VERTEX_REGION_CLAUDE_4_1_OPUS || getDefaultCloudMLRegion()
    );
  }
  if (modelName?.startsWith("claude-opus-4")) {
    return (
      process.env.VERTEX_REGION_CLAUDE_4_0_OPUS || getDefaultCloudMLRegion()
    );
  }
  if (modelName?.startsWith("claude-sonnet-4-5")) {
    return (
      process.env.VERTEX_REGION_CLAUDE_4_5_SONNET || getDefaultCloudMLRegion()
    );
  }
  if (modelName?.startsWith("claude-sonnet-4")) {
    return (
      process.env.VERTEX_REGION_CLAUDE_4_0_SONNET || getDefaultCloudMLRegion()
    );
  }
  return getDefaultCloudMLRegion();
}

// ============================================================================
// BEHAVIOR CONFIGURATION
// ============================================================================

/**
 * Determines if Bash commands should maintain the project working directory.
 * @returns {boolean} True if working directory should be maintained
 */
export function shouldMaintainProjectWorkingDir() {
  return parseBoolean(process.env.CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR);
}

// ============================================================================
// CONFIGURATION CONSTANTS
// ============================================================================

/**
 * Default configuration values
 */
export const CONFIG_DEFAULTS = {
  BASH_MAX_OUTPUT_LENGTH: 30000,
  AWS_REGION: "us-east-1",
  CLOUD_ML_REGION: "us-east5",
};

/**
 * Environment variable names used by the application
 */
export const ENV_VARS = {
  // Directories
  CLAUDE_CONFIG_DIR: "CLAUDE_CONFIG_DIR",

  // AWS Configuration
  AWS_REGION: "AWS_REGION",
  AWS_DEFAULT_REGION: "AWS_DEFAULT_REGION",

  // Google Cloud Configuration
  CLOUD_ML_REGION: "CLOUD_ML_REGION",
  VERTEX_REGION_CLAUDE_HAIKU_4_5: "VERTEX_REGION_CLAUDE_HAIKU_4_5",
  VERTEX_REGION_CLAUDE_3_5_HAIKU: "VERTEX_REGION_CLAUDE_3_5_HAIKU",
  VERTEX_REGION_CLAUDE_3_5_SONNET: "VERTEX_REGION_CLAUDE_3_5_SONNET",
  VERTEX_REGION_CLAUDE_3_7_SONNET: "VERTEX_REGION_CLAUDE_3_7_SONNET",
  VERTEX_REGION_CLAUDE_4_1_OPUS: "VERTEX_REGION_CLAUDE_4_1_OPUS",
  VERTEX_REGION_CLAUDE_4_0_OPUS: "VERTEX_REGION_CLAUDE_4_0_OPUS",
  VERTEX_REGION_CLAUDE_4_5_SONNET: "VERTEX_REGION_CLAUDE_4_5_SONNET",
  VERTEX_REGION_CLAUDE_4_0_SONNET: "VERTEX_REGION_CLAUDE_4_0_SONNET",

  // Behavior Flags
  CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR: "CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR",
};

/**
 * No-op function for default/placeholder callbacks
 * @returns {void}
 */
export function noop() {}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  // Directory & Path
  getClaudeConfigDir,

  // Boolean Parsing
  parseBoolean,
  parseBooleanNegative,

  // Environment Variables
  parseEnvironmentVariables,

  // Cloud Regions
  getAWSRegion,
  getDefaultCloudMLRegion,
  getVertexRegionForModel,

  // Behavior Configuration
  shouldMaintainProjectWorkingDir,

  // Constants
  CONFIG_DEFAULTS,
  ENV_VARS,

  // Utilities
  noop,
};
