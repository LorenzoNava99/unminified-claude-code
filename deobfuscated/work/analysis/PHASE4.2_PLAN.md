# Phase 4.2+ Extraction Plan - Comprehensive Roadmap

**Created:** 2025-11-12
**Status:** Planning Complete - Ready for Execution
**Current Progress:** Phase 4.1 Complete (100%) - Schemas & Constants Extracted

---

## Overview

Phase 4.2+ focuses on extracting the **core system modules** that power the tool infrastructure. This includes the tool execution engine, hook system, permission system, and supporting utilities.

**Estimated Duration:** 5-7 days
**Estimated Complexity:** High
**Dependencies:** Phase 4.1 schemas and constants (✅ Complete)

---

## Phase 4.2: Core System Extraction (Estimated 3 days)

### 4.2.1: Tool Execution Engine

**Priority:** Highest
**Complexity:** High
**Files to Create:**
- `phase4-modules/tool-execution/tool-executor.js`
- `phase4-modules/tool-execution/tool-validator.js`
- `phase4-modules/tool-execution/tool-stream.js`

**Key Functions to Extract:**

1. **executeToolUse** (line 358179)
   - Main tool execution dispatcher
   - Renamed from `uaA`
   - Handles tool invocation, validation, and result processing

2. **createToolExecutionStream** (line 358244)
   - Renamed from `X85`
   - Creates async generator stream for tool execution
   - Handles streaming results

3. **executeToolWithValidation** (line 358272)
   - Renamed from `W85`
   - Validates inputs before execution
   - Checks permissions and validates schemas

**Dependencies:**
- Tool schemas (✅ extracted)
- Tool constants (✅ extracted)
- Hook system (pending)
- Permission system (pending)

**Approach:**
1. Extract main execution functions
2. Identify and extract helper functions
3. Create clean module interfaces
4. Document execution flow

---

### 4.2.2: Hook System Module

**Priority:** High
**Complexity:** Medium
**Files to Create:**
- `phase4-modules/hooks/hook-executor.js`
- `phase4-modules/hooks/hook-types.js`
- `phase4-modules/hooks/hook-helpers.js`

**Key Functions to Extract:**

1. **executePreToolUseHooks** (line 358711)
   - Renamed from `C85`
   - Executes PreToolUse hooks before tool execution
   - Returns permission behavior (allow/deny/ask)

2. **HOOK_EVENT_NAMES** (line 59500)
   - Renamed from `UYA`
   - Array of 9 hook event types:
     - PreToolUse
     - PostToolUse
     - Notification
     - UserPromptSubmit
     - SessionStart
     - SessionEnd
     - Stop
     - SubagentStop
     - PreCompact

3. **Hook Iteration Functions:**
   - `Vc1` → `iterateToolHooks`
   - `Fc1`, `Xc1`, `Wc1` → Error formatting functions
   - `B5` → `createHookMessage`
   - `vMQ` → `formatPermissionBehavior`

**Dependencies:**
- None (standalone system)

**Approach:**
1. Extract hook event constants
2. Extract hook executor
3. Extract helper functions
4. Document hook lifecycle

---

### 4.2.3: Permission System Module

**Priority:** High
**Complexity:** Medium
**Files to Create:**
- `phase4-modules/permissions/permission-checker.js`
- `phase4-modules/permissions/permission-types.js`
- `phase4-modules/permissions/directory-permissions.js`

**Key Functions to Extract:**

1. **Permission Checkers:**
   - `checkReadOnlyToolPermissions` (from `Om`)
   - `checkWriteToolPermissions` (from `Es`)
   - `checkDirectoryPermission` (from `fC`)

2. **Permission Behavior Enum:**
   - `PERMISSION_BEHAVIOR_ENUM` (from `KTI`)
   - Values: "allow", "deny", "ask"

3. **Agent Mode Functions:**
   - `AGENT_MODES` array (from `wYA`)
   - `parseAgentMode` (from `IP0`)
   - `isDefaultMode` (from `GP0`)

**Dependencies:**
- Tool constants (✅ extracted)

