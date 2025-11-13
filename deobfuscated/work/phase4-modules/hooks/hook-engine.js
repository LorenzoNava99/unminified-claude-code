/**
 * Hook System - Main Engine
 *
 * Core hook execution functions that coordinate hook matching, execution,
 * and result processing. Supports both streaming and non-streaming execution.
 *
 * Original locations:
 * - executeHooksStream (P$A): line 491419
 * - executeHooks (k00): line 491752
 */

const { DEFAULT_HOOK_TIMEOUT_MS } = require('./hook-types');
const { getMatchingHooks, combineAbortSignals, buildHookInput } = require('./hook-helpers');
const { executeHookCommand, executePromptHook, executeCallbackHook } = require('./hook-executors');

// ============================================================================
// External Dependencies (Placeholders)
// ============================================================================

/**
 * TODO: Import these from appropriate modules:
 *
 * Settings/Config:
 * - M0() - Get settings object (has disableAllHooks property)
 * - Ts2() - Check if workspace trust required
 *
 * Telemetry:
 * - recordTelemetryEvent(name, data) - Record telemetry
 *
 * Hook Processing:
 * - Ps2(stdout) - Parse hook output (json, plainText, validationError)
 * - js2(data) - Process hook result into standard format
 * - G0A(response) - Check if async hook response
 * - tk0(json) - Check if should suppress output
 * - lazyInit$A() - Generate hook UUID
 *
 * Message Creation:
 * - createHookMessage(data) - Create hook message
 *
 * Utilities:
 * - baA(generators) - Merge async generators
 * - nA.bold(text) - Bold text formatting
 * - nA.yellow(text) - Yellow text formatting
 * - IT(message) - Display message
 * - V9(message) - Display system message
 *
 * Logging:
 * - m(message, options) - Debug logging
 * - logError(error, context) - Error logging
 */

// Placeholder implementations
const getSettings = function() {
  // TODO: Import from settings module
  // Original name: M0
  return {
    disableAllHooks: false
  };
};

const isWorkspaceTrustRequired = function() {
  // TODO: Import from workspace trust module
  // Original name: Ts2
  return false;
};

const recordTelemetryEvent = function(name, data) {
  // TODO: Import from telemetry module
  // console.log(`[Telemetry] ${name}:`, data);
};

const parseHookOutput = function(stdout) {
  // TODO: Import from hook output parser
  // Original name: Ps2
  // Parses stdout and returns {json, plainText, validationError}
  const trimmed = stdout.trim();
  if (!trimmed.startsWith("{")) {
    return {
      plainText: stdout
    };
  }
  try {
    const json = JSON.parse(trimmed);
    return { json };
  } catch {
    return {
      validationError: "Invalid JSON"
    };
  }
};

const processHookResult = function(data) {
  // TODO: Import from hook result processor
  // Original name: js2
  // Processes hook JSON into standard result format
  return {
    permissionBehavior: data.json?.permissionDecision,
    stopReason: data.json?.stopReason,
    preventContinuation: data.json?.continue === false,
    systemMessage: data.json?.systemMessage,
    additionalContext: data.json?.additionalContext,
    updatedMCPToolOutput: data.json?.updatedMCPToolOutput,
    hookPermissionDecisionReason: data.json?.reason
  };
};

const isAsyncHookResponse = function(response) {
  // TODO: Import from hook validation
  // Original name: G0A
  return response && typeof response === 'object' && response.async === true;
};

const shouldSuppressOutput = function(json) {
  // TODO: Import from hook validation
  // Original name: tk0
  return json && json.suppressOutput === true;
};

const generateHookUuid = function() {
  // TODO: Import from uuid module
  // Original name: lazyInit$A
  return Math.random().toString(36).substring(7);
};

const createHookMessage = function(data) {
  // TODO: Import from hook-helpers or tool-helpers
  return {
    type: "attachment",
    attachment: data,
    uuid: generateHookUuid(),
    timestamp: new Date().toISOString()
  };
};

const mergeAsyncGenerators = async function*(generators) {
  // TODO: Import from async utilities
  // Original name: baA
  // Merges multiple async generators into one
  for (const gen of generators) {
    yield* gen;
  }
};

const bold = (text) => text;  // TODO: Import chalk or similar
const yellow = (text) => text;  // TODO: Import chalk or similar

