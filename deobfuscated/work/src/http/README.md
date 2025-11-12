# HTTP Client Module

Axios-based HTTP client library for making HTTP requests with interceptor support.

## Overview

This module provides a full-featured HTTP client based on Axios. It includes:
- Promise-based HTTP requests
- Request/response interceptors
- Automatic JSON data transformation
- Request cancellation
- Custom configuration
- Error handling
- Browser and Node.js support

## Key Components

### Axios Class

The main HTTP client class that provides methods for making HTTP requests.

```javascript
class Axios {
  constructor(defaults) {
    this.defaults = defaults;
    this.interceptors = {
      request: new InterceptorManager(),
      response: new InterceptorManager(),
    };
  }

  async request(config) { }
  getUri(config) { }

  // HTTP method shortcuts
  get(url, config) { }
  delete(url, config) { }
  head(url, config) { }
  options(url, config) { }
  post(url, data, config) { }
  put(url, data, config) { }
  patch(url, data, config) { }
}
```

### InterceptorManager Class

Manages request and response interceptors.

```javascript
class InterceptorManager {
  constructor() {
    this.handlers = [];
  }

  use(fulfilled, rejected, options) {
    // Registers an interceptor
    // Returns: handler ID for ejection
  }

  eject(id) {
    // Removes an interceptor by ID
  }

  clear() {
    // Removes all interceptors
  }

  forEach(fn) {
    // Iterates over all handlers
  }
}
```

## Usage Examples

### Basic GET Request

```javascript
import axios from './http/axios.js';

// Simple GET request
const response = await axios.get('https://api.example.com/users');
console.log(response.data);

// GET request with parameters
const response2 = await axios.get('https://api.example.com/users', {
  params: {
    page: 1,
    limit: 10
  }
});
```

### POST Request

```javascript
import axios from './http/axios.js';

// POST request with JSON data
const response = await axios.post('https://api.example.com/users', {
  name: 'John Doe',
  email: 'john@example.com'
});

// POST request with custom headers
const response2 = await axios.post(
  'https://api.example.com/users',
  { name: 'Jane' },
  {
    headers: {
      'Authorization': 'Bearer token123',
      'Content-Type': 'application/json'
    }
  }
);
```

### Request Configuration

```javascript
import axios from './http/axios.js';

const config = {
  url: 'https://api.example.com/data',
  method: 'get', // default
  baseURL: 'https://api.example.com',

  // Custom headers
  headers: {
    'Authorization': 'Bearer token',
    'X-Custom-Header': 'value'
  },

  // Query parameters
  params: {
    id: 123,
    filter: 'active'
  },

  // Request body (POST, PUT, PATCH)
  data: {
    name: 'value'
  },

  // Timeout in milliseconds
  timeout: 5000,

  // Response type
  responseType: 'json', // 'arraybuffer', 'document', 'text', 'stream'

  // Maximum redirects
  maxRedirects: 5,

  // Validate status
  validateStatus: (status) => status >= 200 && status < 300
};

const response = await axios.request(config);
```

### Request Interceptors

Request interceptors allow you to modify requests before they are sent.

```javascript
import axios from './http/axios.js';

// Add a request interceptor
const requestId = axios.interceptors.request.use(
  (config) => {
    // Modify config before request is sent
    console.log('Request:', config.method, config.url);

    // Add authentication token
    config.headers.Authorization = `Bearer ${getToken()}`;

    // Add timestamp
    config.metadata = { startTime: new Date() };

    return config;
  },
  (error) => {
    // Handle request error
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Remove interceptor later
axios.interceptors.request.eject(requestId);
```

### Response Interceptors

Response interceptors allow you to process responses before they reach your code.

