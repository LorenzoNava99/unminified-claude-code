/**
 * Tool Schemas - Central Export
 *
 * This module exports all tool input/output validation schemas.
 * Each tool has its own schema file for better organization.
 */

// File operation tools
const readSchemas = require('./read-tool-schema');
const writeSchemas = require('./write-tool-schema');
const editSchemas = require('./edit-tool-schema');

// Shell and search tools
const bashSchemas = require('./bash-tool-schema');
const grepSchemas = require('./grep-tool-schema');
const globSchemas = require('./glob-tool-schema');

// Web tools
const webFetchSchemas = require('./webfetch-tool-schema');
const webSearchSchemas = require('./websearch-tool-schema');

// Agent and task tools
const taskSchemas = require('./task-tool-schema');
const todoWriteSchemas = require('./todowrite-tool-schema');

module.exports = {
  // Read tool
  readInputSchema: readSchemas.readInputSchema,
  readOutputSchema: readSchemas.readOutputSchema,
  imageMediaTypes: readSchemas.imageMediaTypes,

  // Write tool
  writeInputSchema: writeSchemas.writeInputSchema,
  writeOutputSchema: writeSchemas.writeOutputSchema,
  diffPatchSchema: writeSchemas.diffPatchSchema,

  // Edit tool
  editInputSchema: editSchemas.editInputSchema,
  editOutputSchema: editSchemas.editOutputSchema,

  // Bash tool
  bashInputSchema: bashSchemas.bashInputSchema,
  bashOutputSchema: bashSchemas.bashOutputSchema,
  LONG_RUNNING_COMMANDS: bashSchemas.LONG_RUNNING_COMMANDS,
  MAX_TIMEOUT_MS: bashSchemas.MAX_TIMEOUT_MS,

  // Grep tool
  grepInputSchema: grepSchemas.grepInputSchema,
  grepOutputSchema: grepSchemas.grepOutputSchema,
  VCS_DIRECTORIES: grepSchemas.VCS_DIRECTORIES,

  // Glob tool
  globInputSchema: globSchemas.globInputSchema,
  globOutputSchema: globSchemas.globOutputSchema,
  MAX_GLOB_RESULTS: globSchemas.MAX_GLOB_RESULTS,

  // WebFetch tool
  webFetchInputSchema: webFetchSchemas.webFetchInputSchema,
  webFetchOutputSchema: webFetchSchemas.webFetchOutputSchema,

  // WebSearch tool
  webSearchInputSchema: webSearchSchemas.webSearchInputSchema,
  webSearchOutputSchema: webSearchSchemas.webSearchOutputSchema,
  searchResultItemSchema: webSearchSchemas.searchResultItemSchema,
  searchResultBlockSchema: webSearchSchemas.searchResultBlockSchema,

  // Task tool
  taskInputSchema: taskSchemas.taskInputSchema,
  taskInputSchemaWithBackground: taskSchemas.taskInputSchemaWithBackground,
  taskOutputSchema: taskSchemas.taskOutputSchema,
  completedAgentResultSchema: taskSchemas.completedAgentResultSchema,
  asyncLaunchedResultSchema: taskSchemas.asyncLaunchedResultSchema,
  subAgentEnteredResultSchema: taskSchemas.subAgentEnteredResultSchema,
  baseAgentResultSchema: taskSchemas.baseAgentResultSchema,

  // TodoWrite tool
  todoWriteInputSchema: todoWriteSchemas.todoWriteInputSchema,
  todoWriteOutputSchema: todoWriteSchemas.todoWriteOutputSchema,
  todoItemSchema: todoWriteSchemas.todoItemSchema,
  todoListSchema: todoWriteSchemas.todoListSchema,
  todoStatusSchema: todoWriteSchemas.todoStatusSchema
};
