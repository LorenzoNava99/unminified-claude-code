# Claude Code CLI - Initial Analysis Discoveries

**Date:** 2025-11-12
**Source:** Deobfuscated Claude Code v2.0.37
**Status:** Phase 1 & 3 Analysis In Progress

---

## Executive Summary

This document contains initial findings from the deobfuscation and analysis of Claude Code CLI. The analysis has revealed key architectural components, API patterns, authentication mechanisms, and tool systems.

---

## File Statistics

| File | Size | Lines | Status |
|------|------|-------|--------|
| `deobfuscated.js` | 15MB | 515,464 | Phase 1 complete (webcrack), Phase 3 modernization in progress |
| `index.js` | 42KB | 1,790 | Restringer + Lebab + Prettier complete |
| `node_modules/1/index.js` | 59 lines | - | Async task queue (already clean) |
| `node_modules/2/index.js` | 221 lines | - | Promise polyfill (Restringer + Lebab complete) |
| `node_modules/3/index.js` | 4 lines | - | Promise loader (already clean) |

---

## Code Structure Patterns

### Variable Naming Patterns

Top obfuscated patterns identified (by frequency):
- `X92` (14 occurrences)
- `D42`, `X84`, `S256`, `Q42` (8-10 occurrences each)
- Pattern: Single capital letter + 1-3 digits (e.g., `A41`, `B69`, `C59`)

**Total unique patterns:** 480+ function names, 854+ class definitions

### Function Definitions

Sample of obfuscated function names:
```
function A, function A39, function A59, function A81
function B1, function B69, function BA, function BC
function C, function C41, function C50, function C59
```

### Class Definitions

Sample of obfuscated class names (854 total):
```
class A, class A1Q, class A41, class AAA
class B, class B0A, class B8A, class B92
class AI0, class AJA, class AM2, class ANQ
```

---

## Key Components Identified

### 1. CLI Argument Parsing

**Framework:** Commander.js

Key patterns found (deobfuscated.js:4508-37497):
- Process argv inspection for debug flags
- `--debug`, `-d`, `--debug=<value>`, `--debug-to-stderr`
- Error codes: `commander.invalidArgument`, `commander.missingArgument`, `commander.unknownOption`
- Exit codes with context: `commander.help`, `commander.version`

Example:
```javascript
// Line 4508
return K0(process.env.DEBUG) || process.argv.includes("--debug") ||
       process.argv.includes("-d") || process.argv.some(A => A.startsWith("--debug="));
```

### 2. API Communication

**Patterns:** Custom fetch abstraction with fallback

Key findings:
- Fetch function parameter with global fallback: `fetchFn: B = fetch`
- Multiple abstraction layers for API calls
- Functions: `eJ9()`, `i81()`, `KY0()` (lines 24002-24891)
- Endpoint configuration with `this._fetch` property
- Custom fetch wrappers for request interception

**Evidence:**
- 30+ references to fetch/fetchFn parameters
- EventSource integration for streaming (line 24365)
- Fetch function injection pattern throughout

### 3. Authentication System

**Patterns Identified:**

Token management (lines 4133-4197):
- `sessionIngressToken`
- `oauthTokenFromFd`
- `apiKeyFromFd`
- Token counting and usage tracking

Token metrics:
```javascript
inputTokens, outputTokens
cacheReadInputTokens, cacheCreationInputTokens
```

Environment variables:
- `CLAUDE_CODE_MAX_OUTPUT_TOKENS`
- Model-specific vertex regions:
  - `VERTEX_REGION_CLAUDE_HAIKU_4_5`
  - `VERTEX_REGION_CLAUDE_3_5_HAIKU`
  - `VERTEX_REGION_CLAUDE_3_5_SONNET`
  - `VERTEX_REGION_CLAUDE_3_7_SONNET`

**Token Counter:** Uses metrics system with description "Number of tokens used", unit "tokens"

### 4. File System Operations

**Implementation:** Wrapper around Node.js `fs` module (lines 3772-5740)

Key methods:
- `existsSync(A)` - Check file existence
- `readFileSync(A, B)` - Read file as text
- `readFileBytesSync(A)` - Read file as buffer
- `writeFileSync(A, B, Q)` - Write file with options
- `mkdirSync(A)` - Create directory with recursive option

**Configuration Paths:**
- Config dir: `process.env.CLAUDE_CONFIG_DIR ?? ${home}/.claude`
- Auto-create directories if missing
- Path resolution with validation

**Safety features:**
- Existence checks before operations
- Recursive directory creation
- Encoding options support

### 5. URLs and Endpoints Discovered

**Total unique URLs:** 249

**Key patterns:**
- OAuth localhost callback: `http://localhost:${port}/callback`
- Local API server: `http://localhost:3000/api/oauth/claude_cli/create_api_key`
- SSE endpoint template: `http://${host}:${port}/sse`
- AWS metadata endpoints:
  - `http://169.254.169.254` (EC2 metadata)
  - `http://169.254.170.2` (ECS metadata)
  - `http://[fd00:ec2::254]` (IPv6 metadata)
- JSON Schema references: `http://json-schema.org/draft-07/schema#`

**Interesting patterns:**
- Template string URLs with port placeholders
- Debugging endpoints: `http://dogs.are.great${Q}` (likely test endpoint)
- Local development server patterns

### 6. Anthropic-Specific References

**Environment Configuration:**
- `CLAUDE_CONFIG_DIR` - Configuration directory path
- `CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR` - Bash behavior flag
- Model-specific vertex region configs

