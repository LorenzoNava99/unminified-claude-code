/**
 * Edit Tool - Input/Output Schemas
 *
 * Zod validation schemas for the Edit tool that performs string replacements in files.
 */

const { z } = require('zod');

/**
 * Diff patch schema - represents a unified diff hunk
 * (Shared with Write tool)
 */
const diffPatchSchema = z.object({
  oldStart: z.number(),
  oldLines: z.number(),
  newStart: z.number(),
  newLines: z.number(),
  lines: z.array(z.string())
});

/**
 * Input schema for Edit tool
 *
 * @property {string} file_path - The absolute path to the file to modify
 * @property {string} old_string - The text to replace
 * @property {string} new_string - The text to replace it with (must be different from old_string)
 * @property {boolean} [replace_all=false] - Replace all occurrences of old_string (default false)
 */
const editInputSchema = z.strictObject({
  file_path: z.string().describe("The absolute path to the file to modify"),
  old_string: z.string().describe("The text to replace"),
  new_string: z.string().describe("The text to replace it with (must be different from old_string)"),
  replace_all: z.boolean().default(false).optional().describe("Replace all occurences of old_string (default false)")
});

/**
 * Output schema for Edit tool
 *
 * @property {string} filePath - The file path that was edited
 * @property {string} oldString - The original string that was replaced
 * @property {string} newString - The new string that replaced it
 * @property {string} originalFile - The original file contents before editing
 * @property {object[]} structuredPatch - Diff patch showing the changes
 * @property {boolean} userModified - Whether the user modified the proposed changes
 * @property {boolean} replaceAll - Whether all occurrences were replaced
 */
const editOutputSchema = z.object({
  filePath: z.string().describe("The file path that was edited"),
  oldString: z.string().describe("The original string that was replaced"),
  newString: z.string().describe("The new string that replaced it"),
  originalFile: z.string().describe("The original file contents before editing"),
  structuredPatch: z.array(diffPatchSchema).describe("Diff patch showing the changes"),
  userModified: z.boolean().describe("Whether the user modified the proposed changes"),
  replaceAll: z.boolean().describe("Whether all occurrences were replaced")
});

module.exports = {
  editInputSchema,
  editOutputSchema,
  diffPatchSchema
};
