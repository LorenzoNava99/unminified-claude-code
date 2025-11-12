/**
 * Grep Tool - Input/Output Schemas
 *
 * Zod validation schemas for the Grep tool that performs ripgrep-based code search.
 */

const { z } = require('zod');

/**
 * Input schema for Grep tool
 *
 * A powerful search tool built on ripgrep with support for:
 * - Regex patterns
 * - File filtering (glob patterns, file types)
 * - Context lines (-A, -B, -C)
 * - Multiple output modes
 * - Pagination (head_limit, offset)
 *
 * @property {string} pattern - The regular expression pattern to search for
 * @property {string} [path] - File or directory to search in (defaults to cwd)
 * @property {string} [glob] - Glob pattern to filter files (e.g. "*.js", "*.{ts,tsx}")
 * @property {"content"|"files_with_matches"|"count"} [output_mode="files_with_matches"] - Output mode
 * @property {number} [-B] - Number of lines to show before each match (rg -B)
 * @property {number} [-A] - Number of lines to show after each match (rg -A)
 * @property {number} [-C] - Number of lines to show before and after each match (rg -C)
 * @property {boolean} [-n=true] - Show line numbers in output (rg -n)
 * @property {boolean} [-i] - Case insensitive search (rg -i)
 * @property {string} [type] - File type to search (js, py, rust, go, java, etc.)
 * @property {number} [head_limit] - Limit output to first N lines/entries
 * @property {number} [offset=0] - Skip first N lines/entries before applying head_limit
 * @property {boolean} [multiline=false] - Enable multiline mode (rg -U --multiline-dotall)
 */
const grepInputSchema = z.strictObject({
  pattern: z.string().describe("The regular expression pattern to search for in file contents"),
  path: z.string().optional().describe("File or directory to search in (rg PATH). Defaults to current working directory."),
  glob: z.string().optional().describe("Glob pattern to filter files (e.g. \"*.js\", \"*.{ts,tsx}\") - maps to rg --glob"),
  output_mode: z.enum(["content", "files_with_matches", "count"]).optional().describe("Output mode: \"content\" shows matching lines (supports -A/-B/-C context, -n line numbers, head_limit), \"files_with_matches\" shows file paths (supports head_limit), \"count\" shows match counts (supports head_limit). Defaults to \"files_with_matches\"."),
  "-B": z.number().optional().describe("Number of lines to show before each match (rg -B). Requires output_mode: \"content\", ignored otherwise."),
  "-A": z.number().optional().describe("Number of lines to show after each match (rg -A). Requires output_mode: \"content\", ignored otherwise."),
  "-C": z.number().optional().describe("Number of lines to show before and after each match (rg -C). Requires output_mode: \"content\", ignored otherwise."),
  "-n": z.boolean().optional().describe("Show line numbers in output (rg -n). Requires output_mode: \"content\", ignored otherwise. Defaults to true."),
  "-i": z.boolean().optional().describe("Case insensitive search (rg -i)"),
  type: z.string().optional().describe("File type to search (rg --type). Common types: js, py, rust, go, java, etc. More efficient than include for standard file types."),
  head_limit: z.number().optional().describe("Limit output to first N lines/entries, equivalent to \"| head -N\". Works across all output modes: content (limits output lines), files_with_matches (limits file paths), count (limits count entries). Defaults based on \"cap\" experiment value: 0 (unlimited), 20, or 100."),
  offset: z.number().optional().describe("Skip first N lines/entries before applying head_limit, equivalent to \"| tail -n +N | head -N\". Works across all output modes. Defaults to 0."),
  multiline: z.boolean().optional().describe("Enable multiline mode where . matches newlines and patterns can span lines (rg -U --multiline-dotall). Default: false.")
});

/**
 * Output schema for Grep tool
 *
 * @property {"content"|"files_with_matches"|"count"} [mode] - The output mode used
 * @property {number} numFiles - Number of files with matches
 * @property {string[]} filenames - List of filenames with matches
 * @property {string} [content] - Matching lines content (when output_mode is "content")
 * @property {number} [numLines] - Number of lines in content output
 * @property {number} [numMatches] - Number of matches found
 * @property {number} [appliedLimit] - The head_limit that was applied
 * @property {number} [appliedOffset] - The offset that was applied
 */
const grepOutputSchema = z.object({
  mode: z.enum(["content", "files_with_matches", "count"]).optional(),
  numFiles: z.number(),
  filenames: z.array(z.string()),
  content: z.string().optional(),
  numLines: z.number().optional(),
  numMatches: z.number().optional(),
  appliedLimit: z.number().optional(),
  appliedOffset: z.number().optional()
});

/**
 * Version control directories that are automatically excluded from grep searches
 */
const VCS_DIRECTORIES = [".git", ".svn", ".hg", ".bzr"];

module.exports = {
  grepInputSchema,
  grepOutputSchema,
  VCS_DIRECTORIES
};
