# Phase 4: Module Extraction - Plan

**Status:** 🔄 IN PROGRESS
**Started:** 2025-11-12
**Estimated Duration:** 7-10 days

---

## Objective

Extract the monolithic 515K line file into logical, maintainable ES modules with clear boundaries and dependencies.

---

## Module Structure Plan

Based on Phase 2 & 3 analysis, we've identified these logical modules:

### 1. Tools Module (`tools/`)
All 16 tool implementations should be extracted into individual files:

```
tools/
├── index.js                 # Tool registry and exports
├── read.js                  # readTool (I8)
├── write.js                 # writeTool (lC)
├── edit.js                  # editTool (cH)
├── bash.js                  # bashTool (o2)
├── grep.js                  # grepTool (_j)
├── glob.js                  # globTool (VN)
├── web-fetch.js             # webFetchTool (KJ)
├── web-search.js            # webSearchTool (ewA)
├── task.js                  # taskTool (Rm)
├── todo-write.js            # todoWriteTool (_G)
├── skill.js                 # skillTool (fd)
├── slash-command.js         # slashCommandTool (hd)
├── notebook-edit.js         # notebookEditTool (SO)
├── bash-output.js           # bashOutputTool (D01)
├── kill-shell.js            # killShellTool (K01)
└── exit-plan-mode.js        # exitPlanModeTool (wS)
```

### 2. Tool Execution Module (`tool-execution/`)
Core tool execution logic:

```
tool-execution/
├── index.js                 # Main exports
├── executor.js              # executeToolUse, createToolExecutionStream, executeToolWithValidation
├── queue.js                 # AsyncQueue class
├── validation.js            # Input validation helpers
├── telemetry.js             # recordTelemetryEvent, tool metrics
└── result-helpers.js        # createToolResultMessage, createToolCancelledResult
```

### 3. Hooks Module (`hooks/`)
Hook execution system:

```
hooks/
├── index.js                 # Hook exports
├── executor.js              # executePreToolUseHooks, iterateToolHooks
├── formatters.js            # formatHookError, formatHookBlockingError, etc.
├── constants.js             # HOOK_EVENT_NAMES
└── types.js                 # Hook type definitions
```

### 4. Permissions Module (`permissions/`)
Permission checking system:

```
permissions/
├── index.js                 # Permission exports
├── checker.js               # checkReadOnlyToolPermissions, checkWriteToolPermissions
├── directory.js             # checkDirectoryPermission
├── rules.js                 # extractPermissionRules
└── schemas.js               # PERMISSION_BEHAVIOR_ENUM, PERMISSION_RULE_SCHEMA
```

### 5. CLI Module (`cli/`)
Entry point and CLI logic:

```
cli/
├── index.js                 # Main CLI entry
├── entry-point.js           # cliEntryPoint (h4I)
├── main.js                  # mainFunction (_4I)
├── runner.js                # runApplication (b4I)
├── onboarding.js            # showSetupScreens, completeOnboarding
└── modes.js                 # Agent mode functions
```

### 6. Config Module (`config/`)
Configuration and settings:

```
config/
├── index.js                 # Config exports
├── api.js                   # BASE_OAUTH_CONFIG, PRODUCTION_API_CONFIG, LOCAL_API_CONFIG
├── tool-constants.js        # READ_MAX_LINES, BASH_MAX_BYTES, etc.
└── settings.js              # Settings management
```

### 7. Utilities Module (`utils/`)
Shared utility functions:

```
utils/
├── index.js                 # Utility exports
├── telemetry.js             # Telemetry helpers
├── error-handling.js        # Error formatters
├── validation.js            # Common validation
└── helpers.js               # General helpers
```

---

## Extraction Strategy

### Phase 4.1: Tool Extraction (Days 1-3)
1. Extract each tool into its own file
2. Identify and extract shared dependencies
3. Create tool registry
4. Test individual tool modules

### Phase 4.2: Core System Extraction (Days 4-5)
1. Extract tool execution engine
2. Extract hook system
3. Extract permission system
4. Ensure clean interfaces

### Phase 4.3: Infrastructure Extraction (Days 6-7)
1. Extract CLI entry points
2. Extract configuration
3. Extract utilities
4. Create proper exports

### Phase 4.4: Integration & Testing (Days 8-10)
1. Wire all modules together
2. Create main entry point
3. Test module loading
4. Verify functionality

---

## Module Extraction Principles

1. **Single Responsibility**: Each module should have one clear purpose
2. **Minimal Dependencies**: Reduce coupling between modules
3. **Clear Interfaces**: Export only what's needed
4. **Proper Naming**: Use descriptive file and export names
5. **Documentation**: Add JSDoc comments for exports

---

## Dependency Graph (Planned)

```
main.js (entry)
  ├── cli/ (entry points)
  │   ├── config/ (settings)
  │   └── utils/ (helpers)
  │
  ├── tools/ (16 tool implementations)
  │   ├── tool-execution/ (executor)
  │   ├── hooks/ (hook system)
  │   ├── permissions/ (permission checks)
  │   └── config/ (tool constants)
  │
  └── utils/ (shared utilities)
```

---

## Expected Outcomes

1. **16 tool module files** (~500-2000 lines each)
2. **Core system modules** (execution, hooks, permissions)
3. **Infrastructure modules** (CLI, config, utils)
4. **Main entry point** that imports and wires everything
5. **Significant improvement** in code navigability and maintainability

---

## Success Criteria

- ✅ Each tool in its own file
- ✅ Clear module boundaries
- ✅ Minimal circular dependencies
- ✅ Proper ES module syntax
- ✅ All functionality preserved
- ✅ Code remains runnable

---

**Next Step:** Begin with tool extraction (Phase 4.1)
