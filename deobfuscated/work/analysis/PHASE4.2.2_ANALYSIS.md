# Phase 4.2.2: Hook System Analysis

**Date:** 2025-11-13
**Status:** Analysis Complete - Ready for Extraction
**Dependency:** Phase 4.2.1 Complete ✅

---

## Overview

The hook system is a critical component that allows user-defined shell commands or prompts to execute at specific points in the tool execution lifecycle. This provides extensibility and customization capabilities.

---

## Hook Architecture

### 9 Hook Event Types (line 59500)

```javascript
HOOK_EVENT_NAMES = [
  "PreToolUse",      // Before tool execution
  "PostToolUse",     // After tool execution
  "Notification",    // When notifications are sent
  "UserPromptSubmit",// Before user prompt is submitted
  "SessionStart",    // At session start
  "SessionEnd",      // At session end
  "Stop",            // When execution is stopped
  "SubagentStop",    // When subagent is stopped
  "PreCompact"       // Before context compaction
];
```

### Hook Types

1. **Command Hooks** - Execute shell commands
2. **Prompt Hooks** - Send prompts to Claude
3. **Callback Hooks** - Execute JavaScript callbacks

---

## Key Functions Identified

### Hook Iterators (Wrappers)

**1. iterateToolHooks** (line 491885) - PreToolUse hooks
- Already well-named ✅
- Wraps hook input preparation
- Delegates to P$A (main executor)
- Parameters: toolName, toolUseID, input, context, mode, signal, timeoutMs

**2. Kc1** (line 491902) - PostToolUse hooks
- Should be renamed: `iteratePostToolHooks`
- Similar structure to PreToolUse
- Includes tool_response in hook input
- Delegates to P$A

**3. sc1** (line 491919) - Notification hooks
- Should be renamed: `executeNotificationHooks`
- Non-streaming (uses k00 instead of P$A)
- Parameters: {message, title, notificationType}

**4. Dc1** (line 491938) - Stop/SubagentStop hooks
- Should be renamed: `executeStopHooks`
- Streaming (uses P$A)
- Handles both Stop and SubagentStop events

**5. dt1** (line 491953) - UserPromptSubmit hooks
- Should be renamed: `executeUserPromptSubmitHooks`
- Streaming (uses P$A)
- Parameters: prompt, context

**6. Bx1** (line 491967) - SessionStart hooks
- Should be renamed: `executeSessionStartHooks`
- Streaming (uses P$A)
- Parameters: source, context, signal, timeoutMs

**7. Ix1** (line 491981) - PreCompact hooks
- Should be renamed: `executePreCompactHooks`
- Non-streaming (uses k00)
- Returns: {newCustomInstructions, userDisplayMessage}
- Special handling: aggregates outputs from all hooks

**8. ee1** (line 492020+) - SessionEnd hooks (assumed)
- Should be renamed: `executeSessionEndHooks`
- Need to read more to confirm

### Core Executors

**1. P$A** (line 491419) - Main streaming hook executor
- Should be renamed: `executeHooksStream`
- Yields results as they arrive
- Parameters:
  - hookInput: Hook input data
  - toolUseID: Tool use ID
  - matchQuery: Query to match hooks (e.g., tool name)
  - signal: AbortSignal
  - timeoutMs: Timeout in milliseconds
  - toolUseContext: Execution context
  - messages: Messages array (optional)
- Returns: AsyncGenerator yielding hook results

**2. k00** (line 491752) - Non-streaming hook executor
- Should be renamed: `executeHooks`
- Waits for all hooks to complete
- Returns: Promise<Array> of hook results
- Used for: Notification, PreCompact hooks

### Helper Functions

**1. DR** - Hook input builder
- Should be renamed: `buildHookInput`
- Builds base hook input structure
- Likely includes: cwd, mode, environment vars, etc.

**2. y00** - Hook matcher/selector
- Should be renamed: `getMatchingHooks`
- Finds hooks that match the event and query
- Parameters: (appState, hookEventName, hookInput)
- Returns: Array of matching hooks

