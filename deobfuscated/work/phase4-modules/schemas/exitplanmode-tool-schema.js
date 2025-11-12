/**
 * ExitPlanMode Tool - Input/Output Schemas
 *
 * Zod validation schemas for the ExitPlanMode tool that prompts the user to exit plan mode
 * and start coding implementation.
 */

const { z } = require('zod');

/**
 * Input schema for ExitPlanMode tool
 *
 * Used when in plan mode after creating a plan. Presents the plan to the user
 * for approval before proceeding to implementation.
 *
 * IMPORTANT: Only use this tool when the task requires planning the implementation steps
 * of a task that requires writing code. For research tasks, do NOT use this tool.
 *
 * @property {string} plan - The plan to present to the user (supports markdown, should be concise)
 */
const exitPlanModeInputSchema = z.strictObject({
  plan: z.string().describe("The plan you came up with, that you want to run by the user for approval. Supports markdown. The plan should be pretty concise.")
});

/**
 * Output schema for ExitPlanMode tool
 *
 * Returns the plan that was presented and whether this is an agent context.
 *
 * @property {string} plan - The plan that was presented to the user
 * @property {boolean} isAgent - Whether this is being executed in an agent context
 */
const exitPlanModeOutputSchema = z.object({
  plan: z.string().describe("The plan that was presented to the user"),
  isAgent: z.boolean()
});

module.exports = {
  exitPlanModeInputSchema,
  exitPlanModeOutputSchema
};
