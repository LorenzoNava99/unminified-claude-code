/**
 * Tool Execution Engine - Core Functions
 *
 * This module contains the main tool execution pipeline including:
 * - Tool execution dispatcher (executeToolUse)
 * - Stream creation (createToolExecutionStream)
 * - Validation and execution (executeToolWithValidation)
 * - Hook integration (executePreToolUseHooks, executePostToolUseHooks)
 *
 * Original locations:
 * - executeToolUse: line 358179-358243
 * - createToolExecutionStream: line 358244-358271
 * - executeToolWithValidation: line 358272-358617
 * - executePostToolUseHooks (F85): line 358618-358710
 * - executePreToolUseHooks: line 358711-358835
 */

const { AsyncQueue } = require('./async-queue');
const {
  TOOL_CANCELLED_MESSAGE,
  formatInputValidationError,
  formatHookError,
  createToolCancelledResult,
  createToolProgressMessage,
  createHookMessage,
  isMcpTool
} = require('./tool-helpers');

// TODO: Import tool constants from phase4-modules/shared-utils/tool-constants.js
const {
  TOOL_READ,
  TOOL_WRITE,
  TOOL_EDIT,
  TOOL_BASH
} = require('../shared-utils/tool-constants');

// ============================================================================
// External Dependencies (Need to be imported from appropriate modules)
// ============================================================================

/**
 * NOTE: These functions are referenced but not yet extracted.
 * They will need to be imported from their respective modules:
 *
 * Telemetry & Recording:
 * - recordTelemetryEvent(eventName, data) - Records telemetry events
 * - recordToolInvocation(toolName, metadata) - Records tool usage
 * - recordToolDecision(decision, source) - Records permission decisions
 * - recordToolDuration(durationMs) - Records tool execution time
 * - recordToolPermissionGranted() - Records permission grant
 * - incrementToolInvocationCount() - Increments tool counter
 * - incrementToolRejection() - Increments rejection counter
 * - JhQ(key, data) - Advanced telemetry function
 * - Ug1(data) - Tool result tracking
 * - ON(eventType, data) - Event notification system
 *
 * Tool Timing:
 * - toolTimingReporter.reportToolStart(toolName, toolUseId)
 * - toolTimingReporter.reportToolComplete(toolName, toolUseId)
 * - toolTimingReporter.reportToolError(toolName, error, toolUseId)
 *
 * Messages:
 * - createToolResultMessage(params) - Creates tool result message
 *
 * Hooks:
 * - iterateToolHooks(toolName, toolUseId, input, context, mode, signal)
 *   Original name: Vc1 (PreToolUse hook iterator)
 * - iteratePostToolHooks(toolName, toolUseId, input, output, context, mode, signal)
 *   Original name: Kc1 (PostToolUse hook iterator)
 * - formatHookBlockingError(hookName, error) - Formats blocking errors
 * - formatPermissionBehavior(behavior) - Formats permission behavior
 *   Original name: vMQ
 *
 * Logging:
 * - logError(error, context) - Error logging function
 * - m(message) - Debug logging function
 *
 * Error Classes:
 * - nJ - Hook-related error class
 * - RT - Shell/Bash execution error class
 *
 * Constants:
 * - tX0, HF0, oX0, WZA - Error context constants
 * - AN - "[Request interrupted by user for tool use]"
 */

// ============================================================================
// PLACEHOLDER IMPLEMENTATIONS
// (These should be replaced with actual imports when modules are available)
// ============================================================================

// Placeholder telemetry functions
const recordTelemetryEvent = function(eventName, data) {
  // TODO: Import from telemetry module
  console.log(`[Telemetry] ${eventName}:`, data);
};

const recordToolInvocation = function(toolName, metadata) {
  // TODO: Import from telemetry module
};

const incrementToolInvocationCount = function() {
  // TODO: Import from telemetry module
};

const recordToolDecision = function(decision, source) {
  // TODO: Import from telemetry module
};

const incrementToolRejection = function() {
  // TODO: Import from telemetry module
};

const recordToolPermissionGranted = function() {
  // TODO: Import from telemetry module
};

const recordToolDuration = function(durationMs) {
  // TODO: Import from telemetry module
};

const JhQ = function(key, data) {
  // TODO: Import from telemetry module
};

const Ug1 = function(data) {
  // TODO: Import from telemetry module
};

const ON = function(eventType, data) {
  // TODO: Import from telemetry module
};

