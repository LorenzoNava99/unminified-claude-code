# CLI Module

Command-line interface and entry point for Claude Code.

## Overview

This module provides the main CLI functionality:
- Command parsing and routing
- Interactive and non-interactive modes
- Configuration management
- Session initialization
- Error handling and logging

## Entry Point

### Main CLI

```javascript
#!/usr/bin/env node

import { CLI } from './cli/index.js';

const cli = new CLI({
  name: 'claude-code',
  version: '2.0.37',
  description: 'Claude Code CLI'
});

cli.run(process.argv.slice(2));
```

## Commands

### Chat Command

Start interactive chat session:

```bash
claude-code chat
claude-code chat --model claude-opus-4
claude-code chat --project /path/to/project
```

### Task Command

Execute one-off task:

```bash
claude-code task "Write a hello world program"
claude-code task --file prompt.txt
```

### Config Command

Manage configuration:

```bash
claude-code config list
claude-code config get api_key
claude-code config set api_key sk-...
claude-code config delete api_key
```

### Auth Command

Manage authentication:

```bash
claude-code auth login
claude-code auth logout
claude-code auth status
```

### MCP Command

Manage MCP servers:

```bash
claude-code mcp list
claude-code mcp add server-name
claude-code mcp remove server-name
claude-code mcp info server-name
```

### Version Command

Show version information:

```bash
claude-code --version
claude-code -v
```

### Help Command

Show help:

```bash
claude-code --help
claude-code -h
claude-code chat --help
```

## Command Structure

### Command Definition

```javascript
class Command {
  name: string;
  description: string;
  options: Option[];
  action: (args, options) => Promise<void>;

  /**
   * Execute command
   */
  async execute(args, options) { }

  /**
   * Validate arguments
   */
  validate(args, options) { }

  /**
   * Show help
   */
  help() { }
}
```

### Option Definition

```javascript
interface Option {
  name: string;
  alias?: string;
  description: string;
  type: 'string' | 'number' | 'boolean';
  required?: boolean;
  default?: any;
  choices?: any[];
}
```

## Global Options

Options available for all commands:

```bash
--verbose, -v         Verbose output
--quiet, -q          Quiet mode
--no-color           Disable colors
--config <path>      Config file path
--log-level <level>  Log level (debug|info|warn|error)
--help, -h           Show help
```

## Configuration

### Config File

Default location: `~/.claude/config.json`

```json
{
  "api_key": "sk-...",
  "model": "claude-sonnet-4-5",
  "provider": "anthropic",
  "max_tokens": 4096,
  "temperature": 1.0,
  "theme": "dark"
}
```

### Environment Variables

```bash
ANTHROPIC_API_KEY=sk-...
CLAUDE_CONFIG_DIR=~/.claude
CLAUDE_MODEL=claude-opus-4
CLAUDE_PROVIDER=anthropic
CLAUDE_MAX_TOKENS=4096
```

## Interactive Mode

### REPL

Start REPL (Read-Eval-Print Loop):

```bash
claude-code
> How do I create a function?
Claude: To create a function...
> exit
```

### Commands in REPL

```bash
/help              Show help
/clear             Clear screen
/reset             Reset conversation
/model <name>      Switch model
/save <file>       Save conversation
/load <file>       Load conversation
/exit              Exit REPL
```

## Error Handling

### Error Types

```javascript
class CLIError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}

// Usage
throw new CLIError('Invalid API key', 'AUTH_ERROR');
```

### Error Codes

- `AUTH_ERROR` - Authentication failed
- `CONFIG_ERROR` - Configuration invalid
- `API_ERROR` - API request failed
- `VALIDATION_ERROR` - Input validation failed
- `FILE_ERROR` - File operation failed
- `NETWORK_ERROR` - Network request failed

### Error Handling

```javascript
try {
  await command.execute(args, options);
} catch (error) {
  if (error instanceof CLIError) {
    console.error(`Error [${error.code}]: ${error.message}`);
    process.exit(1);
  } else {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}
```

## Logging

### Log Levels

```javascript
import { logger } from './cli/logger.js';

logger.debug('Debug message');
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message');
```

### Log Configuration

```javascript
logger.configure({
  level: 'info',        // Minimum level to log
  format: 'text',       // or 'json'
  output: process.stderr,
  timestamps: true,
  colors: true
});
```

## Testing

### Command Testing

```javascript
import { CLI } from './cli/index.js';

describe('CLI', () => {
  test('chat command', async () => {
    const cli = new CLI();
    const result = await cli.run(['chat', '--help']);
    expect(result).toContain('Start chat session');
  });
});
```

## Signal Handling

Handle process signals gracefully:

```javascript
process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  await cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await cleanup();
  process.exit(0);
});
```

## Startup Flow

1. Parse command-line arguments
2. Load configuration
3. Initialize session
4. Authenticate if needed
5. Execute command
6. Cleanup and exit

## Architecture

```
CLI Entry Point
├── Command Router
│   ├── Chat Command
│   ├── Task Command
│   ├── Config Command
│   ├── Auth Command
│   └── MCP Command
├── Session Manager
├── Configuration Manager
├── API Client
└── UI Components
```

## Dependencies

- **All Modules** - CLI orchestrates all modules
- **Configuration Module** - Config management
- **Session Module** - Session handling
- **API Client Module** - API interactions
- **Tools Module** - Tool execution
- **UI Module** - Terminal interface
- **MCP Protocol Module** - MCP integration
- **OAuth Module** - Authentication

## Best Practices

1. **Always validate input**
2. **Provide helpful error messages**
3. **Support both interactive and non-interactive modes**
4. **Handle signals gracefully**
5. **Log important operations**
6. **Exit with appropriate codes**
7. **Show progress for long operations**
8. **Support --help for all commands**
