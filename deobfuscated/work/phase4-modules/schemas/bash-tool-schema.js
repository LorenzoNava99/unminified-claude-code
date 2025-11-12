/**
 * Bash Tool - Input/Output Schemas
 *
 * Zod validation schemas for the Bash tool that executes shell commands.
 */

const { z } = require('zod');

// Maximum timeout for bash commands (typically 600000ms = 10 minutes)
const MAX_TIMEOUT_MS = 600000;

/**
 * Input schema for Bash tool
 *
 * @property {string} command - The command to execute
 * @property {number} [timeout] - Optional timeout in milliseconds (max 600000)
 * @property {string} [description] - Clear, concise description of what this command does
 * @property {boolean} [run_in_background] - Set to true to run in background
 * @property {boolean} [dangerouslyDisableSandbox] - Override sandbox mode (dangerous)
 */
const bashInputSchema = z.strictObject({
  command: z.string().describe("The command to execute"),
  timeout: z.number().optional().describe(`Optional timeout in milliseconds (max ${MAX_TIMEOUT_MS})`),
  description: z.string().optional().describe(`Clear, concise description of what this command does in 5-10 words, in active voice. Examples:
Input: ls
Output: List files in current directory

Input: git status
Output: Show working tree status

Input: npm install
Output: Install package dependencies

Input: mkdir foo
Output: Create directory 'foo'`),
  run_in_background: z.boolean().optional().describe("Set to true to run this command in the background. Use BashOutput to read the output later."),
  dangerouslyDisableSandbox: z.boolean().optional().describe("Set this to true to dangerously override sandbox mode and run commands without sandboxing.")
});

/**
 * Output schema for Bash tool
 *
 * @property {string} stdout - The standard output of the command
 * @property {string} stderr - The standard error output of the command
 * @property {string} [summary] - Summarized output when available
 * @property {string} [rawOutputPath] - Path to raw output file when summarized
 * @property {boolean} interrupted - Whether the command was interrupted
 * @property {boolean} [isImage] - Flag to indicate if stdout contains image data
 * @property {string} [backgroundTaskId] - ID of the background task if running in background
 * @property {boolean} [dangerouslyDisableSandbox] - Flag to indicate if sandbox mode was overridden
 * @property {string} [returnCodeInterpretation] - Semantic interpretation for non-error exit codes
 * @property {any[]} [structuredContent] - Structured content blocks from mcp-cli commands
 */
const bashOutputSchema = z.object({
  stdout: z.string().describe("The standard output of the command"),
  stderr: z.string().describe("The standard error output of the command"),
  summary: z.string().optional().describe("Summarized output when available"),
  rawOutputPath: z.string().optional().describe("Path to raw output file when summarized"),
  interrupted: z.boolean().describe("Whether the command was interrupted"),
  isImage: z.boolean().optional().describe("Flag to indicate if stdout contains image data"),
  backgroundTaskId: z.string().optional().describe("ID of the background task if command is running in background"),
  dangerouslyDisableSandbox: z.boolean().optional().describe("Flag to indicate if sandbox mode was overridden"),
  returnCodeInterpretation: z.string().optional().describe("Semantic interpretation for non-error exit codes with special meaning"),
  structuredContent: z.array(z.any()).optional().describe("Structured content blocks from mcp-cli commands")
});

/**
 * Common build and development commands that benefit from longer timeouts
 */
const LONG_RUNNING_COMMANDS = [
  "npm", "yarn", "pnpm", "node", "python", "python3", "go", "cargo",
  "make", "docker", "terraform", "webpack", "vite", "jest", "pytest",
  "curl", "wget", "build", "test", "serve", "watch", "dev"
];

module.exports = {
  bashInputSchema,
  bashOutputSchema,
  LONG_RUNNING_COMMANDS,
  MAX_TIMEOUT_MS
};