const toolTimingReporter = {
  reportToolStart: function(toolName, toolUseId) {
    // TODO: Import from timing module
  },
  reportToolComplete: function(toolName, toolUseId) {
    // TODO: Import from timing module
  },
  reportToolError: function(toolName, error, toolUseId) {
    // TODO: Import from timing module
  }
};

const createToolResultMessage = function(params) {
  // TODO: Import from message creation module
  return {
    type: "user",
    uuid: require('./tool-helpers').generateUuid(),
    timestamp: new Date().toISOString(),
    message: {
      role: "user",
      content: params.content
    }
  };
};

const logError = function(error, context) {
  // TODO: Import from logging module
  console.error(`[Error ${context}]:`, error);
};

const m = function(message) {
  // TODO: Import from debug logging module (likely verbose debug mode)
  // console.log(`[Debug]:`, message);
};

const iterateToolHooks = async function*(toolName, toolUseId, input, context, mode, signal) {
  // TODO: Import from hook module (PreToolUse hooks)
  // Original name: Vc1
  // This is a placeholder - actual implementation will iterate over PreToolUse hooks
  return;
};

const iteratePostToolHooks = async function*(toolName, toolUseId, input, output, context, mode, signal) {
  // TODO: Import from hook module (PostToolUse hooks)
  // Original name: Kc1
  // This is a placeholder - actual implementation will iterate over PostToolUse hooks
  return;
};

const formatHookBlockingError = function(hookName, error) {
  // TODO: Import from hook helpers
  return `Hook ${hookName} blocked execution: ${error}`;
};

const formatPermissionBehavior = function(behavior) {
  // TODO: Import from permission helpers
  // Original name: vMQ
  const behaviors = {
    allow: "allowed",
    deny: "denied",
    ask: "requested permission for"
  };
  return behaviors[behavior] || behavior;
};

// Error context constants (placeholders)
const tX0 = "TOOL_EXEC_ERROR";
const HF0 = "TOOL_JSON_ERROR";
const oX0 = "TOOL_VALIDATION_ERROR";
const WZA = "HOOK_ERROR";
const AN = "[Request interrupted by user for tool use]";

// ============================================================================
// Main Tool Execution Functions
// ============================================================================

/**
 * executeToolUse - Main tool execution dispatcher
 *
 * This is the entry point for all tool executions. It:
 * 1. Looks up the tool by name
 * 2. Checks if execution was aborted
 * 3. Delegates to createToolExecutionStream
 * 4. Handles errors and cancellation
 *
 * Original location: line 358179-358243
 * Original name: uaA
 *
 * @param {Object} toolUse - Tool use block from Claude's response
 * @param {string} toolUse.name - Name of the tool to execute
 * @param {string} toolUse.id - Unique ID for this tool use
 * @param {Object} toolUse.input - Input parameters for the tool
 * @param {Object} conversationMessage - The conversation message containing the tool use
 * @param {string} conversationMessage.message.id - Message ID
 * @param {Function} checkPermissionCallback - Callback to check tool permissions
 * @param {Object} context - Execution context
 * @param {Object} context.options.tools - Array of available tools
 * @param {AbortController} context.abortController - Abort controller for cancellation
 * @param {Object} context.queryTracking - Query tracking metadata
 * @param {Map} context.toolDecisions - Map of tool decisions
 * @yields {Object} - Stream of execution results
 *
 * @example
 * for await (const result of executeToolUse(toolUse, message, checkPermission, context)) {
 *   console.log(result.message);
 * }
 */
