# Claude Code CLI - Discovered Architecture

**Analysis Date:** 2025-11-12
**Version Analyzed:** 2.0.37
**Analysis Status:** Phase 1-2 In Progress

---

## Executive Summary

Through systematic decompilation analysis and context discovery, we have identified key architectural components and embedded libraries within the Claude Code CLI codebase.

### Key Discoveries

1. **Bundle Structure:** Browserify-based bundle with 4 modules
2. **Embedded Libraries:** Axios (HTTP client), Zod (validation), LocalForage (storage), AWS SDK v3
3. **Core Components:** Session management, Tool system, API client, Configuration system

---

## Embedded Libraries (Identified)

### 1. Axios HTTP Client

**Evidence:** InterceptorManager class, FormDataEntry encoding

```javascript
// BK0 class is Axios InterceptorManager
class BK0 {  // -> InterceptorManager
  constructor() {
    this.handlers = [];
  }
  use(A, B, Q) {  // fulfilled, rejected, config
    this.handlers.push({
      fulfilled: A,
      rejected: B,
      synchronous: Q ? Q.synchronous : false,
      runWhen: Q ? Q.runWhen : null
    });
  }
  eject(A) { /* ... */ }
  clear() { /* ... */ }
}

// mK0 class is Axios FormDataEntry
class mK0 {  // -> FormDataEntry
  constructor(A, B) {  // name, value
    // Handles multipart/form-data encoding
  }
  async *encode() { /* ... */ }
  static escapeName(A) { /* ... */ }
}
```

**Usage:** HTTP requests to Anthropic API, file uploads, streaming

---

### 2. Zod Validation Library

**Evidence:** ParseStatus class with valid/dirty/aborted states

```javascript
// QC class is Zod ParseStatus
class QC {  // -> ParseStatus
  constructor() {
    this.value = "valid";
  }
  dirty() {
    if (this.value === "valid") {
      this.value = "dirty";
    }
  }
  abort() {
    if (this.value !== "aborted") {
      this.value = "aborted";
    }
  }
  static mergeArray(A, B) { /* ... */ }
  static mergeObjectAsync(A, B) { /* ... */ }
  static mergeObjectSync(A, B) { /* ... */ }
}
```

**Usage:** Input validation, schema validation, configuration validation

---

### 3. LocalForage Storage

**Evidence:** Explicitly identified in index.js (1,790 lines)

```javascript
// LocalForage detection and initialization
function X() {
  try {
    if (typeof indexedDB !== "undefined") return indexedDB;
    if (typeof webkitIndexedDB !== "undefined") return webkitIndexedDB;
    // ... more vendors
  } catch (e) { return; }
}
```

**Usage:** Conversation history persistence, session storage, cache

---

### 4. AWS SDK v3 Components

**Evidence:** Signature v4 implementation found in deobfuscated code

**Components:**
- `@aws-sdk/signature-v4` - Request signing
- AWS credential provider
- Region management

**Usage:** AWS Bedrock integration, potentially other AWS services

---

## Core Architecture Components

### 1. Session Management

**Key Identifier:** `YB` (sessionState)

```javascript
var YB = {
  totalToolDuration: 0,
  isNonInteractiveSession: true,
  sessionIngressToken: undefined,
  sessionCounter: null,
  codeEditToolDecisionCounter: null,
  sessionId: Y50(),  // randomUUID()
  agentColorMap: new Map(),
  agentColorIndex: 0
};
```

**Responsibilities:**
- Session lifecycle management
- Tool usage tracking
- Cost/token accounting
- Agent coordination

---

### 2. Configuration System

**Key Functions:**
- `dB()` - getClaudeConfigDir
- `K0(A)` - parseBoolean
- `Ne(A)` - parseBooleanNegative
- `Z50(A)` - parseEnvironmentVariables
- `QLA(A)` - getVertexRegionForModel
- `pL()` - getDefaultCloudMLRegion
- `Le()` - getAWSRegion

