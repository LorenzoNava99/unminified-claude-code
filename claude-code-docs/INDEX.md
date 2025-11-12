# Claude Code Documentation Index

Complete documentation downloaded from https://code.claude.com/docs/en/

Downloaded: 2025-11-12
Total files: 30

## Main Documentation Pages

### 1. Core Documentation
- **overview.md** (122 lines) - Main overview of Claude Code
- **quickstart.md** (328 lines) - Getting started guide
- **setup.md** (214 lines) - Installation and setup instructions
- **common-workflows.md** (949 lines) - Advanced workflows and patterns
- **cli-reference.md** (126 lines) - CLI commands reference
- **interactive-mode.md** (169 lines) - Interactive mode features

### 2. Features & Capabilities
- **sub-agents.md** (479 lines) - Subagents and task delegation
- **plugins.md** (391 lines) - Plugin system overview
- **plugins-reference.md** (376 lines) - Plugin API reference
- **slash-commands.md** (499 lines) - Slash commands reference
- **hooks.md** (1063 lines) - Event hooks system
- **mcp.md** (1296 lines) - Model Context Protocol integration
- **memory.md** (103 lines) - Conversation memory management

### 3. Configuration & Customization
- **settings.md** (406 lines) - Configuration options
- **model-config.md** (126 lines) - Model configuration
- **statusline.md** (202 lines) - Status line customization
- **output-styles.md** (109 lines) - Output formatting options
- **iam.md** (200 lines) - Identity and access management
- **sandboxing.md** (205 lines) - Sandboxing and security isolation

### 4. Enterprise & Third-Party Integrations
- **third-party-integrations.md** (222 lines) - Enterprise deployment overview
- **amazon-bedrock.md** (227 lines) - AWS Bedrock integration
- **google-vertex-ai.md** (159 lines) - Google Vertex AI integration
- **llm-gateway.md** (145 lines) - LLM Gateway integration
- **network-config.md** (90 lines) - Network configuration
- **vs-code.md** (135 lines) - VS Code integration

### 5. Security & Compliance
- **security.md** (136 lines) - Security best practices
- **data-usage.md** (96 lines) - Data collection and usage policies
- **legal-and-compliance.md** (36 lines) - Legal and compliance information

### 6. Operations & Troubleshooting
- **troubleshooting.md** (336 lines) - Common issues and solutions
- **costs.md** (131 lines) - Cost management and tracking

## Documentation Statistics

Total lines of documentation: ~8,000+ lines
Largest files:
- mcp.md (1,296 lines, 42K)
- hooks.md (1,063 lines, 33K)
- common-workflows.md (949 lines, 26K)
- settings.md (406 lines, 50K)
- slash-commands.md (499 lines, 22K)

## Topics Covered

### Tools & Integrations
- Bash execution and shell management
- File operations (Read, Write, Edit, Glob, Grep)
- Web operations (WebFetch, WebSearch)
- Git workflows and GitHub integration
- MCP (Model Context Protocol) servers
- Third-party IDE integrations (VS Code, JetBrains)

### Agent System
- Task delegation to subagents
- Agent types (general-purpose, Explore, Plan)
- Agent communication patterns
- Context management

### Security & Permissions
- IAM permission system
- Sandboxing modes
- Credential management
- Tool-specific permissions
- Working directory restrictions

### Enterprise Features
- AWS Bedrock deployment
- Google Vertex AI deployment
- LLM Gateway support
- Network configuration options
- Enterprise policy management

### Customization
- Hooks (SessionStart, ToolResponse, UserPromptSubmit, etc.)
- Slash commands for custom workflows
- Plugins for extending functionality
- Status line customization
- Output format configuration

### Advanced Workflows
- Git commit and PR creation
- Code review patterns
- Testing automation
- Multi-file refactoring
- Codebase exploration

## Usage

All markdown files can be read directly or processed with markdown tools.

To search across all documentation:
```bash
grep -r "search term" *.md
```

To view a specific file:
```bash
cat overview.md
```

To get a list of all available topics:
```bash
ls -1 *.md
```