**3. Fy** - Default timeout constant
- Should be renamed: `DEFAULT_HOOK_TIMEOUT_MS`
- Likely value: 60000 (60 seconds) or similar

**4. lazyInit$A** - UUID generator for hooks
- Should be renamed: `generateHookUuid`
- Already have generateUuid in tool-helpers

**5. M0()** - Config/settings getter
- Should be renamed: `getSettings` or `getConfig`
- Has property: disableAllHooks

**6. Ts2()** - Workspace trust checker
- Should be renamed: `isWorkspaceTrustRequired`
- Returns true if workspace trust not accepted

**7. S00** - Shell command executor
- Should be renamed: `executeHookCommand`
- Line 491515
- Parameters: hook, hookEvent, hookName, hookInput, signal, index
- Returns: execution result

**8. Os2** - Prompt hook executor
- Should be renamed: `executePromptHook`
- Line 491511
- Parameters: hook, hookName, hookEvent, hookInput, signal, context, messages
- Returns: prompt execution result

**9. n1I** - Callback hook executor
- Should be renamed: `executeCallbackHook`
- Line 491472
- Parameters: {toolUseID, hook, hookEvent, hookInput, signal}
- Returns: callback execution result

**10. nB1** - Abort signal combiner
- Should be renamed: `combineAbortSignals`
- Line 491471
- Combines multiple abort signals
- Returns: {abortSignal, cleanup}

**11. createHookMessage** - Already extracted ✅
- Available from tool-helpers module

---

## Hook Execution Flow

### Streaming Hooks (PreToolUse, PostToolUse, Stop, UserPromptSubmit, SessionStart)

```
User Action
    ↓
Hook Iterator (e.g., iterateToolHooks)
    ↓
Build Hook Input (DR)
    ↓
Main Executor (P$A / executeHooksStream)
    ↓
Get Matching Hooks (y00)
    ↓
For Each Hook:
    ├─ Command Hook → S00 (executeHookCommand)
    ├─ Prompt Hook → Os2 (executePromptHook)
    └─ Callback Hook → n1I (executeCallbackHook)
    ↓
Yield Results as Stream
```

### Non-Streaming Hooks (Notification, PreCompact)

```
Event Trigger
    ↓
Hook Function (e.g., Ix1)
    ↓
Build Hook Input (DR)
    ↓
Executor (k00 / executeHooks)
    ↓
Get Matching Hooks (y00)
    ↓
Execute All Hooks in Parallel
    ↓
Await All Results
    ↓
Return Aggregated Results
```

---

## Hook Result Schema

Hook results contain:
- `message`: Hook message (progress, error, etc.)
- `outcome`: "success" | "non_blocking_error" | "blocking_error" | "cancelled"
- `hook`: Reference to hook definition
- `succeeded`: Boolean success flag
- `output`: Hook output (for command hooks)
- `permissionBehavior`: "allow" | "deny" | "ask" (PreToolUse only)
- `hookPermissionDecisionReason`: Reason for permission decision
- `updatedInput`: Modified input (PreToolUse only)
- `updatedMCPToolOutput`: Modified output (PostToolUse for MCP tools)
- `blockingError`: Error that blocks execution
- `preventContinuation`: Flag to stop execution
- `stopReason`: Reason for stopping
- `additionalContexts`: Additional context to add
- `aborted`: Whether hook was aborted

---

## Dependencies

### From Tool Execution Module (Phase 4.2.1) ✅
- createHookMessage
- generateUuid
- formatHookError
- recordTelemetryEvent
- logError

### From Telemetry Module (Pending)
- recordTelemetryEvent

### From Config/Settings Module (Pending)
- M0() / getSettings
- Ts2() / isWorkspaceTrustRequired

### From Execution Context (Pending)
- AbortSignal operations
- getAppState

### External Dependencies
- Shell execution (child_process)
- Timeout handling (AbortSignal.timeout)

---

## Extraction Plan

### Phase 4.2.2.1: Hook Types and Constants
**File:** `phase4-modules/hooks/hook-types.js`