**Configuration Sources:**
1. Environment variables (`CLAUDE_CONFIG_DIR`, `CLOUD_ML_REGION`, etc.)
2. Config files in `~/.claude/`
3. Command-line arguments

**Model-Specific Regions:**
```javascript
function QLA(modelName) {
  if (modelName?.startsWith("claude-haiku-4-5")) {
    return process.env.VERTEX_REGION_CLAUDE_HAIKU_4_5 || pL();
  }
  if (modelName?.startsWith("claude-3-5-haiku")) {
    return process.env.VERTEX_REGION_CLAUDE_3_5_HAIKU || pL();
  }
  // ... more models
  return pL();
}
```

---

### 3. Tool System

**Discovered Tool References:**
- `BashTool` - Shell command execution
- `FileReadTool` - File reading
- `FileWriteTool` - File writing
- `FileEditTool` - File editing
- `GrepTool` - Content searching
- `GlobTool` - Pattern matching
- `ReadMcpResourceTool` - MCP resource reading

**Tool Configuration:**
```javascript
ILA = {
  name: "BASH_MAX_OUTPUT_LENGTH",
  default: 30000,
  validate: A => {
    // Validation logic
  }
};
```

---

### 4. API Client Layer

**Anthropic API Integration:**
- Message streaming
- Token counting
- Model selection
- Region-based routing

**Providers Supported:**
- Anthropic direct
- AWS Bedrock
- Google Cloud Vertex AI

---

## Module Organization (Discovered)

Based on code analysis, the natural module boundaries are:

```
Claude Code CLI
├── Config Layer
│   ├── Environment variable parsing
│   ├── Config file loading
│   └── Region/provider selection
├── Session Layer
│   ├── Session lifecycle
│   ├── State management
│   └── Metrics tracking
├── Tool Layer
│   ├── Tool registry
│   ├── Tool execution
│   └── Permission management
├── API Layer
│   ├── HTTP client (Axios)
│   ├── Request/response handling
│   └── Streaming support
├── Storage Layer
│   └── LocalForage wrapper
└── CLI Layer
    ├── Argument parsing
    ├── Command routing
    └── Output formatting
```

---

## Identifier Mapping Progress

### Confirmed Mappings (60+)

#### Module System
- `DB9` → `createRequire`
- `z` → `createCommonJSModule`
- `T` → `createLazyModule`
- `IA` → `interopRequireWildcard`

#### Object Utilities
- `FB9` → `objectCreate`
- `CB9` → `getPrototypeOf`
- `h21` → `defineProperty`
- `VB9` → `getOwnPropertyNames`
- `KB9` → `objectHasOwnProperty`

#### Type Checking
- `TB9` → `getTypeTag`
- `PB9` → `isObjectLike`
- `bz` → `toTypeTag`

#### Configuration
- `dB` → `getClaudeConfigDir`
- `K0` → `parseBoolean`
- `Ne` → `parseBooleanNegative`
- `Z50` → `parseEnvironmentVariables`
- `QLA` → `getVertexRegionForModel`
- `pL` → `getDefaultCloudMLRegion`
- `Le` → `getAWSRegion`

#### Session Management
- `YB` → `sessionState`
- `Y50` → `randomUUID`

#### Libraries
- `BK0` → `InterceptorManager` (Axios)
- `mK0` → `FormDataEntry` (Axios)
- `QC` → `ParseStatus` (Zod)
- `y1` → `utils`
- `GI` → `platformUtils`

---

## Obfuscation Patterns Identified

### 1. Single-Letter Parameters (Critical Issue)

**Frequency Analysis:**
- `A`: 77,981 uses
- `B`: 52,673 uses
- `Q`: 40,151 uses
- `I`: 30,248 uses
- `G`: 25,444 uses

**Challenge:** These are context-dependent and require function-level analysis.

### 2. Short Alphanumeric Identifiers

**Pattern:** 2-4 character combinations (e.g., `DB9`, `FB9`, `h21`, `t7A`)

