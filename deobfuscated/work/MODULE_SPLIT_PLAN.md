# Module Splitting Plan for Claude Code CLI

**Date:** 2025-11-12
**Phase:** 4 - Module Organization
**Current State:** Monolithic 15MB file (515,465 lines)
**Target State:** 50+ logical modules with clear boundaries

---

## Module Identification (Based on Import Analysis)

### 1. Core Configuration Module (`src/config/`)

**Lines:** ~4110-4500
**Size:** ~400 lines
**Purpose:** Configuration management, environment variables, directory resolution

**Files to Create:**
- `src/config/index.js` - Main export
- `src/config/directories.js` - Directory resolution (getClaudeConfigDir)
- `src/config/env-parser.js` - Environment variable parsing (parseBoolean, parseBooleanNegative, parseEnvironmentVariables)
- `src/config/regions.js` - Cloud region configuration (getVertexRegionForModel, getDefaultCloudMLRegion, getAWSRegion)
- `src/config/validators.js` - Configuration validation

**Imports:**
```javascript
import { join } from "path";
import { homedir } from "os";
import { cwd } from "process";
import { realpathSync } from "fs";
import { randomUUID } from "crypto";
```

**Key Functions:**
- getClaudeConfigDir() - Line 4117
- parseBoolean() - Line 4126
- parseBooleanNegative() - Line 4142
- parseEnvironmentVariables() - Line 4160
- getVertexRegionForModel() - ~Line 4200
- getDefaultCloudMLRegion() - ~Line 4220
- getAWSRegion() - ~Line 4230
- shouldMaintainProjectWorkingDir() - Line 4239

---

### 2. Session Management Module (`src/session/`)

**Lines:** TBD (needs grep analysis for sessionState usage)
**Size:** ~500-800 lines
**Purpose:** Session lifecycle, state management, metrics tracking

**Files to Create:**
- `src/session/index.js` - Main export
- `src/session/state.js` - Session state management (sessionState variable)
- `src/session/metrics.js` - Metrics and tracking
- `src/session/lifecycle.js` - Session initialization and cleanup

**Key Variables/Functions:**
- sessionState (YB) - Global session state
- randomUUID (Y50) - Session ID generation

---

### 3. MCP Protocol Module (`src/mcp/`)

**Lines:** ~25845-28700
**Size:** ~2,855 lines
**Purpose:** Model Context Protocol implementation

**Files to Create:**
- `src/mcp/index.js` - Main export
- `src/mcp/client.js` - MCP client (_MA class)
- `src/mcp/transport-stdio.js` - Stdio transport (R81 class)
- `src/mcp/transport-websocket.js` - WebSocket transport (s81 class)
- `src/mcp/message-buffer.js` - Message buffering (eGA class)
- `src/mcp/rpc.js` - JSON-RPC handling (oGA class)
- `src/mcp/protocol.js` - Protocol utilities (xJ9, DMA functions)
- `src/mcp/discovery.js` - MCP server discovery

**Imports:**
```javascript
import from "node:process";
import { PassThrough } from "node:stream";
import { setMaxListeners } from "events";
```

**Key Classes/Functions:**
- eGA (MessageBuffer) - Line 25845
- R81 (StdioTransport) - Line 25892
- oGA (JSON-RPC Handler) - Line ~25900
- _MA (MCP Client) - Line ~27531
- s81 (WebSocket Transport) - Line ~27774
- xJ9 (JSON-RPC decode) - Line 25866
- DMA (JSON-RPC encode) - Line 25869

---

### 4. OAuth 2.0 Module (`src/oauth/`)

**Lines:** ~27248-27600
**Size:** ~350 lines
**Purpose:** OAuth 2.0 authentication and authorization

**Files to Create:**
- `src/oauth/index.js` - Main export
- `src/oauth/token.js` - Token management (refresh, validation)
- `src/oauth/registration.js` - Client registration
- `src/oauth/discovery.js` - OAuth discovery and metadata
- `src/oauth/utils.js` - OAuth utilities

**Key Functions:**
- n81 - OAuth token refresh - Line 27505
- YX9 - Client registration - Line 27561
- eJ9 - Resource metadata - Line 27248
- QX9 - Well-known metadata - Line 27303
- i81 - MCP protocol fetch - Line 27265
- KY0 - Protocol version fetch - Line 27291
- AX9 - Well-known URL construction - Line 27281
- BX9 - Response error checking - Line 27300
- IX9 - Discovery URL generation - ~Line 27321

---

### 5. HTTP Client Module (`src/http/`)

**Lines:** ~40000-48000
**Size:** ~8,000 lines
**Purpose:** Axios HTTP client implementation

**Files to Create:**
- `src/http/index.js` - Main export
- `src/http/client.js` - Axios class (xZA) - Line 44136
- `src/http/interceptors.js` - InterceptorManager (BK0) - Line 40003
- `src/http/form-data.js` - FormDataEntry (mK0) - Line 42328
- `src/http/adapter.js` - HTTP adapter (k51) - Line 44335
- `src/http/streaming.js` - Response streaming (IK9, jK9, SK9)