**Approach:**
1. Extract permission enums and types
2. Extract permission checking functions
3. Extract mode-related functions
4. Document permission flow

---

## Phase 4.3: Supporting Systems (Estimated 2 days)

### 4.3.1: File Operation Utilities

**Files to Create:**
- `phase4-modules/shared-utils/filesystem.js`
- `phase4-modules/shared-utils/path-utils.js`

**Key Functions:**
- `getFs()` - Filesystem wrapper (already renamed from `NA`)
- `resolveFilePath()` - Path resolution (from `Js`)
- `resolveAbsolutePath()` - Absolute path resolution (from `g9`)
- `getCwd()`, `getHomedir()` - Directory getters

**Status:** Many already renamed in Phase 3.5 ✅

---

### 4.3.2: Telemetry Module

**Files to Create:**
- `phase4-modules/shared-utils/telemetry.js`

**Key Functions:**
- `recordTelemetryEvent` - Already renamed from `GA` (471 occurrences)
- `recordFileOperation` - Already renamed from `kj` (8 occurrences)

**Status:** Core functions already renamed ✅

---

### 4.3.3: Validation & Error Handling

**Files to Create:**
- `phase4-modules/shared-utils/validation.js`
- `phase4-modules/shared-utils/error-handling.js`

**Key Functions:**
- `validateContentSize` - Already renamed from `zs2`
- `logError` - Already renamed from `AA` (468 occurrences)
- `createToolResultMessage` - Already renamed from `_0` (112 occurrences)

**Status:** Core functions already renamed ✅

---

## Phase 4.4: Integration & Testing (Estimated 2 days)

### 4.4.1: Module Wiring

**Tasks:**
1. Create main entry point that imports all modules
2. Wire tool registry with schemas, constants, and execution engine
3. Connect hook system to tool execution
4. Connect permission system to tool validation

**Files to Create:**
- `phase4-modules/index.js` - Main export
- `phase4-modules/tool-registry.js` - Tool registration

---

### 4.4.2: Dependency Resolution

**Tasks:**
1. Map all inter-module dependencies
2. Resolve circular dependencies
3. Create dependency graph
4. Optimize import structure

**Challenges:**
- Tool execution depends on hooks and permissions
- Hooks may depend on tool metadata
- Need careful import ordering

---

### 4.4.3: Testing & Validation

**Tasks:**
1. Create test file that requires all modules
2. Verify no syntax errors
3. Check for missing exports
4. Validate schema usage
5. Document any remaining unrenamed identifiers

**Files to Create:**
- `phase4-modules/test-imports.js` - Import validation
- `phase4-modules/README.md` - Module documentation

---

## Dependency Map

```
Tool Execution Engine
├── Tool Schemas (✅ extracted)
├── Tool Constants (✅ extracted)
├── Hook System (pending)
└── Permission System (pending)

Hook System
└── (standalone)

Permission System
├── Tool Constants (✅ extracted)
└── Agent Mode Types (pending)

Supporting Utilities
├── Filesystem (partially renamed)
├── Path Utils (partially renamed)
├── Telemetry (renamed)
└── Validation (renamed)
```

---

## Extraction Strategy

### Phase-by-Phase Approach

**Phase 4.2.1: Core Execution (Day 1-2)**
1. Extract tool executor functions
2. Extract validation logic
3. Create clean module interfaces
4. Document execution flow

**Phase 4.2.2: Hook System (Day 2-3)**
1. Extract hook constants
2. Extract hook executor
3. Wire to execution engine
4. Document hook lifecycle

**Phase 4.2.3: Permission System (Day 3)**
1. Extract permission types
2. Extract permission checkers
3. Wire to validation
4. Document permission flow

**Phase 4.3: Supporting Systems (Day 4-5)**
1. Extract filesystem utilities
2. Extract telemetry
3. Extract validation helpers
4. Create utility index

**Phase 4.4: Integration (Day 6-7)**
1. Create main entry point
2. Wire all modules
3. Resolve dependencies
4. Test and validate

---

## Success Criteria

