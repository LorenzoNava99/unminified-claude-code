# Phase 7: Navigation and Analysis Tools

## Overview

This directory contains powerful command-line tools for navigating and analyzing the deobfuscated Claude Code source. These tools enable rapid symbol lookup, cross-referencing, and code analysis.

## Tools

### 1. Symbol Navigator (`symbol-navigator.sh`)

Find symbol definitions (functions, classes, exports) in the codebase.

**Usage**:
```bash
./symbol-navigator.sh <command> [arguments]
```

**Commands**:

| Command | Description | Example |
|---------|-------------|---------|
| `find <name>` | Find any symbol (function/class/variable) | `./symbol-navigator.sh find MB9` |
| `function <name>` | Find function definition | `./symbol-navigator.sh function executeTools` |
| `class <name>` | Find class definition | `./symbol-navigator.sh class WebSocketClient` |
| `export <name>` | Find export statement | `./symbol-navigator.sh export Server` |
| `mcp <keyword>` | Find MCP-related code | `./symbol-navigator.sh mcp server` |
| `tool <name>` | Find tool implementation | `./symbol-navigator.sh tool Bash` |
| `api <endpoint>` | Find API endpoint usage | `./symbol-navigator.sh api /v1/messages` |
| `rebuild-cache` | Rebuild symbol cache (run once) | `./symbol-navigator.sh rebuild-cache` |

**Examples**:

```bash
# Find function definition with context
./symbol-navigator.sh function handleStreamingResponse

# Find all MCP server-related code
./symbol-navigator.sh mcp initialize

# Find where a tool is implemented
./symbol-navigator.sh tool Read

# Find API endpoint references
./symbol-navigator.sh api https://api.anthropic.com
```

---

### 2. Cross-Reference Tool (`cross-reference.sh`)

Find usages, references, and call sites of symbols.

**Usage**:
```bash
./cross-reference.sh <command> [arguments]
```

**Commands**:

| Command | Description | Example |
|---------|-------------|---------|
| `usage <symbol>` | Find all usages of a symbol | `./cross-reference.sh usage WebSocket` |
| `callers <function>` | Find all callers of a function | `./cross-reference.sh callers executeTool` |
| `imports <module>` | Find where a module is imported | `./cross-reference.sh imports "fs/promises"` |
| `property <name>` | Find property accesses | `./cross-reference.sh property authorization` |
| `string <text>` | Find string occurrences | `./cross-reference.sh string "api.anthropic.com"` |
| `pattern <regex>` | Find regex pattern matches | `./cross-reference.sh pattern 'process\.env\.[A-Z_]+'` |
| `context <symbol> <n>` | Find symbol with N lines of context | `./cross-reference.sh context MCP 10` |
| `stats <symbol>` | Show usage statistics | `./cross-reference.sh stats setTimeout` |

**Examples**:

```bash
# Find all usages of a class
./cross-reference.sh usage MCPServer

# Find who calls a function
./cross-reference.sh callers parseSSEEvent

# Find all environment variable accesses
./cross-reference.sh pattern 'process\.env\.[A-Z_]+'

# Get detailed usage statistics
./cross-reference.sh stats ANTHROPIC_API_KEY

# Find with context lines
./cross-reference.sh context "code_challenge" 5
```

---

## Common Workflows

### Workflow 1: Understand a Symbol

```bash
# Step 1: Find where it's defined
./symbol-navigator.sh find executeTools

# Step 2: Find all usages
./cross-reference.sh usage executeTools

# Step 3: Find who calls it
./cross-reference.sh callers executeTools

# Step 4: Get statistics
./cross-reference.sh stats executeTools
```

### Workflow 2: Trace API Flow

```bash
# Find API endpoint definition
./symbol-navigator.sh api /v1/messages

# Find all usages of the endpoint
./cross-reference.sh string "/v1/messages"

# Find authentication code
./cross-reference.sh property authorization

# Find response handling
./symbol-navigator.sh function handleResponse
```

### Workflow 3: Analyze MCP Implementation

```bash
# Find MCP server code
./symbol-navigator.sh mcp server

# Find initialize method
./symbol-navigator.sh function initialize

# Find all MCP-related imports
./cross-reference.sh imports modelcontextprotocol

# Get MCP usage statistics
./cross-reference.sh pattern 'mcp__[a-z]+__[a-z_]+'
```

### Workflow 4: Debug Tool Execution

```bash
# Find tool definition
./symbol-navigator.sh tool Read

# Find all tool executions
./cross-reference.sh usage tool_use

# Find error handling
./symbol-navigator.sh function handleToolError

# Find with context
./cross-reference.sh context "tool_result" 10
```

### Workflow 5: Security Audit

```bash
# Find environment variable usage
./cross-reference.sh pattern 'process\.env\.'

# Find token management
./cross-reference.sh usage sessionIngressToken

# Find authentication code
./symbol-navigator.sh function authenticate

# Find file operations
./cross-reference.sh property file_path
```

---

## Tips and Tricks

### Performance

**For large searches** (>100 results), use more specific queries:
```bash
# Too broad (1000+ results)
./cross-reference.sh usage A

# Better (specific pattern)
./cross-reference.sh pattern 'class A[A-Z0-9]{2}'
```

**Use caching** for repeated searches:
```bash
# Build cache once (takes ~1 minute)
./symbol-navigator.sh rebuild-cache

# Future searches will be faster
```

### Regex Patterns

**Useful patterns**:

```bash
# Find all environment variables
./cross-reference.sh pattern 'process\.env\.[A-Z_]+'

# Find all API endpoints
./cross-reference.sh pattern 'https?://[a-z.-]+\.[a-z]{2,}'

# Find all error types
./cross-reference.sh pattern 'Error\(.*\)'

# Find all timeout configurations
./cross-reference.sh pattern 'setTimeout.*[0-9]+'

# Find all class definitions
./cross-reference.sh pattern 'class [A-Z][a-zA-Z0-9]*'
```

