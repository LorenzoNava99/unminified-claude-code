/**
 * WebFetch Tool - Input/Output Schemas
 *
 * Zod validation schemas for the WebFetch tool that fetches content from URLs
 * and processes it using an AI model.
 */

const { z } = require('zod');

/**
 * Input schema for WebFetch tool
 *
 * Fetches content from a URL, converts HTML to markdown, and processes it with a prompt
 * using a small, fast model.
 *
 * @property {string} url - The URL to fetch content from (must be valid URL)
 * @property {string} prompt - The prompt to run on the fetched content
 */
const webFetchInputSchema = z.strictObject({
  url: z.string().url().describe("The URL to fetch content from"),
  prompt: z.string().describe("The prompt to run on the fetched content")
});

/**
 * Output schema for WebFetch tool
 *
 * Returns fetched content, HTTP response details, and AI-processed result.
 *
 * @property {number} bytes - Size of the fetched content in bytes
 * @property {number} code - HTTP response code (200, 404, 500, etc.)
 * @property {string} codeText - HTTP response code text ("OK", "Not Found", etc.)
 * @property {string} result - Processed result from applying the prompt to the content
 * @property {number} durationMs - Time taken to fetch and process the content
 * @property {string} url - The URL that was fetched (may differ from input if redirected)
 */
const webFetchOutputSchema = z.object({
  bytes: z.number().describe("Size of the fetched content in bytes"),
  code: z.number().describe("HTTP response code"),
  codeText: z.string().describe("HTTP response code text"),
  result: z.string().describe("Processed result from applying the prompt to the content"),
  durationMs: z.number().describe("Time taken to fetch and process the content"),
  url: z.string().describe("The URL that was fetched")
});

module.exports = {
  webFetchInputSchema,
  webFetchOutputSchema
};
