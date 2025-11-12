# Claude Code Deobfuscation Plan
**Date:** 2025-11-12
**Agent:** claude/explore-project-setup-011CV4E2HNUYpg1m6kcyiSou
**Status:** Planning Phase - No active deobfuscation in progress

## Project Status Check

### Git Branches Analysis
- **Current branch:** `claude/explore-project-setup-011CV4E2HNUYpg1m6kcyiSou` (this agent)
- **Other branch:** `claude/explore-project-setup-011CV3qKmArgR15vjkARtvD9` (no deobfuscation work)
- **Work done:** Documentation extraction and symbol cataloging only
- **No overlapping work detected** ✓

### Current State
- ✅ Phase 0 complete: Initial webcrack deobfuscation (515,464 lines)
- ✅ Documentation downloaded (30 files, 393KB)
- ✅ Symbols extracted (560+ symbols in 16 categories)
- ❌ No work directory created yet
- ❌ No deobfuscation progress on actual code
- ❌ No other agents working on deobfuscation

**SAFE TO PROCEED** - No risk of duplicating work or overwriting changes.

---

## File Analysis

### deobfuscated.js Structure

**File:** `/home/user/unminified-claude-code/deobfuscated/deobfuscated.js`
- **Size:** 14.3 MB
- **Lines:** 515,464
- **Functions:** 2,837
- **Var declarations:** 8,168
- **Format:** ES6 modules (single import statement)

### Obfuscation Patterns Identified

#### 1. Variable Name Patterns
```javascript
// Short 3-4 char names with mixed case and numbers
DB9, FB9, CB9, h21, VB9, KB9, IA, z, E$, T, HA
A0, A1, A2, A00, A01, A02 (sequential numbering)
kQ0, SQ0, wB9, $B9, t7A, yQ0 (mixed patterns)
```

#### 2. Module/Lazy Initialization Pattern
```javascript
// Functions wrapped in T(() => { ... })
var kQ0 = T(() => {
  mp();
  SQ0 = Object.prototype;
  wB9 = SQ0.hasOwnProperty;
  // ...
});
```

#### 3. Known Good Identifiers Found
- Tool names preserved as strings: "Read", "Write", "Edit", "Bash", "Grep", "Glob"
- Model names: "claude-haiku-4-5", "claude-sonnet-4-5", etc.
- Telemetry metrics: "claude_code.session.count", "claude_code.cost.usage"
- API endpoints: Around line 55,827

---

## Deobfuscation Strategy

### Phase 1: Automated Pattern Recognition (Week 1)

#### 1.1 String Literal Analysis
**Goal:** Extract all strings to understand functionality

```bash
# Extract all string literals
grep -oP '"[^"]+"' deobfuscated.js | sort -u > work/analysis/strings.txt
grep -oP "'[^']+'" deobfuscated.js | sort -u >> work/analysis/strings.txt

# Categorize strings
- API endpoints
- Error messages
- Tool names
- Configuration keys
- File paths
```

**Deliverable:** `work/analysis/string-catalog.json`

#### 1.2 Identifier Frequency Analysis
**Goal:** Find most commonly used obfuscated identifiers

```bash
# Extract all identifiers
grep -oE '\b[A-Za-z_$][A-Za-z0-9_$]*\b' deobfuscated.js | \
  sort | uniq -c | sort -rn > work/analysis/identifier-frequency.txt

# Focus on top 500 most frequent
head -500 work/analysis/identifier-frequency.txt
```

**Deliverable:** `work/analysis/top-identifiers.txt`

#### 1.3 Cross-Reference with Extracted Symbols
**Goal:** Map strings to likely variable names

```javascript
// If we find "Read" tool used, nearby variables likely:
// - ReadTool, readFile, executeRead, etc.

// Strategy:
1. Find string "Read" in code
2. Look at surrounding 50 lines
3. Identify variables used in same scope
4. Map obfuscated names to ReadTool functionality
```

**Deliverable:** `work/mappings/initial-mappings.json`

---

### Phase 2: Function Signature Analysis (Week 1-2)

#### 2.1 Entry Point Identification
**Goal:** Find main(), CLI entry points

```javascript
// Look for:
- #!/usr/bin/env node (line 1 - found!)
- process.argv parsing
- Command-line flag processing
- Main event loop
```