const displayMessage = function(message) {
  // TODO: Import from UI module
  // Original name: IT
  console.log(message);
};

const displaySystemMessage = function(message) {
  // TODO: Import from UI module
  // Original name: V9
  console.log(`[System] ${message}`);
};

const m = function(message, options) {
  // TODO: Import from debug logging
  // console.log(`[Hook Debug]:`, message);
};

const logError = function(error, context) {
  // TODO: Import from logging module
  console.error(`[Hook Error ${context}]:`, error);
};

// Error context constants
const ZX0 = "HOOK_INPUT_STRINGIFY";
const I61 = "HOOK_INPUT_STRINGIFY_SYNC";

// ============================================================================
// Streaming Hook Executor
// ============================================================================

/**
 * Executes hooks with streaming results (async generator)
 *
 * This is the main streaming hook executor used by PreToolUse, PostToolUse,
 * Stop, UserPromptSubmit, and SessionStart hooks.
 *
 * Flow:
 * 1. Check if hooks are disabled or workspace untrusted
 * 2. Get matching hooks from settings
 * 3. Yield progress messages for each hook
 * 4. Execute hooks concurrently (with mergeAsyncGenerators)
 * 5. Yield results as they arrive
 * 6. Process results for permission behavior, blocking errors, etc.
 *
 * Original location: line 491419
 * Original name: P$A
 *
 * @param {Object} options - Execution options
 * @param {Object} options.hookInput - Hook input data
 * @param {string} [options.toolUseID] - Tool use ID
 * @param {string} [options.matchQuery] - Query to match hooks
 * @param {AbortSignal} [options.signal] - Abort signal
 * @param {number} [options.timeoutMs] - Timeout in ms (default: 60000)
 * @param {Object} [options.toolUseContext] - Tool execution context
 * @param {Array} [options.messages] - Messages for prompt hooks
 * @yields {Object} - Hook results (message, outcome, blocking, etc.)
 *
 * @example
 * for await (const result of executeHooksStream({
 *   hookInput: { hook_event_name: "PreToolUse", tool_name: "Read", ... },
 *   toolUseID: "tool_123",
 *   matchQuery: "Read",
 *   signal: abortSignal,
 *   toolUseContext: context
 * })) {
 *   if (result.blockingError) {
 *     // Hook blocked execution
 *   }
 *   if (result.message) {
 *     // Display message to user
 *   }
 * }
 */