**Imports:**
```javascript
import from "url";
import from "crypto";
import from "stream";
import from "util";
import { Readable } from "stream";
import from "http";
import from "https";
import from "zlib";
import { EventEmitter } from "events";
```

**Key Classes/Functions:**
- InterceptorManager (BK0) - Line 40003
- FormDataEntry (mK0) - Line 42328
- Axios (xZA) - Line 44136
- k51 (HTTP adapter) - Line 44335
- IK9 (response streaming) - async generator
- jK9 (stream transformation) - async generator
- SK9 (SSE parsing) - async generator

---

### 6. Validation Module (`src/validation/`)

**Lines:** ~11158-15939
**Size:** ~4,781 lines
**Purpose:** Zod validation library

**Files to Create:**
- `src/validation/index.js` - Main export
- `src/validation/status.js` - ParseStatus (QC) - Line 11158
- `src/validation/context.js` - ParseContext (tL) - Line 11298
- `src/validation/types.js` - ZodType base class (k8) - Line 11367
- `src/validation/schemas.js` - Schema definitions

**Key Classes:**
- ParseStatus (QC) - Line 11158
- ParseContext (tL) - Line 11298
- ZodType (k8) - Line 11367

---

### 7. Storage Module (`src/storage/`)

**Lines:** TBD (LocalForage sections)
**Size:** ~1,000-2,000 lines
**Purpose:** LocalForage storage wrapper

**Files to Create:**
- `src/storage/index.js` - Main export
- `src/storage/localforage.js` - LocalForage wrapper
- `src/storage/indexeddb.js` - IndexedDB utilities

---

### 8. Tools Module (`src/tools/`)

**Lines:** TBD (requires grep for tool-related functions)
**Size:** ~5,000-8,000 lines (estimated)
**Purpose:** Tool system (Bash, Read, Write, Edit, Grep, Glob, etc.)

**Files to Create:**
- `src/tools/index.js` - Main export
- `src/tools/registry.js` - Tool registration and management
- `src/tools/bash.js` - BashTool
- `src/tools/read.js` - FileReadTool
- `src/tools/write.js` - FileWriteTool
- `src/tools/edit.js` - FileEditTool
- `src/tools/grep.js` - GrepTool
- `src/tools/glob.js` - GlobTool
- `src/tools/permissions.js` - Tool permission management
- `src/tools/execution.js` - Tool execution logic

**Key Functions:**
- Hc1 - Tool definition creation
- PK - Permission result processing
- qEA - File validation for editing
- DhQ - Apply edits to file
- ZgQ - Display diff/patch
- TtQ - Write file with validation
- BB2 - MCP request handling

---

### 9. UI/Display Module (`src/ui/`)

**Lines:** TBD (requires grep for display/render functions)
**Size:** ~3,000-5,000 lines (estimated)
**Purpose:** User interface, rendering, display formatting

**Files to Create:**
- `src/ui/index.js` - Main export
- `src/ui/render.js` - Content rendering
- `src/ui/theme.js` - Theme management
- `src/ui/messages.js` - Message display
- `src/ui/tools.js` - Tool UI (selection, details)
- `src/ui/welcome.js` - Welcome message

**Key Functions:**
- PYQ - Render content with formatting
- jYQ - Process and display messages
- iT6 - Handle in-progress tool calls
- E10 - Tool selection UI
- z10 - Tool details UI
- Hi2 - Tool exit confirmation
- TB1 - Tool management flow
- M9I - Welcome message display

---

### 10. Utilities Module (`src/utils/`)

**Lines:** ~195-1500 (and scattered throughout)
**Size:** ~2,000-3,000 lines (estimated)
**Purpose:** Utility functions (type checking, conversions, etc.)

**Files to Create:**
- `src/utils/index.js` - Main export
- `src/utils/type-checking.js` - Type checking utilities
- `src/utils/conversions.js` - Type conversion utilities
- `src/utils/object.js` - Object manipulation utilities
- `src/utils/array.js` - Array utilities
- `src/utils/string.js` - String utilities

**Key Functions:**
- SB9 - isSymbol
- yB9 - arrayMap
- xB9 - isObject
- vB9 - identity
- uB9 - isFunction
- hQ0 - toString
- dB9 - deep comparison base
- lB9 - deep equality check
- getRawTag - Get raw type tag
- getTypeTag - Get type tag
- isObjectLike - Check if object-like

---

### 11. Module System (`src/modules/`)

**Lines:** ~1-200 (module wrapper functions)
**Size:** ~200 lines
**Purpose:** Module loading and initialization

**Files to Create:**
- `src/modules/index.js` - Main export
- `src/modules/commonjs.js` - CommonJS utilities
- `src/modules/lazy.js` - Lazy loading
- `src/modules/interop.js` - ES6/CommonJS interop

