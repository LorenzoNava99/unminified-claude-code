# Claude Code CLI - Complete Architecture Documentation

**Version:** 2.0.37
**Date:** 2025-11-12
**Analysis Phase:** Phase 2 Ultra-Deep Analysis
**Status:** Production Reverse Engineering

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Core Protocols](#core-protocols)
4. [Component Map](#component-map)
5. [Cloud AI Integration](#cloud-ai-integration)
6. [Environment Configuration](#environment-configuration)
7. [API Endpoints](#api-endpoints)
8. [Authentication & Security](#authentication--security)
9. [Data Flow](#data-flow)
10. [Deployment Patterns](#deployment-patterns)

---

## Executive Summary

Claude Code CLI is a **production-grade agentic coding assistant** implementing the **Model Context Protocol (MCP)** for tool integration, with multi-cloud AI provider support (Anthropic API, AWS Bedrock, Google Vertex AI), sophisticated streaming architecture, and extensive configuration system.

### Key Architectural Highlights

- **Protocol**: Model Context Protocol (MCP) - Server/Client implementation
- **Version**: 2.0.37 with MCP protocol versioning
- **Streaming**: WebSocket + Server-Sent Events (SSE)
- **Bundler**: Browserify (4 modules)
- **CLI Framework**: Commander.js
- **AI Providers**: Anthropic (primary), AWS Bedrock, Google Vertex AI
- **Configuration**: 330+ environment variables
- **Tool System**: Dynamic tool registration with MCP server integration
- **Telemetry**: OpenTelemetry (OTEL) with configurable exporters

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Claude Code CLI                          │
├─────────────────────────────────────────────────────────────┤
│  Commander.js CLI Interface                                  │
├─────────────────────────────────────────────────────────────┤
│  MCP Protocol Layer                                          │
│  ├─ MCP Client                                              │
│  ├─ MCP Server Integration                                  │
│  └─ Tool Registration & Discovery                           │
├─────────────────────────────────────────────────────────────┤
│  Communication Layer                                         │
│  ├─ WebSocket Client                                        │
│  ├─ Server-Sent Events (SSE)                                │
│  ├─ HTTP/HTTPS Client (fetch abstraction)                   │
│  └─ OAuth 2.0 + OIDC                                        │
├─────────────────────────────────────────────────────────────┤
│  AI Provider Abstraction                                     │
│  ├─ Anthropic API Client                                    │
│  ├─ AWS Bedrock SDK                                         │
│  └─ Google Vertex AI Client                                 │
├─────────────────────────────────────────────────────────────┤
│  Tool System                                                 │
│  ├─ Bash Execution (sandboxed)                              │
│  ├─ File Operations (Read/Write/Edit)                       │
│  ├─ Git Integration                                         │
│  ├─ Web Fetching                                            │
│  └─ MCP Tool Proxy                                          │
├─────────────────────────────────────────────────────────────┤
│  Storage & Cache                                             │
│  ├─ LocalForage (IndexedDB/localStorage)                    │
│  ├─ Conversation History                                    │
│  └─ Checkpointing System                                    │
├─────────────────────────────────────────────────────────────┤
│  Observability                                               │
│  ├─ OpenTelemetry Integration                               │
│  ├─ Token Usage Metrics                                     │
│  └─ Sentry Error Reporting                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Protocols

### Model Context Protocol (MCP)

**Purpose**: Standardized protocol for LLM-tool integration

**Key Features**:
- Protocol version negotiation
- Session management with session IDs
- OIDC-based authentication
- Tool discovery and execution
- Streaming support
- S256 code challenge (PKCE)

**Implementation Details**:
```
Headers:
- MCP-Protocol-Version: <version>
- mcp-session-id: <session_id>
- mcp-protocol-version: <version>

Commands:
- mcp-cli call <server>/<tool> [args]
- mcp-cli read <server>/<resource>

Tool Naming Convention:
- MCP tools: mcp__<server>__<tool>
- Example: mcp__filesystem__readFile
```

**Configuration**:
- `ENABLE_EXPERIMENTAL_MCP_CLI` - Enable MCP CLI
- `USE_MCP_CLI_DIR` - MCP CLI directory
- `MCP_OAUTH_CALLBACK_PORT` - OAuth callback port
- `MCP_SERVER_CONNECTION_BATCH_SIZE` - Batch connection size
- `MCP_TIMEOUT` - General MCP timeout
- `MCP_TOOL_TIMEOUT` - Tool execution timeout
- `MAX_MCP_OUTPUT_TOKENS` - Token limit for MCP output

### WebSocket Protocol

**Purpose**: Real-time bidirectional communication

**Features**:
- Sec-WebSocket-Version: 13, 8 (fallback)
- Protocol version negotiation
- Deflate stream compression
- Server/client role detection

**Key Patterns**:
```javascript
Symbol("websocket")  // WebSocket marker
_isServer: boolean   // Server vs client mode
acceptAsServer()     // Server connection acceptance
acceptAsClient()     // Client connection establishment
```

### Server-Sent Events (SSE)

**Purpose**: Server-to-client streaming

**Endpoint Pattern**:
```
http://${host}:${port}/sse
```

**Configuration**:
- `CLAUDE_CODE_SSE_PORT` - SSE port override

---

## Component Map

### 1. CLI Layer (Commander.js)

**Location**: Lines 4508-37497
**Framework**: Commander.js v11+

**Error Codes**:
- `commander.invalidArgument`
- `commander.missingArgument`
- `commander.optionMissingArgument`
- `commander.unknownOption`
- `commander.excessArguments`
- `commander.unknownCommand`
- `commander.missingMandatoryOptionValue`
- `commander.conflictingOption`
- `commander.version`
- `commander.help`
- `commander.executeSubCommandAsync`

**Debug Flags**:
- `--debug`, `-d` - Enable debug mode
- `--debug=<value>` - Debug with specific value
- `--debug-to-stderr`, `-d2e` - Debug output to stderr

**Environment Variables**:
- `DEBUG` - General debug flag
- `DEBUG_SDK` - SDK debug flag
- `DEBUG_AUTH` - Authentication debug

### 2. API Client Layer

**Architecture**: Multi-provider abstraction with unified interface

**Providers**:

#### Anthropic API (Primary)
**Base URL**: `https://api.anthropic.com`

**Key Endpoints**:
- `/api/claude` - Main API endpoint
- `/api/hello` - Health check
- `/api/oauth/claude` - OAuth flow
- `/api/organization/` - Organization management

**Models Supported**:
- `claude-haiku-4-5` - Haiku 4.5
- `claude-3-5-haiku` - Haiku 3.5
- `claude-3-5-sonnet` - Sonnet 3.5
- `claude-3-7-sonnet` - Sonnet 3.7 (upcoming)
- `claude-4-5-sonnet` - Sonnet 4.5
- `claude-4-0-sonnet` - Sonnet 4.0
- `claude-4-0-opus` - Opus 4.0
- `claude-4-1-opus` - Opus 4.1

**Environment Variables**:
- `ANTHROPIC_API_KEY` - API key
- `ANTHROPIC_AUTH_TOKEN` - Auth token
- `ANTHROPIC_BASE_URL` - Override base URL
- `ANTHROPIC_BETAS` - Beta features
- `ANTHROPIC_CUSTOM_HEADERS` - Custom headers
- `ANTHROPIC_MODEL` - Model override
- `ANTHROPIC_DEFAULT_SONNET_MODEL` - Default Sonnet
- `ANTHROPIC_DEFAULT_OPUS_MODEL` - Default Opus
- `ANTHROPIC_DEFAULT_HAIKU_MODEL` - Default Haiku
- `ANTHROPIC_SMALL_FAST_MODEL` - Small/fast model selection
- `ANTHROPIC_VERTEX_PROJECT_ID` - Vertex AI project ID

#### AWS Bedrock
**Purpose**: AWS-hosted Claude models

**Configuration**:
- `CLAUDE_CODE_USE_BEDROCK` - Enable Bedrock
- `CLAUDE_CODE_SKIP_BEDROCK_AUTH` - Skip auth
- `BEDROCK_BASE_URL` - Base URL override
- `AWS_REGION` - AWS region
- `AWS_DEFAULT_REGION` - Default region
- `AWS_ACCESS_KEY_ID` - Access key
- `AWS_SECRET_ACCESS_KEY` - Secret key
- `AWS_SESSION_TOKEN` - Session token
- `AWS_PROFILE` - Profile name
- `AWS_BEARER_TOKEN_BEDROCK` - Bearer token

**Endpoints**:
- `https://bedrock.${region}.amazonaws.com`
- `https://bedrock-runtime.${region}.amazonaws.com`
- `https://bedrock-fips.${region}.amazonaws.com` (FIPS)
- `https://bedrock-runtime-fips.${region}.amazonaws.com` (FIPS)

**Bedrock Models**:
- Full AWS Bedrock SDK integration
- Custom model support
- Foundation model agreements
- Model customization jobs
- Model invocation jobs
- Provisioned throughput

#### Google Vertex AI
**Purpose**: GCP-hosted Claude models

**Configuration**:
- `CLAUDE_CODE_USE_VERTEX` - Enable Vertex
- `CLAUDE_CODE_SKIP_VERTEX_AUTH` - Skip auth
- `VERTEX_BASE_URL` - Base URL override
- `GOOGLE_APPLICATION_CREDENTIALS` - Service account
- `GOOGLE_CLOUD_PROJECT` - Project ID
- `GOOGLE_CLOUD_QUOTA_PROJECT` - Quota project
- `GCLOUD_PROJECT` - Project (alias)
- `GCP_PROJECT` - Project (alias)
- `CLOUD_ML_REGION` - ML region

**Endpoints**:
- `https://aiplatform.googleapis.com/v1`
- `https://accounts.google.com/o/oauth2/v2/auth`
- `https://accounts.google.com/o/oauth2/revoke`

**Region-Specific Environment Variables**:
- `VERTEX_REGION_CLAUDE_HAIKU_4_5`
- `VERTEX_REGION_CLAUDE_3_5_HAIKU`
- `VERTEX_REGION_CLAUDE_3_5_SONNET`
- `VERTEX_REGION_CLAUDE_3_7_SONNET`
- `VERTEX_REGION_CLAUDE_4_0_SONNET`
- `VERTEX_REGION_CLAUDE_4_5_SONNET`
- `VERTEX_REGION_CLAUDE_4_0_OPUS`
- `VERTEX_REGION_CLAUDE_4_1_OPUS`

### 3. Token Management System

**Architecture**: Comprehensive usage tracking with caching

**Token Types**:
- `inputTokens` - Input token count
- `outputTokens` - Output token count
- `cacheReadInputTokens` - Cache read tokens
- `cacheCreationInputTokens` - Cache creation tokens

**Configuration**:
- `CLAUDE_CODE_MAX_OUTPUT_TOKENS` - Output token limit
- `API_MAX_INPUT_TOKENS` - Input token limit
- `API_TARGET_INPUT_TOKENS` - Target input tokens
- `MAX_THINKING_TOKENS` - Thinking token limit

**Prompt Caching Control**:
- `DISABLE_PROMPT_CACHING` - Global disable
- `DISABLE_PROMPT_CACHING_HAIKU` - Haiku-specific
- `DISABLE_PROMPT_CACHING_SONNET` - Sonnet-specific
- `DISABLE_PROMPT_CACHING_OPUS` - Opus-specific

**Token Counter**: OpenTelemetry metric
```
claude_code.token.usage
  - description: "Number of tokens used"
  - unit: "tokens"
```

### 4. File System Layer

**Location**: Lines 3772-5740

**Operations**:
- `existsSync(path)` - Check existence
- `readFileSync(path, encoding)` - Read file
- `readFileBytesSync(path)` - Read as buffer
- `writeFileSync(path, data, options)` - Write file
- `mkdirSync(path, {recursive})` - Create directory
- `createWriteStream(path)` - Create write stream

**Configuration Paths**:
- Config directory: `$CLAUDE_CONFIG_DIR` or `~/.claude`
- MCP CLI directory: `$USE_MCP_CLI_DIR` or `~/.claude/claude-code-mcp-cli`
- Debug logs: `$CLAUDE_CODE_DEBUG_LOGS_DIR`
- Test fixtures: `$CLAUDE_CODE_TEST_FIXTURES_ROOT`

**Safety Features**:
- Recursive directory creation
- Existence checking before operations
- Encoding option support
- Stream-based operations

**Environment Variables**:
- `CLAUDE_CONFIG_DIR` - Configuration directory
- `HOME` - Home directory (Unix)
- `USERPROFILE` - Home directory (Windows)
- `LOCALAPPDATA` - Local app data (Windows)
- `XDG_CONFIG_HOME` - XDG config directory
- `XDG_DATA_HOME` - XDG data directory
- `XDG_CACHE_HOME` - XDG cache directory
- `XDG_STATE_HOME` - XDG state directory

### 5. Tool System

**Architecture**: Dynamic tool registration with MCP integration

**Built-in Tools**:
- **Bash**: Sandboxed command execution
- **Read**: File reading
- **Write**: File writing
- **Edit**: File editing
- **Glob**: File pattern matching
- **Grep**: Content search
- **WebFetch**: HTTP requests
- **Git**: Version control operations

**MCP Tool Integration**:
- Prefix: `mcp__<server>__<tool>`
- Discovery: Automatic MCP server scanning
- Execution: Proxy to MCP server
- Timeout: Configurable per-tool

**Tool Configuration**:
- `CLAUDE_CODE_MAX_TOOL_USE_CONCURRENCY` - Concurrent tool executions
- `MCP_TOOL_TIMEOUT` - MCP tool timeout
- `SLASH_COMMAND_TOOL_CHAR_BUDGET` - Slash command budget
- `ENABLE_LSP_TOOL` - Enable LSP tool

### 6. Bash Execution System

**Security**: Sandboxed execution with timeouts

**Configuration**:
- `CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR` - Maintain working directory
- `CLAUDE_BASH_NO_LOGIN` - Skip login shell
- `BASH_DEFAULT_TIMEOUT_MS` - Default timeout
- `BASH_MAX_TIMEOUT_MS` - Maximum timeout
- `BASH_MAX_OUTPUT_LENGTH` - Output length limit
- `CLAUDE_CODE_BASH_SANDBOX_SHOW_INDICATOR` - Show sandbox indicator
- `CLAUDE_CODE_DONT_INHERIT_ENV` - Don't inherit environment
- `CLAUDE_CODE_GIT_BASH_PATH` - Git Bash path (Windows)
- `SHELL` - Shell path (Unix)

**Detection Patterns**:
- `eval` command detection
- `-e`, `--eval` flags
- `-p`, `--print` flags

### 7. OAuth & Authentication

**Protocol**: OAuth 2.0 + OpenID Connect (OIDC)

**Flow**: Authorization Code with PKCE (S256)

**Endpoints**:
- Authorization: Provider-specific
- Token exchange: Provider-specific
- Callback: `http://localhost:${port}/callback`
- API key creation: `http://localhost:3000/api/oauth/claude_cli/create_api_key`

**Token Storage**:
- File descriptor-based (secure)
- `sessionIngressToken`
- `oauthTokenFromFd`
- `apiKeyFromFd`
- `CLAUDE_CODE_OAUTH_TOKEN`
- `CLAUDE_CODE_WEBSOCKET_AUTH_FILE_DESCRIPTOR`
- `CLAUDE_CODE_API_KEY_FILE_DESCRIPTOR`
- `CLAUDE_CODE_SESSION_ACCESS_TOKEN`

**Configuration**:
- `CLAUDE_CODE_API_KEY_HELPER_TTL_MS` - API key helper TTL
- `MCP_OAUTH_CALLBACK_PORT` - OAuth callback port

### 8. Session Management

**Session Tracking**:
- `sessionId` - Unique session identifier
- `sessionIngressToken` - Session authentication
- `sessionCounter` - Session count metric

**Environment Variables**:
- `CLAUDE_CODE_SESSION_ID` - Override session ID

**Metrics**:
```
claude_code.session.count
  - description: "Count of CLI sessions started"

Session cost tracking:
  - description: "Cost of the Claude Code session"
```

**Session Types**:
- Interactive: Terminal-based
- Non-interactive: Programmatic (`isNonInteractiveSession`)
- Remote: Remote environment (`CLAUDE_CODE_REMOTE`)

---

## Cloud AI Integration

### Multi-Cloud Architecture

```
User Request
     │
     ├─> Provider Selection Logic
     │   ├─ CLAUDE_CODE_USE_BEDROCK → AWS Bedrock
     │   ├─ CLAUDE_CODE_USE_VERTEX → Google Vertex AI
     │   └─ Default → Anthropic API
     │
     ├─> Authentication
     │   ├─ Bedrock: AWS credentials
     │   ├─ Vertex: GCP service account
     │   └─ Anthropic: API key
     │
     ├─> Model Selection
     │   ├─ Haiku: Fast, cheap
     │   ├─ Sonnet: Balanced
     │   └─ Opus: Most capable
     │
     └─> Streaming Response
         ├─ WebSocket (real-time)
         ├─ SSE (server-push)
         └─ HTTP (fallback)
```

### Cloud Detection

**AWS Detection**:
- `AWS_EXECUTION_ENV`
- `AWS_LAMBDA_FUNCTION_NAME`
- Metadata endpoint: `http://169.254.169.254` (EC2)
- Metadata endpoint: `http://169.254.170.2` (ECS)
- Metadata endpoint: `http://[fd00:ec2::254]` (IPv6)

**GCP Detection**:
- `K_SERVICE`, `K_CONFIGURATION` (Cloud Run)
- `FUNCTION_NAME`, `FUNCTION_TARGET` (Cloud Functions)
- `GAE_MODULE_NAME`, `GAE_SERVICE` (App Engine)
- `GCE_METADATA_HOST`, `GCE_METADATA_IP`
- Metadata: `http://metadata.google.internal.`

**Environment Detection**:
- `CLOUD_RUN_JOB` - Google Cloud Run
- `FLY_APP_NAME` - Fly.io
- `RAILWAY_SERVICE_NAME` - Railway
- `RENDER` - Render
- `VERCEL` - Vercel
- `NETLIFY` - Netlify
- `WEBSITE_SITE_NAME` - Azure
- `DYNO` - Heroku
- `REPL_ID` - Repl.it
- `CODESPACES` - GitHub Codespaces
- `GITPOD_WORKSPACE_ID` - Gitpod

---

## Environment Configuration

### Configuration System

**Total Variables**: 330+

**Categories**:
1. **Claude Code Specific** (60+)
2. **AI Provider** (30+)
3. **Cloud Platform** (40+)
4. **Observability** (25+)
5. **Development** (20+)
6. **System** (155+)

### Critical Configuration Variables

#### Claude Code Core
```bash
# Session & Identity
CLAUDE_CODE_SESSION_ID          # Session identifier
CLAUDE_CODE_CONTAINER_ID        # Container ID

# Authentication
CLAUDE_CODE_API_KEY_FILE_DESCRIPTOR     # API key FD
CLAUDE_CODE_OAUTH_TOKEN                  # OAuth token
CLAUDE_CODE_OAUTH_TOKEN_FILE_DESCRIPTOR # OAuth token FD
CLAUDE_CODE_WEBSOCKET_AUTH_FILE_DESCRIPTOR # WebSocket auth FD
CLAUDE_CODE_SESSION_ACCESS_TOKEN        # Session access token

# Behavior Control
CLAUDE_CODE_ACTION                       # Action mode
CLAUDE_CODE_REMOTE                       # Remote mode
CLAUDE_CODE_REMOTE_ENVIRONMENT_TYPE     # Environment type
CLAUDE_CODE_ENTRYPOINT                  # Entry point override

# Feature Flags
ENABLE_EXPERIMENTAL_MCP_CLI             # Enable MCP CLI
CLAUDE_CODE_DISABLE_ATTACHMENTS         # Disable attachments
CLAUDE_CODE_DISABLE_COMMAND_INJECTION_CHECK  # Disable injection check
CLAUDE_CODE_DISABLE_FINE_GRAINED_TOOL_STREAMING  # Disable fine-grained streaming
CLAUDE_CODE_USE_NATIVE_FILE_SEARCH      # Use native file search
```

#### Telemetry & Observability
```bash
# Telemetry Control
CLAUDE_CODE_ENABLE_TELEMETRY            # Enable telemetry
DISABLE_TELEMETRY                       # Disable telemetry
ENABLE_ENHANCED_TELEMETRY_BETA          # Enhanced telemetry

# OpenTelemetry
OTEL_EXPORTER_OTLP_ENDPOINT            # OTLP endpoint
OTEL_EXPORTER_OTLP_HEADERS             # OTLP headers
OTEL_TRACES_EXPORTER                   # Traces exporter
OTEL_METRICS_EXPORTER                  # Metrics exporter
OTEL_LOGS_EXPORTER                     # Logs exporter
OTEL_LOG_MODEL_RESPONSE                # Log model responses
OTEL_LOG_TOOL_CONTENT                  # Log tool content
OTEL_LOG_USER_PROMPTS                  # Log user prompts
CLAUDE_CODE_OTEL_FLUSH_TIMEOUT_MS      # Flush timeout
CLAUDE_CODE_OTEL_SHUTDOWN_TIMEOUT_MS   # Shutdown timeout

# Sentry
SENTRY_DSN                             # Sentry DSN
SENTRY_ENVIRONMENT                     # Environment
SENTRY_RELEASE                         # Release version
SENTRY_TRACES_SAMPLE_RATE              # Sample rate
```

#### Development & Testing
```bash
# Development
DEV                                    # Development mode
IS_DEMO                                # Demo mode
IS_SANDBOX                             # Sandbox mode
NODE_V8_COVERAGE                       # V8 coverage
NODE_DEBUG                             # Node debug
NODE_OPTIONS                           # Node options

# Testing
JEST_WORKER_ID                         # Jest worker
TEST_ENABLE_SESSION_PERSISTENCE        # Test persistence
CLAUDE_CODE_TEST_FIXTURES_ROOT         # Test fixtures
SWE_BENCH_INSTANCE_ID                  # SWE-Bench instance
SWE_BENCH_RUN_ID                       # SWE-Bench run
SWE_BENCH_TASK_ID                      # SWE-Bench task

# CI/CD Detection
GITHUB_ACTIONS                         # GitHub Actions
GITLAB_CI                              # GitLab CI
CIRCLECI                               # CircleCI
BUILDKITE                              # Buildkite
TEAMCITY_VERSION                       # TeamCity
```

---

## API Endpoints

### Complete Endpoint Map (180 endpoints)

#### Anthropic Endpoints
```
https://api.anthropic.com/api/claude
https://api.anthropic.com/api/hello
https://api.anthropic.com/api/oauth/claude
https://api.anthropic.com/api/organization/
https://claude.ai/api/web/domain
https://claude.ai/code/
https://claude.ai/oauth/authorize
https://claude.ai/settings/data-privacy-controls
https://claude.ai/settings/usage
https://claude.ai/upgrade/max
https://anthropic.com/legal/privacy
https://anthropic.com/legal/terms
https://anthropic.com/supported-countries
```

#### Segment & Analytics
```
https://api.segment.io
https://api.statsigcdn.com/v1
```

#### AWS Infrastructure
```
http://169.254.169.254  # EC2 metadata
http://169.254.170.2    # ECS metadata
http://[fd00:ec2::254]  # EC2 metadata (IPv6)
https://aws.amazon.com/javascript/
```

#### Google Cloud
```
http://metadata.google.internal.
https://accounts.google.com
https://accounts.google.com/o/oauth2/v2/auth
https://accounts.google.com/o/oauth2/revoke
https://aiplatform.googleapis.com/v1
```

#### Development & Testing
```
http://localhost
http://localhost:3000/api/oauth/claude_cli/create_api_key
http://localhost:${port}/callback
http://dogs.are.great${Q}  # Test endpoint
http://www.example.com
http://1.1.1.1  # Connectivity check
```

---

## Authentication & Security

### Security Architecture

**Multi-Layer Security**:
1. **Transport Security**: HTTPS/TLS
2. **Authentication**: OAuth 2.0 + OIDC
3. **Authorization**: API keys, Bearer tokens
4. **Sandboxing**: Bash execution isolation
5. **Input Validation**: Command injection checks

### Authentication Mechanisms

#### 1. API Key Authentication
```
Header: x-api-key: <api_key>
       Authorization: Bearer <api_key>

Environment: ANTHROPIC_API_KEY
File Descriptor: CLAUDE_CODE_API_KEY_FILE_DESCRIPTOR
```

#### 2. OAuth 2.0 Flow
```
1. Authorization Request → Provider
2. User Authorization
3. Authorization Code → Callback
4. Token Exchange (with PKCE S256)
5. Access Token Storage (FD-based)
```

#### 3. Session Tokens
```
sessionIngressToken  - Session authentication
oauthTokenFromFd     - OAuth token from file descriptor
apiKeyFromFd         - API key from file descriptor
CLAUDE_CODE_SESSION_ACCESS_TOKEN - Session access token
```

### Certificate Management
```
CLAUDE_CODE_CLIENT_CERT            # Client certificate
CLAUDE_CODE_CLIENT_KEY             # Client private key
CLAUDE_CODE_CLIENT_KEY_PASSPHRASE  # Key passphrase
NODE_EXTRA_CA_CERTS                # Extra CA certificates
```

### Security Features

**Command Injection Protection**:
- `CLAUDE_CODE_DISABLE_COMMAND_INJECTION_CHECK` - Disable (dangerous)
- Eval detection in bash execution
- Input sanitization

**Sandboxing**:
- Bash execution in controlled environment
- Timeout enforcement
- Output length limits
- Environment variable control

**Data Privacy**:
- `CLAUDE_CODE_ADDITIONAL_PROTECTION` - Enhanced protection
- `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` - Minimal traffic
- `https://claude.ai/settings/data-privacy-controls`

---

## Data Flow

### Request Flow

```
1. User Input (CLI)
   ↓
2. Command Parser (Commander.js)
   ↓
3. Configuration Loading
   ├─ Environment Variables (330+)
   ├─ Config Files (~/.claude)
   └─ Session State (LocalForage)
   ↓
4. Provider Selection
   ├─ Bedrock → AWS SDK
   ├─ Vertex → GCP Client
   └─ Default → Anthropic API
   ↓
5. Request Construction
   ├─ Model Selection
   ├─ Token Limits
   ├─ System Prompts
   └─ Tool Definitions (MCP)
   ↓
6. Streaming Request
   ├─ WebSocket (if available)
   ├─ SSE (if supported)
   └─ HTTP (fallback)
   ↓
7. Response Processing
   ├─ Token Counting
   ├─ Tool Invocation
   │   ├─ Built-in Tools
   │   └─ MCP Tool Proxy
   └─ Checkpoint Creation
   ↓
8. Output Rendering
   ├─ Terminal Display
   ├─ Syntax Highlighting
   └─ Progress Indicators
```

### Tool Execution Flow

```
Tool Request
   ↓
Tool Router
   ├─ Built-in Tool?
   │   ├─ Bash → Sandbox Execution
   │   ├─ Read → File System
   │   ├─ Write → File System
   │   └─ Git → Git Operations
   │
   └─ MCP Tool? (prefix: mcp__)
       ↓
   MCP Tool Proxy
       ├─ Parse: mcp__<server>__<tool>
       ├─ Lookup MCP Server
       ├─ Forward Request
       ├─ Handle Timeout
       └─ Return Response
   ↓
Result Processing
   ├─ Output Formatting
   ├─ Error Handling
   └─ Token Counting
```

---

## Deployment Patterns

### Supported Environments

#### Local Development
- Terminal: iTerm2, Alacritty, Kitty, Konsole, GNOME Terminal, etc.
- Shell: Bash, Zsh, Fish
- Editor Integration: VS Code, JetBrains IDEs

#### CI/CD Platforms
- GitHub Actions
- GitLab CI
- CircleCI
- BuildKite
- TeamCity
- Jenkins (via environment detection)

#### Cloud Platforms
- **AWS**: Lambda, EC2, ECS, Fargate
- **GCP**: Cloud Run, Cloud Functions, App Engine, GCE
- **Azure**: Functions, App Service
- **Fly.io**: Apps
- **Railway**: Services
- **Render**: Web services
- **Heroku**: Dynos
- **Vercel**: Edge functions
- **Netlify**: Functions

#### Container Platforms
- **Docker**: Containerized execution
- **Kubernetes**: Pod-based deployment
- **Cloud Run**: Serverless containers

#### Remote Development
- **GitHub Codespaces**
- **Gitpod**
- **Repl.it**
- **SSH**: Remote servers

### Environment Detection Logic

```javascript
// Pseudo-code from analysis
function detectEnvironment() {
  if (AWS_LAMBDA_FUNCTION_NAME || AWS_EXECUTION_ENV) return "aws-lambda";
  if (K_SERVICE || CLOUD_RUN_JOB) return "gcp-cloud-run";
  if (FUNCTION_NAME && FUNCTION_TARGET) return "gcp-functions";
  if (GAE_SERVICE) return "gcp-app-engine";
  if (DYNO) return "heroku";
  if (FLY_APP_NAME) return "fly.io";
  if (RAILWAY_SERVICE_NAME) return "railway";
  if (RENDER) return "render";
  if (VERCEL) return "vercel";
  if (NETLIFY) return "netlify";
  if (WEBSITE_SITE_NAME) return "azure";
  if (CODESPACES) return "github-codespaces";
  if (GITPOD_WORKSPACE_ID) return "gitpod";
  if (REPL_ID) return "replit";
  if (GITHUB_ACTIONS) return "github-actions";
  if (GITLAB_CI) return "gitlab-ci";
  if (CIRCLECI) return "circleci";
  if (BUILDKITE) return "buildkite";
  return "local";
}
```

---

## Appendix

### Version History
- **2.0.37**: Current version (analyzed)
- MCP protocol version support
- WebSocket protocol: 13, 8

### Bundle Structure
```json
{
  "type": "browserify",
  "entryId": "4",
  "modules": [
    {"id": "1", "path": "node_modules/1/index.js"},
    {"id": "2", "path": "node_modules/2/index.js"},
    {"id": "3", "path": "node_modules/3/index.js"},
    {"id": "4", "path": "index.js"}
  ]
}
```

### Key Dependencies
- LocalForage: Browser-like storage for Node.js
- Commander.js: CLI framework
- WebSocket: Real-time communication
- EventSource: SSE client
- AWS SDK: Bedrock integration
- Google Cloud: Vertex AI integration

### Copyright & Legal
```
(c) Anthropic PBC. All rights reserved.
Legal: https://docs.claude.com/en/docs/claude-code/legal-and-compliance
Terms: https://anthropic.com/legal/terms
Privacy: https://anthropic.com/legal/privacy
```

---

*Last Updated: 2025-11-12*
*Analysis Phase: Ultra-Deep Phase 2*
*Document Version: 1.0*
