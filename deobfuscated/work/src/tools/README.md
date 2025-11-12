# Tools Module

Tool system for Claude Code CLI - manages available tools and their execution.

## Overview

This module implements the tool system that allows Claude to:
- Execute bash commands
- Read and write files
- Search code
- Make web requests
- Interact with MCP servers
- Launch subagents

## Key Components

### Tool Registry

Central registry of all available tools:

```javascript
class ToolRegistry {
  /**
   * Register a tool
   */
  register(tool) { }

  /**
   * Get tool by name
   */
  getTool(name) { }

  /**
   * List all tools
   */
  listTools() { }

  /**
   * Check if tool exists
   */
  has(name) { }
}
```

### Tool Interface

Standard interface that all tools must implement:

```javascript
interface Tool {
  name: string;
  description: string;
  parameters: Schema;

  /**
   * Execute the tool
   */
  execute(params: any): Promise<any>;

  /**
   * Validate parameters
   */
  validate(params: any): boolean;
}
```

## Built-in Tools

### Bash Tool

Execute shell commands:

```javascript
{
  name: "Bash",
  description: "Execute bash commands",
  parameters: {
    command: string,
    timeout?: number,
    cwd?: string
  }
}
```

### Read Tool

Read file contents:

```javascript
{
  name: "Read",
  description: "Read file contents",
  parameters: {
    file_path: string,
    offset?: number,
    limit?: number
  }
}
```

### Write Tool

Write file contents:

```javascript
{
  name: "Write",
  description: "Write to file",
  parameters: {
    file_path: string,
    content: string
  }
}
```

### Edit Tool

Edit file with replacements:

```javascript
{
  name: "Edit",
  description: "Edit file",
  parameters: {
    file_path: string,
    old_string: string,
    new_string: string,
    replace_all?: boolean
  }
}
```

### Grep Tool

Search code with regex:

```javascript
{
  name: "Grep",
  description: "Search code",
  parameters: {
    pattern: string,
    path?: string,
    glob?: string,
    output_mode?: 'content' | 'files_with_matches' | 'count'
  }
}
```

### Glob Tool

Find files by pattern:

```javascript
{
  name: "Glob",
  description: "Find files",
  parameters: {
    pattern: string,
    path?: string
  }
}
```

### WebFetch Tool

Fetch web content:

```javascript
{
  name: "WebFetch",
  description: "Fetch URL content",
  parameters: {
    url: string,
    prompt: string
  }
}
```

### WebSearch Tool

Search the web:

```javascript
{
  name: "WebSearch",
  description: "Search the web",
  parameters: {
    query: string,
    allowed_domains?: string[],
    blocked_domains?: string[]
  }
}
```

### Task Tool

Launch subagents:

```javascript
{
  name: "Task",
  description: "Launch subagent",
  parameters: {
    description: string,
    prompt: string,
    subagent_type: string
  }
}
```

## Tool Execution

### Execute Tool

```javascript
import { executeToolexecute from './tools/index.js';

const result = await executeTool('Bash', {
  command: 'ls -la',
  cwd: '/home/user'
});
```

### Tool Result Format

```javascript
{
  success: boolean,
  output: any,
  error?: string,
  duration: number,
  toolName: string
}
```

## MCP Tools

Tools provided by MCP servers:

### List MCP Tools

```javascript
import { listMCPTools } from './tools/mcp.js';

const tools = await listMCPTools(mcpClient);
```

### Execute MCP Tool

```javascript
import { executeMCPTool } from './tools/mcp.js';

const result = await executeMCPTool(
  mcpClient,
  'toolName',
  { param1: 'value1' }
);
```

## Tool Hooks

Hooks for tool lifecycle events:

```javascript
import { ToolHooks } from './tools/hooks.js';

// Before tool execution
ToolHooks.on('beforeExecute', (toolName, params) => {
  console.log(`Executing ${toolName}...`);
});

// After tool execution
ToolHooks.on('afterExecute', (toolName, result) => {
  console.log(`Completed ${toolName}`);
});

// On tool error
ToolHooks.on('error', (toolName, error) => {
  console.error(`Error in ${toolName}:`, error);
});
```

## Tool Validation

Validate tool parameters before execution:

```javascript
import { validateToolParams } from './tools/validation.js';

const isValid = validateToolParams('Bash', {
  command: 'ls -la',
  timeout: 5000
});

if (!isValid) {
  throw new Error('Invalid parameters');
}
```

## Tool Security

Security considerations:
- Command injection prevention
- Path traversal protection
- Resource limits (timeout, memory)
- Sandboxing for bash commands
- Permission checks

## Dependencies

- **Session Module** - Tool execution context
- **MCP Protocol Module** - MCP tool integration
- **UI Module** - Tool selection interface
- **Validation Module** - Parameter validation
- **Configuration Module** - Tool settings
