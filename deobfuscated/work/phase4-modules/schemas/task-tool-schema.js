/**
 * Task Tool - Input/Output Schemas
 *
 * Zod validation schemas for the Task tool that launches specialized agents (subprocesses)
 * to handle complex, multi-step tasks autonomously.
 */

const { z } = require('zod');

/**
 * Input schema for Task tool
 *
 * @property {string} description - A short (3-5 word) description of the task
 * @property {string} prompt - The detailed task for the agent to perform
 * @property {string} subagent_type - The type of specialized agent to use (e.g., "general-purpose", "Explore", "Plan")
 * @property {"sonnet"|"opus"|"haiku"} [model] - Optional model to use (defaults to parent's model)
 * @property {string} [resume] - Optional agent ID to resume from previous execution
 */
const taskInputSchema = z.object({
  description: z.string().describe("A short (3-5 word) description of the task"),
  prompt: z.string().describe("The task for the agent to perform"),
  subagent_type: z.string().describe("The type of specialized agent to use for this task"),
  model: z.enum(["sonnet", "opus", "haiku"]).optional().describe("Optional model to use for this agent. If not specified, inherits from parent. Prefer haiku for quick, straightforward tasks to minimize cost and latency."),
  resume: z.string().optional().describe("Optional agent ID to resume from. If provided, the agent will continue from the previous execution transcript.")
});

/**
 * Extended input schema with background execution support
 * (Used internally for async agent launches)
 */
const taskInputSchemaWithBackground = taskInputSchema.extend({
  run_in_background: z.boolean().optional().describe("Set to true to run this agent in the background. Use AgentOutputTool to read the output later.")
});

/**
 * Base agent result schema with common fields
 */
const baseAgentResultSchema = z.object({
  agentId: z.string(),
  content: z.array(z.object({
    type: z.literal("text"),
    text: z.string()
  })),
  totalToolUseCount: z.number(),
  totalDurationMs: z.number(),
  totalTokens: z.number(),
  usage: z.object({
    input_tokens: z.number(),
    output_tokens: z.number(),
    cache_creation_input_tokens: z.number().nullable(),
    cache_read_input_tokens: z.number().nullable(),
    server_tool_use: z.object({
      web_search_requests: z.number(),
      web_fetch_requests: z.number()
    }).nullable(),
    service_tier: z.enum(["standard", "priority", "batch"]).nullable(),
    cache_creation: z.object({
      ephemeral_1h_input_tokens: z.number(),
      ephemeral_5m_input_tokens: z.number()
    }).nullable()
  })
});

/**
 * Completed agent result schema
 *
 * Returned when the agent completes its task synchronously.
 */
const completedAgentResultSchema = baseAgentResultSchema.extend({
  status: z.literal("completed"),
  prompt: z.string()
});

/**
 * Async launched agent result schema
 *
 * Returned when the agent is launched in the background.
 */
const asyncLaunchedResultSchema = z.object({
  status: z.literal("async_launched"),
  agentId: z.string().describe("The ID of the async agent"),
  description: z.string().describe("The description of the task"),
  prompt: z.string().describe("The prompt for the agent")
});

/**
 * Sub-agent entered result schema
 *
 * Returned when a sub-agent is entered (nested agent execution).
 */
const subAgentEnteredResultSchema = z.object({
  status: z.literal("sub_agent_entered"),
  description: z.string(),
  message: z.string()
});

/**
 * Output schema for Task tool
 *
 * Discriminated union supporting three execution modes:
 * - completed: Synchronous task completion with full results
 * - async_launched: Background task with agent ID for later retrieval
 * - sub_agent_entered: Nested agent execution notification
 */
const taskOutputSchema = z.union([
  completedAgentResultSchema,
  asyncLaunchedResultSchema,
  subAgentEnteredResultSchema
]);

module.exports = {
  taskInputSchema,
  taskInputSchemaWithBackground,
  taskOutputSchema,
  completedAgentResultSchema,
  asyncLaunchedResultSchema,
  subAgentEnteredResultSchema,
  baseAgentResultSchema
};
