# Storage Module

Client-side storage abstraction layer with LocalForage and storage provider pattern.

## Overview

This module provides a unified interface for client-side data persistence across multiple storage backends:
- **IndexedDB** (preferred, async, large capacity)
- **WebSQL** (fallback for older browsers)
- **localStorage** (fallback for minimal support)
- **sessionStorage** (temporary session data)
- **Memory storage** (no persistence, for testing)

## Key Concepts

### LocalForage

LocalForage is a fast and simple storage library that improves the offline experience by using asynchronous storage (IndexedDB or WebSQL) with a simple localStorage-like API.

**Benefits:**
- Asynchronous API (doesn't block UI)
- Multiple storage backends with automatic fallback
- Larger storage capacity than localStorage (typically 50MB+ vs 5-10MB)
- Stores complex data types (objects, arrays, blobs) natively
- Simple localStorage-compatible API

## Basic Usage

### Initialization

```javascript
import { Storage } from './storage/index.js';

// Initialize with default config
await Storage.init({
  name: 'claude-code',
  storeName: 'keyvaluepairs',
  driver: [
    Storage.INDEXEDDB,
    Storage.WEBSQL,
    Storage.LOCALSTORAGE
  ]
});
```

### Simple Storage Operations

```javascript
import { Storage } from './storage/index.js';

// Set item
await Storage.setItem('user', {
  id: 1,
  name: 'John Doe',
  preferences: { theme: 'dark' }
});

// Get item
const user = await Storage.getItem('user');
console.log(user.name); // "John Doe"

// Remove item
await Storage.removeItem('user');

// Clear all data
await Storage.clear();

// Get keys
const keys = await Storage.keys();
console.log(keys); // ['key1', 'key2', ...]

// Get length
const count = await Storage.length();
console.log(count); // Number of stored items
```

### Iteration

```javascript
// Iterate over all items
await Storage.iterate((value, key, iterationNumber) => {
  console.log(`[${iterationNumber}] ${key} =>`, value);

  // Return to stop iteration early
  if (key === 'stop') {
    return false;
  }
});
```

## Storage Backends

### IndexedDB (Preferred)

**Pros:**
- Large storage capacity (50MB+, can request more)
- Supports complex data structures natively
- Asynchronous, doesn't block UI
- Transactional, ACID compliant

**Cons:**
- More complex API (abstracted by LocalForage)
- Not available in all environments (e.g., private browsing)

**Usage:**
```javascript
const storage = Storage.createInstance({
  driver: Storage.INDEXEDDB,
  name: 'myDatabase',
  storeName: 'myStore'
});
```

### WebSQL (Fallback)

**Pros:**
- Good storage capacity
- SQL query support
- Asynchronous

**Cons:**
- Deprecated (but still supported)
- Only available in some browsers (Chrome, Safari)

**Usage:**
```javascript
const storage = Storage.createInstance({
  driver: Storage.WEBSQL,
  name: 'myDatabase',
  storeName: 'myStore'
});
```

### localStorage (Fallback)

**Pros:**
- Widely supported
- Simple synchronous API
- Persistent across sessions

**Cons:**
- Limited capacity (5-10MB)
- Only stores strings
- Synchronous (blocks UI)
- Can be cleared by user

**Usage:**
```javascript
const storage = Storage.createInstance({
  driver: Storage.LOCALSTORAGE,
  name: 'myDatabase'
});
```

### sessionStorage (Temporary)

**Pros:**
- Same as localStorage
- Automatically cleared on session end

**Cons:**
- Same as localStorage
- Data lost when tab/window closes

### Memory Storage (Testing)

**Pros:**
- Fast
- No persistence concerns
- Good for testing

**Cons:**
- Data lost on page refresh
- Limited by available memory

## Storage Provider Pattern

The codebase uses a Storage Provider abstraction that allows swapping storage implementations:

```javascript
class StorageProvider {
  /**
   * Get item from storage
   * @param {string} key - Storage key
   * @returns {Promise<any>} Stored value
   */
  async getItem(key) { }

  /**
   * Set item in storage
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   * @returns {Promise<void>}
   */
  async setItem(key, value) { }

  /**
   * Remove item from storage
   * @param {string} key - Storage key
   * @returns {Promise<void>}
   */
  async removeItem(key) { }

  /**
   * Get all keys
   * @returns {Promise<string[]>} Array of keys
   */
  async getAllKeys() { }

  /**
   * Clear all data
   * @returns {Promise<void>}
   */
  async clear() { }
}
```

### Custom Storage Provider

```javascript
// Custom provider (e.g., for React Native)
class AsyncStorageProvider {
  constructor(asyncStorage) {
    this.storage = asyncStorage;
  }

  async getItem(key) {
    const value = await this.storage.getItem(key);
    return value ? JSON.parse(value) : null;
  }

  async setItem(key, value) {
    await this.storage.setItem(key, JSON.stringify(value));
  }

  async removeItem(key) {
    await this.storage.removeItem(key);
  }

  async getAllKeys() {
    return await this.storage.getAllKeys();
  }

  async clear() {
    await this.storage.clear();
  }
}

// Use custom provider
Storage._setProvider(new AsyncStorageProvider(AsyncStorage));
```

## Configuration Options

### Database Configuration

```javascript
const config = {
  // Database name
  name: 'myApp',

  // Store name (like a table)
  storeName: 'keyvaluepairs',

  // Version (for migrations)
  version: 1.0,

  // Description
  description: 'My app storage',

  // Storage driver priority
  driver: [
    Storage.INDEXEDDB,
    Storage.WEBSQL,
    Storage.LOCALSTORAGE
  ],

  // Size (for WebSQL, in bytes)
  size: 4980736 // ~5MB
};

await Storage.init(config);
```

### Multiple Instances

Create separate storage instances for different purposes:

```javascript
// User data storage
const userStorage = Storage.createInstance({
  name: 'userData',
  storeName: 'users'
});

// Cache storage
const cacheStorage = Storage.createInstance({
  name: 'cache',
  storeName: 'responses'
});

// Session storage
const sessionStorage = Storage.createInstance({
  driver: Storage.LOCALSTORAGE,
  name: 'session'
});
```

## Common Patterns

### Caching API Responses

```javascript
async function fetchWithCache(url) {
  // Check cache first
  const cached = await Storage.getItem(`cache:${url}`);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  // Fetch from API
  const response = await fetch(url);
  const data = await response.json();

  // Cache for 1 hour
  await Storage.setItem(`cache:${url}`, {
    data,
    expires: Date.now() + 3600000
  });

  return data;
}
```

### User Preferences

```javascript
class PreferencesManager {
  constructor() {
    this.storage = Storage.createInstance({
      name: 'preferences',
      storeName: 'user'
    });
  }

  async get(key, defaultValue) {
    const value = await this.storage.getItem(key);
    return value !== null ? value : defaultValue;
  }

  async set(key, value) {
    await this.storage.setItem(key, value);
  }

  async getAll() {
    const prefs = {};
    await this.storage.iterate((value, key) => {
      prefs[key] = value;
    });
    return prefs;
  }

  async reset() {
    await this.storage.clear();
  }
}

// Usage
const prefs = new PreferencesManager();
await prefs.set('theme', 'dark');
await prefs.set('language', 'en');

const theme = await prefs.get('theme', 'light');
```

### Failed Request Queue

```javascript
class FailedRequestQueue {
  constructor() {
    this.storage = Storage.createInstance({
      name: 'requestQueue',
      storeName: 'failed'
    });
  }

  async add(request) {
    const id = `request_${Date.now()}_${Math.random()}`;
    await this.storage.setItem(id, {
      ...request,
      timestamp: Date.now()
    });
    return id;
  }

  async getAll() {
    const requests = [];
    await this.storage.iterate((value, key) => {
      requests.push({ id: key, ...value });
    });
    return requests.sort((a, b) => a.timestamp - b.timestamp);
  }

  async remove(id) {
    await this.storage.removeItem(id);
  }

  async retry() {
    const requests = await this.getAll();
    for (const request of requests) {
      try {
        await fetch(request.url, request.options);
        await this.remove(request.id);
      } catch (error) {
        console.error('Retry failed:', error);
      }
    }
  }
}
```

### Offline Data Sync

```javascript
class OfflineSync {
  constructor() {
    this.storage = Storage.createInstance({
      name: 'offlineData',
      storeName: 'pending'
    });
  }

  async savePending(operation, data) {
    const ops = await this.storage.getItem('operations') || [];
    ops.push({
      operation,
      data,
      timestamp: Date.now()
    });
    await this.storage.setItem('operations', ops);
  }

  async sync() {
    const ops = await this.storage.getItem('operations') || [];
    const failed = [];

    for (const op of ops) {
      try {
        await this.executeOperation(op);
      } catch (error) {
        failed.push(op);
      }
    }

    await this.storage.setItem('operations', failed);
    return { total: ops.length, failed: failed.length };
  }

  async executeOperation(op) {
    // Execute the operation
    await fetch('/api/sync', {
      method: 'POST',
      body: JSON.stringify(op)
    });
  }
}
```

## Error Handling

```javascript
try {
  await Storage.setItem('key', value);
} catch (error) {
  if (error.name === 'QuotaExceededError') {
    // Storage quota exceeded
    console.error('Storage full! Clearing old data...');
    await clearOldData();
  } else if (error.name === 'NotFoundError') {
    // Database not found (e.g., in private browsing)
    console.error('Storage not available');
    // Fall back to memory storage
  } else {
    console.error('Storage error:', error);
  }
}
```

## Debugging

### Check Current Driver

```javascript
const driver = await Storage.driver();
console.log('Using driver:', driver);
// "asyncStorage" (IndexedDB)
// "webSQLStorage" (WebSQL)
// "localStorageWrapper" (localStorage)
```

### Storage Info

```javascript
// Check if storage is ready
const ready = await Storage.ready();
console.log('Storage ready:', ready);

// Get all keys
const keys = await Storage.keys();
console.log('Stored keys:', keys);

// Get storage length
const length = await Storage.length();
console.log('Items stored:', length);
```

### Clear Storage

```javascript
// Clear all data
await Storage.clear();

// Drop entire database
await Storage.dropInstance({
  name: 'myApp',
  storeName: 'keyvaluepairs'
});
```

## Best Practices

1. **Always handle errors**
   ```javascript
   try {
     await Storage.setItem(key, value);
   } catch (error) {
     // Handle quota exceeded, etc.
   }
   ```

2. **Check storage availability**
   ```javascript
   if (Storage.supports(Storage.INDEXEDDB)) {
     // Use IndexedDB
   } else {
     // Fallback
   }
   ```

3. **Use appropriate storage for data lifetime**
   - Persistent user data → IndexedDB
   - Session data → sessionStorage
   - Cache → IndexedDB with expiration
   - Temporary data → Memory storage

4. **Implement cache invalidation**
   ```javascript
   async function invalidateCache(pattern) {
     const keys = await Storage.keys();
     for (const key of keys) {
       if (key.startsWith(pattern)) {
         await Storage.removeItem(key);
       }
     }
   }
   ```

5. **Batch operations when possible**
   ```javascript
   const operations = keys.map(key => Storage.removeItem(key));
   await Promise.all(operations);
   ```

6. **Monitor storage usage**
   ```javascript
   async function getStorageSize() {
     let size = 0;
     await Storage.iterate((value) => {
       size += JSON.stringify(value).length;
     });
     return size;
   }
   ```

## Security Considerations

- Storage is **not encrypted** by default
- Data is accessible to JavaScript on same origin
- Private browsing mode may disable storage
- Users can clear storage at any time
- Don't store sensitive data without encryption

### Encrypting Stored Data

```javascript
async function secureSetItem(key, value, encryptionKey) {
  const encrypted = await encrypt(JSON.stringify(value), encryptionKey);
  await Storage.setItem(key, encrypted);
}

async function secureGetItem(key, encryptionKey) {
  const encrypted = await Storage.getItem(key);
  if (!encrypted) return null;
  const decrypted = await decrypt(encrypted, encryptionKey);
  return JSON.parse(decrypted);
}
```

## Performance Tips

- Use batch operations for multiple items
- Implement pagination for large datasets
- Use appropriate indexes (IndexedDB)
- Clear old data periodically
- Compress large values before storing
- Use Web Workers for heavy operations

## Migration

### Migrating Between Versions

```javascript
async function migrate(fromVersion, toVersion) {
  if (fromVersion < 2 && toVersion >= 2) {
    // Migration from v1 to v2
    const oldData = await Storage.getItem('userData');
    await Storage.setItem('user', transformData(oldData));
    await Storage.removeItem('userData');
  }
}

// Run migrations
const currentVersion = 2;
const storedVersion = await Storage.getItem('version') || 1;
if (storedVersion < currentVersion) {
  await migrate(storedVersion, currentVersion);
  await Storage.setItem('version', currentVersion);
}
```

## Related Modules

- **Session Module** - Uses storage for session persistence
- **Configuration Module** - Stores user preferences
- **API Client Module** - Caches API responses
- **Tools Module** - Stores tool state

## Browser Support

- **IndexedDB**: Chrome 24+, Firefox 16+, Safari 8+, Edge All
- **WebSQL**: Chrome 4+, Safari 3.1+ (deprecated)
- **localStorage**: All modern browsers
- **sessionStorage**: All modern browsers

## Dependencies

- None (LocalForage is embedded)
- Uses native browser APIs (IndexedDB, WebSQL, localStorage)
