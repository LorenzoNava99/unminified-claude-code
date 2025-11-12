/**
 * TodoWrite Tool - Input/Output Schemas
 *
 * Zod validation schemas for the TodoWrite tool that manages task tracking.
 */

const { z } = require('zod');

/**
 * Todo status enum - represents the current state of a todo item
 */
const todoStatusSchema = z.enum(["pending", "in_progress", "completed"]);

/**
 * Individual todo item schema
 *
 * @property {string} content - The task content (imperative form, e.g., "Implement feature")
 * @property {"pending"|"in_progress"|"completed"} status - The current status
 * @property {string} activeForm - Present continuous form for display (e.g., "Implementing feature")
 */
const todoItemSchema = z.object({
  content: z.string().min(1, "Content cannot be empty"),
  status: todoStatusSchema,
  activeForm: z.string().min(1, "Active form cannot be empty")
});

/**
 * Array of todo items
 */
const todoListSchema = z.array(todoItemSchema);

/**
 * Input schema for TodoWrite tool
 *
 * @property {object[]} todos - The updated todo list with all items
 */
const todoWriteInputSchema = z.strictObject({
  todos: todoListSchema.describe("The updated todo list")
});

/**
 * Output schema for TodoWrite tool
 *
 * Shows the before/after state of the todo list for tracking changes.
 *
 * @property {object[]} oldTodos - The todo list before the update
 * @property {object[]} newTodos - The todo list after the update
 */
const todoWriteOutputSchema = z.object({
  oldTodos: todoListSchema.describe("The todo list before the update"),
  newTodos: todoListSchema.describe("The todo list after the update")
});

module.exports = {
  todoWriteInputSchema,
  todoWriteOutputSchema,
  todoItemSchema,
  todoListSchema,
  todoStatusSchema
};
