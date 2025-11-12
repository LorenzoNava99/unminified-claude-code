# MCP Integration Guide

## Overview

This guide provides comprehensive instructions for integrating Model Context Protocol (MCP) servers with Claude Code CLI. Based on static analysis of the Claude Code source, this represents one of the first production implementations of the MCP protocol.

## Table of Contents

1. [Introduction to MCP](#introduction-to-mcp)
2. [Quick Start](#quick-start)
3. [Transport Methods](#transport-methods)
4. [Server Development](#server-development)
5. [Tool Development](#tool-development)
6. [Authentication (SSE)](#authentication-sse)
7. [Advanced Patterns](#advanced-patterns)
8. [Troubleshooting](#troubleshooting)

---

## 1. Introduction to MCP

### What is MCP?

Model Context Protocol (MCP) is an open protocol that enables AI applications like Claude Code to:

- **Access external tools** - Execute commands on remote systems
- **Query data sources** - Read databases, APIs, filesystems
- **Integrate services** - GitHub, Jira, Slack, custom systems
- **Extend capabilities** - Add domain-specific functionality

### How Claude Code Uses MCP

```
┌─────────────────┐
│   Claude Code   │
│      CLI        │
└────────┬────────┘
         │
         │ MCP Protocol (JSON-RPC 2.0)
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────┐
│ stdio │ │  SSE  │
│Server │ │Server │
└───┬───┘ └──┬────┘
    │        │
┌───▼───────▼────┐
│  Your Tools &  │
│  Data Sources  │
└────────────────┘
```

### Key Concepts

**Server**: A process that exposes tools via MCP protocol
**Tool**: A function that Claude can call (like `read_file`, `search_code`)
**Transport**: How messages are sent (stdio, SSE)
**Discovery**: How Claude Code finds and loads servers

---

## 2. Quick Start

### Step 1: Install an MCP Server

Example with a filesystem server:

```bash
npm install -g @modelcontextprotocol/server-filesystem
```

### Step 2: Configure Claude Code

Create `~/.claude/mcp_servers.json`:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "mcp-server-filesystem",
      "args": ["/home/user/projects"],
      "env": {
        "DEBUG": "false"
      }
    }
  }
}
```

### Step 3: Enable MCP

```bash
export ENABLE_EXPERIMENTAL_MCP_CLI=true
```

### Step 4: Use the Tools

```bash
claude

> Can you read the README.md file in my projects directory?

# Claude will use: mcp__filesystem__read_file
```

---

## 3. Transport Methods

MCP supports two transport methods:

### Method 1: stdio (Standard I/O)

**Best for**: Local processes, command-line tools

```json
{
  "mcpServers": {
    "my-server": {
      "command": "/path/to/server",
      "args": ["--verbose"],
      "env": {
        "API_KEY": "secret"
      }
    }
  }
}
```

**How it works**:
```
Claude Code spawns server process
   ↓
Writes JSON-RPC to server's stdin
   ↓
Reads JSON-RPC from server's stdout
   ↓
Server's stderr used for logging/detection
```

**Server detection** (Line 3699):
```javascript
// Claude Code detects server name from stderr
// Format: MCP server "server-name"
console.error('MCP server "my-server"');
```

### Method 2: SSE (Server-Sent Events)

**Best for**: Remote servers, HTTP-based services, authentication required

```json
{
  "mcpServers": {
    "remote-api": {
      "transport": "sse",
      "sse": {
        "url": "https://api.example.com/mcp",
        "headers": {
          "Authorization": "Bearer token123"
        }
      }
    }
  }
}
```

**How it works**:
```
Claude Code opens SSE connection
   ↓
Sends JSON-RPC via POST to sse.url
   ↓
Receives responses via SSE events
   ↓
Bidirectional communication over HTTP
```

**Authentication requirement** (Line 24132):

SSE transport **MUST** support:
- OpenID Connect (OIDC)
- PKCE with S256 code challenge method

---

## 4. Server Development

### Basic Server Structure

```javascript
#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// 1. Create server instance
const server = new Server(
  {
    name: 'example-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 2. Register tool handlers
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'example_tool',
        description: 'An example tool',
        inputSchema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'A message to process',
            },
          },
          required: ['message'],
        },
      },
    ],
  };
});

