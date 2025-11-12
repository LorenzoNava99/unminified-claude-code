/**
 * KillShell Tool - Input/Output Schemas
 *
 * Zod validation schemas for the KillShell tool that terminates background bash shells.
 */

const { z } = require('zod');

/**
 * Input schema for KillShell tool
 *
 * Kills a running background bash shell by its ID.
 * Use this tool when you need to terminate a long-running shell.
 * Shell IDs can be found using the /bashes command.
 *
 * @property {string} shell_id - The ID of the background shell to kill
 */
const killShellInputSchema = z.strictObject({
  shell_id: z.string().describe("The ID of the background shell to kill")
});

/**
 * Output schema for KillShell tool
 *
 * Returns a success or failure status message.
 *
 * @property {string} message - Status message about the operation
 * @property {string} shell_id - The ID of the shell that was killed
 */
const killShellOutputSchema = z.object({
  message: z.string().describe("Status message about the operation"),
  shell_id: z.string().describe("The ID of the shell that was killed")
});

module.exports = {
  killShellInputSchema,
  killShellOutputSchema
};
