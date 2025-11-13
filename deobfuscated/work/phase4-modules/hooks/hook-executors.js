/**
 * Hook System - Hook Executors
 *
 * Functions that execute different types of hooks:
 * - Command hooks: Execute shell commands
 * - Prompt hooks: Send prompts to Claude
 * - Callback hooks: Execute JavaScript functions
 *
 * Original locations:
 * - executeHookCommand (S00): line 491174
 * - executePromptHook (Os2): line 490768
 * - executeCallbackHook (n1I): line 492076
 */

// ============================================================================
// External Dependencies (Placeholders)
// ============================================================================

/**
 * TODO: Import these from appropriate modules when available:
 *
 * Process/Shell Execution:
 * - getHomedir() - Get user home directory
 * - SPA(prefix, command) - Apply shell prefix to command
 * - p1I(command, args, options) - Spawn child process (child_process.spawn wrapper)
 * - jPA(process, signal, timeout) - Manage process with abort signal and timeout
 * - getCwd() - Get current working directory
 * - ik0(index) - Get environment file path
 *
 * Hook Management:
 * - G0A(response) - Check if response is async hook
 * - ek0(hookData) - Register async hook
 * - A_0(processId, data) - Append to stdout for async hook
 * - B_0(processId, data) - Append to stderr for async hook
 *
 * Prompt Hooks:
 * - d1I(promptTemplate, hookInput) - Interpolate prompt template
 * - Gb(options) - Process prompt input
 * - createHookMessage(data) - Create hook message
 * - iB1() - Generate hook ID
 * - m1I(signal1, signal2) - Combine abort signals
 * - AV(content) - Create assistant message
 * - oj(options) - Query Claude model
 * - BW() - Get model name
 * - P3(text) - Parse JSON safely
 *
 * Callback Hooks:
 * - js2(data) - Process hook result
 *
 * Logging:
 * - m(message) - Debug logging
 * - logError(error, context) - Error logging
 */

// Placeholder implementations
const getHomedir = function() {
  // TODO: Import from filesystem module
  return process.env.HOME || process.env.USERPROFILE || "/";
};

const getCwd = function() {
  // TODO: Import from filesystem module
  return process.cwd();
};

const m = function(message) {
  // TODO: Import from debug logging module
  // console.log(`[Hook Debug]:`, message);
};

const logError = function(error, context) {
  // TODO: Import from logging module
  console.error(`[Hook Error ${context}]:`, error);
};

const applyShellPrefix = function(prefix, command) {
  // TODO: Import from shell module
  // Original name: SPA
  return `${prefix} ${command}`;
};

const spawnProcess = function(command, args, options) {
  // TODO: Import from process module
  // Original name: p1I
  // This would be a wrapper around child_process.spawn
  const { spawn } = require('child_process');
  return spawn(command, args, options);
};

const manageProcessWithSignal = function(process, signal, timeoutMs) {
  // TODO: Import from process management module
  // Original name: jPA
  // This manages abort signal and timeout for a process
  return {
    background: (id) => {
      // Background the process
      return {
        stdoutStream: process.stdout,
        stderrStream: process.stderr
      };
    }
  };
};

const isAsyncHookResponse = function(response) {
  // TODO: Import from hook validation module
  // Original name: G0A
  // Checks if response indicates async execution
  return response && typeof response === 'object' && response.async === true;
};

const registerAsyncHook = function(hookData) {
  // TODO: Import from async hook registry
  // Original name: ek0
  // Registers a hook for async execution
};

const appendAsyncHookStdout = function(processId, data) {
  // TODO: Import from async hook registry
  // Original name: A_0
};

const appendAsyncHookStderr = function(processId, data) {
  // TODO: Import from async hook registry
  // Original name: B_0
};

const getEnvironmentFilePath = function(index) {
  // TODO: Import from environment module
  // Original name: ik0
  return `.env.${index}`;
};

const interpolatePromptTemplate = function(template, hookInput) {
  // TODO: Import from template module
  // Original name: d1I
  // Interpolates {{variable}} placeholders in prompt
  return template;
};

const processPromptInput = async function(options) {
  // TODO: Import from prompt processing module
  // Original name: Gb
  // Processes user input and decides if should query model
  return {
    shouldQuery: false,
    messages: []
  };
};