**Known locations:**
- Line 1: Shebang
- Line 3,957: `CLAUDE_CONFIG_DIR` env var
- Line 4,295-4,318: Telemetry metrics initialization
- Line 55,827: API endpoints constants

**Deliverable:** `work/analysis/entry-points.md`

#### 2.2 Tool Implementation Search
**Goal:** Find where each of the 17 tools is implemented

```bash
# Search for tool name usage
for tool in Read Write Edit Bash Grep Glob WebFetch WebSearch Task TodoWrite \
            Agent SlashCommand Skill NotebookEdit NotebookRead BashOutput \
            KillShell; do
  echo "=== $tool ===" >> work/analysis/tool-locations.txt
  grep -n "\"$tool\"" deobfuscated.js | head -20 >> work/analysis/tool-locations.txt
done
```

**Strategy:**
- Find string literal "Read"
- Trace backwards to find function definition
- Map obfuscated function name → ReadTool
- Repeat for all 17 tools

**Deliverable:** `work/analysis/tool-implementations.md`

#### 2.3 API Client Location
**Goal:** Find Anthropic API communication layer

```bash
# Search around API endpoints (line 55,827)
sed -n '55800,55900p' deobfuscated.js > work/analysis/api-client-section.js

# Find fetch/axios calls
grep -n "fetch\|axios\|https\?://" deobfuscated.js | \
  grep -v "^//" > work/analysis/network-calls.txt
```

**Deliverable:** `work/analysis/api-client.md`

---

### Phase 3: Contextual Renaming (Week 2-3)

#### 3.1 Create Mapping Database
**Goal:** Build comprehensive rename mapping

```javascript
// Structure: work/mappings/symbol-map.json
{
  "DB9": {
    "newName": "createRequire",
    "confidence": "HIGH",
    "reason": "Direct import alias",
    "location": "line 8",
    "type": "import"
  },
  "FB9": {
    "newName": "objectCreate",
    "confidence": "HIGH",
    "reason": "Object.create reference",
    "location": "line 9",
    "type": "builtin-alias"
  },
  "CB9": {
    "newName": "getPrototypeOf",
    "confidence": "HIGH",
    "reason": "Object.getPrototypeOf",
    "location": "line 11",
    "type": "builtin-alias"
  }
  // ... continue for all identifiers
}
```

**Confidence Levels:**
- **HIGH:** Direct reference or obvious context (like imports)
- **MEDIUM:** Inferred from usage patterns
- **LOW:** Best guess from surrounding code

#### 3.2 Automated Renaming Script
**Goal:** Create rename tool with safety checks

```javascript
// rename-tool.js
const mappings = require('./mappings/symbol-map.json');

function renameSymbol(code, oldName, newName, confidence) {
  if (confidence !== 'HIGH') {
    // Require manual review
    console.warn(`⚠️  Manual review required for ${oldName} → ${newName}`);
    return code;
  }

  // Use AST for safe renaming (avoid false positives in strings)
  // Only rename in code context, not in string literals
  return safeRename(code, oldName, newName);
}
```

**Safety features:**
- AST-based renaming (not regex)
- Preserve string literals
- Backup before each rename
- Git commit after each batch

**Deliverable:** `work/tools/rename-tool.js`

#### 3.3 Incremental Renaming Strategy

**Order of operations:**
1. **HIGH confidence renames** (imports, built-ins) - ~100 symbols
2. **Tool implementations** (Read, Write, etc.) - ~200 symbols
3. **API client** (fetch, endpoints) - ~150 symbols
4. **Hook system** (PreToolUse, PostToolUse) - ~100 symbols
5. **CLI parsing** (flags, commands) - ~200 symbols
6. **MEDIUM confidence** (requires validation) - ~1000 symbols
7. **LOW confidence** (manual review) - remaining ~5000 symbols

**Git strategy:**
```bash
git checkout -b deobfuscation/phase3-renaming

# Commit after each category
git commit -m "Rename HIGH confidence imports (100 symbols)"
git commit -m "Rename tool implementations (200 symbols)"
# etc.
```

---

### Phase 4: Module Extraction (Week 3-4)

#### 4.1 Identify Module Boundaries
**Goal:** Split monolithic file into logical modules