async function* executeToolUse(toolUse, conversationMessage, checkPermissionCallback, context) {
  const toolName = toolUse.name;
  const tool = context.options.tools.find(t => t.name === toolName);
  const messageId = conversationMessage.message.id;

  // Check if tool exists
  if (!tool) {
    recordTelemetryEvent("tengu_tool_use_error", {
      error: `No such tool available: ${toolName}`,
      toolName: toolName,
      toolUseID: toolUse.id,
      isMcp: toolName.startsWith("mcp__"),
      queryChainId: context.queryTracking?.chainId,
      queryDepth: context.queryTracking?.depth
    });

    yield {
      message: createToolResultMessage({
        content: [{
          type: "tool_result",
          content: `<tool_use_error>Error: No such tool available: ${toolName}</tool_use_error>`,
          is_error: true,
          tool_use_id: toolUse.id
        }],
        toolUseResult: `Error: No such tool available: ${toolName}`
      })
    };
    return;
  }

  const input = toolUse.input;

  try {
    // Check if aborted before starting
    if (context.abortController.signal.aborted) {
      recordTelemetryEvent("tengu_tool_use_cancelled", {
        toolName: tool.name,
        toolUseID: toolUse.id,
        isMcp: tool.isMcp ?? false,
        queryChainId: context.queryTracking?.chainId,
        queryDepth: context.queryTracking?.depth
      });

      const cancelledResult = createToolCancelledResult(toolUse.id);
      yield {
        message: createToolResultMessage({
          content: [cancelledResult],
          toolUseResult: TOOL_CANCELLED_MESSAGE
        })
      };
      return;
    }

    // Execute tool with streaming
    for await (const result of createToolExecutionStream(
      tool,
      toolUse.id,
      input,
      context,
      checkPermissionCallback,
      conversationMessage,
      messageId
    )) {
      yield result;
    }
  } catch (error) {
    logError(error instanceof Error ? error : Error(String(error)), tX0);

    const errorMessage = error instanceof Error ? error.message : String(error);
    const fullErrorMessage = `Error calling tool${tool ? ` (${tool.name})` : ""}: ${errorMessage}`;

    yield {
      message: createToolResultMessage({
        content: [{
          type: "tool_result",
          content: `<tool_use_error>${fullErrorMessage}</tool_use_error>`,
          is_error: true,
          tool_use_id: toolUse.id
        }],
        toolUseResult: fullErrorMessage
      })
    };
  }
}

/**
 * createToolExecutionStream - Creates async iterator for tool execution
 *
 * Wraps executeToolWithValidation in an AsyncQueue to provide streaming results.
 * Handles progress messages and final results.
 *
 * Original location: line 358244-358271
 * Original name: X85
 *
 * @param {Object} tool - Tool object
 * @param {string} toolUseId - ID for this tool use
 * @param {Object} input - Tool input parameters
 * @param {Object} context - Execution context
 * @param {Function} checkPermissionCallback - Permission check callback
 * @param {Object} conversationMessage - Conversation message
 * @param {string} messageId - Message ID
 * @returns {AsyncQueue} - Async iterator yielding results
 */
function createToolExecutionStream(
  tool,
  toolUseId,
  input,
  context,
  checkPermissionCallback,
  conversationMessage,
  messageId
) {
  const queue = new AsyncQueue();

  // Progress callback - enqueues progress messages
  const onProgress = (progressData) => {
    recordTelemetryEvent("tengu_tool_use_progress", {
      messageID: messageId,
      toolName: tool.name,
      isMcp: tool.isMcp ?? false,
      queryChainId: context.queryTracking?.chainId,
      queryDepth: context.queryTracking?.depth
    });

    queue.enqueue({
      message: createToolProgressMessage({
        toolUseID: progressData.toolUseID,
        parentToolUseID: toolUseId,
        data: progressData.data
      })
    });
  };

  // Execute tool with validation
  executeToolWithValidation(
    tool,
    toolUseId,
    input,
    context,
    checkPermissionCallback,
    conversationMessage,
    messageId,
    onProgress
  )
    .then(results => {
      // Enqueue all result messages
      for (const result of results) {
        queue.enqueue(result);
      }
    })
    .catch(error => {
      // Propagate error to queue
      queue.error(error);
    })
    .finally(() => {
      // Mark queue as done
      queue.done();
    });

  return queue;
}

/**
 * executeToolWithValidation - Validates input, checks permissions, executes tool
 *
 * This is the heart of the tool execution pipeline. It:
 * 1. Validates tool input against schema
 * 2. Runs custom validation (if provided)
 * 3. Executes PreToolUse hooks
 * 4. Checks permissions (with hook override support)
 * 5. Calls the tool's execute function
 * 6. Executes PostToolUse hooks
 * 7. Handles errors at every stage
 *
 * Original location: line 358272-358617
 * Original name: W85
 *
 * @param {Object} tool - Tool object with inputSchema, validateInput, call methods
 * @param {string} toolUseId - Unique ID for this tool execution
 * @param {Object} input - Tool input parameters
 * @param {Object} context - Execution context
 * @param {Function} checkPermissionCallback - Permission check callback
 * @param {Object} conversationMessage - Conversation message
 * @param {string} messageId - Message ID
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Array>} - Array of result messages
 */