const createHookMessage = function(data) {
  // TODO: Import from tool-helpers or hook-helpers
  // This is already extracted in Phase 4.2.1
  return {
    type: "attachment",
    attachment: data,
    uuid: Math.random().toString(36),
    timestamp: new Date().toISOString()
  };
};

const generateHookId = function() {
  // TODO: Import from uuid module
  // Original name: iB1
  return Math.random().toString(36).substring(7);
};

const combineAbortSignalsForPrompt = function(signal1, signal2) {
  // TODO: Import from signal management module
  // Original name: m1I (different from nB1)
  return {
    signal: signal1,
    cleanup: () => {}
  };
};

const createAssistantMessage = function(content) {
  // TODO: Import from message creation module
  // Original name: AV
  return {
    role: "assistant",
    content: content.content
  };
};

const queryClaudeModel = async function(options) {
  // TODO: Import from Claude API module
  // Original name: oj
  return {
    message: {
      content: [{ type: "text", text: '{"ok": true}' }]
    }
  };
};

const getModelName = function() {
  // TODO: Import from config module
  // Original name: BW
  return "claude-sonnet-4-5-20250929";
};

const parseJSONSafely = function(text) {
  // TODO: Import from parsing module
  // Original name: P3
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const processHookResult = function(data) {
  // TODO: Import from hook result processor
  // Original name: js2
  // Processes hook JSON response into standard format
  return {};
};

const createAbortController = function() {
  // Standard AbortController
  return new AbortController();
};

// ============================================================================
// Command Hook Executor
// ============================================================================

/**
 * Executes a shell command hook
 *
 * This function handles:
 * - Command interpolation with shell prefix
 * - Environment variable setup (CLAUDE_PROJECT_DIR, CLAUDE_ENV_FILE)
 * - Process spawning and I/O management
 * - Async hook detection and backgrounding
 * - Timeout and abort signal handling
 * - EPIPE error handling
 *
 * Async Hooks:
 * Command hooks can return `{"async": true, ...}` in their initial output
 * to indicate they should run in the background. The process is then
 * registered and monitored asynchronously.
 *
 * Original location: line 491174
 * Original name: S00
 *
 * @param {Object} hook - Hook definition
 * @param {string} hook.command - Shell command to execute
 * @param {number} [hook.timeout] - Timeout in seconds (default: 60)
 * @param {string} hookEvent - Hook event name (e.g., "PreToolUse")
 * @param {string} hookName - Full hook name (e.g., "PreToolUse:Read")
 * @param {string} hookInputJSON - Hook input as JSON string
 * @param {AbortSignal} signal - Abort signal for cancellation
 * @param {number} [sessionEnvIndex] - Session environment index (for SessionStart)
 * @returns {Promise<Object>} - Execution result
 *
 * @property {string} stdout - Standard output from command
 * @property {string} stderr - Standard error from command
 * @property {number} status - Exit status code
 * @property {boolean} [aborted] - Whether execution was aborted
 *
 * @example
 * const result = await executeHookCommand(
 *   { command: "echo 'Hook executed'", timeout: 30 },
 *   "PreToolUse",
 *   "PreToolUse:Read",
 *   '{"tool_name": "Read", "tool_input": {...}}',
 *   signal
 * );
 */
async function executeHookCommand(hook, hookEvent, hookName, hookInputJSON, signal, sessionEnvIndex) {
  const homeDir = getHomedir();

  // Apply shell prefix if configured
  const shellCommand = process.env.CLAUDE_CODE_SHELL_PREFIX
    ? applyShellPrefix(process.env.CLAUDE_CODE_SHELL_PREFIX, hook.command)
    : hook.command;

  // Hook timeout (default 60 seconds)
  const timeoutMs = hook.timeout ? hook.timeout * 1000 : 60000;

  // Set up environment variables
  const env = {
    ...process.env,
    CLAUDE_PROJECT_DIR: homeDir
  };

  // Add environment file for SessionStart hooks
  if (hookEvent === "SessionStart" && sessionEnvIndex !== undefined) {
    env.CLAUDE_ENV_FILE = getEnvironmentFilePath(sessionEnvIndex);
  }

  // Spawn the process
  const childProcess = spawnProcess(shellCommand, [], {
    env: env,
    cwd: getCwd(),
    shell: true
  });

  // Manage process with abort signal and timeout
  const processManager = manageProcessWithSignal(childProcess, signal, timeoutMs);

  // Output buffers
  let stdout = "";
  let stderr = "";

  // Set encoding
  childProcess.stdout.setEncoding("utf8");
  childProcess.stderr.setEncoding("utf8");

  // Async hook detection
  let asyncDetected = false;
  let asyncResolve = null;
  const asyncPromise = new Promise(resolve => {
    asyncResolve = resolve;
  });

  // Listen to stdout - check for async hook response
  childProcess.stdout.on("data", (data) => {
    stdout += data;

    // Check if this is an async hook (only on first JSON-like output)
    if (!asyncDetected && stdout.trim().includes("}")) {
      asyncDetected = true;
      m(`Hooks: Checking initial response for async: ${stdout.trim()}`);

      try {
        const response = JSON.parse(stdout.trim());
        m(`Hooks: Parsed initial response: ${JSON.stringify(response)}`);

        if (isAsyncHookResponse(response)) {
          const processId = `async_hook_${childProcess.pid}`;
          m(`Hooks: Detected async hook, backgrounding process ${processId}`);

          // Background the process
          const bgProcess = processManager.background(processId);

          if (bgProcess) {
            // Register async hook
            registerAsyncHook({
              processId: processId,
              asyncResponse: response,
              hookEvent: hookEvent,
              hookName: hookName,
              command: hook.command,
              shellCommand: processManager
            });

            // Continue monitoring output
            bgProcess.stdoutStream.on("data", (chunk) => {
              appendAsyncHookStdout(processId, chunk.toString());
            });

            bgProcess.stderrStream.on("data", (chunk) => {
              appendAsyncHookStderr(processId, chunk.toString());
            });

            // Resolve immediately for async hooks
            asyncResolve?.({
              stdout: stdout,
              stderr: stderr,
              status: 0
            });
          }
        } else {
          m("Hooks: Initial response is not async, continuing normal processing");
        }
      } catch (err) {
        m(`Hooks: Failed to parse initial response as JSON: ${err}`);
      }
    }
  });

  // Listen to stderr
  childProcess.stderr.on("data", (data) => {
    stderr += data;
  });

  // Write hook input to stdin
  const stdinPromise = new Promise((resolve, reject) => {
    childProcess.stdin.on("error", reject);
    childProcess.stdin.write(hookInputJSON, "utf8");
    childProcess.stdin.end();
    resolve();
  });

  // Listen for process errors
  const errorPromise = new Promise((resolve, reject) => {
    childProcess.on("error", reject);
  });

  // Listen for process close
  const closePromise = new Promise((resolve) => {
    childProcess.on("close", (code) => {
      resolve({
        stdout: stdout,
        stderr: stderr,
        status: code ?? 1,
        aborted: signal.aborted
      });
    });
  });

  // Wait for execution
  try {
    // First wait for stdin to be written
    await Promise.race([stdinPromise, errorPromise]);

    // Then wait for either async resolution or normal completion
    return await Promise.race([asyncPromise, closePromise, errorPromise]);
  } catch (error) {
    const err = error;

    // Handle EPIPE (command closed stdin early)
    if (err.code === "EPIPE") {
      m("EPIPE error while writing to hook stdin (hook command likely closed early)");
      return {
        stdout: "",
        stderr: "Hook command closed stdin before hook input was fully written (EPIPE)",
        status: 1
      };
    }

    // Handle abort
    if (err.code === "ABORT_ERR") {
      return {
        stdout: "",
        stderr: "Hook cancelled",
        status: 1,
        aborted: true
      };
    }

    // Handle other errors
    return {
      stdout: "",
      stderr: `Error occurred while executing hook command: ${error instanceof Error ? error.message : String(error)}`,
      status: 1
    };
  }
}

// ============================================================================
// Prompt Hook Executor
// ============================================================================

/**
 * Executes a prompt hook by sending a prompt to Claude
 *
 * Prompt hooks allow hooks to:
 * 1. Interpolate templates with hook input data
 * 2. Process the prompt through Claude
 * 3. Return structured JSON responses (ok: true/false, reason, etc.)
 *
 * The hook can return:
 * - {ok: true} - Hook condition is met
 * - {ok: false, reason: "..."} - Hook condition not met with reason
 *
 * Original location: line 490768
 * Original name: Os2
 *
 * @param {Object} hook - Hook definition
 * @param {string} hook.prompt - Prompt template with {{placeholders}}
 * @param {number} [hook.timeout] - Timeout in seconds (default: 30)
 * @param {string} hookName - Full hook name
 * @param {string} hookEvent - Hook event name
 * @param {string} hookInputJSON - Hook input as JSON string
 * @param {AbortSignal} signal - Abort signal
 * @param {Object} context - Execution context
 * @param {Array} [previousMessages] - Previous messages in conversation
 * @returns {Promise<Object>} - Hook result with outcome and message
 *
 * @example
 * const result = await executePromptHook(
 *   { prompt: "Is the file {{tool_input.file_path}} safe to read?" },
 *   "PreToolUse:Read",
 *   "PreToolUse",
 *   hookInputJSON,
 *   signal,
 *   context
 * );
 */
async function executePromptHook(hook, hookName, hookEvent, hookInputJSON, signal, context, previousMessages) {
  try {
    // Interpolate prompt template with hook input
    const interpolatedPrompt = interpolatePromptTemplate(hook.prompt, hookInputJSON);
    m(`Hooks: Processing prompt hook with prompt: ${interpolatedPrompt}`);

    // Create modified context for prompt processing
    const modifiedContext = {
      ...context,
      onChangeAPIKey: () => {},
      onChangeDynamicMcpConfig: undefined,
      onInstallIDEExtension: undefined,
      resume: undefined,
      options: {
        ...context.options,
        dynamicMcpConfig: undefined,
        ideInstallationStatus: null,
        theme: "dark"
      }
    };

    // Process the prompt input
    const processedPrompt = await processPromptInput({
      input: interpolatedPrompt,
      mode: "prompt",
      setIsLoading: () => {},
      setToolJSX: () => {},
      context: modifiedContext
    });

    // If prompt processing decided not to query, return messages
    if (!processedPrompt.shouldQuery) {
      const content = processedPrompt.messages.map(msg => {
        if (msg.type === "user" && msg.message?.content) {
          if (typeof msg.message.content === "string") {
            return msg.message.content;
          }
          return msg.message.content
            .filter(block => block.type === "text")
            .map(block => block.text)
            .join("");
        }
        return "";
      }).join("\n");

      return {
        hook: hook,
        outcome: "success",
        message: createHookMessage({
          type: "hook_success",
          hookName: hookName,
          toolUseID: `hook-${generateHookId()}`,
          hookEvent: hookEvent,
          content: content
        })
      };
    }

    // Combine with previous messages if available
    const messages = previousMessages && previousMessages.length > 0
      ? [...previousMessages, ...processedPrompt.messages]
      : processedPrompt.messages;

    m(`Hooks: Querying model with ${messages.length} messages`);

    // Set up timeout
    const timeoutMs = hook.timeout ? hook.timeout * 1000 : 30000;
    const timeoutController = createAbortController();
    const timeoutId = setTimeout(() => {
      timeoutController.abort();
    }, timeoutMs);

    // Combine abort signals
    const { signal: combinedSignal, cleanup } = combineAbortSignalsForPrompt(
      signal,
      timeoutController.signal
    );

    // Add JSON priming to ensure structured response
    const messagesWithPriming = [...messages, createAssistantMessage({ content: "{" })];

    try {
      // Query Claude
      const response = await queryClaudeModel({
        messages: messagesWithPriming,
        systemPrompt: [`You are evaluating a hook in Claude Code.

CRITICAL: You MUST return ONLY valid JSON with no other text, explanation, or commentary before or after the JSON. Do not include any markdown code blocks, thinking, or additional text.

Your response must be a single JSON object matching one of the following schemas:
1. If the condition is met, return: {ok: true}
2. If the condition is not met, return: {ok: false, reason: "Reason for why it is not met"}

Return the JSON object directly with no preamble or explanation.`],
        maxThinkingTokens: 0,
        tools: context.options.tools,
        signal: combinedSignal,
        options: {
          async getToolPermissionContext() {
            return (await context.getAppState()).toolPermissionContext;
          },
          model: getModelName(),
          toolChoice: undefined,
          isNonInteractiveSession: true,
          hasAppendSystemPrompt: false,
          agents: [],
          querySource: "hook_prompt",
          mcpTools: []
        }
      });

      clearTimeout(timeoutId);
      cleanup();

      // Extract JSON from response (prepend the "{" we primed with)
      const responseText = "{" + response.message.content
        .filter(block => block.type === "text")
        .map(block => block.text)
        .join("");

      m(`Hooks: Model response: ${responseText}`);

      // Parse JSON response
      const parsed = parseJSONSafely(responseText);

      if (!parsed) {
        m(`Hooks: error parsing response as JSON: ${responseText}`);
        return {
          hook: hook,
          outcome: "non_blocking_error",
          message: createHookMessage({
            type: "hook_error_during_execution",
            hookName: hookName,
            toolUseID: `hook-${generateHookId()}`,
            hookEvent: hookEvent,
            content: `Failed to parse hook response as JSON: ${responseText}`
          })
        };
      }

      // Return successful result
      return {
        hook: hook,
        outcome: "success",
        message: createHookMessage({
          type: "hook_success",
          hookName: hookName,
          toolUseID: `hook-${generateHookId()}`,
          hookEvent: hookEvent,
          content: JSON.stringify(parsed)
        }),
        // Include parsed response for decision making
        json: parsed
      };
    } catch (error) {
      clearTimeout(timeoutId);
      cleanup();

      return {
        hook: hook,
        outcome: "non_blocking_error",
        message: createHookMessage({
          type: "hook_error_during_execution",
          hookName: hookName,
          toolUseID: `hook-${generateHookId()}`,
          hookEvent: hookEvent,
          content: `Error querying model: ${error instanceof Error ? error.message : String(error)}`
        })
      };
    }
  } catch (error) {
    return {
      hook: hook,
      outcome: "non_blocking_error",
      message: createHookMessage({
        type: "hook_error_during_execution",
        hookName: hookName,
        toolUseID: `hook-${generateHookId()}`,
        hookEvent: hookEvent,
        content: `Error in prompt hook: ${error instanceof Error ? error.message : String(error)}`
      })
    };
  }
}

// ============================================================================
// Callback Hook Executor
// ============================================================================

/**
 * Executes a callback hook (JavaScript function)
 *
 * Callback hooks are JavaScript functions that receive:
 * - hookInput: The hook input data
 * - toolUseID: Tool use ID for tracking
 * - signal: Abort signal
 *
 * The callback can return:
 * - {async: true, ...} - To run asynchronously
 * - Any JSON object - Standard hook response
 *
 * Original location: line 492076
 * Original name: n1I
 *
 * @param {Object} options - Execution options
 * @param {string} options.toolUseID - Tool use ID
 * @param {Object} options.hook - Hook definition with callback function
 * @param {string} options.hookEvent - Hook event name
 * @param {Object} options.hookInput - Hook input data
 * @param {AbortSignal} options.signal - Abort signal
 * @returns {Promise<Object>} - Hook result with outcome
 *
 * @example
 * const result = await executeCallbackHook({
 *   toolUseID: "tool_123",
 *   hook: { callback: async (input) => ({ ok: true }) },
 *   hookEvent: "PreToolUse",
 *   hookInput: { tool_name: "Read", ... },
 *   signal: abortSignal
 * });
 */
async function executeCallbackHook({ toolUseID, hook, hookEvent, hookInput, signal }) {
  // Execute the callback function
  const result = await hook.callback(hookInput, toolUseID, signal);

  // Check if this is an async hook
  if (isAsyncHookResponse(result)) {
    return {
      outcome: "success",
      hook: hook
    };
  }

  // Process the result and return
  return {
    ...processHookResult({
      json: result,
      command: "callback",
      hookName: `${hookEvent}:Callback`,
      toolUseID: toolUseID,
      hookEvent: hookEvent,
      expectedHookEvent: hookEvent,
      stdout: undefined,
      stderr: undefined,
      exitCode: undefined
    }),
    outcome: "success",
    hook: hook
  };
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  executeHookCommand,
  executePromptHook,
  executeCallbackHook
};
