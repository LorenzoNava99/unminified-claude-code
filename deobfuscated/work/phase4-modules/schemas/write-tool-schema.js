/**
 * Write Tool - Input/Output Schemas
 *
 * Zod validation schemas for the Write tool that handles file creation and updates.
 */

const { z } = require('zod');

/**
 * Diff patch schema - represents a unified diff hunk
 *
 * @property {number} oldStart - Starting line number in the old file
 * @property {number} oldLines - Number of lines in the old file
 * @property {number} newStart - Starting line number in the new file
 * @property {number} newLines - Number of lines in the new file
 * @property {string[]} lines - Diff lines (prefixed with +, -, or space)
 */
const diffPatchSchema = z.object({
  oldStart: z.number(),
  oldLines: z.number(),
  newStart: z.number(),
  newLines: z.number(),
  lines: z.array(z.string())
});

/**
 * Input schema for Write tool
 *
 * @property {string} file_path - The absolute path to the file to write
 * @property {string} content - The content to write to the file
 */
const writeInputSchema = z.strictObject({
  file_path: z.string().describe("The absolute path to the file to write (must be absolute, not relative)"),
  content: z.string().describe("The content to write to the file")
});

/**
 * Output schema for Write tool
 *
 * @property {"create" | "update"} type - Whether a new file was created or existing file was updated
 * @property {string} filePath - The path to the file that was written
 * @property {string} content - The content that was written to the file
 * @property {object[]} structuredPatch - Diff patch showing the changes
 */
const writeOutputSchema = z.object({
  type: z.enum(["create", "update"]).describe("Whether a new file was created or an existing file was updated"),
  filePath: z.string().describe("The path to the file that was written"),
  content: z.string().describe("The content that was written to the file"),
  structuredPatch: z.array(diffPatchSchema).describe("Diff patch showing the changes")
});

module.exports = {
  writeInputSchema,
  writeOutputSchema,
  diffPatchSchema
};