### Phase 4.2 Complete When:
- ✅ Tool execution engine extracted and documented
- ✅ Hook system extracted and documented
- ✅ Permission system extracted and documented
- ✅ All core functions have clean interfaces
- ✅ Dependencies clearly documented

### Phase 4.3 Complete When:
- ✅ All supporting utilities extracted
- ✅ Filesystem functions modularized
- ✅ Telemetry system extracted
- ✅ Validation helpers extracted

### Phase 4.4 Complete When:
- ✅ All modules wire together successfully
- ✅ No circular dependencies
- ✅ All exports validated
- ✅ Import test passes
- ✅ Documentation complete

---

## Risk Assessment

### High Risk Areas

**1. Circular Dependencies**
- Risk: Tool execution → hooks → tools
- Mitigation: Careful interface design, dependency injection

**2. Unrenamed Identifiers**
- Risk: Many helper functions still have cryptic names
- Mitigation: Rename on extraction, document in mapping files

**3. Complex State Management**
- Risk: Tools share state through context objects
- Mitigation: Extract context management separately

### Medium Risk Areas

**1. React/UI Dependencies**
- Risk: Render functions use React/Ink (not extracted)
- Mitigation: Keep render functions in monolithic file for now

**2. Missing Type Information**
- Risk: No TypeScript definitions yet
- Mitigation: Phase 5 will add type definitions

---

## Current Status Summary

### ✅ Completed
- Phase 4.1: All 16 tool schemas extracted
- Phase 4.1: Tool constants extracted
- Foundation solid for Phase 4.2+

### 🔄 In Progress
- Phase 4.2 planning (this document)

### ⏳ Pending
- Phase 4.2: Core system extraction
- Phase 4.3: Supporting utilities
- Phase 4.4: Integration and testing

---

## Next Steps for Continuation

**Immediate (Next Session):**
1. Begin Phase 4.2.1: Extract tool execution engine
2. Start with `executeToolUse` function
3. Identify all helper functions it depends on
4. Create `tool-execution/` directory structure

**Following Steps:**
1. Extract hook system (Phase 4.2.2)
2. Extract permission system (Phase 4.2.3)
3. Extract supporting utilities (Phase 4.3)
4. Wire everything together (Phase 4.4)

---

## Files to Create (Complete List)

### Phase 4.2 (Core Systems)
- `phase4-modules/tool-execution/tool-executor.js`
- `phase4-modules/tool-execution/tool-validator.js`
- `phase4-modules/tool-execution/tool-stream.js`
- `phase4-modules/tool-execution/index.js`
- `phase4-modules/hooks/hook-executor.js`
- `phase4-modules/hooks/hook-types.js`
- `phase4-modules/hooks/hook-helpers.js`
- `phase4-modules/hooks/index.js`
- `phase4-modules/permissions/permission-checker.js`
- `phase4-modules/permissions/permission-types.js`
- `phase4-modules/permissions/directory-permissions.js`
- `phase4-modules/permissions/index.js`

### Phase 4.3 (Supporting Systems)
- `phase4-modules/shared-utils/filesystem.js`
- `phase4-modules/shared-utils/path-utils.js`
- `phase4-modules/shared-utils/telemetry.js`
- `phase4-modules/shared-utils/validation.js`
- `phase4-modules/shared-utils/error-handling.js`
- `phase4-modules/shared-utils/index.js`

### Phase 4.4 (Integration)
- `phase4-modules/tool-registry.js`
- `phase4-modules/index.js`
- `phase4-modules/test-imports.js`
- `phase4-modules/README.md`

**Total Files:** ~25 additional files

---

## Estimated Metrics

| Metric | Estimated Value |
|--------|----------------|
| **Total Files to Create** | ~25 |
| **Lines of Code** | ~3,000 |
| **Functions to Extract** | ~50 |
| **Helper Functions** | ~100+ |
| **Total Time** | 5-7 days |

---

**Phase 4.2+ Plan: COMPLETE** ✅

This comprehensive plan provides a clear roadmap for completing Phase 4 module extraction.
