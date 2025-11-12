# OAuth Module

OAuth 2.0 authentication and authorization implementation.

## Overview

This module implements OAuth 2.0 authentication flows for secure API access. It includes:
- Authorization Code Flow with PKCE
- Token exchange and refresh
- Client registration (dynamic)
- Resource metadata discovery
- Authorization server metadata
- Token management

## Key Components

### OAuth Flows

#### Authorization Code Flow

Standard OAuth 2.0 authorization code flow with PKCE (Proof Key for Code Exchange).

```javascript
// 1. Generate PKCE challenge
const codeVerifier = generateCodeVerifier();
const codeChallenge = await generateCodeChallenge(codeVerifier);

// 2. Redirect to authorization endpoint
const authUrl = buildAuthorizationUrl({
  authorizationEndpoint: 'https://auth.example.com/authorize',
  clientId: 'your-client-id',
  redirectUri: 'https://your-app.com/callback',
  scope: 'read write',
  state: generateState(),
  codeChallenge,
  codeChallengeMethod: 'S256'
});

window.location.href = authUrl;

// 3. Handle callback
const params = new URLSearchParams(window.location.search);
const code = params.get('code');
const state = params.get('state');

// 4. Exchange code for tokens
const tokens = await exchangeCodeForTokens({
  tokenEndpoint: 'https://auth.example.com/token',
  clientId: 'your-client-id',
  code,
  redirectUri: 'https://your-app.com/callback',
  codeVerifier
});

console.log(tokens.access_token);
console.log(tokens.refresh_token);
```

#### Token Refresh

Refresh expired access tokens using refresh tokens.

```javascript
const newTokens = await refreshAccessToken({
  tokenEndpoint: 'https://auth.example.com/token',
  clientId: 'your-client-id',
  refreshToken: tokens.refresh_token
});

console.log(newTokens.access_token);
```

### Authorization Functions

#### `startAuthorization(serverUrl, options)`

Initiates the authorization flow.

```javascript
const result = await startAuthorization(
  new URL('https://auth.example.com'),
  {
    metadata: serverMetadata,
    clientInformation: clientInfo,
    scope: 'read write',
    redirectUri: 'https://app.com/callback',
    fetchFn: customFetch
  }
);

// Returns authorization URL or AUTHORIZED status
if (typeof result === 'string') {
  // Redirect to authorization URL
  window.location.href = result;
} else {
  // Already authorized
  console.log('Authorized!');
}
```

#### `exchangeCodeForTokens(serverUrl, options)`

Exchanges authorization code for access tokens.

```javascript
const tokens = await exchangeCodeForTokens(
  new URL('https://auth.example.com'),
  {
    metadata: serverMetadata,
    clientInformation: clientInfo,
    authorizationCode: code,
    redirectUri: 'https://app.com/callback',
    resource: resourceUrl,
    addClientAuthentication: authCallback,
    fetchFn: customFetch
  }
);

console.log(tokens);
// {
//   access_token: "...",
//   token_type: "Bearer",
//   expires_in: 3600,
//   refresh_token: "...",
//   scope: "read write"
// }
```

#### `refreshAccessToken(serverUrl, options)`

Refreshes an access token using a refresh token.

```javascript
const newTokens = await refreshAccessToken(
  new URL('https://auth.example.com'),
  {
    metadata: serverMetadata,
    clientInformation: clientInfo,
    refreshToken: currentTokens.refresh_token,
    resource: resourceUrl,
    addClientAuthentication: authCallback,
    fetchFn: customFetch
  }
);
```

#### `registerClient(serverUrl, options)`

Dynamically registers a new OAuth client.

```javascript
const clientInfo = await registerClient(
  new URL('https://auth.example.com'),
  {
    metadata: serverMetadata,
    clientMetadata: {
      client_name: "My Application",
      redirect_uris: ["https://app.com/callback"],
      grant_types: ["authorization_code", "refresh_token"],
      token_endpoint_auth_method: "none"
    },
    fetchFn: customFetch
  }
);

console.log(clientInfo.client_id);
```

### Metadata Discovery

#### Server Metadata

OAuth 2.0 authorization server metadata (RFC 8414).

