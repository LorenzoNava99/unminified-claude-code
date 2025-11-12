# Session Module

Session state management and persistence for Claude Code CLI.

## Overview

This module manages user sessions including:
- Session state persistence
- Authentication tokens
- User preferences
- Session lifecycle management
- Multi-session support

## Key Components

### Session State

Tracks the current state of the Claude Code session:

```javascript
{
  sessionId: string,
  userId: string,
  authToken: string,
  startTime: number,
  lastActivity: number,
  preferences: {
    theme: string,
    model: string,
    language: string
  },
  context: {
    workingDirectory: string,
    projectRoot: string,
    gitBranch: string
  }
}
```

### Session Manager

```javascript
class SessionManager {
  /**
   * Initialize or resume session
   */
  async init() { }

  /**
   * Get current session
   */
  getSession() { }

  /**
   * Update session state
   */
  async updateSession(updates) { }

  /**
   * End current session
   */
  async endSession() { }

  /**
   * Check if session is valid
   */
  isValid() { }
}
```

## Usage Examples

### Initialize Session

```javascript
import { SessionManager } from './session/index.js';

const session = new SessionManager({
  storage: storageProvider,
  config: configProvider
});

await session.init();
```

### Session Lifecycle

```javascript
// Start new session
await session.start({
  userId: 'user123',
  authToken: 'token...'
});

// Update session
await session.update({
  lastActivity: Date.now(),
  context: { workingDirectory: '/path/to/project' }
});

// End session
await session.end();
```

### Session Persistence

Sessions are automatically persisted to storage and can be resumed:

```javascript
// On app startup
const existingSession = await session.load();
if (existingSession && session.isValid(existingSession)) {
  await session.resume(existingSession);
} else {
  await session.start();
}
```

## Features

- **Automatic persistence** - Sessions saved to storage
- **Token refresh** - Auto-refresh authentication tokens
- **Timeout handling** - Automatic session timeout
- **Activity tracking** - Track user activity
- **Context preservation** - Remember working directory, preferences
- **Multi-session** - Support multiple concurrent sessions

## Dependencies

- **Storage Module** - Session persistence
- **Configuration Module** - Session configuration
- **OAuth Module** - Authentication token management
- **Utilities Module** - Helper functions