**Solution:** Context analysis reveals purpose (e.g., `h21` is `defineProperty`)

### 3. Numbered Variants

**Pattern:** Same letter with numbers (e.g., `A1`, `Q1`, `B1`, `I1`, `G1`)

**Challenge:** Need AST analysis to determine scope and rename appropriately

---

## Code Quality Metrics

### Current State (After Initial Deobfuscation)

| Metric | Value |
|--------|-------|
| Total Lines | 515,464 |
| File Size | 15 MB |
| Identifiers Analyzed | 200+ |
| Confirmed Mappings | 60+ |
| Classes Identified | 12+ |
| Embedded Libraries | 4+ |
| Single-Letter Params | 400,000+ uses |

### Readability Score

| Category | Before | Current | Target |
|----------|--------|---------|--------|
| Variable Names | 1/10 | 2/10 | 9/10 |
| Structure | 2/10 | 2/10 | 8/10 |
| Documentation | 0/10 | 0/10 | 7/10 |
| **Overall** | **1/10** | **2/10** | **8.5/10** |

---

## Next Steps

### Immediate (In Progress)
1. ✅ Complete lebab ES6 modernization
2. ⏳ Apply systematic identifier renaming (60+ mappings)
3. ⏳ Format with prettier
4. ⏳ Verify transformed code validity

### Short-term
5. Expand identifier mapping to 200+ identifiers
6. Add JSDoc documentation to public APIs
7. Create TypeScript definition files
8. Extract embedded libraries to npm dependencies

### Medium-term
9. Split monolithic file into logical modules
10. Create architecture diagrams
11. Document API endpoints
12. Create test suite

---

## Tools Used

- **webcrack**: Initial deobfuscation ✅
- **restringer**: Advanced deobfuscation (partial - incompatible with some patterns)
- **lebab**: ES6 modernization ⏳
- **prettier**: Code formatting (pending)
- **@babel/core**: Systematic renaming (script ready)
- **TypeScript**: Type inference (planned)

---

## Key Insights

### 1. Library Identification

The codebase extensively uses well-known open-source libraries:
- **Axios** for HTTP (not fetch)
- **Zod** for validation (not Joi/Yup)
- **LocalForage** for storage (not direct IndexedDB)

This means we can:
- Reference official documentation
- Extract to npm dependencies
- Benefit from type definitions

### 2. Provider Architecture

Claude Code supports multiple API providers:
- Anthropic Direct API
- AWS Bedrock (with signature v4)
- Google Cloud Vertex AI (region-based)

Each has specific configuration and routing logic.

### 3. Tool Permission System

Evidence of sophisticated permission management:
- `codeEditToolDecisionCounter` - tracks accept/reject decisions
- Tool-specific hooks and matchers
- Sandbox mode for BashTool

### 4. Session Persistence

LocalForage indicates:
- Conversation history is stored locally
- Session state persists across runs
- Cache for performance optimization

---

## Challenges Encountered

### 1. File Size

15MB single file causes:
- Memory exhaustion in some tools
- Long processing times
- Difficult manual analysis

**Solution:** Incremental processing, increased memory limits

### 2. Parameter Obfuscation

400,000+ single-letter parameters require:
- Function-by-function analysis
- AST-based context understanding
- Heuristic naming

**Solution:** Babel plugin for systematic renaming

### 3. Tool Compatibility

Restringer failed on main file due to:
- AST parsing issues
- Already-deobfuscated code
- Memory constraints

**Solution:** Skip restringer, proceed with lebab

---

## Conclusion

Significant progress has been made in understanding the Claude Code CLI architecture. The systematic approach of:

1. Frequency analysis
2. Context discovery
3. Library identification
4. Mapping creation

...has enabled us to create a foundation for comprehensive identifier renaming and documentation.

The next phase will apply these discoveries to dramatically improve code readability through automated transformation.

---

*Generated: 2025-11-12*
*Status: Phase 1-2 Active*
*Progress: ~30% Complete*