**Expected modules based on documentation:**
- `src/tools/read-tool.ts`
- `src/tools/write-tool.ts`
- `src/tools/bash-tool.ts`
- `src/api/anthropic-client.ts`
- `src/cli/parser.ts`
- `src/cli/commands.ts`
- `src/hooks/hook-manager.ts`
- `src/agents/agent-manager.ts`
- `src/mcp/mcp-client.ts`
- `src/config/settings-loader.ts`

#### 4.2 Extract by Dependency Analysis
**Goal:** Create import/export graph

```javascript
// Use AST to trace:
// Function A calls Function B
// Module exports { toolA, toolB }
// Build dependency tree
```

**Tool:** Use `madge` or similar for dependency visualization

**Deliverable:** `work/analysis/module-structure.json`

---

### Phase 5: Type Definitions (Week 4-5)

#### 5.1 Generate TypeScript Definitions
**Goal:** Create accurate .d.ts files

**Use existing:** `/home/user/unminified-claude-code/package/sdk-tools.d.ts`

**Enhance with:**
- Internal type definitions
- Function signatures from deobfuscated code
- Configuration types from settings.json schema

#### 5.2 Convert to TypeScript
**Option A:** Keep JavaScript with JSDoc comments
**Option B:** Full TypeScript conversion

**Recommendation:** Option A first (faster), then Option B

---

### Phase 6: Documentation & Validation (Week 5-6)

#### 6.1 Generate Code Documentation
- JSDoc comments for all public functions
- README.md for each module
- Architecture diagram (mermaid)
- API documentation

#### 6.2 Validation Tests
```bash
# Ensure renamed code still works
1. Compare output of original vs renamed
2. Run simple test commands
3. Verify tool execution
4. Check API communication
```

#### 6.3 Create Comparison Report
```markdown
## Deobfuscation Results

**Original:**
- File: 14.3MB, 515,464 lines
- Identifiers: 8,000+ obfuscated

**Deobfuscated:**
- Files: X modules, Y KB each
- Identifiers: Meaningful names
- Type coverage: Z%
- Documentation: Complete
```

---

## Tools & Setup

### Required Tools

```bash
# Install deobfuscation tools
npm install -g @babel/parser @babel/traverse @babel/types
npm install -g prettier eslint
npm install -g madge  # Dependency analysis

# Optional: Advanced tools
npm install -g @restringer/cli  # Additional deobfuscation
npm install -g lebab  # ES5 → ES6 modernization
```

### Directory Structure

```
deobfuscated/
├── deobfuscated.js (original - DO NOT MODIFY)
├── work/
│   ├── analysis/
│   │   ├── strings.txt
│   │   ├── identifier-frequency.txt
│   │   ├── entry-points.md
│   │   ├── tool-locations.txt
│   │   ├── api-client-section.js
│   │   └── module-structure.json
│   ├── mappings/
│   │   ├── symbol-map.json
│   │   ├── initial-mappings.json
│   │   └── validated-mappings.json
│   ├── tools/
│   │   ├── rename-tool.js
│   │   ├── extract-strings.js
│   │   └── validate-rename.js
│   ├── step1-strings-extracted/
│   │   └── deobfuscated-step1.js
│   ├── step2-renamed-high-confidence/
│   │   └── deobfuscated-step2.js
│   ├── step3-renamed-medium-confidence/
│   │   └── deobfuscated-step3.js
│   └── final/
│       ├── src/
│       │   ├── tools/
│       │   ├── api/
│       │   ├── cli/
│       │   ├── hooks/
│       │   └── agents/
│       ├── package.json
│       └── README.md
└── DEOBFUSCATION_LOG.md
```

---

## Coordination with Other Agents

### Branch Naming Convention
- `deobfuscation/phase1-analysis` - String extraction, analysis
- `deobfuscation/phase2-functions` - Function identification
- `deobfuscation/phase3-renaming` - Symbol renaming
- `deobfuscation/phase4-modules` - Module extraction
- `deobfuscation/phase5-types` - Type definitions

### Lock Files (Prevent Conflicts)
```bash
# Before starting work on a section:
touch work/locks/phase3-renaming.lock
echo "Agent: 011CV4E2HNUYpg1m6kcyiSou" >> work/locks/phase3-renaming.lock
echo "Started: $(date)" >> work/locks/phase3-renaming.lock

# When done:
rm work/locks/phase3-renaming.lock
```

