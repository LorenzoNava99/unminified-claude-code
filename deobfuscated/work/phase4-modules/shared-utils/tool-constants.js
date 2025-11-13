/**
 * Tool Constants - Names and Identifiers
 *
 * This module exports all tool name constants used throughout the codebase.
 * These constants are used as unique identifiers for tool registration and execution.
 */

/**
 * Tool name constants
 *
 * These string constants uniquely identify each tool in the system.
 * They match the `name` property in each tool's implementation object.
 */

// File operation tools
const TOOL_READ = "Read";
const TOOL_WRITE = "Write";
const TOOL_EDIT = "Edit";

// Shell and search tools
const TOOL_BASH = "Bash";
const TOOL_GREP = "Grep";
const TOOL_GLOB = "Glob";

// Web tools
const TOOL_WEBFETCH = "WebFetch";
const TOOL_WEBSEARCH = "WebSearch";

// Agent and task tools
const TOOL_TASK = "Task";
const TOOL_TODOWRITE = "TodoWrite";

// Specialized tools
const TOOL_NOTEBOOKEDIT = "NotebookEdit";
const TOOL_SLASHCOMMAND = "SlashCommand";
const TOOL_SKILL = "Skill";
const TOOL_BASHOUTPUT = "BashOutput";
const TOOL_KILLSHELL = "KillShell";
const TOOL_EXITPLANMODE = "ExitPlanMode";

/**
 * Tool descriptions (short versions)
 *
 * Brief descriptions of what each tool does.
 * Used in UI and logging contexts.
 */
const TOOL_DESCRIPTIONS = {
  [TOOL_READ]: "Read file contents",
  [TOOL_WRITE]: "Write file contents",
  [TOOL_EDIT]: "Edit file with string replacement",
  [TOOL_BASH]: "Execute shell command",
  [TOOL_GREP]: "Search code with patterns",
  [TOOL_GLOB]: "Find files by pattern",
  [TOOL_WEBFETCH]: "Fetch and process web content",
  [TOOL_WEBSEARCH]: "Search the web",
  [TOOL_TASK]: "Launch specialized agent",
  [TOOL_TODOWRITE]: "Manage task list",
  [TOOL_NOTEBOOKEDIT]: "Edit Jupyter notebook",
  [TOOL_SLASHCOMMAND]: "Execute custom command",
  [TOOL_SKILL]: "Execute skill",
  [TOOL_BASHOUTPUT]: "Retrieve background shell output",
  [TOOL_KILLSHELL]: "Terminate background shell",
  [TOOL_EXITPLANMODE]: "Exit plan mode"
};

/**
 * Tool categories
 *
 * Groups tools by their primary function for organization and UI purposes.
 */
const TOOL_CATEGORIES = {
  FILE_OPERATIONS: [TOOL_READ, TOOL_WRITE, TOOL_EDIT, TOOL_NOTEBOOKEDIT],
  SHELL_SEARCH: [TOOL_BASH, TOOL_GREP, TOOL_GLOB, TOOL_BASHOUTPUT, TOOL_KILLSHELL],
  WEB: [TOOL_WEBFETCH, TOOL_WEBSEARCH],
  AGENTS: [TOOL_TASK, TOOL_TODOWRITE],
  SPECIALIZED: [TOOL_SLASHCOMMAND, TOOL_SKILL, TOOL_EXITPLANMODE]
};

/**
 * Tool characteristics flags
 *
 * Boolean flags indicating tool capabilities and requirements.
 * Useful for permission checking and execution planning.
 */
const TOOL_CHARACTERISTICS = {
  // Read-only tools (don't modify system state)
  READ_ONLY: [
    TOOL_READ,
    TOOL_BASH, // Can be read-only depending on command
    TOOL_GREP,
    TOOL_GLOB,
    TOOL_WEBFETCH,
    TOOL_WEBSEARCH,
    TOOL_BASHOUTPUT,
    TOOL_EXITPLANMODE
  ],

  // Tools that can run concurrently without conflicts
  CONCURRENCY_SAFE: [
    TOOL_READ,
    TOOL_GREP,
    TOOL_GLOB,
    TOOL_WEBFETCH,
    TOOL_WEBSEARCH,
    TOOL_BASHOUTPUT,
    TOOL_KILLSHELL,
    TOOL_EXITPLANMODE
  ],

  // Tools that require user permission prompts
  REQUIRES_PERMISSION: [
    TOOL_WRITE,
    TOOL_EDIT,
    TOOL_BASH,
    TOOL_NOTEBOOKEDIT,
    TOOL_KILLSHELL
  ],

  // Tools that support background execution
  SUPPORTS_BACKGROUND: [
    TOOL_BASH,
    TOOL_TASK
  ]
};

/**
 * All tool names in a single array
 *
 * Useful for iteration and validation.
 */
const ALL_TOOLS = [
  TOOL_READ,
  TOOL_WRITE,
  TOOL_EDIT,
  TOOL_BASH,
  TOOL_GREP,
  TOOL_GLOB,
  TOOL_WEBFETCH,
  TOOL_WEBSEARCH,
  TOOL_TASK,
  TOOL_TODOWRITE,
  TOOL_NOTEBOOKEDIT,
  TOOL_SLASHCOMMAND,
  TOOL_SKILL,
  TOOL_BASHOUTPUT,
  TOOL_KILLSHELL,
  TOOL_EXITPLANMODE
];

/**
 * Tool count constant
 */
const TOTAL_TOOLS = ALL_TOOLS.length; // 16

module.exports = {
  // Individual tool constants
  TOOL_READ,
  TOOL_WRITE,
  TOOL_EDIT,
  TOOL_BASH,
  TOOL_GREP,
  TOOL_GLOB,
  TOOL_WEBFETCH,
  TOOL_WEBSEARCH,
  TOOL_TASK,
  TOOL_TODOWRITE,
  TOOL_NOTEBOOKEDIT,
  TOOL_SLASHCOMMAND,
  TOOL_SKILL,
  TOOL_BASHOUTPUT,
  TOOL_KILLSHELL,
  TOOL_EXITPLANMODE,

  // Collections
  TOOL_DESCRIPTIONS,
  TOOL_CATEGORIES,
  TOOL_CHARACTERISTICS,
  ALL_TOOLS,
  TOTAL_TOOLS
};
