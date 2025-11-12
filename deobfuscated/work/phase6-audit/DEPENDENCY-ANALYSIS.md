# Dependency Analysis

## Overview

Comprehensive analysis of all dependencies, versions, and library usage in Claude Code CLI based on static analysis of the deobfuscated bundle.

## Identified Dependencies

### Core Framework & CLI

| Package | Version | Purpose |
|---------|---------|---------|
| **commander** | 9.15.1 | CLI framework and argument parsing |
| **localforage** | 1.3.0 | Browser-style storage for Node.js |
| **rxjs** | 7.0.0 | Reactive programming library |

### React Ecosystem

| Package | Version | Purpose |
|---------|---------|---------|
| **react** | 18.3.1 | UI rendering (likely for terminal UI) |
| **react-reconciler** | 18.3.1 | Custom React renderer |

### AWS SDK

| Package | Version | Purpose |
|---------|---------|---------|
| **@aws-sdk/client-bedrock** | 3.840.0 | AWS Bedrock model listing |
| **@aws-sdk/client-bedrock-runtime** | 3.797.0 | AWS Bedrock model invocation |

### Observability & Telemetry

| Package | Version | Purpose |
|---------|---------|---------|
| **@opentelemetry/*** | 0.204.0 | Multiple packages for metrics/tracing |
| **@sentry/node** | (VERSION: 2.0.37 appears throughout) | Error reporting |
| **statsig** | (client base class found) | A/B testing and feature flags |

### MCP Protocol

| Package | Version | Purpose |
|---------|---------|---------|
| **@modelcontextprotocol/sdk** | 3.12.1 (SDK_VERSION) | MCP server/client implementation |

### Utilities

| Package | Version | Purpose |
|---------|---------|---------|
| **semver** | (SEMVER_SPEC_VERSION: 2.0.0) | Semantic versioning |
| **zod** | (multiple schemas found) | Runtime type validation |

## OpenTelemetry Dependencies

From version strings (lines 69-76):

```javascript
MK2.VERSION = "0.204.0"  // @opentelemetry/api
UD2.VERSION = "0.204.0"  // @opentelemetry/core
VN2.VERSION = "0.204.0"  // @opentelemetry/resources
rL2.VERSION = "0.204.0"  // @opentelemetry/sdk-metrics
KM2.VERSION = "0.204.0"  // @opentelemetry/sdk-trace-base
oO2.VERSION = "0.204.0"  // @opentelemetry/semantic-conventions
DR2.VERSION = "0.204.0"  // @opentelemetry/sdk-trace-node
```

**Analysis**: Complete OpenTelemetry suite for metrics and distributed tracing.

## Sentry Error Reporting

Version: 2.0.37 (appears 40+ times throughout codebase)

**Integration points**:
- Error boundary wrapping
- Unhandled exception capture
- Network error reporting
- Tool execution error tracking

## Version Compatibility

### npm Version Constraints

```javascript
// Line 5-6 (from version-strings.txt)
minNpmVersion: "4.13.0"
maxNpmVersion: "4.21.0"

// Line 7
minNpmVersion: "4.22.0"
```

**Analysis**: Different version ranges for different components, suggesting compatibility requirements.

### Node.js Compatibility

From imports:
```javascript
import { createRequire } from "node:module"  // Node.js 12.2.0+
import { randomUUID } from "crypto"          // Node.js 14.17.0+
import { setTimeout } from "node:timers/promises"  // Node.js 15.0.0+
```

**Minimum Node.js version**: 15.0.0+

## Security Considerations

### Dependency Age

- ✅ React 18.3.1 - Current major version (18.x)
- ⚠️ LocalForage 1.3.0 - Last updated 2021 (potential staleness)
- ✅ Commander 9.15.1 - Recent version
- ⚠️ AWS SDK 3.840.0 - Check for security updates

### Known Vulnerabilities

**Static analysis limitations**: Cannot run `npm audit` without package.json. Requires source repository access.

**Recommendation**:
```bash
# Claude Code maintainers should run:
npm audit
npm audit fix

# Or with yarn:
yarn audit
yarn upgrade-interactive --latest
```

## Bundle Analysis

### Bundle Structure (Browserify)

```json
{
  "type": "browserify",
  "entryId": "4",
  "modules": [
    {"id": "1", "path": "node_modules/1/index.js"},
    {"id": "2", "path": "node_modules/2/index.js"},
    {"id": "3", "path": "node_modules/3/index.js"},
    {"id": "4", "path": "index.js"}
  ]
}
```

**Size**: 15MB deobfuscated JavaScript

**Analysis**:
- Large bundle size suggests many embedded dependencies
- Browserify bundle format (older bundler, webpack/rollup more common now)
- All dependencies vendored at build time

## Licensing Considerations

**Unknown**: License information not visible in deobfuscated code

**Recommendation**: Check source repository for:
- MIT, Apache 2.0, BSD licenses (permissive)
- GPL, AGPL licenses (copyleft - may have implications)
- Each dependency's license

## Dependency Tree Depth

**Estimated transitive dependencies**: 100+ packages

**Direct dependencies observed**: 30-40 packages

**Analysis**: Medium to large dependency tree typical for modern Node.js applications

## Related Documentation

- **Phase 6**: [SECURITY-AUDIT.md](./SECURITY-AUDIT.md) - Security implications of dependencies

**Generated**: 2025-11-12