**Key Functions/Variables:**
- createCommonJSModule (z) - CommonJS module wrapper
- createLazyModule (T) - Lazy module initializer
- interopRequireWildcard (IA) - ES6 interop
- nodeRequire (HA) - Node.js require

---

### 12. API Client Module (`src/api/`)

**Lines:** TBD (requires grep for Anthropic API functions)
**Size:** ~2,000-4,000 lines (estimated)
**Purpose:** Anthropic API client (messages, streaming, etc.)

**Files to Create:**
- `src/api/index.js` - Main export
- `src/api/client.js` - API client
- `src/api/messages.js` - Message API
- `src/api/streaming.js` - Streaming responses
- `src/api/bedrock.js` - AWS Bedrock integration
- `src/api/vertex.js` - Google Vertex AI integration

---

### 13. CLI Module (`src/cli/`)

**Lines:** TBD (requires grep for CLI entry point and argument parsing)
**Size:** ~1,000-2,000 lines (estimated)
**Purpose:** Command-line interface, argument parsing, command routing

**Files to Create:**
- `src/cli/index.js` - CLI entry point
- `src/cli/args.js` - Argument parsing
- `src/cli/commands.js` - Command routing
- `src/cli/output.js` - Output formatting

---

## Module Dependency Graph

```
CLI Module (src/cli/)
  ├── Config Module (src/config/)
  ├── Session Module (src/session/)
  ├── API Client Module (src/api/)
  │   ├── HTTP Client Module (src/http/)
  │   ├── OAuth Module (src/oauth/)
  │   └── Validation Module (src/validation/)
  ├── Tools Module (src/tools/)
  │   ├── MCP Module (src/mcp/)
  │   ├── UI Module (src/ui/)
  │   └── Storage Module (src/storage/)
  └── Utilities Module (src/utils/)
      └── Module System (src/modules/)
```

---

## Extraction Priority (Least Dependencies First)

1. **Module System** - No dependencies (foundational)
2. **Utilities** - Minimal dependencies
3. **Validation** - Self-contained (Zod)
4. **Config** - Depends on: Utilities
5. **HTTP Client** - Depends on: Utilities (Axios)
6. **OAuth** - Depends on: HTTP Client, Utilities
7. **MCP Protocol** - Depends on: Utilities, Module System
8. **Storage** - Depends on: Utilities
9. **Session** - Depends on: Config, Utilities
10. **UI/Display** - Depends on: Utilities
11. **Tools** - Depends on: Session, MCP, UI, Storage
12. **API Client** - Depends on: HTTP Client, OAuth, Validation, Config
13. **CLI** - Depends on: All modules (entry point)

---

## Extraction Process (Per Module)

For each module, follow these steps:

### Step 1: Create Module Directory Structure
```bash
mkdir -p src/config
mkdir -p src/session
# ... etc
```

### Step 2: Extract Code Sections
- Identify line ranges for the module
- Copy code to new file
- Add proper imports
- Add exports

### Step 3: Update Main File
- Replace extracted code with import
- Ensure backward compatibility

### Step 4: Test Extraction
- Verify module loads correctly
- Run basic functionality tests
- Check for circular dependencies

### Step 5: Document Module
- Add README.md to module directory
- Document exported functions/classes
- Add usage examples

---

## Testing Strategy

After each module extraction:
1. **Unit Tests**: Test module functions in isolation
2. **Integration Tests**: Test module interactions
3. **Smoke Tests**: Ensure basic CLI functionality works
4. **Regression Tests**: Verify no behavior changes

---

## Metrics Tracking

Track these metrics for each module extraction:

- **Lines Extracted**: Number of lines moved to module
- **Functions Extracted**: Count of functions
- **Classes Extracted**: Count of classes
- **Dependencies**: Number of imports
- **Exports**: Number of exported items
- **Circular Dependencies**: Any circular refs detected
- **Test Coverage**: Percentage covered by tests

---

## Success Criteria

Module extraction is complete when:
- [x] All modules identified and documented
- [ ] All modules extracted with proper boundaries
- [ ] No circular dependencies
- [ ] All tests passing
- [ ] Code size reduced by 90%+ in main file
- [ ] Each module has README documentation
- [ ] Module dependency graph verified
- [ ] Performance benchmarks show no regression

---

## Timeline Estimate

- **Module System Extraction**: 2-3 hours
- **Utilities Extraction**: 3-4 hours
- **Validation Extraction**: 2-3 hours
- **Config Extraction**: 2-3 hours
- **HTTP Client Extraction**: 4-6 hours
- **OAuth Extraction**: 2-3 hours
- **MCP Protocol Extraction**: 4-6 hours
- **Storage Extraction**: 2-3 hours
- **Session Extraction**: 3-4 hours
- **UI/Display Extraction**: 4-5 hours
- **Tools Extraction**: 6-8 hours
- **API Client Extraction**: 5-7 hours
- **CLI Extraction**: 3-4 hours

**Total Estimated Time**: 42-59 hours

---

*Created: 2025-11-12*
*Status: Planning Complete, Ready for Execution*
