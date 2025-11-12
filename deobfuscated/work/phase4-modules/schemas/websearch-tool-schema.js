/**
 * WebSearch Tool - Input/Output Schemas
 *
 * Zod validation schemas for the WebSearch tool that allows searching the web
 * and using the results to inform responses.
 */

const { z } = require('zod');

/**
 * Input schema for WebSearch tool
 *
 * Performs web searches with optional domain filtering.
 * Note: Web search is only available in the US.
 *
 * @property {string} query - The search query to use (minimum 2 characters)
 * @property {string[]} [allowed_domains] - Only include search results from these domains
 * @property {string[]} [blocked_domains] - Never include search results from these domains
 */
const webSearchInputSchema = z.strictObject({
  query: z.string().min(2).describe("The search query to use"),
  allowed_domains: z.array(z.string()).optional().describe("Only include search results from these domains"),
  blocked_domains: z.array(z.string()).optional().describe("Never include search results from these domains")
});

/**
 * Individual search result item schema
 *
 * @property {string} title - The title of the search result
 * @property {string} url - The URL of the search result
 */
const searchResultItemSchema = z.object({
  title: z.string().describe("The title of the search result"),
  url: z.string().describe("The URL of the search result")
});

/**
 * Search result block schema
 *
 * Groups search results with a tool use ID.
 *
 * @property {string} tool_use_id - ID of the tool use
 * @property {object[]} content - Array of search hits
 */
const searchResultBlockSchema = z.object({
  tool_use_id: z.string().describe("ID of the tool use"),
  content: z.array(searchResultItemSchema).describe("Array of search hits")
});

/**
 * Output schema for WebSearch tool
 *
 * Returns search results formatted as blocks and/or text commentary.
 *
 * @property {string} query - The search query that was executed
 * @property {Array<object|string>} results - Search results and/or text commentary from the model
 * @property {number} durationSeconds - Time taken to complete the search operation
 */
const webSearchOutputSchema = z.object({
  query: z.string().describe("The search query that was executed"),
  results: z.array(z.union([searchResultBlockSchema, z.string()])).describe("Search results and/or text commentary from the model"),
  durationSeconds: z.number().describe("Time taken to complete the search operation")
});

module.exports = {
  webSearchInputSchema,
  webSearchOutputSchema,
  searchResultItemSchema,
  searchResultBlockSchema
};
