# Claude Code Extracted Symbols

Comprehensive extraction of all symbols, identifiers, and constants from Claude Code documentation.

**Extracted:** 2025-11-12
**Source:** Claude Code documentation (30 markdown files)

## Symbol Categories

### 1. Tool Names (17 tools)
**File:** `tool-names.txt`

Core tools available in Claude Code for file operations, bash execution, web operations, and task management.

- **File Operations:** Read, Write, Edit, Glob, Grep, NotebookEdit, NotebookRead
- **Execution:** Bash, BashOutput, Tmux
- **Web:** WebFetch, WebSearch
- **Task Management:** Task, Agent, TodoWrite, SlashCommand, Skill

### 2. CLI Flags (110 flags)
**File:** `cli-flags.txt`

Command-line flags for configuring Claude Code behavior, including:
- `--add-dir` - Add working directories
- `--agents` - Define custom subagents
- `--allowedTools` / `--disallowedTools` - Permission control
- `--print / -p` - Non-interactive mode
- `--system-prompt` - Custom system prompts
- `--output-format` - Format control (text, json, stream-json)
- `--model` - Model selection
- `--permission-mode` - Permission mode selection
- `--resume / --continue` - Session management
- `--verbose` - Debug logging
- `--dangerously-skip-permissions` - Bypass permissions

### 3. Slash Commands (33 commands)
**File:** `slash-commands.txt`

Built-in interactive commands:
- `/agents` - Manage subagents
- `/bug` - Report bugs
- `/clear` - Clear history
- `/commit` - Not in built-in list (custom)
- `/config` - Settings interface
- `/context` - View context usage
- `/cost` - Token usage
- `/doctor` - Health check
- `/help` - Usage help
- `/hooks` - Manage hooks
- `/mcp` - MCP server management
- `/memory` - Edit CLAUDE.md
- `/model` - Select model
- `/permissions` - Permission management
- `/sandbox` - Enable sandboxing
- `/status` - Status information
- `/todos` - List todos

### 4. Environment Variables (30 variables)
**File:** `env-variables.txt`

Configuration via environment variables:
- `CLAUDE_CODE_*` - Main configuration (23 variables)
- `CLAUDE_PROJECT_DIR` - Project directory
- `CLAUDE_ENV_FILE` - Environment file path
- `DISABLE_*` - Feature toggles (7 variables)

Key variables:
- `CLAUDE_CODE_USE_BEDROCK` - AWS Bedrock mode
- `CLAUDE_CODE_USE_VERTEX` - Google Vertex AI mode
- `CLAUDE_CODE_API_KEY_HELPER_TTL_MS` - API key helper TTL
- `DISABLE_TELEMETRY` - Opt out of telemetry
- `DISABLE_PROMPT_CACHING` - Disable caching

### 5. Model Names (18 models)
**File:** `model-names.txt`

Supported Claude models:
- **Sonnet 4.5:** `claude-sonnet-4-5-20250929`, `claude-sonnet-4-5-20250929-v1`, `claude-sonnet-4-20250514`
- **Opus 4:** `claude-opus-4-1`
- **Haiku 4.5:** `claude-haiku-4-5`, `claude-haiku-4-5-20251001-v1`
- **Haiku 3.5:** `claude-3-5-haiku-20241022`, `claude-3-5-haiku-20241022-v1`

Model aliases:
- `sonnet` - Latest Sonnet
- `opus` - Latest Opus
- `haiku` - Latest Haiku

### 6. Configuration Keys (37 keys)
**File:** `config-keys.txt`

Settings.json configuration options:
- **General:** `apiKeyHelper`, `model`, `env`, `companyAnnouncements`
- **Permissions:** `allow`, `ask`, `deny`, `defaultMode`, `additionalDirectories`
- **MCP:** `enableAllProjectMcpServers`, `allowedMcpServers`, `deniedMcpServers`
- **Hooks:** `hooks`, `disableAllHooks`
- **Sandbox:** `enabled`, `autoAllowBashIfSandboxed`, `excludedCommands`
- **Network:** `allowUnixSockets`, `allowLocalBinding`, `httpProxyPort`
- **AWS:** `awsAuthRefresh`, `awsCredentialExport`
- **Display:** `statusLine`, `outputStyle`, `includeCoAuthoredBy`

### 7. Hook Events (9 events)
**File:** `hook-events.txt`

Event hooks for customizing behavior:
- `PreToolUse` - Before tool execution
- `PostToolUse` - After tool execution
- `UserPromptSubmit` - Before processing user prompt
- `Stop` - When agent finishes
- `SubagentStop` - When subagent finishes
- `SessionStart` - Session initialization
- `SessionEnd` - Session termination
- `PreCompact` - Before context compaction
- `Notification` - Notification events

### 8. Permission Modes (4 modes)
**File:** `permission-modes.txt`

