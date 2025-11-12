/**
 * Skill Tool - Input/Output Schemas
 *
 * Zod validation schemas for the Skill tool that executes skills within the main conversation.
 * Skills provide specialized capabilities and domain knowledge.
 */

const { z } = require('zod');

/**
 * Input schema for Skill tool
 *
 * Invokes a skill with the specified name. Skills are defined in the available_skills list
 * and provide specialized functionality.
 *
 * @property {string} skill - The skill name (no arguments). E.g., "pdf" or "xlsx"
 */
const skillInputSchema = z.object({
  skill: z.string().describe("The skill name (no arguments). E.g., \"pdf\" or \"xlsx\"")
});

/**
 * Output schema for Skill tool
 *
 * Returns validation status and the skill name.
 *
 * @property {boolean} success - Whether the skill is valid
 * @property {string} commandName - The name of the skill
 */
const skillOutputSchema = z.object({
  success: z.boolean().describe("Whether the skill is valid"),
  commandName: z.string().describe("The name of the skill")
});

module.exports = {
  skillInputSchema,
  skillOutputSchema
};