async function executeToolWithValidation(
  tool,
  toolUseId,
  input,
  context,
  checkPermissionCallback,
  conversationMessage,
  messageId,
  onProgress
) {
  // ============================================================
  // Phase 1: Schema Validation
  // ============================================================

  const parseResult = tool.inputSchema.safeParse(input);

  if (!parseResult.success) {
    const errorMessage = formatInputValidationError(tool.name, parseResult.error);

    recordTelemetryEvent("tengu_tool_use_error", {
      error: "InputValidationError",
      errorDetails: errorMessage.slice(0, 2000),
      messageID: messageId,
      toolName: tool.name,
      isMcp: tool.isMcp ?? false,
      queryChainId: context.queryTracking?.chainId,
      queryDepth: context.queryTracking?.depth
    });

    return [{
      message: createToolResultMessage({
        content: [{
          type: "tool_result",
          content: `<tool_use_error>InputValidationError: ${errorMessage}</tool_use_error>`,
          is_error: true,
          tool_use_id: toolUseId
        }],
        toolUseResult: `InputValidationError: ${parseResult.error.message}`
      })
    }];
  }

  // ============================================================
  // Phase 2: Custom Validation (Optional)
  // ============================================================

  const customValidationResult = await tool.validateInput?.(parseResult.data, context);

  if (customValidationResult?.result === false) {
    recordTelemetryEvent("tengu_tool_use_error", {
      messageID: messageId,
      toolName: tool.name,
      error: customValidationResult.message,
      errorCode: customValidationResult.errorCode,
      isMcp: tool.isMcp ?? false,
      queryChainId: context.queryTracking?.chainId,
      queryDepth: context.queryTracking?.depth
    });

    return [{
      message: createToolResultMessage({
        content: [{
          type: "tool_result",
          content: `<tool_use_error>${customValidationResult.message}</tool_use_error>`,
          is_error: true,
          tool_use_id: toolUseId
        }],
        toolUseResult: `Error: ${customValidationResult.message}`
      })
    }];
  }

  // ============================================================
  // Phase 3: PreToolUse Hooks
  // ============================================================

  const resultMessages = [];
  let validatedInput = parseResult.data;
  let shouldPreventContinuation = false;
  let stopReason;
  let hookPermissionResult;

  for await (const hookResult of executePreToolUseHooks(
    context,
    tool,
    validatedInput,
    toolUseId,
    conversationMessage.message.id
  )) {
    switch (hookResult.type) {
      case "message":
        if (hookResult.message.message.type === "progress") {
          onProgress(hookResult.message.message);
        } else {
          resultMessages.push(hookResult.message);
        }
        break;

      case "hookPermissionResult":
        hookPermissionResult = hookResult.hookPermissionResult;
        break;

      case "preventContinuation":
        shouldPreventContinuation = hookResult.shouldPreventContinuation;
        break;

      case "stopReason":
        stopReason = hookResult.stopReason;
        break;

      case "stop":
        resultMessages.push({
          message: createToolResultMessage({
            content: [createToolCancelledResult(toolUseId)],
            toolUseResult: `Error: ${stopReason}`
          })
        });
        return resultMessages;
    }
  }

  // ============================================================
  // Phase 4: Telemetry - Record Tool Invocation
  // ============================================================

  const telemetryMetadata = {};

  if (validatedInput && typeof validatedInput === "object") {
    if (tool.name === TOOL_READ && "file_path" in validatedInput) {
      telemetryMetadata.file_path = String(validatedInput.file_path);
    } else if ((tool.name === TOOL_EDIT || tool.name === TOOL_WRITE) && "file_path" in validatedInput) {
      telemetryMetadata.file_path = String(validatedInput.file_path);
    } else if (tool.name === TOOL_BASH && "command" in validatedInput) {
      const bashInput = validatedInput;
      telemetryMetadata.full_command = bashInput.command;
    }
  }

  recordToolInvocation(tool.name, telemetryMetadata);
  incrementToolInvocationCount();

  // ============================================================
  // Phase 5: Permission Check (with Hook Override)
  // ============================================================

  let permissionResult;

  if (hookPermissionResult !== undefined && hookPermissionResult.behavior === "allow") {
    m(`Hook approved tool use for ${tool.name}, bypassing permission check`);
    permissionResult = hookPermissionResult;
  } else if (hookPermissionResult !== undefined && hookPermissionResult.behavior === "deny") {
    m(`Hook denied tool use for ${tool.name}`);
    permissionResult = hookPermissionResult;
  } else {
    // No hook override or hook returned "ask" - perform normal permission check
    const hookAskResult = hookPermissionResult?.behavior === "ask" ? hookPermissionResult : undefined;
    permissionResult = await checkPermissionCallback(
      tool,
      validatedInput,
      context,
      conversationMessage,
      toolUseId,
      hookAskResult
    );
  }

  // Handle permission denial
  if (permissionResult.behavior !== "allow") {
    const toolDecision = context.toolDecisions?.get(toolUseId);
    recordToolDecision("reject", toolDecision?.source || "unknown");
    incrementToolRejection();

    recordTelemetryEvent("tengu_tool_use_can_use_tool_rejected", {
      messageID: messageId,
      toolName: tool.name,
      queryChainId: context.queryTracking?.chainId,
      queryDepth: context.queryTracking?.depth
    });

    let denialMessage = permissionResult.message;
    if (shouldPreventContinuation && !denialMessage) {
      denialMessage = `Execution stopped by PreToolUse hook${stopReason ? `: ${stopReason}` : ""}`;
    }

    resultMessages.push({
      message: createToolResultMessage({
        content: [{
          type: "tool_result",
          content: denialMessage,
          is_error: true,
          tool_use_id: toolUseId
        }],
        toolUseResult: `Error: ${denialMessage}`
      })
    });

    return resultMessages;
  }

  // Permission granted
  recordTelemetryEvent("tengu_tool_use_can_use_tool_allowed", {
    messageID: messageId,
    toolName: tool.name,
    queryChainId: context.queryTracking?.chainId,
    queryDepth: context.queryTracking?.depth
  });

  // Use updated input from permission result
  validatedInput = permissionResult.updatedInput;

  // ============================================================
  // Phase 6: Build Tool Parameters for Telemetry
  // ============================================================

  const toolParameters = {};

  if (tool.name === TOOL_BASH && "command" in validatedInput) {
    const bashInput = validatedInput;
    toolParameters.bash_command = bashInput.command.trim().split(/\s+/)[0] || "";
    toolParameters.full_command = bashInput.command;

    if (bashInput.timeout !== undefined) {
      toolParameters.timeout = bashInput.timeout;
    }
    if (bashInput.description !== undefined) {
      toolParameters.description = bashInput.description;
    }
    if ("dangerouslyDisableSandbox" in bashInput) {
      toolParameters.dangerouslyDisableSandbox = bashInput.dangerouslyDisableSandbox;
    }
  }

  const toolDecision = context.toolDecisions?.get(toolUseId);
  recordToolDecision(toolDecision?.decision || "unknown", toolDecision?.source || "unknown");
  recordToolPermissionGranted();

  // ============================================================
  // Phase 7: Execute Tool
  // ============================================================

  const startTime = Date.now();
  toolTimingReporter.reportToolStart(tool.name, toolUseId);

  try {
    // Helper function to add result message
    const addResultMessage = function(toolOutput) {
      resultMessages.push({
        message: createToolResultMessage({
          content: [tool.mapToolResultToToolResultBlockParam(toolOutput, toolUseId)],
          toolUseResult: toolOutput
        }),
        contextModifier: contextModifierFunc ? {
          toolUseID: toolUseId,
          modifyContext: contextModifierFunc
        } : undefined
      });
    };

    // Execute the tool
    const toolResult = await tool.call(
      validatedInput,
      {
        ...context,
        userModified: permissionResult.userModified ?? false
      },
      checkPermissionCallback,
      conversationMessage,
      (progressData) => {
        recordTelemetryEvent("tengu_tool_use_progress", {
          messageID: conversationMessage.message.id,
          toolName: tool.name,
          isMcp: tool.isMcp ?? false
        });
        onProgress({
          toolUseID: progressData.toolUseID,
          data: progressData.data
        });
      }
    );

    const duration = Date.now() - startTime;
    recordToolDuration(duration);
    toolTimingReporter.reportToolComplete(tool.name, toolUseId);

    // ========================================================
    // Phase 7.1: Record Tool Output Telemetry
    // ========================================================

    if (toolResult.data && typeof toolResult.data === "object") {
      const outputMetadata = {};

      if (tool.name === TOOL_READ && "content" in toolResult.data) {
        if ("file_path" in validatedInput) {
          outputMetadata.file_path = String(validatedInput.file_path);
        }
        outputMetadata.content = String(toolResult.data.content);
      }

      if ((tool.name === TOOL_EDIT || tool.name === TOOL_WRITE) && "file_path" in validatedInput) {
        outputMetadata.file_path = String(validatedInput.file_path);
        if (tool.name === TOOL_EDIT && "diff" in toolResult.data) {
          outputMetadata.diff = String(toolResult.data.diff);
        }
        if (tool.name === TOOL_WRITE && "content" in validatedInput) {
          outputMetadata.content = String(validatedInput.content);
        }
      }

      if (tool.name === TOOL_BASH && "command" in validatedInput) {
        const bashInput = validatedInput;
        outputMetadata.bash_command = bashInput.command;
        if ("output" in toolResult.data) {
          outputMetadata.output = String(toolResult.data.output);
        }
      }

      if (Object.keys(outputMetadata).length > 0) {
        JhQ("tool.output", outputMetadata);
      }
    }

    Ug1({ success: true });
    incrementToolRejection();

    // Calculate result size
    let resultSizeBytes = 0;
    try {
      resultSizeBytes = JSON.stringify(toolResult.data).length;
    } catch (err) {
      logError(err instanceof Error ? err : Error(String(err)), HF0);
    }

    recordTelemetryEvent("tengu_tool_use_success", {
      messageID: messageId,
      toolName: tool.name,
      isMcp: tool.isMcp ?? false,
      durationMs: duration,
      queryChainId: context.queryTracking?.chainId,
      queryDepth: context.queryTracking?.depth
    });

    ON("tool_result", {
      tool_name: tool.name,
      success: "true",
      duration_ms: String(duration),
      ...(Object.keys(toolParameters).length > 0 && {
        tool_parameters: JSON.stringify(toolParameters)
      }),
      tool_result_size_bytes: String(resultSizeBytes),
      ...(toolDecision && {
        decision_source: toolDecision.source,
        decision_type: toolDecision.decision
      })
    });

    // ========================================================
    // Phase 8: PostToolUse Hooks
    // ========================================================

    let toolOutput = toolResult.data;
    const postHookMessages = [];
    let contextModifierFunc = toolResult.contextModifier;

    // Add result message for non-MCP tools before hooks
    if (!isMcpTool(tool)) {
      addResultMessage(toolOutput);
    }

    // Execute PostToolUse hooks
    for await (const hookResult of executePostToolUseHooks(
      context,
      tool,
      toolUseId,
      conversationMessage.message.id,
      permissionResult,
      toolOutput
    )) {
      if ("updatedMCPToolOutput" in hookResult) {
        if (isMcpTool(tool)) {
          toolOutput = hookResult.updatedMCPToolOutput;
        }
      } else if (isMcpTool(tool)) {
        postHookMessages.push(hookResult);
      } else {
        resultMessages.push(hookResult);
      }
    }

    // Add result message for MCP tools after hooks
    if (isMcpTool(tool)) {
      addResultMessage(toolOutput);
    }

    // Add new messages from tool result
    if (toolResult.newMessages && toolResult.newMessages.length > 0) {
      for (const newMessage of toolResult.newMessages) {
        resultMessages.push({
          message: newMessage
        });
      }
    }

    // Add hook continuation stop message if needed
    if (shouldPreventContinuation) {
      resultMessages.push({
        message: createHookMessage({
          type: "hook_stopped_continuation",
          message: stopReason || "Execution stopped by hook",
          hookName: `PreToolUse:${tool.name}`,
          toolUseID: toolUseId,
          hookEvent: "PreToolUse"
        })
      });
    }

    // Add post-hook messages
    for (const postHookMessage of postHookMessages) {
      resultMessages.push(postHookMessage);
    }

    return resultMessages;

  } catch (error) {
    // ========================================================
    // Phase 9: Error Handling
    // ========================================================

    const duration = Date.now() - startTime;
    recordToolDuration(duration);

    Ug1({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    });
    incrementToolRejection();

    toolTimingReporter.reportToolError(
      tool.name,
      error instanceof Error ? error.message : String(error),
      toolUseId
    );

    // Only log and record errors that aren't "expected" error types
    // nJ and RT are error classes that are handled specially
    if (!(error.constructor.name === 'nJ')) {
      if (!(error.constructor.name === 'RT')) {
        logError(error instanceof Error ? error : Error(String(error)), oX0);
      }

      recordTelemetryEvent("tengu_tool_use_error", {
        messageID: messageId,
        toolName: tool.name,
        error: error instanceof Error ? error.constructor.name : "UnknownError",
        isMcp: tool.isMcp ?? false,
        queryChainId: context.queryTracking?.chainId,
        queryDepth: context.queryTracking?.depth
      });

      ON("tool_result", {
        tool_name: tool.name,
        use_id: toolUseId,
        success: "false",
        duration_ms: String(duration),
        error: error instanceof Error ? error.message : String(error),
        ...(Object.keys(toolParameters).length > 0 && {
          tool_parameters: JSON.stringify(toolParameters)
        }),
        ...(toolDecision && {
          decision_source: toolDecision.source,
          decision_type: toolDecision.decision
        })
      });
    }

    const formattedError = formatHookError(error);

    return [{
      message: createToolResultMessage({
        content: [{
          type: "tool_result",
          content: formattedError,
          is_error: true,
          tool_use_id: toolUseId
        }],
        toolUseResult: `Error: ${formattedError}`
      })
    }];

  } finally {
    // Cleanup: remove tool decision from context
    if (toolDecision) {
      context.toolDecisions?.delete(toolUseId);
    }
  }
}

