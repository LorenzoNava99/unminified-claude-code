# MCP Protocol Module

Model Context Protocol (MCP) client implementation and transport layer.

## Overview

This module implements the Model Context Protocol, providing client functionality for communicating with MCP servers. It includes:
- SSE (Server-Sent Events) transport
- Streamable HTTP transport
- OAuth 2.0 authentication
- Protocol message handling
- Session management and reconnection

## Key Components

### Transport Classes

The module provides two transport implementations:

1. **SSEClientTransport** (`_MA`)
   - Server-Sent Events based transport
   - Supports OAuth authentication
   - Event-driven message receiving
   - Automatic reconnection

2. **StreamableHTTPClientTransport** (`s81`)
   - HTTP-based streaming transport
   - Session management with `mcp-session-id` header
   - Resumption token support
   - Configurable reconnection options

### Protocol Headers

The MCP protocol uses custom HTTP headers:
- `mcp-protocol-version` - Protocol version identifier
- `mcp-session-id` - Session tracking identifier
- `last-event-id` - Event stream resumption token

## Transport Features

### Authentication

Both transports support OAuth 2.0 authentication:
- Bearer token authentication
- Automatic token refresh
- Resource metadata URL discovery
- Authorization code flow

### Reconnection

Configurable automatic reconnection:
- Exponential backoff
- Maximum retry attempts
- Initial reconnection delay
- Delay growth factor

### Error Handling

Comprehensive error handling:
- Authentication errors (401)
- Connection errors
- Protocol errors
- Custom error callbacks

## Usage Examples

### SSE Transport

```javascript
import { SSEClientTransport } from './mcp/index.js';

const transport = new SSEClientTransport(
  new URL('https://example.com/mcp'),
  {
    authProvider: myAuthProvider,
    eventSourceInit: {},
    requestInit: {}
  }
);

transport.onmessage = (message) => {
  console.log('Received:', message);
};

transport.onerror = (error) => {
  console.error('Error:', error);
};

await transport.start();
await transport.send({ method: 'ping' });
```

### Streamable HTTP Transport

```javascript
import { StreamableHTTPClientTransport } from './mcp/index.js';

const transport = new StreamableHTTPClientTransport(
  new URL('https://example.com/mcp'),
  {
    authProvider: myAuthProvider,
    sessionId: 'session-123',
    reconnectionOptions: {
      initialReconnectionDelay: 1000,
      maxReconnectionDelay: 30000,
      reconnectionDelayGrowFactor: 2,
      maxRetries: 5
    }
  }
);

transport.onmessage = (message) => {
  console.log('Received:', message);
};

await transport.start();
await transport.send({ method: 'listTools' });
```

## Protocol Message Types

The MCP protocol supports various message types:
- **Requests**: Method calls with IDs
- **Responses**: Results or errors for requests
- **Notifications**: One-way messages without IDs
- **Events**: Server-to-client notifications

## Authentication Flow

1. Client connects to server URL
2. Server responds with 401 and `www-authenticate` header
3. Client discovers resource metadata URL
4. Client initiates OAuth flow
5. Client receives authorization code
6. Client exchanges code for access token
7. Client retries connection with Bearer token

## Reconnection Strategy

Default reconnection options:
```javascript
{
  initialReconnectionDelay: 1000,    // 1 second
  maxReconnectionDelay: 30000,       // 30 seconds
  reconnectionDelayGrowFactor: 2,    // Double each time
  maxRetries: 5                      // Give up after 5 attempts
}
```

Reconnection delay calculation:
```
delay = min(
  initialDelay * (growthFactor ^ attemptNumber),
  maxDelay
)
```

## Session Management

### Session IDs

Sessions are tracked using the `mcp-session-id` header:
- Server provides session ID in response
- Client includes session ID in subsequent requests
- Enables server-side state management

### Resumption Tokens

SSE streams can be resumed using resumption tokens:
- Server provides token in event `id` field
- Client stores latest token
- On reconnection, client sends `last-event-id` header
- Server resumes from that point

## Error Types

### UnauthorizedError (`hV`)

Thrown when authentication fails or is required:
```javascript
class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
  }
}
```

### SSEError (`HY0`)

Thrown when SSE stream encounters errors:
```javascript
class SSEError extends Error {
  constructor(code, message, event) {
    super(`SSE error: ${message}`);
    this.code = code;
    this.event = event;
  }
}
```

### HTTPError (`xMA`)

Thrown when HTTP requests fail:
```javascript
class HTTPError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
```

## Implementation Notes

### SSEClientTransport

- Uses EventSource API for server-sent events
- Requires endpoint discovery before sending
- Server sends `endpoint` event with POST URL
- Automatic 401 handling with re-authentication
- Closes gracefully with abort signals

### StreamableHTTPClientTransport

- Supports both JSON and SSE responses
- Handles HTTP 202 (Accepted) for async operations
- Session ID persists across requests
- Reconnects SSE streams automatically
- Supports message replay with resumption tokens

## Configuration Options

### Transport Options

```javascript
{
  // OAuth provider for authentication
  authProvider?: AuthProvider,

  // Custom fetch function (for testing/proxying)
  fetch?: typeof fetch,

  // EventSource initialization options (SSE only)
  eventSourceInit?: EventSourceInit,

  // Request initialization options (headers, etc.)
  requestInit?: RequestInit,

  // Session ID for session tracking (HTTP only)
  sessionId?: string,

  // Reconnection configuration (HTTP only)
  reconnectionOptions?: ReconnectionOptions
}
```

### Reconnection Options

```javascript
{
  initialReconnectionDelay: number,    // Initial delay in ms
  maxReconnectionDelay: number,        // Maximum delay in ms
  reconnectionDelayGrowFactor: number, // Multiplier for each retry
  maxRetries: number                   // Max attempts (0 = infinite)
}
```

## Protocol Compliance

This implementation follows the Model Context Protocol specification:
- Message format validation
- Header handling
- Authentication flows
- Error responses
- Event streaming
- Session management

## Dependencies

- EventSource API (for SSE transport)
- Fetch API (for HTTP requests)
- TextDecoderStream (for stream processing)
- TransformStream (for SSE parsing)
- AbortController (for cancellation)

## Security Considerations

- Always use HTTPS in production
- Validate server certificates
- Secure OAuth token storage
- Implement token refresh before expiration
- Handle authentication errors gracefully
- Sanitize error messages before logging
- Use abort signals for cleanup
- Validate message origins for WebSocket

## Future Enhancements

- WebSocket transport implementation
- Binary message support
- Message compression
- Multiplexing support
- Rate limiting
- Message queuing
- Offline support
- Connection pooling

## Related Modules

- **OAuth Module** - Authentication provider implementation
- **HTTP Client Module** - Low-level HTTP utilities
- **Validation Module** - Message schema validation