Extract:
- HOOK_EVENT_NAMES (line 59500)
- DEFAULT_HOOK_TIMEOUT_MS (Fy)
- Hook result type definitions
- Hook input schemas

**Estimated Lines:** ~100

---

### Phase 4.2.2.2: Hook Helpers
**File:** `phase4-modules/hooks/hook-helpers.js`

Extract:
- buildHookInput (DR)
- getMatchingHooks (y00)
- combineAbortSignals (nB1)
- generateHookUuid (lazyInit$A)

**Estimated Lines:** ~150

---

### Phase 4.2.2.3: Hook Executors
**File:** `phase4-modules/hooks/hook-executors.js`

Extract:
- executeHookCommand (S00)
- executePromptHook (Os2)
- executeCallbackHook (n1I)

**Estimated Lines:** ~200

---

### Phase 4.2.2.4: Main Hook Engine
**File:** `phase4-modules/hooks/hook-engine.js`

Extract:
- executeHooksStream (P$A) - Main streaming executor
- executeHooks (k00) - Non-streaming executor

**Estimated Lines:** ~300

---

### Phase 4.2.2.5: Hook Event Functions
**File:** `phase4-modules/hooks/hook-events.js`

Extract all 9 hook event functions:
1. iterateToolHooks (line 491885) ✅ already named
2. iteratePostToolHooks (Kc1, line 491902)
3. executeNotificationHooks (sc1, line 491919)
4. executeStopHooks (Dc1, line 491938)
5. executeUserPromptSubmitHooks (dt1, line 491953)
6. executeSessionStartHooks (Bx1, line 491967)
7. executePreCompactHooks (Ix1, line 491981)
8. executeSessionEndHooks (ee1, line 492020+)

**Estimated Lines:** ~200

---

### Phase 4.2.2.6: Module Index
**File:** `phase4-modules/hooks/index.js`

Export all hook functionality

**Estimated Lines:** ~50

---

## Total Estimated Effort

- **Files:** 6
- **Lines of Code:** ~1,000
- **Lines of Documentation:** ~400
- **Total:** ~1,400 lines

**Complexity:** High
- Many interdependencies
- Shell execution concerns
- Timeout and cancellation handling
- Multiple execution modes (streaming, non-streaming)
- Security considerations (workspace trust)

---

## Function Renaming Summary

| Original Name | New Name | Location | Type |
|---------------|----------|----------|------|
| ✅ iterateToolHooks | iterateToolHooks | 491885 | Already good |
| Kc1 | iteratePostToolHooks | 491902 | Iterator |
| sc1 | executeNotificationHooks | 491919 | Executor |
| Dc1 | executeStopHooks | 491938 | Iterator |
| dt1 | executeUserPromptSubmitHooks | 491953 | Iterator |
| Bx1 | executeSessionStartHooks | 491967 | Iterator |
| Ix1 | executePreCompactHooks | 491981 | Executor |
| ee1 | executeSessionEndHooks | 492020+ | Executor |
| P$A | executeHooksStream | 491419 | Core |
| k00 | executeHooks | 491752 | Core |
| DR | buildHookInput | ? | Helper |
| y00 | getMatchingHooks | ? | Helper |
| Fy | DEFAULT_HOOK_TIMEOUT_MS | ? | Constant |
| lazyInit$A | generateHookUuid | ? | Helper |
| M0 | getSettings | ? | Config |
| Ts2 | isWorkspaceTrustRequired | ? | Security |
| S00 | executeHookCommand | 491515 | Executor |
| Os2 | executePromptHook | 491511 | Executor |
| n1I | executeCallbackHook | 491472 | Executor |
| nB1 | combineAbortSignals | 491471 | Helper |

---

## Next Steps

**Immediate (Next Session):**
1. Start with Phase 4.2.2.1: Extract hook types and constants
2. Continue with Phase 4.2.2.2: Extract hook helpers
3. Progress through remaining phases sequentially

**Priority:** High
- Hooks are used by tool execution engine (already extracted)
- Required for permission system integration

---

**Phase 4.2.2 Analysis: COMPLETE** ✅

This analysis provides a complete roadmap for extracting the hook system.
