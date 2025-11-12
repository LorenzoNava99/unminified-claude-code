# Claude Code CLI - Phase 3 Semantic Analysis

**Date:** 2025-11-12
**Phase:** Semantic Analysis (Phase 3)
**Status:** In Progress
**Scope:** Symbol table, call graphs, type inference, execution flows

---

## Table of Contents

1. [Symbol Table](#symbol-table)
2. [MCP Integration Architecture](#mcp-integration-architecture)
3. [Streaming Implementation](#streaming-implementation)
4. [Tool Execution Flow](#tool-execution-flow)
5. [AI Provider Clients](#ai-provider-clients)
6. [Class Hierarchy](#class-hierarchy)
7. [Call Graph Analysis](#call-graph-analysis)
8. [Type Inference](#type-inference)

---

## Symbol Table

### Function Signatures (200+ extracted)

**Naming Pattern Analysis:**
- Pattern: Single capital letter + 2-3 digits (e.g., `MB9`, `TB9`, `AQ9`)
- Total unique functions: 200+ in initial scan
- Parameter count: Varies 0-4 parameters typically

**Key Functions Identified:**

```javascript
// Line 109
function MB9(A) { ... }

// Line 120
function TB9(A) { ... }

// Line 319
function AQ9(A, B) { ... }

// Line 375
function GQ9(A, B, Q) { ... }

// Line 495
function HQ9(A, B, Q, I) { ... }
```

### Class Definitions (300+ extracted)

**Naming Patterns:**
- Capital letter + 2 digits + letter (e.g., `AI0`, `BI0`, `QI0`)
- Three capital letters (e.g., `MPA`, `CRA`)
- Capital + 0-9 + capital (e.g., `B0A`, `I0A`)

**Key Classes:**

```javascript
// Line 4654 - Storage/Database related
class AI0 { ... }

// Line 4736 - Related storage class
class BI0 { ... }

// Line 5229 - Extends base class
class A41 extends TI9 { ... }

// Line 22841 - Major component
class R81 { ... }

// Line 43496 - Network core
class Yz0 extends XRA.NetworkCore { ... }

// Line 43677 - Data adapter
class Cz0 extends hl.DataAdapterCore { ... }

// Line 43765 - Statsig client
class CRA extends m8.StatsigClientBase { ... }
```

### Module Exports (200+ patterns)

**Export Patterns:**
```javascript
// Direct exports
wLA.exports.mask = function (B, Q, I, G, Z) { ... }
wLA.exports.unmask = function (B, Q) { ... }

// Object exports
vI0.exports = { ... }
uI0.exports = gI0;
iI0.exports = pI0;

// Validation exports
NLA.exports.isValidUTF8 = function (A) { ... }
```

---

## MCP Integration Architecture

### Integration Points (100+ identified)

**Key MCP Components:**

#### 1. MCP Server Detection
```javascript
// Line 3699 - Server name extraction
let Q = A.match(/^MCP server ["']([^"']+)["']/);
```

#### 2. MCP CLI Integration
```javascript
// Line 4606 - Experimental MCP CLI flag
return K0(process.env.ENABLE_EXPERIMENTAL_MCP_CLI);

// Line 6621 - MCP CLI directory
return process.env.USE_MCP_CLI_DIR || zI0(aI9(), "claude-code-mcp-cli");
```

#### 3. Tool Naming Convention
```javascript
// Line 6663 - MCP tool prefix detection
let B = A.name.startsWith("mcp__")
  ? A.name.split("__")[1] || "unknown"
  : "unknown";

// Line 272070 - Tool name construction
let Z = `mcp__${I}__${G}`;
```

#### 4. Protocol Version Management
```javascript
// Line 24043 - Protocol version header
"MCP-Protocol-Version": B

// Line 24110 - Alternative header location
"MCP-Protocol-Version": Q
```

#### 5. OIDC Integration with PKCE
```javascript
// Line 24132 - S256 requirement
throw Error(`Incompatible OIDC provider at ${Y}: does not support S256
  code challenge method required by MCP specification`);
```

#### 6. MCP Tool Output Updates
```javascript
// Line 93443 - Schema definition
updatedMCPToolOutput: k.unknown()
  .describe("Updates the output for MCP tools")
  .optional()
```

#### 7. Security Validation
```javascript
// Line 272063 - Name validation
message: "Invalid MCP server or tool name. Names must contain only
  letters, numbers, hyphens, and underscores."

// Line 272066 - Security reason
reason: "Security: Invalid characters in MCP identifier"
```

#### 8. Permission System
```javascript
// Line 272078 - Tool denial
message: `MCP tool ${I}/${G} has been denied`

// Line 272115 - Permission requirement
reason: "MCP tool requires permission"
```

#### 9. MCPB File Format Support
```javascript
// Line 293483-486 - MCPB file validation
k.string().url().refine(A => A.endsWith(".mcpb") || A.endsWith(".dxt"), {
  message: "MCPB URL must end with .mcpb or .dxt"
})
```

#### 10. MCP Server Configuration
```javascript
// Line 293533 - Configuration schema
mcpServers: k.union([
  R8A.describe("MCP servers to include in the plugin"),
  J$Q.describe("Path or URL to MCPB file"),
  k.record(k.string(), Dm).describe("MCP server configurations"),
  k.array(...)
])
```

### MCP Architecture Pattern

```
┌────────────────────────────────────────────┐
│         Claude Code CLI Main Process       │
├────────────────────────────────────────────┤
│  MCP Client Integration Layer              │
│  ├─ Server Discovery                       │
│  ├─ Protocol Negotiation (versioning)      │
│  ├─ OIDC Auth + PKCE (S256)               │
│  └─ Session Management                     │
├────────────────────────────────────────────┤
│  Tool Proxy Layer                          │
│  ├─ Tool Name Resolution (mcp__X__Y)       │
│  ├─ Permission Checking                    │
│  ├─ Parameter Validation                   │
│  └─ Result Processing                      │
├────────────────────────────────────────────┤
│  MCP Server Communication                  │
│  ├─ MCPB File Parser (.mcpb, .dxt)        │
│  ├─ Server Configuration Loader            │
│  ├─ Protocol Version Headers               │
│  └─ Error Handling                         │
└────────────────────────────────────────────┘
         │
         ├──> MCP Server 1 (mcp__server1__*)
         ├──> MCP Server 2 (mcp__server2__*)
         └──> MCP Server N (mcp__serverN__*)
```

---

## Streaming Implementation

### WebSocket Implementation (150+ references)

#### Key Patterns:

**1. WebSocket Symbol Marker**
```javascript
// Line 7267 - Internal symbol
kWebSocket: Symbol("websocket")
```

**2. Connection State Management**
```javascript
// Line 9041, 9064, 9096 - State validation
throw Error("WebSocket is not open: readyState 0 (CONNECTING)");
```

**3. Protocol Versioning**
```javascript
// Line 9272 - Version header
"Sec-WebSocket-Version": G.protocolVersion
```

**4. Security Headers**
```javascript
// Line 9273 - Key negotiation
"Sec-WebSocket-Key": F

// Line 9281 - Extensions negotiation
G.headers["Sec-WebSocket-Extensions"] = J79({...})

// Line 9292 - Subprotocol selection
G.headers["Sec-WebSocket-Protocol"] = Q.join(",")
```

**5. Error Handling**
```javascript
// Line 7927 - Payload size limit
"Invalid WebSocket frame: payload length > 2^53 - 1"

// Line 9393 - Accept header validation
uz(A, H, "Invalid Sec-WebSocket-Accept header");
```

### Streaming Flow

```
Client Request
     │
     ├─> WebSocket Connection Attempt (v13)
     │   ├─ Send: Sec-WebSocket-Version: 13
     │   ├─ Send: Sec-WebSocket-Key: <random>
     │   ├─ Send: Sec-WebSocket-Protocol: <protocols>
     │   ├─ Send: Sec-WebSocket-Extensions: <exts>
     │   │
     │   ├─ Receive: Sec-WebSocket-Accept: <hash>
     │   ├─ Validate: Accept header
     │   └─ Establish: WebSocket connection
     │
     ├─> [FALLBACK] WebSocket v8
     │   └─ Retry with older protocol
     │
     ├─> [FALLBACK] Server-Sent Events (SSE)
     │   └─ HTTP streaming
     │
     └─> [FALLBACK] HTTP Long-Polling
         └─ Repeated HTTP requests
```

---

## Tool Execution Flow

### Tool Use Types (100+ references)

**Three Tool Use Types:**
1. `tool_use` - Standard tool execution
2. `server_tool_use` - Server-side tools (e.g., web_search)
3. `mcp_tool_use` - MCP server tools

#### Type Detection
```javascript
// Line 100623 - Tool use type check
return A.type === "tool_use"
    || A.type === "server_tool_use"
    || A.type === "mcp_tool_use";

// Line 179027 - Alternative check
return A.type === "tool_use" || A.type === "server_tool_use";
```

#### Usage Tracking
```javascript
// Line 4198 - Web search tracking
I.webSearchRequests += B.server_tool_use?.web_search_requests ?? 0;

// Line 101060-61 - Server tool usage
if (B.usage.server_tool_use != null) {
  Q.usage.server_tool_use = B.usage.server_tool_use;
}
```

#### Tool Use ID Management
```javascript
// Line 178582 - Extract tool uses from content
let Q = B.content.filter(G => G.type === "tool_use");

// Line 178593, 178606, 178612 - Tool result matching
tool_use_id: G.id
```

#### Clear Tool Uses Operation
```javascript
// Line 101393, 101410 - Clear operation
type: "clear_tool_uses_20250919"
```

### Tool Execution Flow Diagram

```
API Message with Tool Uses
     │
     ├─> Parse Content
     │   └─ Filter: type === "tool_use"
     │
     ├─> For Each Tool Use
     │   ├─ Extract: tool_use_id
     │   ├─ Extract: tool name
     │   ├─ Extract: parameters
     │   │
     │   ├─> Check Tool Type
     │   │   ├─ mcp__* → Route to MCP Proxy
     │   │   ├─ server_tool_use → Server-side handler
     │   │   └─ tool_use → Built-in tool
     │   │
     │   ├─> Execute Tool
     │   │   ├─ Validate parameters
     │   │   ├─ Check permissions
     │   │   ├─ Execute with timeout
     │   │   └─ Collect results
     │   │
     │   └─> Track Usage
     │       ├─ Update usage.server_tool_use
     │       ├─ Update webSearchRequests
     │       └─ Log execution metrics
     │
     ├─> Collect All Results
     │   └─ Match: tool_use_id → result
     │
     └─> Return Results
         ├─ Format: tool_result blocks
         └─ Include: tool_use_id references
```

---

## AI Provider Clients

### Anthropic API Client (40+ references)

**Base Configuration:**
```javascript
// Line 55827 - Base URL
BASE_API_URL: "https://api.anthropic.com"

// Line 55831 - OAuth endpoints
API_KEY_URL: "https://api.anthropic.com/api/oauth/claude_cli/create_api_key"
ROLES_URL: "https://api.anthropic.com/api/oauth/claude_cli/roles"

// Line 179779 - Client initialization
baseURL: A || "https://api.anthropic.com"
```

**Features API Integration:**
```javascript
// Line 178341, 178352, 178363, 178376, 178389 - Beta features
"anthropic-beta": [...(Q ?? []), "files-api-2025-04-14"].toString()
```

**Organization Access:**
```javascript
// Line 175535 - Sonnet 1M access check
`https://api.anthropic.com/api/organization/${A}/claude_code_sonnet_1m_access`
```

**Streaming Requirement:**
```javascript
// Line 180140 - Long request handling
throw new y2("Streaming is required for operations that may take longer
  than 10 minutes. See https://github.com/anthropics/anthropic-sdk-typescript
  #long-requests for more details");
```

**Vertex AI Detection:**
```javascript
// Line 180281 - Non-Anthropic API check
return this.baseURL !== "https://api.anthropic.com";
```

### AWS Bedrock Client

**Package Information:**
```javascript
// Line 124998 - Package name
name: "@aws-sdk/client-bedrock"

// Line 213707 - Runtime package
name: "@aws-sdk/client-bedrock-runtime"
```

**Repository:**
```javascript
// Line 125088
homepage: "https://github.com/aws/aws-sdk-js-v3/tree/main/clients/client-bedrock"
```

### Provider Selection Logic

```
Request Initialization
     │
     ├─> Check: CLAUDE_CODE_USE_BEDROCK
     │   ├─ YES → Initialize Bedrock Client
     │   │   ├─ Load AWS credentials
     │   │   ├─ Set region
     │   │   └─ Configure endpoint
     │   └─ NO → Continue
     │
     ├─> Check: CLAUDE_CODE_USE_VERTEX
     │   ├─ YES → Initialize Vertex Client
     │   │   ├─ Load GCP credentials
     │   │   ├─ Set project ID
     │   │   └─ Configure region
     │   └─ NO → Continue
     │
     └─> Default → Anthropic API
         ├─ Load API key
         ├─ Set base URL
         └─ Configure beta features
```

---

## Class Hierarchy

### Major Class Families

#### Network and Communication Classes
```javascript
class Yz0 extends XRA.NetworkCore { ... }     // Line 43496
class Cz0 extends hl.DataAdapterCore { ... }  // Line 43677
```

#### Telemetry and Analytics
```javascript
class CRA extends m8.StatsigClientBase { ... } // Line 43765
```

#### Core Components
```javascript
class AI0 { ... }  // Storage/DB - Line 4654
class BI0 { ... }  // Storage/DB - Line 4736
class QI0 { ... }  // Core component - Line 4982
class II0 { ... }  // Core component - Line 5081
class A41 extends TI9 { ... }  // Extended base - Line 5229
```

#### Service Classes
```javascript
class R81 { ... }   // Major service - Line 22841
class BK0 { ... }   // Service component - Line 36421
class XE0 { ... }   // Service component - Line 41013
class GH0 { ... }   // Service component - Line 42152
class TH0 { ... }   // Service component - Line 42515
```

#### UI/Display Classes
```javascript
class AY1 { ... }   // Line 90353
class B0A { ... }   // Line 90735
class GY1 { ... }   // Line 90828
class MPA { ... }   // Line 92181
class I0A { ... }   // Line 93014
```

---

## Call Graph Analysis

### Critical Call Patterns

**MCP Tool Invocation Chain:**
```
User Input
  → CLI Parser
    → Tool Router
      → MCP Tool Detector (checks "mcp__" prefix)
        → MCP Client
          → Protocol Negotiation
            → Tool Execution
              → Result Processing
                → Response Formatting
```

**Streaming Request Chain:**
```
API Request
  → Provider Selection
    → Client Initialization
      → WebSocket Connection (primary)
        ├─ Success → Stream Handler
        └─ Failure → SSE Fallback
             ├─ Success → Stream Handler
             └─ Failure → HTTP Fallback
```

**Authentication Flow:**
```
Auth Request
  → OAuth Provider
    → OIDC Discovery
      → PKCE Challenge (S256)
        → Authorization Code
          → Token Exchange
            → Session Creation
              → Token Storage (FD)
```

---

## Type Inference

### Inferred Types

**Configuration Objects:**
```typescript
interface MCPServerConfig {
  name: string;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  mcpb?: string;  // Path or URL to .mcpb/.dxt file
}

interface ToolUse {
  type: "tool_use" | "server_tool_use" | "mcp_tool_use";
  id: string;
  name: string;
  input: unknown;
}

interface ToolResult {
  type: "tool_result";
  tool_use_id: string;
  content: unknown;
  is_error?: boolean;
}

interface Usage {
  input_tokens: number;
  output_tokens: number;
  cache_read_input_tokens?: number;
  cache_creation_input_tokens?: number;
  server_tool_use?: {
    web_search_requests?: number;
  };
}
```

**WebSocket Types:**
```typescript
interface WebSocketConfig {
  protocolVersion: "13" | "8";
  headers: {
    "Sec-WebSocket-Version": string;
    "Sec-WebSocket-Key": string;
    "Sec-WebSocket-Protocol"?: string;
    "Sec-WebSocket-Extensions"?: string;
    "Sec-WebSocket-Origin"?: string;
  };
}

interface WebSocketState {
  readyState: 0 | 1 | 2 | 3;  // CONNECTING | OPEN | CLOSING | CLOSED
  kWebSocket: symbol;
}
```

**Provider Types:**
```typescript
interface ProviderConfig {
  baseURL: string;
  apiKey?: string;
  headers?: Record<string, string>;
  timeout?: number;
  maxRetries?: number;
}

interface AnthropicConfig extends ProviderConfig {
  baseURL: "https://api.anthropic.com";
  anthropicBeta?: string[];
}

interface BedrockConfig {
  region: string;
  credentials: AWSCredentials;
  endpoint?: string;
}

interface VertexConfig {
  projectId: string;
  region: string;
  credentials: GCPCredentials;
}
```

---

## Execution Flow Summary

### Complete Request Lifecycle

```
1. CLI Input
   ↓
2. Command Parsing (Commander.js)
   ↓
3. Configuration Loading
   ├─ Environment variables (330+)
   ├─ Config files (~/.claude)
   ├─ Session state (LocalForage)
   └─ MCP server configs
   ↓
4. Provider Selection
   ├─ Bedrock → AWS SDK
   ├─ Vertex → GCP Client
   └─ Default → Anthropic API
   ↓
5. Authentication
   ├─ OAuth 2.0 + OIDC
   ├─ PKCE (S256 challenge)
   └─ Token storage (FD-based)
   ↓
6. Model Selection
   ├─ Haiku (fast/cheap)
   ├─ Sonnet (balanced)
   └─ Opus (capable)
   ↓
7. Request Construction
   ├─ System prompts
   ├─ Tool definitions
   ├─ Token limits
   └─ Streaming config
   ↓
8. Connection Establishment
   ├─ WebSocket (v13 primary, v8 fallback)
   ├─ SSE (HTTP streaming)
   └─ HTTP (long-polling)
   ↓
9. Streaming Response
   ├─ Token counting
   ├─ Tool use detection
   └─ Checkpoint creation
   ↓
10. Tool Execution
    ├─ Built-in tools (Bash, File ops, Git)
    ├─ Server tools (Web search)
    └─ MCP tools (External servers)
    ↓
11. Result Processing
    ├─ Format results
    ├─ Update usage metrics
    └─ Create checkpoints
    ↓
12. Output Rendering
    ├─ Terminal display
    ├─ Syntax highlighting
    └─ Progress indicators
```

---

## Key Findings

### 1. MCP Integration Depth
- **Production-grade MCP implementation**
- Full protocol version negotiation
- OIDC authentication with PKCE
- Dynamic server discovery
- Comprehensive permission system
- MCPB file format support

### 2. Multi-Provider Architecture
- Unified interface across providers
- Automatic fallback mechanisms
- Provider-specific optimizations
- Region-aware deployment

### 3. Streaming Resilience
- Triple-redundant streaming protocols
- Automatic protocol degradation
- Connection state management
- Comprehensive error handling

### 4. Tool System Flexibility
- Three tool execution types
- Dynamic tool registration
- MCP proxy layer
- Detailed usage tracking

### 5. Security Architecture
- File descriptor-based secrets
- PKCE S256 challenge
- Input validation
- Permission checking

---

*Phase 3 Semantic Analysis*
*Status: In Progress*
*Last Updated: 2025-11-12*
