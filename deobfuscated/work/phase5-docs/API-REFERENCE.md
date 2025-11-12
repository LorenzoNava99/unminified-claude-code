# Claude Code API Reference

## Overview

This document provides a comprehensive API reference for Claude Code CLI, derived from static analysis of the deobfuscated source code. It covers the Anthropic Messages API integration, MCP protocol implementation, and internal tool APIs.

## Table of Contents

1. [Anthropic Messages API](#anthropic-messages-api)
2. [MCP Protocol API](#mcp-protocol-api)
3. [Built-in Tool APIs](#built-in-tool-apis)
4. [Configuration API](#configuration-api)
5. [Storage API](#storage-api)
6. [Authentication API](#authentication-api)
7. [Multi-Cloud Provider APIs](#multi-cloud-provider-apis)

---

## 1. Anthropic Messages API

### Base Configuration

```typescript
interface APIConfig {
  baseURL: string;           // "https://api.anthropic.com"
  apiVersion: string;        // "2023-06-01"
  defaultModel: string;      // "claude-sonnet-4-5-20250929"
  maxTokens: number;         // 8192
  temperature: number;       // 1.0
}

// Line 55827 - Base API URL
const BASE_API_URL = "https://api.anthropic.com";
```

### Create Message

**Endpoint**: `POST /v1/messages`

**Headers**:
```typescript
{
  "anthropic-version": "2023-06-01",
  "anthropic-beta": "prompt-caching-2024-07-31,pdfs-2024-09-25,max-tokens-3-5-sonnet-2024-07-15",
  "x-api-key": string,
  "content-type": "application/json"
}
```

**Request Body**:
```typescript
interface CreateMessageRequest {
  model: string;              // "claude-sonnet-4-5-20250929"
  messages: Message[];
  tools?: Tool[];
  max_tokens: number;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  stream: boolean;
  system?: string | SystemBlock[];
  metadata?: {
    user_id?: string;
  };
}

interface Message {
  role: "user" | "assistant";
  content: string | ContentBlock[];
}

type ContentBlock =
  | TextBlock
  | ImageBlock
  | ToolUseBlock
  | ToolResultBlock;

interface TextBlock {
  type: "text";
  text: string;
  cache_control?: { type: "ephemeral" };
}

interface ToolUseBlock {
  type: "tool_use";
  id: string;
  name: string;
  input: Record<string, unknown>;
}

interface ToolResultBlock {
  type: "tool_result";
  tool_use_id: string;
  content: string;
  is_error?: boolean;
}

interface Tool {
  name: string;
  description: string;
  input_schema: JSONSchema;
  cache_control?: { type: "ephemeral" };
}
```

**Response (Stream)**:
```typescript
// Server-Sent Events format

// Event 1: message_start
event: message_start
data: {
  type: "message_start",
  message: {
    id: string,
    type: "message",
    role: "assistant",
    content: [],
    model: string,
    usage: {
      input_tokens: number,
      output_tokens: number
    }
  }
}

// Event 2: content_block_start
event: content_block_start
data: {
  type: "content_block_start",
  index: number,
  content_block: { type: "text", text: "" }
}

// Event 3: content_block_delta (repeated)
event: content_block_delta
data: {
  type: "content_block_delta",
  index: number,
  delta: { type: "text_delta", text: string }
}

// Event 4: content_block_stop
event: content_block_stop
data: { type: "content_block_stop", index: number }

// Event 5: message_delta
event: message_delta
data: {
  type: "message_delta",
  delta: { stop_reason: "end_turn" | "tool_use" },
  usage: { output_tokens: number }
}

// Event 6: message_stop
event: message_stop
data: { type: "message_stop" }
```

**Token Usage Types**:
```typescript
interface TokenUsage {
  input_tokens: number;                  // New tokens processed
  output_tokens: number;                 // Tokens generated
  cache_creation_input_tokens?: number;  // Tokens written to cache
  cache_read_input_tokens?: number;      // Tokens read from cache
}

// Prompt caching reduces costs:
// - Cached reads: 90% discount
// - Cache creation: 25% markup
// - Cache TTL: 5 minutes
```

### Streaming Connection Methods

**Method 1: WebSocket (Primary)**
```typescript
// Line 43496 - WebSocket v13 primary
const ws = new WebSocket("wss://api.anthropic.com/v1/messages/stream");

ws.on("open", () => {
  ws.send(JSON.stringify(request));
});

ws.on("message", (data) => {
  const event = parseSSE(data);
  handleEvent(event);
});

// Handshake headers
{
  "Sec-WebSocket-Version": "13",
  "Sec-WebSocket-Key": base64(random(16)),
  "Connection": "Upgrade",
  "Upgrade": "websocket"
}

// Fallback to WebSocket v8 if v13 fails
```

**Method 2: Server-Sent Events (Fallback)**
```typescript
const eventSource = new EventSource(
  "https://api.anthropic.com/v1/messages?stream=true",
  {
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    }
  }
);

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  handleEvent(data);
};
```

**Method 3: HTTP Long-Polling (Last Resort)**
```typescript
async function poll() {
  const response = await fetch("/v1/messages", {
    method: "POST",
    body: JSON.stringify(request)
  });

  for await (const chunk of response.body) {
    yield parseSSE(chunk);
  }
}
```

### Error Responses

```typescript
interface ErrorResponse {
  type: "error";
  error: {
    type: ErrorType;
    message: string;
  };
}

type ErrorType =
  | "invalid_request_error"
  | "authentication_error"
  | "permission_error"
  | "not_found_error"
  | "rate_limit_error"
  | "api_error"
  | "overloaded_error";

// Line 43496 - Error handling with retry
```

---

## 2. MCP Protocol API

### Protocol Overview

Model Context Protocol (MCP) enables Claude Code to integrate with external tools and data sources.

**Version**: MCP 1.0 (extensible)
**Transport**: stdio, Server-Sent Events
**Authentication**: OIDC + PKCE S256 (for SSE)

### Server Configuration

```typescript
// ~/.claude/mcp_servers.json
interface MCPServersConfig {
  mcpServers: {
    [serverName: string]: MCPServerConfig;
  };
}

interface MCPServerConfig {
  name: string;
  command: string;           // Executable path
  args?: string[];
  env?: Record<string, string>;
  mcpb?: string;            // Path to .mcpb file
  transport?: "stdio" | "sse";
  sse?: {
    url: string;
    headers?: Record<string, string>;
  };
}

// Example
{
  "mcpServers": {
    "filesystem": {
      "command": "mcp-server-filesystem",
      "args": ["/home/user/projects"],
      "env": { "DEBUG": "true" }
    },
    "github": {
      "mcpb": "/path/to/github-mcp.mcpb"
    },
    "remote": {
      "transport": "sse",
      "sse": {
        "url": "https://example.com/mcp",
        "headers": { "Authorization": "Bearer token" }
      }
    }
  }
}
```

### MCP Protocol Messages

#### 1. Initialize

**Request** (Client → Server):
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "1.0",
    "capabilities": {
      "tools": {},
      "prompts": {},
      "resources": {}
    },
    "clientInfo": {
      "name": "claude-code",
      "version": "2.0.37"
    }
  }
}
```

**Response** (Server → Client):
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "protocolVersion": "1.0",
    "capabilities": {
      "tools": { "listChanged": true },
      "prompts": {},
      "resources": {}
    },
    "serverInfo": {
      "name": "example-server",
      "version": "1.0.0"
    }
  }
}
```

#### 2. Initialized Notification

**Notification** (Client → Server):
```json
{
  "jsonrpc": "2.0",
  "method": "notifications/initialized"
}
```

#### 3. List Tools

**Request**:
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/list"
}
```

**Response**:
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "tools": [
      {
        "name": "read_file",
        "description": "Read contents of a file",
        "inputSchema": {
          "type": "object",
          "properties": {
            "path": {
              "type": "string",
              "description": "File path"
            }
          },
          "required": ["path"]
        }
      }
    ]
  }
}
```

#### 4. Call Tool

**Request**:
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "read_file",
    "arguments": {
      "path": "/path/to/file.txt"
    }
  }
}
```

**Response**:
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "File contents here..."
      }
    ]
  }
}

// Or error response
{
  "jsonrpc": "2.0",
  "id": 3,
  "error": {
    "code": -32603,
    "message": "File not found",
    "data": { "path": "/path/to/file.txt" }
  }
}
```

### Tool Naming Convention

**Line 6663, 272070 - Tool name format**:
```typescript
// MCP tools are prefixed with server name
const toolName = `mcp__${serverName}__${toolName}`;

// Example: mcp__filesystem__read_file
// Example: mcp__github__create_issue
```

### Server Detection

**Line 3699 - Server name extraction**:
```typescript
function detectMCPServer(stderr: string): string | null {
  // Match: MCP server "server-name"
  const match = stderr.match(/^MCP server ["']([^"']+)["']/);
  return match?.[1] || null;
}
```

### OIDC Requirements (SSE Transport)

**Line 24132 - PKCE S256 requirement**:
```typescript
// MCP servers using SSE transport MUST support:
// - OpenID Connect (OIDC)
// - PKCE (Proof Key for Code Exchange)
// - S256 code challenge method

function validateOIDCProvider(metadata: OIDCMetadata): void {
  if (!metadata.code_challenge_methods_supported?.includes("S256")) {
    throw new Error(
      `Incompatible OIDC provider: does not support S256 code challenge method required by MCP specification`
    );
  }
}
```

---

## 3. Built-in Tool APIs

Claude Code provides a comprehensive set of built-in tools for file operations, command execution, and more.

### Tool: Read

**Description**: Read file contents

```typescript
interface ReadToolInput {
  file_path: string;        // Absolute path
  offset?: number;          // Line number to start (1-indexed)
  limit?: number;           // Number of lines to read
}

interface ReadToolOutput {
  content: string;          // File contents (cat -n format)
  truncated?: boolean;
}

// Usage in tool_use block
{
  "type": "tool_use",
  "name": "Read",
  "input": {
    "file_path": "/home/user/project/src/main.ts"
  }
}
```

### Tool: Write

**Description**: Write content to file (overwrites)

```typescript
interface WriteToolInput {
  file_path: string;
  content: string;
}

interface WriteToolOutput {
  success: boolean;
  bytes_written: number;
}
```

### Tool: Edit

**Description**: Replace specific text in file

```typescript
interface EditToolInput {
  file_path: string;
  old_string: string;       // Text to replace (must be unique)
  new_string: string;
  replace_all?: boolean;    // Replace all occurrences
}

interface EditToolOutput {
  success: boolean;
  replacements: number;
}
```

### Tool: Bash

**Description**: Execute shell command

```typescript
interface BashToolInput {
  command: string;
  timeout?: number;         // Milliseconds (default: 120000)
  run_in_background?: boolean;
}

interface BashToolOutput {
  stdout: string;
  stderr: string;
  exit_code: number;
  shell_id?: string;        // If background execution
}
```

### Tool: Glob

**Description**: Find files matching pattern

```typescript
interface GlobToolInput {
  pattern: string;          // Glob pattern (e.g., "**/*.ts")
  path?: string;           // Directory to search (default: cwd)
}

interface GlobToolOutput {
  files: string[];          // Sorted by modification time
}
```

### Tool: Grep

**Description**: Search file contents

```typescript
interface GrepToolInput {
  pattern: string;          // Regex pattern
  path?: string;           // File or directory
  glob?: string;           // File filter (e.g., "*.js")
  type?: string;           // File type (e.g., "js", "py")
  output_mode?: "content" | "files_with_matches" | "count";
  "-i"?: boolean;          // Case insensitive
  "-n"?: boolean;          // Show line numbers
  "-A"?: number;           // Lines after match
  "-B"?: number;           // Lines before match
  "-C"?: number;           // Context lines
}

interface GrepToolOutput {
  matches: Match[] | string[] | { [file: string]: number };
}
```

### Tool: WebFetch

**Description**: Fetch and analyze web content

```typescript
interface WebFetchToolInput {
  url: string;              // Full URL
  prompt: string;           // Analysis prompt
}

interface WebFetchToolOutput {
  content: string;          // Analyzed content
  markdown?: string;        // Converted markdown
}
```

### Tool: WebSearch

**Description**: Search the web

```typescript
interface WebSearchToolInput {
  query: string;
  allowed_domains?: string[];
  blocked_domains?: string[];
}

interface WebSearchToolOutput {
  results: SearchResult[];
}

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}
```

---

## 4. Configuration API

### Configuration File Format

**~/.claude/config.json**:
```typescript
interface ClaudeConfig {
  // Model settings
  defaultModel?: string;             // "claude-sonnet-4-5-20250929"
  maxTokens?: number;                // 8192
  temperature?: number;              // 0.0 - 1.0

  // Provider settings
  provider?: "anthropic" | "bedrock" | "vertex";
  awsRegion?: string;
  vertexRegion?: string;
  vertexProject?: string;

  // Feature flags
  enableExperimentalMCP?: boolean;
  enablePromptCaching?: boolean;
  enableWebSearch?: boolean;

  // UI settings
  theme?: "dark" | "light" | "auto";
  syntaxHighlighting?: boolean;

  // Telemetry
  telemetryEnabled?: boolean;
  sentryEnabled?: boolean;
  statsigEnabled?: boolean;
}
```

**Project .claude-code.toml**:
```toml
[project]
name = "my-project"
version = "1.0.0"

[model]
default = "claude-sonnet-4-5-20250929"
max_tokens = 8192

[tools]
enabled = ["Read", "Write", "Bash", "Glob", "Grep"]
disabled = ["WebSearch"]

[mcp]
servers_file = ".claude/mcp_servers.json"

[hooks]
pre_tool_use = ".claude/hooks/pre_tool.sh"
post_tool_use = ".claude/hooks/post_tool.sh"
```

### Environment Variables

```bash
# Authentication
export ANTHROPIC_API_KEY="sk-ant-..."

# Configuration
export CLAUDE_CONFIG_DIR="/path/to/config"

# Provider selection
export CLAUDE_CODE_USE_BEDROCK="true"
export AWS_REGION="us-west-2"
export AWS_PROFILE="bedrock-user"

# Vertex AI
export VERTEX_REGION_CLAUDE_SONNET_4_5="us-central1"
export VERTEX_PROJECT="my-gcp-project"
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/credentials.json"

# Feature flags
export ENABLE_EXPERIMENTAL_MCP_CLI="true"

# Debugging
export DEBUG="claude:*"
export CLAUDE_LOG_LEVEL="debug"

# Telemetry
export SENTRY_DSN="https://..."
export STATSIG_SDK_KEY="..."
```

---

## 5. Storage API

### LocalForage Interface

Claude Code uses LocalForage for persistent storage.

```typescript
interface StorageAPI {
  setItem<T>(key: string, value: T): Promise<T>;
  getItem<T>(key: string): Promise<T | null>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
  length(): Promise<number>;
}

// Storage locations
// - Conversations: "conversation:{sessionId}"
// - OAuth tokens: "oauth:token"
// - Session state: "session:current"
// - MCP cache: "mcp:servers"
```

### Session Storage Schema

```typescript
interface StoredSession {
  id: string;
  created_at: number;
  updated_at: number;
  workspace: string;
  model: string;
  messages: Message[];
  tool_uses: ToolUse[];
  tokens: {
    input_tokens: number;
    output_tokens: number;
    cache_read_input_tokens: number;
    cache_creation_input_tokens: number;
  };
}
```

---

## 6. Authentication API

### API Key Authentication

```typescript
// Priority order:
// 1. ANTHROPIC_API_KEY environment variable
// 2. File descriptor (--api-key-fd flag)
// 3. ~/.claude/api_key file
// 4. Prompt user

interface APIKeyAuth {
  type: "api_key";
  key: string;
}
```

### OAuth Authentication

```typescript
interface OAuthFlow {
  // Step 1: Generate PKCE challenge
  code_verifier: string;        // 43-128 chars, [A-Za-z0-9_.-]
  code_challenge: string;       // base64url(sha256(verifier))
  code_challenge_method: "S256";

  // Step 2: Authorization request
  authorization_url: string;
  // https://claude.ai/oauth/authorize?
  //   client_id=claude_cli&
  //   response_type=code&
  //   redirect_uri=http://localhost:3000/callback&
  //   code_challenge={challenge}&
  //   code_challenge_method=S256&
  //   scope=openid profile

  // Step 3: Token exchange
  token_endpoint: "https://api.anthropic.com/v1/oauth/token";

  // Step 4: Store tokens
  tokens: {
    access_token: string;
    refresh_token: string;
    id_token: string;           // JWT
    expires_in: number;         // Seconds
    token_type: "Bearer";
    session_ingress_token?: string;
  };
}

// Line 24132 - PKCE S256 requirement
```

### Token Refresh

```typescript
async function refreshToken(refresh_token: string): Promise<OAuthTokens> {
  const response = await fetch("https://api.anthropic.com/v1/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "refresh_token",
      refresh_token,
      client_id: "claude_cli"
    })
  });

  return response.json();
}
```

---

## 7. Multi-Cloud Provider APIs

### AWS Bedrock

```typescript
// Line 178341+ - Bedrock integration
import {
  BedrockClient,
  ListFoundationModelsCommand
} from "@aws-sdk/client-bedrock";
import {
  BedrockRuntimeClient,
  InvokeModelWithResponseStreamCommand
} from "@aws-sdk/client-bedrock-runtime";

interface BedrockConfig {
  region: string;               // e.g., "us-east-1"
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
  };
  // Or use AWS_PROFILE, instance role, etc.
}

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1"
});

// Model IDs
const MODELS = {
  HAIKU_4_5: "anthropic.claude-haiku-4-5-v1:0",
  SONNET_3_5: "anthropic.claude-3-5-sonnet-20241022-v2:0",
  SONNET_4_5: "anthropic.claude-sonnet-4-5-v1:0",
  OPUS_4: "anthropic.claude-opus-4-v1:0"
};

// Invoke model
const command = new InvokeModelWithResponseStreamCommand({
  modelId: MODELS.SONNET_4_5,
  contentType: "application/json",
  accept: "application/json",
  body: JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    messages: [...],
    max_tokens: 8192
  })
});

const response = await client.send(command);
for await (const chunk of response.body) {
  // Process streamed response
}
```

### Google Vertex AI

```typescript
// Vertex endpoint
const VERTEX_ENDPOINT = "https://aiplatform.googleapis.com/v1";

interface VertexConfig {
  project: string;              // GCP project ID
  region: string;               // e.g., "us-central1"
  credentials: string;          // Path to service account JSON
}

// Model locations (lines 4008-4027)
const VERTEX_REGIONS = {
  HAIKU_4_5: process.env.VERTEX_REGION_CLAUDE_HAIKU_4_5 || "us-central1",
  SONNET_3_5: process.env.VERTEX_REGION_CLAUDE_3_5_SONNET || "us-central1",
  SONNET_3_7: process.env.VERTEX_REGION_CLAUDE_3_7_SONNET || "us-east5",
  SONNET_4_5: process.env.VERTEX_REGION_CLAUDE_SONNET_4_5 || "us-east5",
  OPUS_4: process.env.VERTEX_REGION_CLAUDE_OPUS_4 || "us-east5"
};

// Invoke model
const url = `${VERTEX_ENDPOINT}/projects/${project}/locations/${region}/publishers/anthropic/models/${model}:streamRawPredict`;

const response = await fetch(url, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${accessToken}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    anthropic_version: "vertex-2023-10-16",
    messages: [...],
    max_tokens: 8192,
    stream: true
  })
});
```

---

## API Versioning

### Anthropic API Versions

```typescript
// Current version
const ANTHROPIC_VERSION = "2023-06-01";

// Beta features (Line 178341)
const ANTHROPIC_BETA = [
  "prompt-caching-2024-07-31",
  "pdfs-2024-09-25",
  "max-tokens-3-5-sonnet-2024-07-15"
].join(",");
```

### MCP Protocol Versions

```typescript
// Current protocol version
const MCP_PROTOCOL_VERSION = "1.0";

// Forward compatible: clients should accept newer versions
```

---

## Rate Limits and Quotas

### Anthropic API Limits

```typescript
// Rate limits (from documentation, not in code)
interface RateLimits {
  requests_per_minute: number;   // Tier-dependent
  tokens_per_minute: number;     // Tier-dependent
  tokens_per_day: number;        // Tier-dependent
}

// Retry strategy on 429 errors
// - Initial retry after: 1 second
// - Exponential backoff: 2x multiplier
// - Max retries: 3
// - Max backoff: 60 seconds
```

---

## SDK Versions

From version-strings.txt analysis:

```typescript
const SDK_VERSIONS = {
  CLAUDE_CODE: "2.0.37",
  REACT: "18.3.1",
  AWS_SDK_BEDROCK: "3.840.0",
  AWS_SDK_BEDROCK_RUNTIME: "3.797.0",
  COMMANDER: "9.15.1",
  LOCALFORAGE: "1.3.0",
  RXJS: "7.0.0"
};
```

---

## Related Documentation

- **Phase 2**: [ARCHITECTURE.md](../analysis/ARCHITECTURE.md) - System architecture
- **Phase 3**: [SEMANTIC-ANALYSIS.md](../phase3-semantic/SEMANTIC-ANALYSIS.md) - Code semantics
- **Phase 4**: [EXECUTION-ANALYSIS.md](../phase4-execution/EXECUTION-ANALYSIS.md) - Execution paths
- **Phase 5**: [MCP-INTEGRATION-GUIDE.md](./MCP-INTEGRATION-GUIDE.md) - MCP integration guide

**Generated**: 2025-11-12
**Methodology**: Static analysis of deobfuscated source code
**API Version**: 2023-06-01