### Combining Tools

**Use both tools together** for comprehensive analysis:

```bash
# Find definition
./symbol-navigator.sh function processMessage

# Find callers
./cross-reference.sh callers processMessage

# Find with context
./cross-reference.sh context processMessage 10
```

### Output Redirection

**Save results to file**:
```bash
# Save all MCP references
./symbol-navigator.sh mcp server > mcp-references.txt

# Save usage statistics
./cross-reference.sh stats WebSocket > websocket-stats.txt
```

**Pipe to other tools**:
```bash
# Count occurrences
./cross-reference.sh usage setTimeout | wc -l

# Extract line numbers only
./cross-reference.sh usage executeTools | cut -d: -f1

# Search within results
./symbol-navigator.sh mcp server | grep initialize
```

---

## Advanced Features

### Context Lines

Control how much context to show:
```bash
# Default 5 lines
./cross-reference.sh context authenticate 5

# Show 20 lines for deep analysis
./cross-reference.sh context authenticate 20

# Show 1 line for quick overview
./cross-reference.sh context authenticate 1
```

### Statistics

Get comprehensive usage statistics:
```bash
./cross-reference.sh stats Symbol

# Shows:
# - Total occurrences
# - Definitions count
# - Assignments count
# - Function calls count
# - Property accesses count
# - First/last occurrence
# - Distribution across file
```

### Property Access Patterns

Find different types of property access:
```bash
# Dot notation: obj.property
./cross-reference.sh property apiKey

# Bracket notation: obj["property"]
# Optional chaining: obj?.property
# All handled automatically
```

---

## Limitations

1. **No AST parsing** - These tools use regex, not full syntax parsing
2. **No type inference** - Cannot follow type aliases or interfaces
3. **Minified variables** - Original variable names not available (e.g., `A`, `MB9`)
4. **Large file** - 15MB deobfuscated.js means some searches are slow
5. **No incremental search** - Each search scans entire file

---

## Performance Benchmarks

| Operation | Time | Notes |
|-----------|------|-------|
| Simple find | <1s | Single grep |
| Complex pattern | 2-5s | Regex matching |
| Statistics | 5-10s | Multiple greps |
| Rebuild cache | 60-90s | Run once at setup |

**Tips for speed**:
- Use specific patterns instead of broad searches
- Limit context lines for large result sets
- Use `head`/`tail` to limit output
- Cache results to files for reuse

---

## Troubleshooting

### Issue: "Command not found"

**Solution**: Make sure scripts are executable
```bash
chmod +x symbol-navigator.sh cross-reference.sh
```

### Issue: "Deobfuscated file not found"

**Solution**: Ensure you're in the correct directory
```bash
cd /path/to/unminified-claude-code/deobfuscated/work/phase7-tools
```

### Issue: Too many results

**Solution**: Use more specific patterns
```bash
# Instead of:
./cross-reference.sh usage A

# Use:
./cross-reference.sh pattern 'class A[0-9]{3}'
```

### Issue: No results found

**Solution**: Try broader patterns
```bash
# Try case-insensitive with grep
grep -i "symbol" ../../deobfuscated.js

# Or use wildcards
./cross-reference.sh pattern 'symbol.*'
```

---

## Integration with Editors

### VS Code

Add to `.vscode/tasks.json`:
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Find Symbol",
      "type": "shell",
      "command": "./work/phase7-tools/symbol-navigator.sh",
      "args": ["find", "${input:symbolName}"],
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "symbolName",
      "type": "promptString",
      "description": "Symbol name to find"
    }
  ]
}
```

### Vim

Add to `.vimrc`:
```vim
" Find symbol under cursor
nnoremap <leader>fs :!./work/phase7-tools/symbol-navigator.sh find <cword><CR>

" Find usages of symbol under cursor
nnoremap <leader>fu :!./work/phase7-tools/cross-reference.sh usage <cword><CR>
```

### Emacs

Add to `.emacs`:
```elisp
(defun find-symbol-at-point ()
  "Find symbol at point using symbol-navigator"
  (interactive)
  (shell-command
   (format "./work/phase7-tools/symbol-navigator.sh find %s"
           (thing-at-point 'symbol))))

(global-set-key (kbd "C-c f s") 'find-symbol-at-point)
```

---

## Related Documentation

- **Phase 2**: [ARCHITECTURE.md](../analysis/ARCHITECTURE.md) - Understanding system architecture helps navigate code
- **Phase 3**: [SEMANTIC-ANALYSIS.md](../phase3-semantic/SEMANTIC-ANALYSIS.md) - Symbol tables and patterns
- **Phase 4**: [EXECUTION-ANALYSIS.md](../phase4-execution/EXECUTION-ANALYSIS.md) - Execution flows to trace
- **Phase 5**: [API-REFERENCE.md](../phase5-docs/API-REFERENCE.md) - API patterns to search for
- **Phase 6**: [SECURITY-AUDIT.md](../phase6-audit/SECURITY-AUDIT.md) - Security patterns to find

---

## Future Enhancements

Potential improvements for these tools:

1. **Full AST parsing** - Use JavaScript parser for accurate symbol resolution
2. **Interactive mode** - TUI for browsing results
3. **Call graph generation** - Visualize function call relationships
4. **Type inference** - Follow variable types across assignments
5. **Incremental indexing** - Build search index for faster queries
6. **Web interface** - Browse codebase in browser
7. **Git integration** - Track symbol changes across commits

---

**Generated**: 2025-11-12
**Phase**: 7 - Navigation and Analysis Tools
**Status**: Production Ready