```javascript
import axios from './http/axios.js';

// Add a response interceptor
const responseId = axios.interceptors.response.use(
  (response) => {
    // Process successful response
    console.log('Response:', response.status, response.statusText);

    // Calculate request duration
    const duration = new Date() - response.config.metadata.startTime;
    console.log('Duration:', duration, 'ms');

    // Transform response data
    response.data = transformData(response.data);

    return response;
  },
  (error) => {
    // Handle response error
    if (error.response) {
      // Server responded with error status
      console.error('Error:', error.response.status, error.response.data);

      if (error.response.status === 401) {
        // Handle unauthorized
        refreshToken();
      }
    } else if (error.request) {
      // Request made but no response
      console.error('No response:', error.request);
    } else {
      // Error in request setup
      console.error('Request setup error:', error.message);
    }

    return Promise.reject(error);
  }
);

// Remove interceptor later
axios.interceptors.response.eject(responseId);
```

### Conditional Interceptors

Run interceptors conditionally based on request configuration.

```javascript
axios.interceptors.request.use(
  (config) => {
    // Add special header
    config.headers['X-Special'] = 'value';
    return config;
  },
  null,
  {
    // Only run for authenticated requests
    runWhen: (config) => config.authenticated === true
  }
);
```

### Synchronous Interceptors

By default, interceptors run asynchronously. You can make them synchronous:

```javascript
axios.interceptors.request.use(
  (config) => {
    config.headers['X-Request-ID'] = generateId();
    return config;
  },
  null,
  {
    synchronous: true // Run synchronously
  }
);
```

### Error Handling

```javascript
import axios from './http/axios.js';

try {
  const response = await axios.get('https://api.example.com/data');
  console.log(response.data);
} catch (error) {
  if (error.response) {
    // Server responded with error status (4xx, 5xx)
    console.error('Status:', error.response.status);
    console.error('Data:', error.response.data);
    console.error('Headers:', error.response.headers);
  } else if (error.request) {
    // Request was made but no response received
    console.error('No response received:', error.request);
  } else {
    // Error setting up the request
    console.error('Request setup error:', error.message);
  }

  console.error('Config:', error.config);
}
```

### Creating Instances

Create custom axios instances with specific defaults.

```javascript
import { Axios } from './http/axios.js';

const apiClient = new Axios({
  baseURL: 'https://api.example.com',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Use the instance
const response = await apiClient.get('/users');
```

### Request Cancellation

Cancel requests using AbortController.

```javascript
import axios from './http/axios.js';

const controller = new AbortController();

axios.get('https://api.example.com/data', {
  signal: controller.signal
})
  .then(response => console.log(response.data))
  .catch(error => {
    if (error.name === 'AbortError') {
      console.log('Request cancelled');
    }
  });

// Cancel the request
controller.abort();
```

## Configuration Options

### Request Config

```javascript
{
  // URL for the request
  url: '/user',

  // Request method
  method: 'get', // default

  // Base URL prepended to `url` unless `url` is absolute
  baseURL: 'https://api.example.com',

  // Allow absolute URLs even without baseURL
  allowAbsoluteUrls: true,

  // Custom headers
  headers: {
    'X-Requested-With': 'XMLHttpRequest'
  },

  // URL parameters
  params: {
    ID: 12345
  },

  // Custom parameter serializer
  paramsSerializer: {
    encode: (param) => encodeURIComponent(param),
    serialize: (params) => qs.stringify(params)
  },

  // Request body data
  data: {
    firstName: 'Fred'
  },

  // Timeout in milliseconds
  timeout: 1000,

  // Credentials mode
  withCredentials: false,

  // Response type
  responseType: 'json', // default

  // Response encoding
  responseEncoding: 'utf8', // default

  // XSRF token cookie name
  xsrfCookieName: 'XSRF-TOKEN', // default

  // XSRF header name
  xsrfHeaderName: 'X-XSRF-TOKEN', // default

  // Maximum response body size
  maxContentLength: Infinity,

  // Maximum request body size
  maxBodyLength: Infinity,

  // Maximum redirects
  maxRedirects: 5, // default

  // Validate status code
  validateStatus: (status) => status >= 200 && status < 300,

  // Socket path
  socketPath: null, // default

  // Abort signal
  signal: abortController.signal,

  // Transitional options
  transitional: {
    silentJSONParsing: true,
    forcedJSONParsing: true,
    clarifyTimeoutError: false
  }
}
```