/**
 * executePostToolUseHooks - Executes hooks after tool completion
 *
 * Iterates over PostToolUse hooks and yields their results.
 * Handles hook cancellation, errors, and MCP output modifications.
 *
 * Original location: line 358618-358710
 * Original name: F85
 *
 * @param {Object} context - Execution context
 * @param {Object} tool - Tool object
 * @param {string} toolUseId - Tool use ID
 * @param {string} messageId - Message ID
 * @param {Object} permissionResult - Permission check result
 * @param {*} toolOutput - Tool execution output
 * @yields {Object} - Hook results and messages
 */
async function* executePostToolUseHooks(context, tool, toolUseId, messageId, permissionResult, toolOutput) {
  const startTime = Date.now();

  try {
    const appState = await context.getAppState();
    const mode = appState.toolPermissionContext.mode;
    let currentOutput = toolOutput;

    for await (const hookResult of iteratePostToolHooks(
      tool.name,
      toolUseId,
      permissionResult.updatedInput,
      currentOutput,
      context,
      mode,
      context.abortController.signal
    )) {
      try {
        // Handle hook cancellation
        if (hookResult.message?.type === "attachment" &&
            hookResult.message.attachment.type === "hook_cancelled") {
          recordTelemetryEvent("tengu_post_tool_hooks_cancelled", {
            toolName: tool.name,
            queryChainId: context.queryTracking?.chainId,
            queryDepth: context.queryTracking?.depth
          });

          yield {
            message: createHookMessage({
              type: "hook_cancelled",
              hookName: `PostToolUse:${tool.name}`,
              toolUseID: toolUseId,
              hookEvent: "PostToolUse"
            })
          };
          continue;
        }

        // Yield hook messages
        if (hookResult.message) {
          yield {
            message: hookResult.message
          };
        }

        // Handle blocking errors
        if (hookResult.blockingError) {
          yield {
            message: createHookMessage({
              type: "hook_blocking_error",
              hookName: `PostToolUse:${tool.name}`,
              toolUseID: toolUseId,
              hookEvent: "PostToolUse",
              blockingError: hookResult.blockingError
            })
          };
        }

        // Handle prevent continuation
        if (hookResult.preventContinuation) {
          yield {
            message: createHookMessage({
              type: "hook_stopped_continuation",
              message: hookResult.stopReason || "Execution stopped by PostToolUse hook",
              hookName: `PostToolUse:${tool.name}`,
              toolUseID: toolUseId,
              hookEvent: "PostToolUse"
            })
          };
          return;
        }

        // Handle additional context
        if (hookResult.additionalContexts && hookResult.additionalContexts.length > 0) {
          yield {
            message: createHookMessage({
              type: "hook_additional_context",
              content: hookResult.additionalContexts,
              hookName: `PostToolUse:${tool.name}`,
              toolUseID: toolUseId,
              hookEvent: "PostToolUse"
            })
          };
        }

        // Handle MCP tool output modification
        if (hookResult.updatedMCPToolOutput && isMcpTool(tool)) {
          currentOutput = hookResult.updatedMCPToolOutput;
          yield {
            updatedMCPToolOutput: currentOutput
          };
        }

      } catch (error) {
        const duration = Date.now() - startTime;

        recordTelemetryEvent("tengu_post_tool_hook_error", {
          messageID: messageId,
          toolName: tool.name,
          isMcp: tool.isMcp ?? false,
          duration: duration,
          queryChainId: context.queryTracking?.chainId,
          queryDepth: context.queryTracking?.depth
        });

        yield {
          message: createHookMessage({
            type: "hook_error_during_execution",
            content: formatHookError(error),
            hookName: `PostToolUse:${tool.name}`,
            toolUseID: toolUseId,
            hookEvent: "PostToolUse"
          })
        };
      }
    }
  } catch (error) {
    logError(error instanceof Error ? error : Error(String(error)), WZA);
  }
}