async function* executeHooksStream({
  hookInput,
  toolUseID,
  matchQuery,
  signal,
  timeoutMs = DEFAULT_HOOK_TIMEOUT_MS,
  toolUseContext,
  messages
}) {
  // Check if hooks are disabled
  if (getSettings().disableAllHooks) {
    return;
  }

  const hookEvent = hookInput.hook_event_name;
  const hookName = matchQuery ? `${hookEvent}:${matchQuery}` : hookEvent;

  // Check workspace trust
  if (isWorkspaceTrustRequired()) {
    m(`Skipping ${hookName} hook execution - workspace trust not accepted`);
    return;
  }

  // Get matching hooks
  const appState = toolUseContext ? await toolUseContext.getAppState() : undefined;
  const hooks = getMatchingHooks(appState, hookEvent, hookInput);

  if (hooks.length === 0) {
    return;
  }

  // Check if already aborted
  if (signal?.aborted) {
    return;
  }

  // Record telemetry
  recordTelemetryEvent("tengu_run_hook", {
    hookName: hookName,
    numCommands: hooks.length
  });

  // Yield progress messages for each hook
  for (const hook of hooks) {
    yield {
      message: {
        type: "progress",
        data: {
          type: "hook_progress",
          hookEvent: hookEvent,
          hookName: hookName,
          command: hook.type === "command" ? hook.command :
                   hook.type === "prompt" ? "prompt" : "callback"
        },
        parentToolUseID: toolUseID,
        toolUseID: toolUseID,
        timestamp: new Date().toISOString(),
        uuid: generateHookUuid()
      }
    };
  }

  // Create async generators for each hook
  const hookGenerators = hooks.map(async function* (hook, index) {
    // Handle callback hooks
    if (hook.type === "callback") {
      const { abortSignal, cleanup } = combineAbortSignals(
        AbortSignal.timeout(timeoutMs),
        signal
      );

      yield executeCallbackHook({
        toolUseID: toolUseID,
        hook: hook,
        hookEvent: hookEvent,
        hookInput: hookInput,
        signal: abortSignal
      }).finally(cleanup);
      return;
    }

    // Handle command and prompt hooks
    const hookTimeout = hook.timeout ? hook.timeout * 1000 : timeoutMs;
    const { abortSignal, cleanup } = combineAbortSignals(
      AbortSignal.timeout(hookTimeout),
      signal
    );

    try {
      // Serialize hook input
      let hookInputJSON;
      try {
        hookInputJSON = JSON.stringify(hookInput);
      } catch (err) {
        logError(
          Error(`Failed to stringify hook ${hookName} input`, { cause: err }),
          ZX0
        );

        yield {
          message: createHookMessage({
            type: "hook_error_during_execution",
            hookName: hookName,
            toolUseID: toolUseID,
            hookEvent: hookEvent,
            content: `Failed to prepare hook input: ${err instanceof Error ? err.message : String(err)}`
          }),
          outcome: "non_blocking_error",
          hook: hook
        };
        return;
      }

      // Execute prompt hook
      if (hook.type === "prompt") {
        if (!toolUseContext) {
          throw Error("ToolUseContext is required for prompt hooks. This is a bug.");
        }
        yield await executePromptHook(
          hook,
          hookName,
          hookEvent,
          hookInputJSON,
          abortSignal,
          toolUseContext,
          messages
        );
        cleanup?.();
        return;
      }

      // Execute command hook
      const result = await executeHookCommand(
        hook,
        hookEvent,
        hookName,
        hookInputJSON,
        abortSignal,
        index
      );
      cleanup?.();

      // Handle aborted execution
      if (result.aborted) {
        yield {
          message: createHookMessage({
            type: "hook_cancelled",
            hookName: hookName,
            toolUseID: toolUseID,
            hookEvent: hookEvent
          }),
          outcome: "cancelled",
          hook: hook
        };
        return;
      }

      // Parse hook output
      const { json, plainText, validationError } = parseHookOutput(result.stdout);

      if (validationError) {
        yield {
          message: createHookMessage({
            type: "hook_non_blocking_error",
            hookName: hookName,
            toolUseID: toolUseID,
            hookEvent: hookEvent,
            stderr: `JSON validation failed: ${validationError}`,
            stdout: result.stdout,
            exitCode: 1
          }),
          outcome: "non_blocking_error",
          hook: hook
        };
        return;
      }

      // Handle JSON response
      if (json) {
        // Check for async hook
        if (isAsyncHookResponse(json)) {
          yield {
            outcome: "success",
            hook: hook
          };
          return;
        }

        // Process hook result
        const processed = processHookResult({
          json: json,
          command: hook.type === "command" ? hook.command : "prompt",
          hookName: hookName,
          toolUseID: toolUseID,
          hookEvent: hookEvent,
          expectedHookEvent: hookEvent,
          stdout: result.stdout,
          stderr: result.stderr,
          exitCode: result.status
        });

        // Check if should show output
        if (!shouldSuppressOutput(json) && plainText && result.status === 0) {
          const content = `${bold(hookName)} completed`;
          yield {
            ...processed,
            message: processed.message || createHookMessage({
              type: "hook_success",
              hookName: hookName,
              toolUseID: toolUseID,
              hookEvent: hookEvent,
              content: content,
              stdout: result.stdout,
              stderr: result.stderr,
              exitCode: result.status
            }),
            outcome: "success",
            hook: hook
          };
          return;
        }

        yield {
          ...processed,
          outcome: "success",
          hook: hook
        };
        return;
      }

      // Handle plain text output (exit code 0)
      if (result.status === 0) {
        yield {
          message: createHookMessage({
            type: "hook_success",
            hookName: hookName,
            toolUseID: toolUseID,
            hookEvent: hookEvent,
            content: result.stdout.trim(),
            stdout: result.stdout,
            stderr: result.stderr,
            exitCode: result.status
          }),
          outcome: "success",
          hook: hook
        };
        return;
      }

      // Handle blocking error (exit code 2)
      if (result.status === 2) {
        yield {
          blockingError: {
            blockingError: `[${hook.command}]: ${result.stderr || "No stderr output"}`,
            command: hook.command
          },
          outcome: "blocking",
          hook: hook
        };
        return;
      }

      // Handle non-blocking error (other exit codes)
      yield {
        message: createHookMessage({
          type: "hook_non_blocking_error",
          hookName: hookName,
          toolUseID: toolUseID,
          hookEvent: hookEvent,
          stderr: `Failed with non-blocking status code: ${result.stderr.trim() || "No stderr output"}`,
          stdout: result.stdout,
          exitCode: result.status
        }),
        outcome: "non_blocking_error",
        hook: hook
      };
      return;

    } catch (err) {
      cleanup?.();
      const errorMessage = err instanceof Error ? err.message : String(err);
      yield {
        message: createHookMessage({
          type: "hook_non_blocking_error",
          hookName: hookName,
          toolUseID: toolUseID,
          hookEvent: hookEvent,
          stderr: `Failed to run: ${errorMessage}`,
          stdout: "",
          exitCode: 1
        }),
        outcome: "non_blocking_error",
        hook: hook
      };
      return;
    }
  });

  // Track outcomes
  const outcomes = {
    success: 0,
    blocking: 0,
    non_blocking_error: 0,
    cancelled: 0
  };

  let finalPermissionBehavior;

  // Merge and yield results from all hooks
  for await (const hookResult of mergeAsyncGenerators(hookGenerators)) {
    outcomes[hookResult.outcome]++;

    // Handle prevent continuation
    if (hookResult.preventContinuation) {
      yield {
        preventContinuation: true,
        stopReason: hookResult.stopReason
      };
    }

    // Handle blocking error
    if (hookResult.blockingError) {
      yield {
        blockingError: hookResult.blockingError
      };
    }

    // Handle message
    if (hookResult.message) {
      yield {
        message: hookResult.message
      };
    }

    // Handle system message
    if (hookResult.systemMessage) {
      yield {
        message: createHookMessage({
          type: "hook_system_message",
          content: hookResult.systemMessage,
          hookName: hookName,
          toolUseID: toolUseID,
          hookEvent: hookEvent
        })
      };
    }

    // Handle additional context
    if (hookResult.additionalContext) {
      yield {
        additionalContexts: [hookResult.additionalContext]
      };
    }

    // Handle updated MCP tool output
    if (hookResult.updatedMCPToolOutput) {
      yield {
        updatedMCPToolOutput: hookResult.updatedMCPToolOutput
      };
    }

    // Handle permission behavior (with priority: deny > ask > allow)
    if (hookResult.permissionBehavior) {
      switch (hookResult.permissionBehavior) {
        case "deny":
          finalPermissionBehavior = "deny";
          break;
        case "ask":
          if (finalPermissionBehavior !== "deny") {
            finalPermissionBehavior = "ask";
          }
          break;
        case "allow":
          if (!finalPermissionBehavior) {
            finalPermissionBehavior = "allow";
          }
          break;
      }
    }

    // Yield updated input and permission decision
    if (hookResult.updatedInput !== undefined) {
      yield {
        updatedInput: hookResult.updatedInput
      };
    }

    if (hookResult.hookPermissionDecisionReason) {
      yield {
        hookPermissionDecisionReason: hookResult.hookPermissionDecisionReason
      };
    }
  }

  // Yield final permission behavior if set
  if (finalPermissionBehavior) {
    yield {
      permissionBehavior: finalPermissionBehavior
    };
  }
}