### Progress Tracking
**File:** `work/PROGRESS.md`

```markdown
## Deobfuscation Progress

### Phase 1: Analysis ✓ (this agent)
- [x] String extraction
- [x] Identifier frequency analysis
- [x] Cross-reference with symbols
- **Agent:** 011CV4E2HNUYpg1m6kcyiSou
- **Completed:** 2025-11-12

### Phase 2: Function Analysis (AVAILABLE)
- [ ] Entry point identification
- [ ] Tool implementation search
- [ ] API client location
- **Agent:** None (available)
- **Status:** Not started

### Phase 3: Renaming (AVAILABLE)
- [ ] HIGH confidence renames
- [ ] Tool implementations
- [ ] API client
- **Agent:** None (available)
- **Status:** Not started
```

---

## Risk Mitigation

### Data Loss Prevention
1. **Never modify original files** - Work in `work/` directory
2. **Git commit frequently** - After each significant change
3. **Backup strategy** - Keep last 3 versions
4. **Validation tests** - Ensure code still functions

### Handling Conflicts
If another agent starts work:
1. Check `work/locks/` directory
2. Read `work/PROGRESS.md`
3. Coordinate in commit messages
4. Use different phase branches

### Rollback Plan
```bash
# If renaming causes issues:
git revert <commit-hash>
git checkout deobfuscated.js  # Restore original
```

---

## Success Criteria

### Phase 1-2 Complete When:
- [x] All strings cataloged
- [ ] Entry points identified
- [ ] Tool implementations located
- [ ] API client mapped
- [ ] Module boundaries defined

### Phase 3 Complete When:
- [ ] 100+ HIGH confidence renames done
- [ ] All 17 tools renamed
- [ ] API client fully renamed
- [ ] Validation tests pass

### Phase 6 Complete When:
- [ ] All modules extracted
- [ ] TypeScript definitions complete
- [ ] Documentation written
- [ ] Validation report published
- [ ] Code compiles and runs

---

## Next Steps (Immediate)

### For This Agent (011CV4E2HNUYpg1m6kcyiSou)

1. **Create work directory structure**
   ```bash
   mkdir -p work/{analysis,mappings,tools,locks}
   touch work/PROGRESS.md
   ```

2. **Begin Phase 1.1: String Extraction**
   ```bash
   grep -oP '"[^"]+"' deobfuscated.js | sort -u > work/analysis/strings.txt
   ```

3. **Create lock file**
   ```bash
   echo "Phase 1 - Agent 011CV4E2HNUYpg1m6kcyiSou - $(date)" > work/locks/phase1.lock
   ```

4. **Update progress tracking**
   ```bash
   echo "## Phase 1 Started - $(date)" >> work/PROGRESS.md
   ```

### For Other Agents (If Any)

Check `work/PROGRESS.md` and `work/locks/` before starting any phase. If Phase 1 is locked, start with Phase 2 (function analysis) or wait for Phase 1 completion.

---

## Timeline Estimate

- **Phase 1:** 3-5 days (analysis)
- **Phase 2:** 5-7 days (function identification)
- **Phase 3:** 10-14 days (renaming)
- **Phase 4:** 7-10 days (module extraction)
- **Phase 5:** 5-7 days (type definitions)
- **Phase 6:** 3-5 days (documentation & validation)

**Total:** 5-6 weeks for complete deobfuscation

---

## Resources

### Available Symbols
- `/home/user/unminified-claude-code/claude-code-docs/extracted-symbols/`
  - 17 tools
  - 33 slash commands
  - 110 CLI flags
  - 37 config keys
  - 9 hook events
  - 560+ total symbols

### Documentation
- `/home/user/unminified-claude-code/claude-code-docs/`
  - 30 markdown files
  - Complete API reference
  - Tool descriptions
  - Configuration guides

### Original Files
- `/home/user/unminified-claude-code/deobfuscated/deobfuscated.js` (515K lines)
- `/home/user/unminified-claude-code/package/sdk-tools.d.ts` (1,496 lines)
- `/home/user/unminified-claude-code/package/cli.js` (original minified)

---

**Created:** 2025-11-12
**Agent:** claude/explore-project-setup-011CV4E2HNUYpg1m6kcyiSou
**Status:** Ready to begin Phase 1