/**
 * executePreToolUseHooks - Executes hooks before tool execution
 *
 * Iterates over PreToolUse hooks and yields their results.
 * Hooks can:
 * - Add messages
 * - Override permission behavior (allow/deny/ask)
 * - Prevent continuation
 * - Stop execution
 *
 * Original location: line 358711-358835
 * Already well-named
 *
 * @param {Object} context - Execution context
 * @param {Object} tool - Tool object
 * @param {Object} input - Tool input parameters
 * @param {string} toolUseId - Tool use ID
 * @param {string} messageId - Message ID
 * @yields {Object} - Hook results including permission overrides
 */
async function* executePreToolUseHooks(context, tool, input, toolUseId, messageId) {
  const startTime = Date.now();

  try {
    const appState = await context.getAppState();

    for await (const hookResult of iterateToolHooks(
      tool.name,
      toolUseId,
      input,
      context,
      appState.toolPermissionContext.mode,
      context.abortController.signal
    )) {
      try {
        // Yield hook messages
        if (hookResult.message) {
          yield {
            type: "message",
            message: {
              message: hookResult.message
            }
          };
        }

        // Handle blocking errors
        if (hookResult.blockingError) {
          const errorMessage = formatHookBlockingError(`PreToolUse:${tool.name}`, hookResult.blockingError);
          yield {
            type: "hookPermissionResult",
            hookPermissionResult: {
              behavior: "deny",
              message: errorMessage,
              decisionReason: {
                type: "hook",
                hookName: `PreToolUse:${tool.name}`,
                reason: errorMessage
              }
            }
          };
        }

        // Handle prevent continuation
        if (hookResult.preventContinuation) {
          yield {
            type: "preventContinuation",
            shouldPreventContinuation: true
          };

          if (hookResult.stopReason) {
            yield {
              type: "stopReason",
              stopReason: hookResult.stopReason
            };
          }
        }

        // Handle permission behavior override
        if (hookResult.permissionBehavior !== undefined) {
          m(`Hook result has permissionBehavior=${hookResult.permissionBehavior}`);

          const decisionReason = {
            type: "hook",
            hookName: `PreToolUse:${tool.name}`,
            reason: hookResult.hookPermissionDecisionReason
          };

          if (hookResult.permissionBehavior === "allow") {
            yield {
              type: "hookPermissionResult",
              hookPermissionResult: {
                behavior: "allow",
                updatedInput: hookResult.updatedInput || input,
                decisionReason: decisionReason
              }
            };
          } else {
            yield {
              type: "hookPermissionResult",
              hookPermissionResult: {
                behavior: hookResult.permissionBehavior,
                message: hookResult.hookPermissionDecisionReason ||
                  `Hook PreToolUse:${tool.name} ${formatPermissionBehavior(hookResult.permissionBehavior)} this tool`,
                decisionReason: decisionReason
              }
            };
          }
        }

        // Handle abortion
        if (context.abortController.signal.aborted) {
          recordTelemetryEvent("tengu_pre_tool_hooks_cancelled", {
            toolName: tool.name,
            queryChainId: context.queryTracking?.chainId,
            queryDepth: context.queryTracking?.depth
          });

          yield {
            type: "message",
            message: {
              message: createHookMessage({
                type: "hook_cancelled",
                hookName: `PreToolUse:${tool.name}`,
                toolUseID: toolUseId,
                hookEvent: "PreToolUse"
              })
            }
          };

          yield {
            type: "stop"
          };
          return;
        }

      } catch (error) {
        logError(error instanceof Error ? error : Error(String(error)), WZA);

        const duration = Date.now() - startTime;

        recordTelemetryEvent("tengu_pre_tool_hook_error", {
          messageID: messageId,
          toolName: tool.name,
          isMcp: tool.isMcp ?? false,
          duration: duration,
          queryChainId: context.queryTracking?.chainId,
          queryDepth: context.queryTracking?.depth
        });

        yield {
          type: "message",
          message: {
            message: createHookMessage({
              type: "hook_error_during_execution",
              content: formatHookError(error),
              hookName: `PreToolUse:${tool.name}`,
              toolUseID: toolUseId,
              hookEvent: "PreToolUse"
            })
          }
        };

        yield {
          type: "stop"
        };
      }
    }
  } catch (error) {
    logError(error instanceof Error ? error : Error(String(error)), WZA);

    yield {
      type: "stop"
    };
    return;
  }
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  executeToolUse,
  createToolExecutionStream,
  executeToolWithValidation,
  executePreToolUseHooks,
  executePostToolUseHooks
};