server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'example_tool') {
    return {
      content: [
        {
          type: 'text',
          text: `Processed: ${args.message}`,
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

// 3. Start server
const transport = new StdioServerTransport();
await server.connect(transport);

// 4. Output server detection string
console.error('MCP server "example-server"');
```

### MCP Protocol Handshake

```
Client                              Server
  │                                    │
  ├─ initialize ────────────────────>  │
  │  {                                 │
  │    protocolVersion: "1.0",         │
  │    capabilities: {...},            │
  │    clientInfo: {...}               │
  │  }                                 │
  │                                    │
  │  <──────────────── initialized ─┤
  │                    {               │
  │                      protocolVersion: "1.0",
  │                      capabilities: {...},
  │                      serverInfo: {...}
  │                    }               │
  │                                    │
  ├─ notifications/initialized ────>  │
  │                                    │
  ├─ tools/list ────────────────────>  │
  │                                    │
  │  <────────────────── tools list ─┤
  │                    {               │
  │                      tools: [...]  │
  │                    }               │
  │                                    │
  ├─ tools/call ────────────────────>  │
  │  { name, arguments }               │
  │                                    │
  │  <──────────────── tool result ──┤
  │                    { content }     │
  │                                    │
```

### Error Handling

```javascript
// MCP error codes (JSON-RPC 2.0)
const ERROR_CODES = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
};

// Error response format
{
  "jsonrpc": "2.0",
  "id": 3,
  "error": {
    "code": -32603,
    "message": "Tool execution failed",
    "data": {
      "details": "File not found: /path/to/file"
    }
  }
}
```

---

## 5. Tool Development

### Tool Definition

```javascript
// Tool schema follows JSON Schema
const toolDefinition = {
  name: 'search_code',
  description: 'Search for code patterns in a repository',
  inputSchema: {
    type: 'object',
    properties: {
      pattern: {
        type: 'string',
        description: 'Regex pattern to search for',
      },
      file_types: {
        type: 'array',
        items: { type: 'string' },
        description: 'File extensions to search (e.g., ["js", "ts"])',
      },
      case_sensitive: {
        type: 'boolean',
        description: 'Whether search is case sensitive',
        default: false,
      },
    },
    required: ['pattern'],
  },
};
```

### Tool Implementation

```javascript
async function handleToolCall(name, args) {
  switch (name) {
    case 'search_code': {
      const { pattern, file_types = [], case_sensitive = false } = args;

      // Validate inputs
      if (!pattern) {
        throw new Error('pattern is required');
      }

      try {
        // Execute search (example with ripgrep)
        const { stdout } = await execFile('rg', [
          case_sensitive ? '' : '-i',
          pattern,
          ...file_types.map(ext => `--type=${ext}`),
        ]);

        return {
          content: [
            {
              type: 'text',
              text: stdout,
            },
          ],
        };
      } catch (error) {
        // Return error to Claude
        throw new Error(`Search failed: ${error.message}`);
      }
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
```

### Tool Naming Convention (Lines 6663, 272070)

**Important**: Claude Code prefixes MCP tools with the server name:

```javascript
// Original tool name: read_file
// Server name: filesystem
// Final name used by Claude: mcp__filesystem__read_file

const toolName = `mcp__${serverName}__${originalToolName}`;

// Examples:
// mcp__filesystem__read_file
// mcp__github__create_issue
// mcp__database__execute_query
```

This prevents naming conflicts when multiple servers provide similar tools.

---

## 6. Authentication (SSE)

### OIDC + PKCE Implementation

For SSE-based MCP servers, authentication is required.

**Line 24132 - S256 requirement**:

```javascript
// Your OIDC provider MUST support:
// 1. OpenID Connect Discovery
// 2. PKCE (Proof Key for Code Exchange)
// 3. S256 code challenge method

// Check provider compatibility
function validateProvider(metadata) {
  if (!metadata.code_challenge_methods_supported?.includes('S256')) {
    throw new Error(
      'OIDC provider must support S256 code challenge method (required by MCP spec)'
    );
  }
}
```

### Authorization Flow

```javascript
// 1. Generate PKCE verifier and challenge
import crypto from 'crypto';

function generatePKCE() {
  // Verifier: 43-128 random characters
  const verifier = crypto.randomBytes(32).toString('base64url');

  // Challenge: base64url(sha256(verifier))
  const challenge = crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64url');

  return { verifier, challenge };
}

// 2. Authorization request
const authUrl = new URL('https://your-idp.com/authorize');
authUrl.searchParams.set('client_id', 'your-client-id');
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('redirect_uri', 'http://localhost:3000/callback');
authUrl.searchParams.set('code_challenge', challenge);
authUrl.searchParams.set('code_challenge_method', 'S256');
authUrl.searchParams.set('scope', 'openid profile');

// 3. Token exchange (after receiving code)
const tokenResponse = await fetch('https://your-idp.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    code: authorizationCode,
    redirect_uri: 'http://localhost:3000/callback',
    client_id: 'your-client-id',
    code_verifier: verifier,
  }),
});

const { access_token, refresh_token } = await tokenResponse.json();

// 4. Use token in MCP requests
{
  "mcpServers": {
    "authenticated-server": {
      "transport": "sse",
      "sse": {
        "url": "https://api.example.com/mcp",
        "headers": {
          "Authorization": `Bearer ${access_token}`
        }
      }
    }
  }
}
```

---

## 7. Advanced Patterns

### Pattern 1: Streaming Large Results

```javascript
// For large outputs, stream results
server.setRequestHandler('tools/call', async (request) => {
  if (request.params.name === 'read_large_file') {
    const stream = fs.createReadStream(request.params.arguments.path);

    // Return streaming content
    return {
      content: [
        {
          type: 'text',
          text: await streamToString(stream),
        },
      ],
    };
  }
});
```

### Pattern 2: Progress Updates

```javascript
// Send progress notifications for long operations
server.setRequestHandler('tools/call', async (request, extra) => {
  if (request.params.name === 'process_dataset') {
    const total = 1000;

    for (let i = 0; i < total; i += 100) {
      // Process chunk
      await processChunk(i, i + 100);

      // Send progress
      await server.notification({
        method: 'notifications/progress',
        params: {
          progressToken: request.params.progressToken,
          progress: i / total,
          total: total,
        },
      });
    }

    return { content: [{ type: 'text', text: 'Done' }] };
  }
});
```

### Pattern 3: Resource Management

```javascript
// Provide reusable resources (templates, prompts)
server.setRequestHandler('resources/list', async () => {
  return {
    resources: [
      {
        uri: 'template://sql-query',
        name: 'SQL Query Template',
        description: 'Template for SQL queries',
        mimeType: 'text/plain',
      },
    ],
  };
});

server.setRequestHandler('resources/read', async (request) => {
  if (request.params.uri === 'template://sql-query') {
    return {
      contents: [
        {
          uri: 'template://sql-query',
          mimeType: 'text/plain',
          text: 'SELECT * FROM {table} WHERE {condition};',
        },
      ],
    };
  }
});
```

### Pattern 4: Caching Tool Results

```javascript
// Cache expensive tool results
const cache = new Map();

server.setRequestHandler('tools/call', async (request) => {
  const cacheKey = JSON.stringify(request.params);

  // Check cache
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  // Execute tool
  const result = await executeTool(request.params);

  // Cache result (with TTL)
  cache.set(cacheKey, result);
  setTimeout(() => cache.delete(cacheKey), 300000); // 5min TTL

  return result;
});
```

### Pattern 5: Multiple Tools in One Server

```javascript
// Organize related tools in a single server
const tools = {
  database: {
    list_tables: async (args) => {
      // Return table list
    },
    execute_query: async (args) => {
      // Execute SQL query
    },
    get_schema: async (args) => {
      // Return table schema
    },
  },
};

server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'database_list_tables',
        description: 'List all database tables',
        inputSchema: {
          type: 'object',
          properties: {
            database: { type: 'string' },
          },
          required: ['database'],
        },
      },
      // ... other tools
    ],
  };
});