**Model Detection:**
- Haiku 4.5: `claude-haiku-4-5`
- Haiku 3.5: `claude-3-5-haiku`
- Sonnet 3.5: `claude-3-5-sonnet`
- Sonnet 3.7: `claude-3-7-sonnet`

**Copyright Notice:**
```
// (c) Anthropic PBC. All rights reserved.
// Use is subject to the Legal Agreements outlined here:
// https://docs.claude.com/en/docs/claude-code/legal-and-compliance
```

### 7. Tool/Function Calling System

**Evidence found:**
- Reference to "Uses the ${x5} tool" pattern (line 101743)
- Tool execution and invocation patterns present
- Extensive Mathematica function list embedded (likely for documentation or capabilities)

**Note:** Full tool system analysis pending - requires deeper AST analysis.

### 8. Error Handling

**Sample error strings extracted (72 unique):**

Validation errors:
- `" throw new ValidationError(["`
- `" validate.errors = ["`
- `" levels up, current level is "`

Schema resolution errors:
- `" resolves to more than one schema"`
- `" + B.errSchemaPath + "`

Configuration errors:
- `" options must be specified"`

---

## Network & Communication Architecture

### Streaming Support

**EventSource Integration:**
- Custom EventSource initialization
- Fetch function override capability
- SSE (Server-Sent Events) endpoint support

### Request Interception

**Patterns:**
- Fetch function injection at multiple layers
- Global fetch fallback with custom override
- Async request handling with error recovery

---

## Configuration & Environment

### Debug Configuration

**Debug flags:**
1. Environment: `DEBUG`, `DEBUG_SDK`
2. CLI args: `--debug`, `-d`, `--debug=<value>`
3. Special: `--debug-to-stderr` / `-d2e`

### File System Layout

```
${CLAUDE_CONFIG_DIR or ~/.claude}/
  ├── <config files>
  └── <cache/storage>
```

Auto-creation of directories on first run if missing.

---

## Security Observations

### Metadata Access Patterns

AWS metadata endpoints hardcoded:
- EC2 instance metadata service (IMDS)
- ECS container metadata
- Both IPv4 and IPv6 support

**Implications:** Cloud environment detection and configuration

### Token Security

- Tokens passed via file descriptors (`oauthTokenFromFd`, `apiKeyFromFd`)
- Session ingress tokens for authentication
- Metric collection on token usage

---

## Next Steps

### Immediate (Phase 1 completion):
- [x] Extract URLs and endpoints ✓
- [x] Extract function/class patterns ✓
- [x] Identify CLI framework ✓
- [x] Identify file system operations ✓
- [ ] Complete Lebab modernization (in progress)
- [ ] Format with Prettier

### Phase 2 (Semantic Analysis):
- [ ] Split file for JSNice processing
- [ ] Create variable mapping table
- [ ] Apply semantic renaming

### Phase 3 (Deep Analysis):
- [ ] Map complete tool system architecture
- [ ] Document API protocol fully
- [ ] Trace authentication flows
- [ ] Identify all command handlers

---

## Tools Used

1. **webcrack** - Initial deobfuscation ✓
2. **Restringer** - Advanced deobfuscation (failed on main file - AST parsing error)
3. **Lebab** - ES5 to ES6+ modernization (in progress on main file, complete on modules)
4. **Prettier** - Code formatting (complete on modules)
5. **grep** - Pattern extraction ✓

---

## Analysis Methodology

### Pattern Extraction Commands

```bash
# URL extraction
grep -oP 'https?://[^\s"'\''<>]+' deobfuscated.js | sort | uniq

# Function definitions
grep -oP '\bfunction\s+\w+' deobfuscated.js | sort | uniq

# Class definitions
grep -oP '\bclass\s+\w+' deobfuscated.js | sort | uniq

# CLI parsing
grep -n "process\.argv\|commander" deobfuscated.js

# API calls
grep -in "fetch\|axios\|api\.anthropic" deobfuscated.js

# Authentication
grep -in "apikey\|token\|auth\|bearer" deobfuscated.js

# File operations
grep -in "readfile\|writefile\|fs\.\|path\." deobfuscated.js

# Variable patterns
grep -oP '\b[A-Z][0-9]{2,3}\b' deobfuscated.js | sort | uniq -c | sort -rn
```

---

## Key Insights

1. **Architecture:** Modular design with clear separation between CLI, API client, file system, and tools
2. **Obfuscation Level:** Variable names heavily obfuscated but structure preserved
3. **Framework Choices:** Commander.js for CLI, custom fetch abstraction, EventSource for streaming
4. **Cloud Native:** Built-in AWS metadata service support, environment-based configuration
5. **Token Management:** Sophisticated tracking system for API usage and caching
6. **Security:** File descriptor-based token passing, environment variable configuration

---

## File Inventory

Analysis artifacts created:
- `work/analysis/urls.txt` - 249 unique URLs
- `work/analysis/anthropic-refs.txt` - 100 Anthropic-specific references
- `work/analysis/functions-sample.txt` - 480 unique function names
- `work/analysis/classes.txt` - 854 unique class definitions
- `work/analysis/errors.txt` - 72 error-related strings
- `work/analysis/cli-parsing.txt` - CLI argument parsing patterns
- `work/analysis/api-calls.txt` - API call patterns
- `work/analysis/authentication.txt` - Authentication mechanisms
- `work/analysis/file-ops.txt` - File operation patterns
- `work/analysis/tool-system.txt` - Tool system patterns
- `work/analysis/variable-patterns.txt` - Top 100 variable naming patterns

---

*Last Updated: 2025-11-12 10:40 UTC*
*Phase: 1 (Enhanced Deobfuscation) + Phase 3 (Initial Analysis)*
