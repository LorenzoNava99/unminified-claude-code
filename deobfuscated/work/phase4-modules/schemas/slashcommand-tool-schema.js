/**
 * SlashCommand Tool - Input/Output Schemas
 *
 * Zod validation schemas for the SlashCommand tool that executes custom slash commands
 * defined in .claude/commands/ directory.
 */

const { z } = require('zod');

/**
 * Input schema for SlashCommand tool
 *
 * Executes a slash command within the main conversation. When used, the command
 * expands to its defined prompt in .claude/commands/
 *
 * @property {string} command - The slash command to execute with its arguments (e.g., "/review-pr 123")
 */
const slashCommandInputSchema = z.object({
  command: z.string().describe("The slash command to execute with its arguments, e.g., \"/review-pr 123\"")
});

/**
 * Output schema for SlashCommand tool
 *
 * Returns validation status and the command name.
 *
 * @property {boolean} success - Whether the slash command is valid
 * @property {string} commandName - The name of the slash command
 */
const slashCommandOutputSchema = z.object({
  success: z.boolean().describe("Whether the slash command is valid"),
  commandName: z.string().describe("The name of the slash command")
});

module.exports = {
  slashCommandInputSchema,
  slashCommandOutputSchema
};