// ============================================================================
// Non-Streaming Hook Executor
// ============================================================================

/**
 * Executes hooks and waits for all to complete (non-streaming)
 *
 * This is used for Notification and PreCompact hooks where we need all
 * results before proceeding.
 *
 * Original location: line 491752
 * Original name: k00
 *
 * @param {Object} options - Execution options
 * @param {Function} [options.getAppState] - Function to get app state
 * @param {Object} options.hookInput - Hook input data
 * @param {string} [options.matchQuery] - Query to match hooks
 * @param {AbortSignal} [options.signal] - Abort signal
 * @param {number} [options.timeoutMs] - Timeout in ms
 * @returns {Promise<Array>} - Array of hook results
 *
 * @example
 * const results = await executeHooks({
 *   hookInput: { hook_event_name: "Notification", message: "...", ... },
 *   matchQuery: "info",
 *   signal: abortSignal
 * });
 * // results: [{ command: "...", succeeded: true, output: "..." }, ...]
 */
async function executeHooks({
  getAppState,
  hookInput,
  matchQuery,
  signal,
  timeoutMs = DEFAULT_HOOK_TIMEOUT_MS
}) {
  const hookEvent = hookInput.hook_event_name;
  const hookName = matchQuery ? `${hookEvent}:${matchQuery}` : hookEvent;

  // Check if hooks are disabled
  if (getSettings().disableAllHooks) {
    m(`Skipping hooks for ${hookName} due to 'disableAllHooks' setting`);
    return [];
  }

  // Check workspace trust
  if (isWorkspaceTrustRequired()) {
    m(`Skipping ${hookName} hook execution - workspace trust not accepted`);
    return [];
  }

  // Get matching hooks
  const appState = getAppState ? await getAppState() : undefined;
  const hooks = getMatchingHooks(appState, hookEvent, hookInput);

  if (hooks.length === 0) {
    return [];
  }

  // Check if already aborted
  if (signal?.aborted) {
    return [];
  }

  // Record telemetry
  recordTelemetryEvent("tengu_run_hook", {
    hookName: hookName,
    numCommands: hooks.length
  });

  // Serialize hook input
  let hookInputJSON;
  try {
    hookInputJSON = JSON.stringify(hookInput);
  } catch (err) {
    logError(err instanceof Error ? err : Error(String(err)), I61);
    return [];
  }

  // Execute all hooks in parallel
  const hookPromises = hooks.map(async (hook, index) => {
    // Handle callback hooks
    if (hook.type === "callback") {
      const { abortSignal, cleanup } = combineAbortSignals(
        AbortSignal.timeout(timeoutMs),
        signal
      );

      try {
        const hookId = generateHookUuid();
        const result = await hook.callback(hookInput, hookId, abortSignal);
        cleanup?.();

        // Check for async response
        if (isAsyncHookResponse(result)) {
          m(`${hookName} [callback] returned async response, returning empty output`);
          return {
            command: "callback",
            succeeded: true,
            output: ""
          };
        }

        const output = result.systemMessage || "";
        m(`${hookName} [callback] completed successfully`);
        return {
          command: "callback",
          succeeded: true,
          output: output
        };
      } catch (err) {
        cleanup?.();
        const errorMessage = err instanceof Error ? err.message : String(err);
        m(`${hookName} [callback] failed to run: ${errorMessage}`, { level: "error" });
        return {
          command: "callback",
          succeeded: false,
          output: errorMessage
        };
      }
    }

    // Set up timeout
    const hookTimeout = hook.timeout ? hook.timeout * 1000 : timeoutMs;
    const { abortSignal, cleanup } = combineAbortSignals(
      AbortSignal.timeout(hookTimeout),
      signal
    );

    // Prompt hooks not supported in non-streaming mode
    if (hook.type === "prompt") {
      return {
        command: hook.prompt,
        succeeded: false,
        output: "Prompt stop hooks are not yet supported outside REPL"
      };
    }

    // Execute command hook
    try {
      const result = await executeHookCommand(
        hook,
        hookEvent,
        hookName,
        hookInputJSON,
        abortSignal,
        index
      );
      cleanup?.();

      // Handle cancelled
      if (result.aborted) {
        m(`${hookName} [${hook.command}] cancelled`);
        return {
          command: hook.command,
          succeeded: false,
          output: "Hook cancelled"
        };
      }

      m(`${hookName} [${hook.command}] completed with status ${result.status}`);

      // Parse output
      const { json, validationError } = parseHookOutput(result.stdout);

      if (validationError) {
        displayMessage(`${bold(hookName)} [${hook.command}] ${yellow("Hook JSON output validation failed")}`);
        throw Error(validationError);
      }

      // Handle JSON output
      if (json && !isAsyncHookResponse(json)) {
        m(`Parsed JSON output from hook: ${JSON.stringify(json)}`);
        if (json.systemMessage) {
          displaySystemMessage(json.systemMessage);
        }
      }

      const output = result.status === 0 ? result.stdout || "" : result.stderr || "";
      return {
        command: hook.command,
        succeeded: result.status === 0,
        output: output
      };
    } catch (err) {
      cleanup?.();
      const errorMessage = err instanceof Error ? err.message : String(err);
      m(`${hookName} [${hook.command}] failed to run: ${errorMessage}`, { level: "error" });
      return {
        command: hook.command,
        succeeded: false,
        output: errorMessage
      };
    }
  });

  // Wait for all hooks to complete
  return await Promise.all(hookPromises);
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  executeHooksStream,
  executeHooks
};
