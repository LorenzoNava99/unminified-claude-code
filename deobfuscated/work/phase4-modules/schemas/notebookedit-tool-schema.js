/**
 * NotebookEdit Tool - Input/Output Schemas
 *
 * Zod validation schemas for the NotebookEdit tool that edits Jupyter notebook (.ipynb) files.
 * Supports replacing, inserting, and deleting cells.
 */

const { z } = require('zod');

/**
 * Cell type enum - Jupyter notebook cell types
 */
const cellTypeSchema = z.enum(["code", "markdown"]);

/**
 * Edit mode enum - Types of edits that can be performed
 */
const editModeSchema = z.enum(["replace", "insert", "delete"]);

/**
 * Input schema for NotebookEdit tool
 *
 * @property {string} notebook_path - The absolute path to the Jupyter notebook file (must be absolute)
 * @property {string} [cell_id] - The ID of the cell to edit (for insert, new cell inserted after this ID)
 * @property {string} new_source - The new source for the cell
 * @property {"code"|"markdown"} [cell_type] - The type of the cell (required for insert mode)
 * @property {"replace"|"insert"|"delete"} [edit_mode="replace"] - The type of edit to make
 */
const notebookEditInputSchema = z.strictObject({
  notebook_path: z.string().describe("The absolute path to the Jupyter notebook file to edit (must be absolute, not relative)"),
  cell_id: z.string().optional().describe("The ID of the cell to edit. When inserting a new cell, the new cell will be inserted after the cell with this ID, or at the beginning if not specified."),
  new_source: z.string().describe("The new source for the cell"),
  cell_type: cellTypeSchema.optional().describe("The type of the cell (code or markdown). If not specified, it defaults to the current cell type. If using edit_mode=insert, this is required."),
  edit_mode: editModeSchema.optional().describe("The type of edit to make (replace, insert, delete). Defaults to replace.")
});

/**
 * Output schema for NotebookEdit tool
 *
 * @property {string} new_source - The new source code that was written to the cell
 * @property {string} [cell_id] - The ID of the cell that was edited
 * @property {"code"|"markdown"} cell_type - The type of the cell
 * @property {string} language - The programming language of the notebook
 * @property {string} edit_mode - The edit mode that was used
 * @property {string} [error] - Error message if the operation failed
 */
const notebookEditOutputSchema = z.object({
  new_source: z.string().describe("The new source code that was written to the cell"),
  cell_id: z.string().optional().describe("The ID of the cell that was edited"),
  cell_type: cellTypeSchema.describe("The type of the cell"),
  language: z.string().describe("The programming language of the notebook"),
  edit_mode: z.string().describe("The edit mode that was used"),
  error: z.string().optional().describe("Error message if the operation failed")
});

module.exports = {
  notebookEditInputSchema,
  notebookEditOutputSchema,
  cellTypeSchema,
  editModeSchema
};
