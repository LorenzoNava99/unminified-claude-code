/**
 * Read Tool - Input/Output Schemas
 *
 * Zod validation schemas for the Read tool that handles file reading operations.
 * Supports text files, images, Jupyter notebooks, and PDFs.
 */

const { z } = require('zod');

/**
 * Supported image MIME types for the Read tool
 */
const imageMediaTypes = z.enum([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp"
]);

/**
 * Input schema for Read tool
 *
 * @property {string} file_path - The absolute path to the file to read
 * @property {number} [offset] - The line number to start reading from (for pagination)
 * @property {number} [limit] - The number of lines to read (for pagination)
 */
const readInputSchema = z.strictObject({
  file_path: z.string().describe("The absolute path to the file to read"),
  offset: z.number().optional().describe("The line number to start reading from. Only provide if the file is too large to read at once"),
  limit: z.number().optional().describe("The number of lines to read. Only provide if the file is too large to read at once.")
});

/**
 * Output schema for Read tool
 *
 * Discriminated union supporting different file types:
 * - text: Regular text files with line-by-line content
 * - image: Image files as base64-encoded data
 * - notebook: Jupyter notebook files with parsed cells
 * - pdf: PDF files as base64-encoded data
 */
const readOutputSchema = z.discriminatedUnion("type", [
  // Text file output
  z.object({
    type: z.literal("text"),
    file: z.object({
      filePath: z.string().describe("The path to the file that was read"),
      content: z.string().describe("The content of the file"),
      numLines: z.number().describe("Number of lines in the returned content"),
      startLine: z.number().describe("The starting line number"),
      totalLines: z.number().describe("Total number of lines in the file")
    })
  }),

  // Image file output
  z.object({
    type: z.literal("image"),
    file: z.object({
      base64: z.string().describe("Base64-encoded image data"),
      type: imageMediaTypes.describe("The MIME type of the image"),
      originalSize: z.number().describe("Original file size in bytes")
    })
  }),

  // Jupyter notebook output
  z.object({
    type: z.literal("notebook"),
    file: z.object({
      filePath: z.string().describe("The path to the notebook file"),
      cells: z.array(z.any()).describe("Array of notebook cells")
    })
  }),

  // PDF file output
  z.object({
    type: z.literal("pdf"),
    file: z.object({
      filePath: z.string().describe("The path to the PDF file"),
      base64: z.string().describe("Base64-encoded PDF data"),
      originalSize: z.number().describe("Original file size in bytes")
    })
  })
]);

module.exports = {
  readInputSchema,
  readOutputSchema,
  imageMediaTypes
};
