/**
 * BashOutput Tool - Input/Output Schemas
 *
 * Zod validation schemas for the BashOutput tool that retrieves output from
 * background bash shells.
 */

const { z } = require('zod');

/**
 * Shell status enum - Possible states of a background shell
 */
const shellStatusSchema = z.enum(["running", "completed", "failed", "killed"]);

/**
 * Input schema for BashOutput tool
 *
 * Retrieves output from a running or completed background bash shell.
 * Always returns only new output since the last check.
 *
 * @property {string} bash_id - The ID of the background shell to retrieve output from
 * @property {string} [filter] - Optional regex to filter output lines (non-matching lines are discarded)
 */
const bashOutputInputSchema = z.strictObject({
  bash_id: z.string().describe("The ID of the background shell to retrieve output from"),
  filter: z.string().optional().describe("Optional regular expression to filter the output lines. Only lines matching this regex will be included in the result. Any lines that do not match will no longer be available to read.")
});

/**
 * Output schema for BashOutput tool
 *
 * Returns stdout, stderr, and status information along with shell status.
 *
 * @property {string} shellId - The ID of the background shell
 * @property {string} command - The command that was run in the shell
 * @property {"running"|"completed"|"failed"|"killed"} status - The current status of the shell command
 * @property {number|null} exitCode - The exit code of the command, if available
 * @property {string} stdout - The standard output of the command
 * @property {string} stderr - The standard error output of the command
 * @property {number} stdoutLines - Total number of lines in original stdout
 * @property {number} stderrLines - Total number of lines in original stderr
 * @property {string} [error] - Error message if the shell command failed
 * @property {string} [filterPattern] - The regex pattern used for filtering (only present when filter is applied)
 * @property {string} timestamp - The current timestamp when the output was retrieved
 */
const bashOutputOutputSchema = z.object({
  shellId: z.string().describe("The ID of the background shell"),
  command: z.string().describe("The command that was run in the shell"),
  status: shellStatusSchema.describe("The current status of the shell command"),
  exitCode: z.number().nullable().describe("The exit code of the command, if available"),
  stdout: z.string().describe("The standard output of the command"),
  stderr: z.string().describe("The standard error output of the command"),
  stdoutLines: z.number().describe("Total number of lines in original stdout, even if truncated or filtered"),
  stderrLines: z.number().describe("Total number of lines in original stderr, even if truncated or filtered"),
  error: z.string().optional().describe("Error message if the shell command failed"),
  filterPattern: z.string().optional().describe("The regex pattern used for filtering (only present when filter is applied)"),
  timestamp: z.string().describe("The current timestamp when the output was retrieved")
});

module.exports = {
  bashOutputInputSchema,
  bashOutputOutputSchema,
  shellStatusSchema
};