```javascript
const metadata = await discoverMetadata(
  new URL('https://auth.example.com')
);

console.log(metadata);
// {
//   issuer: "https://auth.example.com",
//   authorization_endpoint: "https://auth.example.com/authorize",
//   token_endpoint: "https://auth.example.com/token",
//   registration_endpoint: "https://auth.example.com/register",
//   grant_types_supported: ["authorization_code", "refresh_token"],
//   response_types_supported: ["code"],
//   code_challenge_methods_supported: ["S256"],
//   token_endpoint_auth_methods_supported: ["none", "client_secret_basic"],
//   ...
// }
```

#### Resource Metadata

Resource server metadata for protected resources.

```javascript
const resourceMetadata = await discoverResourceMetadata(
  new URL('https://api.example.com/resource'),
  response // 401 response with WWW-Authenticate header
);

console.log(resourceMetadata);
// {
//   resource: "https://api.example.com",
//   authorization_servers: ["https://auth.example.com"]
// }
```

### PKCE (Proof Key for Code Exchange)

#### Generate Code Verifier

```javascript
const codeVerifier = generateCodeVerifier();
// Returns: Base64-URL encoded random string (43-128 characters)
```

#### Generate Code Challenge

```javascript
const codeChallenge = await generateCodeChallenge(codeVerifier);
// Returns: Base64-URL encoded SHA-256 hash of code verifier
```

### Client Authentication

#### Client Authentication Methods

Supported methods for authenticating clients:
- `none` - Public clients (no authentication)
- `client_secret_basic` - HTTP Basic Authentication
- `client_secret_post` - POST parameters
- `private_key_jwt` - JWT with private key
- `client_secret_jwt` - JWT with client secret

#### Add Client Authentication

```javascript
function addClientAuthentication(headers, params, serverUrl, metadata) {
  const method = selectAuthMethod(metadata);

  if (method === 'client_secret_basic') {
    const credentials = btoa(`${clientId}:${clientSecret}`);
    headers.set('Authorization', `Basic ${credentials}`);
  } else if (method === 'client_secret_post') {
    params.set('client_id', clientId);
    params.set('client_secret', clientSecret);
  }
  // ... other methods
}
```

## Token Management

### Token Structure

OAuth 2.0 access token response:

```javascript
{
  access_token: string,      // The access token
  token_type: string,         // Usually "Bearer"
  expires_in?: number,        // Seconds until expiration
  refresh_token?: string,     // Token for refreshing
  scope?: string              // Granted scopes (space-separated)
}
```

### Token Storage

Best practices for storing tokens:

```javascript
class TokenStorage {
  constructor() {
    this.tokens = null;
  }

  async saveTokens(tokens) {
    // Store securely (encrypted, keychain, etc.)
    this.tokens = {
      ...tokens,
      expires_at: Date.now() + (tokens.expires_in * 1000)
    };
  }

  async getTokens() {
    if (!this.tokens) return null;

    // Check if expired
    if (Date.now() >= this.tokens.expires_at) {
      return await this.refreshTokens();
    }

    return this.tokens;
  }

  async refreshTokens() {
    const newTokens = await refreshAccessToken(
      authServerUrl,
      {
        refreshToken: this.tokens.refresh_token,
        clientInformation: clientInfo
      }
    );

    await this.saveTokens(newTokens);
    return newTokens;
  }

  clearTokens() {
    this.tokens = null;
  }
}
```

## Authorization Provider Interface

```javascript
class AuthProvider {
  /**
   * Get current tokens
   * @returns {Promise<Tokens|null>}
   */
  async tokens() {
    // Return current valid tokens or null
  }

  /**
   * Start authorization flow
   * @returns {Promise<string|"AUTHORIZED">}
   */
  async authorize(options) {
    // Return authorization URL or AUTHORIZED status
  }

  /**
   * Finish authorization with code
   * @param {string} code - Authorization code
   * @returns {Promise<void>}
   */
  async finishAuthorization(code) {
    // Exchange code for tokens and store
  }

  /**
   * Refresh tokens
   * @returns {Promise<Tokens>}
   */
  async refresh() {
    // Refresh and return new tokens
  }
}
```

## Complete Example

Full OAuth 2.0 flow implementation:

```javascript
import {
  startAuthorization,
  exchangeCodeForTokens,
  refreshAccessToken,
  discoverMetadata
} from './oauth/index.js';

class OAuthClient {
  constructor(config) {
    this.serverUrl = new URL(config.authServer);
    this.clientId = config.clientId;
    this.redirectUri = config.redirectUri;
    this.scope = config.scope;
    this.tokens = null;
  }

  async initialize() {
    // Discover server metadata
    this.metadata = await discoverMetadata(this.serverUrl);
  }

  async login() {
    const result = await startAuthorization(
      this.serverUrl,
      {
        metadata: this.metadata,
        clientInformation: {
          client_id: this.clientId
        },
        scope: this.scope,
        redirectUri: this.redirectUri
      }
    );

    if (typeof result === 'string') {
      // Redirect to authorization URL
      return result;
    } else {
      // Already authorized
      return 'AUTHORIZED';
    }
  }

  async handleCallback(code) {
    this.tokens = await exchangeCodeForTokens(
      this.serverUrl,
      {
        metadata: this.metadata,
        clientInformation: {
          client_id: this.clientId
        },
        authorizationCode: code,
        redirectUri: this.redirectUri
      }
    );

    return this.tokens;
  }

  async getAccessToken() {
    if (!this.tokens) {
      throw new Error('Not authenticated');
    }

    // Check if token is expired
    if (this.isTokenExpired()) {
      await this.refreshToken();
    }

    return this.tokens.access_token;
  }

  async refreshToken() {
    this.tokens = await refreshAccessToken(
      this.serverUrl,
      {
        metadata: this.metadata,
        clientInformation: {
          client_id: this.clientId
        },
        refreshToken: this.tokens.refresh_token
      }
    );

    return this.tokens;
  }

  isTokenExpired() {
    if (!this.tokens?.expires_in) return false;
    const expiresAt = this.tokenReceivedAt + (this.tokens.expires_in * 1000);
    return Date.now() >= expiresAt;
  }

  async makeAuthenticatedRequest(url, options = {}) {
    const token = await this.getAccessToken();

    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      }
    });
  }

  logout() {
    this.tokens = null;
  }
}

// Usage
const client = new OAuthClient({
  authServer: 'https://auth.example.com',
  clientId: 'my-client-id',
  redirectUri: 'https://myapp.com/callback',
  scope: 'read write'
});

await client.initialize();

// Start login
const authUrl = await client.login();
if (authUrl !== 'AUTHORIZED') {
  window.location.href = authUrl;
}

// Handle callback
const code = new URLSearchParams(window.location.search).get('code');
await client.handleCallback(code);

// Make authenticated requests
const response = await client.makeAuthenticatedRequest(
  'https://api.example.com/data'
);
```

## Error Handling

### OAuth Errors

Standard OAuth 2.0 error responses:

```javascript
try {
  const tokens = await exchangeCodeForTokens(serverUrl, options);
} catch (error) {
  if (error.error) {
    // OAuth error response
    console.error('Error:', error.error);
    console.error('Description:', error.error_description);
    console.error('URI:', error.error_uri);

    // Common error codes:
    // - invalid_request
    // - invalid_client
    // - invalid_grant
    // - unauthorized_client
    // - unsupported_grant_type
    // - invalid_scope
  } else {
    // Network or other error
    console.error('Request failed:', error.message);
  }
}
```

## Security Considerations

1. **Always use HTTPS** - Never use OAuth over HTTP in production

2. **Use PKCE** - Required for public clients, recommended for all

3. **Validate state parameter** - Prevents CSRF attacks

4. **Secure token storage** - Never store tokens in localStorage
   - Use httpOnly cookies
   - Use secure session storage
   - Use platform keychains

5. **Implement token refresh** - Don't wait for 401 errors

6. **Short-lived access tokens** - Use refresh tokens for long sessions

7. **Validate redirect URIs** - Must match exactly

8. **Use appropriate scopes** - Request minimum necessary

9. **Handle errors gracefully** - Don't leak sensitive information

10. **Implement token revocation** - Allow users to revoke access

## Standards Compliance

This implementation follows:
- RFC 6749 - OAuth 2.0 Authorization Framework
- RFC 7636 - PKCE
- RFC 8414 - Authorization Server Metadata
- RFC 7662 - Token Introspection
- RFC 7009 - Token Revocation

## Dependencies

- `crypto` - For PKCE generation
- `Fetch API` - For HTTP requests
- `URL API` - For URL manipulation

## Related Modules

- **HTTP Client Module** - Used for making OAuth requests
- **MCP Protocol Module** - Uses OAuth for authentication
- **Configuration Module** - Stores OAuth settings