Permission control modes:
- `default` - Standard permission prompts
- `acceptEdits` - Auto-accept file edits
- `plan` - Planning mode (no tool execution)
- `bypassPermissions` - Skip all prompts (dangerous)

### 9. Agent Types (6 types)
**File:** `agent-types.txt`

Subagent types:
- `general-purpose` - General task handling
- `Explore` - Codebase exploration
- `Plan` - Planning and analysis
- `code-reviewer` - Code review
- `debugger` - Debugging specialist
- `test-runner` - Test execution

### 10. JSON Field Names (13 fields)
**File:** `json-field-names.txt`

Common JSON field names in API/config:
- `stdin`, `stdout`, `stderr` - I/O streams
- `cwd` - Current working directory
- `transcript_path` - Conversation transcript
- `session_id`, `agent_id` - Identifiers
- `tool_name`, `tool_input`, `tool_response` - Tool data
- `hook_event_name` - Hook event type
- `permission_mode` - Current permission mode
- `stop_hook_active` - Stop hook status
- `source` - Event source

### 11. Config Field Names (18 fields)
**File:** `config-field-names.txt`

Configuration object field names:
- `serverName`, `command`, `description`, `prompt`
- `tools`, `model`, `matcher`, `hooks`
- `type`, `timeout`, `decision`, `reason`
- `continue`, `permissionDecision`, `permissionDecisionReason`
- `additionalContext`, `hookSpecificOutput`, `hookEventName`

### 12. File Paths (15 paths)
**File:** `file-paths.txt`

Standard Claude Code file paths:
- `.claude/commands/` - Custom slash commands
- `.claude/agents/` - Custom agent definitions
- `.claude/hooks/` - Hook scripts
- `.claude/skills/` - Agent skills
- `.claude/output-styles/` - Output style configurations
- `settings.json` - Project/user settings
- `settings.local.json` - Local settings (not committed)
- `managed-settings.json` - Enterprise managed settings
- `managed-mcp.json` - Enterprise MCP configuration
- `.mcp.json` - MCP server definitions
- `CLAUDE.md` - Project memory/instructions

### 13. MCP Tool Patterns (18 patterns)
**File:** `mcp-tools.txt`

MCP tool naming patterns:
- `mcp__<server>__<tool>` - Standard format
- `mcp__github__*` - GitHub operations
- `mcp__memory__*` - Memory operations
- `mcp__filesystem__*` - Filesystem operations
- `mcp__puppeteer__*` - Browser automation
- `mcp__jira__*` - Jira integration

### 14. Function Names (44 functions)
**File:** `function-names-sample.txt`

Common function names from code examples:
- `generateClaudeCodeCommand`, `validate_command`
- `get_*` - Getter functions (cost, model, project_dir, etc.)
- `read`, `open`, `parse`, `load` - File operations
- Standard library: `split`, `join`, `map`, `filter`, `reduce`

### 15. Variable Names (24 variables)
**File:** `variable-names.txt`

Variable names from documentation examples:
- `claudeCodeCommand`, `baseCommand`, `commandToShow`
- `currentDir`, `projectDir`, `gitBranch`
- `servers`, `mcpUrl`, `filteredServers`
- `model`, `status`, `data`, `input`

### 16. URLs and API Endpoints (160+ URLs)
**File:** `urls.txt`

API endpoints and documentation URLs:
- `https://api.anthropic.com` - Main API
- `https://console.anthropic.com` - Console
- `https://claude.ai` - Claude.ai
- Third-party integrations (Bedrock, Vertex AI, etc.)

## Usage

These extracted symbols can be used for:

1. **Deobfuscation:** Match obfuscated names to likely original names
2. **Type Definitions:** Create TypeScript definitions
3. **Documentation:** Generate comprehensive API documentation
4. **Testing:** Verify all documented features exist in code
5. **Analysis:** Understand the complete feature set

## Statistics

| Category | Count |
|----------|-------|
| Tool Names | 17 |
| CLI Flags | 110 |
| Slash Commands | 33 |
| Environment Variables | 30 |
| Model Names | 18 |
| Configuration Keys | 37 |
| Hook Events | 9 |
| Permission Modes | 4 |
| Agent Types | 6 |
| JSON Fields | 13 |
| Config Fields | 18 |
| File Paths | 15 |
| MCP Patterns | 18 |
| Function Names | 44 |
| Variable Names | 24 |
| URLs | 160+ |

**Total unique symbols:** ~600+

## Next Steps

1. Use these symbols to map obfuscated identifiers in `deobfuscated.js`
2. Search the deobfuscated code for these exact strings
3. Create rename mappings for Phase 2 of deobfuscation
4. Generate TypeScript type definitions
5. Cross-reference with SDK tools definitions

## See Also

- Parent directory: Complete Claude Code documentation (30 files)
- `deobfuscated/` folder: Deobfuscated source code
- `package/sdk-tools.d.ts`: Official TypeScript definitions
