# Configuration Module

Application configuration, environment variables, and system settings management.

## Overview

This module centralizes all configuration-related functionality including:
- Configuration directory management
- Boolean parsing from environment variables
- Cloud provider region configuration (AWS, Google Cloud)
- Environment variable parsing and validation

## Directory & Path Configuration

### `getClaudeConfigDir()`

Gets the Claude Code configuration directory path.

```javascript
import { getClaudeConfigDir } from './config/index.js';

const configDir = getClaudeConfigDir();
// Returns: /home/user/.claude (default)
// Or: process.env.CLAUDE_CONFIG_DIR if set
```

**Environment Variables:**
- `CLAUDE_CONFIG_DIR` - Override the default configuration directory

## Boolean Parsing Utilities

### `parseBoolean(value)`

Parses various formats into boolean values. Accepts truthy strings like "1", "true", "yes", "on".

```javascript
parseBoolean("true");    // true
parseBoolean("1");       // true
parseBoolean("yes");     // true
parseBoolean("on");      // true
parseBoolean("false");   // false
parseBoolean("");        // false
parseBoolean(true);      // true
```

### `parseBooleanNegative(value)`

Parses values into negated boolean. Returns true for "0", "false", "no", "off".

```javascript
parseBooleanNegative("false");  // true
parseBooleanNegative("0");      // true
parseBooleanNegative("no");     // true
parseBooleanNegative("off");    // true
parseBooleanNegative("true");   // false
parseBooleanNegative(true);     // false
```

## Environment Variable Parsing

### `parseEnvironmentVariables(envVars)`

Parses environment variable strings into an object. Expected format: `KEY1=value1 KEY2=value2`

```javascript
const envVars = ["API_KEY=secret123", "DEBUG=true"];
const parsed = parseEnvironmentVariables(envVars);
// { API_KEY: "secret123", DEBUG: "true" }
```

**Throws:**
- `Error` - If environment variable format is invalid (missing key or value)

## Cloud Region Configuration

### `getAWSRegion()`

Gets the AWS region for Bedrock API calls.

```javascript
const region = getAWSRegion();
// Returns: process.env.AWS_REGION
// Or: process.env.AWS_DEFAULT_REGION
// Or: "us-east-1" (default)
```

**Environment Variables:**
- `AWS_REGION` - Primary AWS region setting
- `AWS_DEFAULT_REGION` - Fallback AWS region setting

### `getDefaultCloudMLRegion()`

Gets the default Google Cloud ML region.

```javascript
const region = getDefaultCloudMLRegion();
// Returns: process.env.CLOUD_ML_REGION
// Or: "us-east5" (default)
```

**Environment Variables:**
- `CLOUD_ML_REGION` - Google Cloud ML region

### `getVertexRegionForModel(modelName)`

Gets the appropriate Google Cloud Vertex AI region for a specific Claude model.

```javascript
const region = getVertexRegionForModel("claude-sonnet-4-5");
// Returns model-specific region or default

const region2 = getVertexRegionForModel("claude-opus-4");
// Checks VERTEX_REGION_CLAUDE_4_0_OPUS env var
```

**Supported Models:**
- `claude-haiku-4-5` → `VERTEX_REGION_CLAUDE_HAIKU_4_5`
- `claude-3-5-haiku` → `VERTEX_REGION_CLAUDE_3_5_HAIKU`
- `claude-3-5-sonnet` → `VERTEX_REGION_CLAUDE_3_5_SONNET`
- `claude-3-7-sonnet` → `VERTEX_REGION_CLAUDE_3_7_SONNET`
- `claude-opus-4-1` → `VERTEX_REGION_CLAUDE_4_1_OPUS`
- `claude-opus-4` → `VERTEX_REGION_CLAUDE_4_0_OPUS`
- `claude-sonnet-4-5` → `VERTEX_REGION_CLAUDE_4_5_SONNET`
- `claude-sonnet-4` → `VERTEX_REGION_CLAUDE_4_0_SONNET`

Falls back to `getDefaultCloudMLRegion()` if model-specific region not set.

## Behavior Configuration

### `shouldMaintainProjectWorkingDir()`

Determines if Bash commands should maintain the project working directory.

```javascript
const maintain = shouldMaintainProjectWorkingDir();
// Returns: parseBoolean(process.env.CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR)
```

**Environment Variables:**
- `CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR` - Set to "true", "1", "yes", or "on" to enable

## Configuration Constants

### `CONFIG_DEFAULTS`

Default configuration values used throughout the application.

```javascript
import { CONFIG_DEFAULTS } from './config/index.js';

console.log(CONFIG_DEFAULTS.BASH_MAX_OUTPUT_LENGTH);  // 30000
console.log(CONFIG_DEFAULTS.AWS_REGION);              // "us-east-1"
console.log(CONFIG_DEFAULTS.CLOUD_ML_REGION);         // "us-east5"
```

### `ENV_VARS`

Object containing all environment variable names used by the application.

```javascript
import { ENV_VARS } from './config/index.js';

console.log(ENV_VARS.CLAUDE_CONFIG_DIR);  // "CLAUDE_CONFIG_DIR"
console.log(ENV_VARS.AWS_REGION);         // "AWS_REGION"
```

Useful for documentation, validation, and avoiding string typos.

## Utilities

### `noop()`

No-op function for default/placeholder callbacks.

```javascript
import { noop } from './config/index.js';

const callback = shouldLog ? logFunction : noop;
callback();  // Safe to call even if logging disabled
```

## Complete Environment Variable List

| Variable | Purpose | Default |
|----------|---------|---------|
| `CLAUDE_CONFIG_DIR` | Configuration directory | `~/.claude` |
| `AWS_REGION` | AWS region | `us-east-1` |
| `AWS_DEFAULT_REGION` | AWS region fallback | `us-east-1` |
| `CLOUD_ML_REGION` | Google Cloud ML region | `us-east5` |
| `VERTEX_REGION_CLAUDE_*` | Model-specific Vertex regions | Falls back to `CLOUD_ML_REGION` |
| `CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR` | Maintain working directory | `false` |

## Dependencies

- `path` - For path joining
- `os` - For homedir lookup

## Usage Examples

### Basic Configuration

```javascript
import {
  getClaudeConfigDir,
  getAWSRegion,
  parseBoolean
} from './config/index.js';

const configDir = getClaudeConfigDir();
const awsRegion = getAWSRegion();
const debugEnabled = parseBoolean(process.env.DEBUG);
```

### Model-Specific Configuration

```javascript
import { getVertexRegionForModel } from './config/index.js';

const models = [
  "claude-sonnet-4-5",
  "claude-opus-4",
  "claude-3-5-haiku"
];

for (const model of models) {
  const region = getVertexRegionForModel(model);
  console.log(`${model}: ${region}`);
}
```

### Environment Variable Parsing

```javascript
import { parseEnvironmentVariables } from './config/index.js';

const envArgs = [
  "API_KEY=secret",
  "TIMEOUT=5000",
  "BASE_URL=https://api.example.com"
];

const env = parseEnvironmentVariables(envArgs);
// { API_KEY: "secret", TIMEOUT: "5000", BASE_URL: "https://api.example.com" }
```

## Notes

- All cloud region functions provide sensible defaults
- Boolean parsing is case-insensitive and handles whitespace
- Environment variable parsing validates format and throws on errors
- Model-specific Vertex regions follow a consistent naming pattern
- Configuration is read-only; no mutation functions provided