server.setRequestHandler('tools/call', async (request) => {
  const [category, action] = request.params.name.split('_', 2);

  if (tools[category]?.[action]) {
    return await tools[category][action](request.params.arguments);
  }

  throw new Error(`Unknown tool: ${request.params.name}`);
});
```

---

## 8. Troubleshooting

### Issue: Server Not Detected

**Symptom**: MCP server tools not available in Claude Code

**Solutions**:

1. **Check server output on stderr**:
   ```javascript
   console.error('MCP server "my-server"');
   ```

2. **Verify configuration**:
   ```bash
   cat ~/.claude/mcp_servers.json
   ```

3. **Test server manually**:
   ```bash
   echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}' | your-server
   ```

4. **Check logs**:
   ```bash
   export DEBUG=claude:mcp
   claude
   ```

### Issue: Tool Execution Fails

**Symptom**: Tool returns error or times out

**Solutions**:

1. **Validate input schema**:
   ```javascript
   // Use strict validation
   if (!args.required_param) {
     throw new Error('required_param is missing');
   }
   ```

2. **Add timeout handling**:
   ```javascript
   const timeout = new Promise((_, reject) =>
     setTimeout(() => reject(new Error('Timeout')), 30000)
   );

   const result = await Promise.race([operation(), timeout]);
   ```

3. **Return detailed errors**:
   ```javascript
   catch (error) {
     return {
       content: [{
         type: 'text',
         text: `Error: ${error.message}\nStack: ${error.stack}`
       }],
       isError: true
     };
   }
   ```

### Issue: OIDC Authentication Fails

**Symptom**: SSE server connection fails with auth error

**Solutions**:

1. **Verify S256 support**:
   ```bash
   curl https://your-idp.com/.well-known/openid-configuration | jq .code_challenge_methods_supported
   # Should include "S256"
   ```

2. **Check token expiration**:
   ```javascript
   if (Date.now() > token.expires_at * 1000) {
     // Refresh token
   }
   ```

3. **Validate redirect URI**:
   ```javascript
   // Must exactly match registered redirect_uri
   redirect_uri: 'http://localhost:3000/callback'  // No trailing slash
   ```

### Issue: Server Crashes

**Symptom**: Server process exits unexpectedly

**Solutions**:

1. **Add error handling**:
   ```javascript
   process.on('uncaughtException', (error) => {
     console.error('Uncaught exception:', error);
     process.exit(1);
   });

   process.on('unhandledRejection', (reason) => {
     console.error('Unhandled rejection:', reason);
     process.exit(1);
   });
   ```

2. **Validate all inputs**:
   ```javascript
   function validateArgs(args, schema) {
     // Use JSON Schema validator
     const valid = validate(args, schema);
     if (!valid) {
       throw new Error(`Invalid arguments: ${validate.errors}`);
     }
   }
   ```

3. **Graceful shutdown**:
   ```javascript
   process.on('SIGTERM', async () => {
     await cleanup();
     process.exit(0);
   });
   ```

---

## Example: Complete MCP Server

```javascript
#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import fs from 'fs/promises';