### Response Schema

```javascript
{
  // Response data (parsed JSON for JSON responses)
  data: {},

  // HTTP status code
  status: 200,

  // HTTP status message
  statusText: 'OK',

  // Response headers
  headers: {},

  // Request configuration
  config: {},

  // Request that generated this response
  request: {}
}
```

## HTTP Methods

All HTTP methods are available as shortcuts:

```javascript
axios.request(config)
axios.get(url[, config])
axios.delete(url[, config])
axios.head(url[, config])
axios.options(url[, config])
axios.post(url[, data[, config]])
axios.put(url[, data[, config]])
axios.patch(url[, data[, config]])
```

## Advanced Features

### Automatic JSON Transformation

Axios automatically transforms JSON data in requests and responses:

```javascript
// Request data is automatically stringified
await axios.post('/user', { name: 'John' });
// Sent as: {"name":"John"}

// Response data is automatically parsed
const response = await axios.get('/user');
console.log(response.data.name); // "John"
```

### Form Data Support

```javascript
import FormData from 'form-data';

const form = new FormData();
form.append('file', fileStream);
form.append('field', 'value');

await axios.post('/upload', form, {
  headers: form.getHeaders()
});
```

### URL Building

```javascript
// Using params
axios.get('/user', {
  params: {
    id: 123,
    active: true
  }
});
// Requests: /user?id=123&active=true

// Get URI without making request
const uri = axios.getUri({
  baseURL: 'https://api.example.com',
  url: '/user',
  params: { id: 123 }
});
// Returns: "https://api.example.com/user?id=123"
```

## Error Types

### AxiosError

All errors thrown by Axios are instances of AxiosError:

```javascript
try {
  await axios.get('/user');
} catch (error) {
  console.log(error.name); // "AxiosError"
  console.log(error.message); // Error message
  console.log(error.code); // Error code (e.g., "ECONNABORTED")
  console.log(error.config); // Request config
  console.log(error.response); // Response object (if available)
  console.log(error.request); // Request object
}
```

## Dependencies

- Node.js built-ins:
  - `http` / `https` - HTTP client
  - `url` - URL parsing
  - `stream` - Stream handling
  - `zlib` - Compression
  - `crypto` - Random generation

## Best Practices

1. **Use Interceptors for Common Logic**
   - Authentication
   - Logging
   - Error handling
   - Request/response transformation

2. **Create Instances for Different APIs**
   ```javascript
   const github = new Axios({ baseURL: 'https://api.github.com' });
   const internal = new Axios({ baseURL: 'https://internal-api.com' });
   ```

3. **Handle Errors Properly**
   ```javascript
   try {
     const response = await axios.get(url);
     return response.data;
   } catch (error) {
     if (error.response) {
       // Handle API errors
     } else if (error.request) {
       // Handle network errors
     } else {
       // Handle other errors
     }
     throw error;
   }
   ```

4. **Use Timeouts**
   ```javascript
   axios.get(url, { timeout: 5000 }); // 5 second timeout
   ```

5. **Cancel Requests When Needed**
   ```javascript
   const controller = new AbortController();
   axios.get(url, { signal: controller.signal });
   // Later: controller.abort();
   ```

6. **Validate Responses**
   ```javascript
   axios.get(url, {
     validateStatus: (status) => status < 500
   });
   ```

## Performance Tips

- Reuse axios instances instead of creating new ones
- Use request/response interceptors instead of wrapping every call
- Set appropriate timeouts to avoid hanging requests
- Use streaming for large responses
- Enable compression for large payloads
- Pool connections when making many requests

## Related Modules

- **OAuth Module** - Authentication provider
- **Validation Module** - Request/response validation
- **MCP Protocol Module** - Uses HTTP client for transport
