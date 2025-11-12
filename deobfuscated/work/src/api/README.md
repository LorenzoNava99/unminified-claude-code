# API Client Module

Anthropic API client for Claude Code CLI with multi-provider support.

## Overview

This module provides API clients for interacting with Claude models across multiple providers:
- **Anthropic Direct** - Direct API access
- **AWS Bedrock** - Claude on AWS
- **Google Vertex AI** - Claude on GCP
- **Azure** - Claude on Azure (if supported)

## Key Components

### API Client

Main client for making API requests:

```javascript
class APIClient {
  constructor(config) {
    this.provider = config.provider;
    this.apiKey = config.apiKey;
    this.model = config.model;
  }

  /**
   * Send message to Claude
   */
  async sendMessage(messages, options) { }

  /**
   * Stream response from Claude
   */
  async *streamMessage(messages, options) { }

  /**
   * List available models
   */
  async listModels() { }
}
```

## Provider Support

### Anthropic Direct

Direct API access to Anthropic:

```javascript
import { AnthropicClient } from './api/anthropic.js';

const client = new AnthropicClient({
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: 'claude-sonnet-4-5-20250929'
});

const response = await client.sendMessage([
  { role: 'user', content: 'Hello, Claude!' }
]);
```

### AWS Bedrock

Claude via AWS Bedrock:

```javascript
import { BedrockClient } from './api/bedrock.js';

const client = new BedrockClient({
  region: 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  model: 'anthropic.claude-3-5-sonnet-20240620-v1:0'
});

const response = await client.sendMessage([
  { role: 'user', content: 'Hello, Claude!' }
]);
```

### Google Vertex AI

Claude via Google Cloud Vertex AI:

```javascript
import { VertexClient } from './api/vertex.js';

const client = new VertexClient({
  project: 'my-gcp-project',
  location: 'us-east5',
  model: 'claude-3-5-sonnet@20240620',
  credentials: gcpCredentials
});

const response = await client.sendMessage([
  { role: 'user', content: 'Hello, Claude!' }
]);
```

## Message Format

### Request Format

```javascript
{
  model: string,
  messages: [
    {
      role: 'user' | 'assistant',
      content: string | ContentBlock[]
    }
  ],
  max_tokens: number,
  temperature?: number,
  top_p?: number,
  top_k?: number,
  stop_sequences?: string[],
  system?: string,
  metadata?: object,
  stream?: boolean,
  tools?: Tool[]
}
```

### Response Format

```javascript
{
  id: string,
  type: 'message',
  role: 'assistant',
  content: ContentBlock[],
  model: string,
  stop_reason: 'end_turn' | 'max_tokens' | 'stop_sequence' | 'tool_use',
  usage: {
    input_tokens: number,
    output_tokens: number
  }
}
```

## Streaming

### Stream Messages

```javascript
const stream = client.streamMessage([
  { role: 'user', content: 'Write a story' }
]);

for await (const chunk of stream) {
  if (chunk.type === 'content_block_delta') {
    process.stdout.write(chunk.delta.text);
  }
}
```

### Stream Event Types

- `message_start` - Message begins
- `content_block_start` - Content block begins
- `content_block_delta` - Incremental content
- `content_block_stop` - Content block ends
- `message_delta` - Message metadata update
- `message_stop` - Message complete

## Tool Use

### Define Tools

```javascript
const tools = [
  {
    name: 'get_weather',
    description: 'Get weather for a location',
    input_schema: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'City name'
        }
      },
      required: ['location']
    }
  }
];
```

### Send with Tools

```javascript
const response = await client.sendMessage(
  [{ role: 'user', content: 'What is the weather in NYC?' }],
  { tools }
);

if (response.stop_reason === 'tool_use') {
  const toolUse = response.content.find(block => block.type === 'tool_use');

  // Execute tool
  const result = await executeToolexecute(toolUse.name, toolUse.input);

  // Continue conversation with result
  const followUp = await client.sendMessage([
    { role: 'user', content: 'What is the weather in NYC?' },
    { role: 'assistant', content: response.content },
    {
      role: 'user',
      content: [{
        type: 'tool_result',
        tool_use_id: toolUse.id,
        content: JSON.stringify(result)
      }]
    }
  ]);
}
```

## Error Handling

### API Errors

```javascript
try {
  const response = await client.sendMessage(messages);
} catch (error) {
  if (error.status === 429) {
    // Rate limited
    console.error('Rate limit exceeded');
  } else if (error.status === 401) {
    // Authentication failed
    console.error('Invalid API key');
  } else if (error.status === 400) {
    // Bad request
    console.error('Invalid request:', error.message);
  } else {
    // Other error
    console.error('API error:', error);
  }
}
```

## Rate Limiting

### Rate Limit Headers

```javascript
const response = await client.sendMessage(messages);

console.log('Requests remaining:', response.headers['anthropic-ratelimit-requests-remaining']);
console.log('Tokens remaining:', response.headers['anthropic-ratelimit-tokens-remaining']);
console.log('Reset at:', response.headers['anthropic-ratelimit-requests-reset']);
```

### Retry Logic

```javascript
async function sendWithRetry(client, messages, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await client.sendMessage(messages);
    } catch (error) {
      if (error.status === 429 && i < maxRetries - 1) {
        // Wait before retrying
        const delay = Math.pow(2, i) * 1000;
        await sleep(delay);
      } else {
        throw error;
      }
    }
  }
}
```

## Caching

### Prompt Caching

```javascript
const response = await client.sendMessage([
  {
    role: 'user',
    content: [
      {
        type: 'text',
        text: 'Large context...',
        cache_control: { type: 'ephemeral' }
      },
      {
        type: 'text',
        text: 'Question about the context'
      }
    ]
  }
]);
```

## Response Validation

Validate API responses:

```javascript
import { validateResponse } from './api/validation.js';

const response = await client.sendMessage(messages);
const isValid = validateResponse(response);

if (!isValid) {
  throw new Error('Invalid API response');
}
```

## Multi-Provider Factory

Create clients for different providers:

```javascript
import { createClient } from './api/factory.js';

const client = createClient({
  provider: 'anthropic', // or 'bedrock', 'vertex'
  apiKey: process.env.API_KEY,
  model: 'claude-sonnet-4-5'
});
```

## Usage Tracking

Track token usage:

```javascript
import { UsageTracker } from './api/usage.js';

const tracker = new UsageTracker();

tracker.on('usage', (usage) => {
  console.log('Input tokens:', usage.input_tokens);
  console.log('Output tokens:', usage.output_tokens);
  console.log('Total cost:', usage.cost);
});

const response = await client.sendMessage(messages);
tracker.track(response.usage);
```

## Dependencies

- **HTTP Client Module** - HTTP requests
- **OAuth Module** - Authentication (for some providers)
- **Validation Module** - Request/response validation
- **Configuration Module** - API configuration
- **Utilities Module** - Helper functions