// Validation schemas
const ReadFileSchema = z.object({
  path: z.string().min(1),
  encoding: z.enum(['utf8', 'base64']).default('utf8'),
});

const WriteFileSchema = z.object({
  path: z.string().min(1),
  content: z.string(),
  encoding: z.enum(['utf8', 'base64']).default('utf8'),
});

// Create server
const server = new Server(
  {
    name: 'filesystem-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool definitions
const TOOLS = [
  {
    name: 'read_file',
    description: 'Read contents of a file',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to file',
        },
        encoding: {
          type: 'string',
          enum: ['utf8', 'base64'],
          description: 'File encoding',
          default: 'utf8',
        },
      },
      required: ['path'],
    },
  },
  {
    name: 'write_file',
    description: 'Write content to a file',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to file',
        },
        content: {
          type: 'string',
          description: 'File content',
        },
        encoding: {
          type: 'string',
          enum: ['utf8', 'base64'],
          description: 'File encoding',
          default: 'utf8',
        },
      },
      required: ['path', 'content'],
    },
  },
];

// Register handlers
server.setRequestHandler('tools/list', async () => {
  return { tools: TOOLS };
});

server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'read_file': {
        const { path, encoding } = ReadFileSchema.parse(args);
        const content = await fs.readFile(path, encoding);
        return {
          content: [
            {
              type: 'text',
              text: content,
            },
          ],
        };
      }

      case 'write_file': {
        const { path, content, encoding } = WriteFileSchema.parse(args);
        await fs.writeFile(path, content, encoding);
        return {
          content: [
            {
              type: 'text',
              text: `Successfully wrote to ${path}`,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    throw new Error(`Tool execution failed: ${error.message}`);
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Server detection
  console.error('MCP server "filesystem-server"');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
```

---

## Best Practices

1. **Always validate inputs** - Use schema validation (Zod, Ajv, etc.)
2. **Handle errors gracefully** - Return descriptive error messages to Claude
3. **Add timeouts** - Prevent hanging on long operations
4. **Log to stderr** - Keep stdout clean for JSON-RPC
5. **Test manually** - Use `echo '{"jsonrpc":"2.0",...}' | your-server`
6. **Version your tools** - Include version in server name for breaking changes
7. **Document thoroughly** - Clear descriptions help Claude use tools correctly
8. **Implement health checks** - Respond to ping/health requests
9. **Cache when possible** - Avoid redundant expensive operations
10. **Clean up resources** - Handle SIGTERM for graceful shutdown

---

## Related Documentation

- **Phase 2**: [ARCHITECTURE.md](../analysis/ARCHITECTURE.md) - MCP architecture
- **Phase 3**: [SEMANTIC-ANALYSIS.md](../phase3-semantic/SEMANTIC-ANALYSIS.md) - MCP code analysis
- **Phase 5**: [API-REFERENCE.md](./API-REFERENCE.md) - MCP API reference
- **MCP Specification**: https://modelcontextprotocol.io/

**Generated**: 2025-11-12
**Source**: Static analysis of Claude Code deobfuscated source
**Protocol Version**: MCP 1.0
