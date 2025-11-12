/**
 * Glob Tool - Input/Output Schemas
 *
 * Zod validation schemas for the Glob tool that performs file pattern matching.
 * Fast, efficient file discovery using glob patterns like "**/*.js" or "src/**/*.ts".
 */

const { z } = require('zod');

/**
 * Input schema for Glob tool
 *
 * @property {string} pattern - The glob pattern to match files against (e.g., "**/*.js", "src/**/*.ts")
 * @property {string} [path] - The directory to search in (defaults to current working directory)
 */
const globInputSchema = z.strictObject({
  pattern: z.string().describe("The glob pattern to match files against"),
  path: z.string().optional().describe("The directory to search in. If not specified, the current working directory will be used. IMPORTANT: Omit this field to use the default directory. DO NOT enter \"undefined\" or \"null\" - simply omit it for the default behavior. Must be a valid directory path if provided.")
});

/**
 * Output schema for Glob tool
 *
 * Returns matching file paths sorted by modification time.
 *
 * @property {number} durationMs - Time taken to execute the search in milliseconds
 * @property {number} numFiles - Total number of files found
 * @property {string[]} filenames - Array of file paths that match the pattern
 * @property {boolean} truncated - Whether results were truncated (limited to 100 files)
 */
const globOutputSchema = z.object({
  durationMs: z.number().describe("Time taken to execute the search in milliseconds"),
  numFiles: z.number().describe("Total number of files found"),
  filenames: z.array(z.string()).describe("Array of file paths that match the pattern"),
  truncated: z.boolean().describe("Whether results were truncated (limited to 100 files)")
});

/**
 * Maximum number of files returned by glob search (prevents overwhelming output)
 */
const MAX_GLOB_RESULTS = 100;

module.exports = {
  globInputSchema,
  globOutputSchema,
  MAX_GLOB_RESULTS
};
