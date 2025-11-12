# Validation Module

Zod-based runtime type validation and schema definition.

## Overview

This module provides comprehensive runtime type validation using Zod. It includes:
- Schema definition and validation
- Type inference from schemas
- Parsing and safe parsing
- Transformation and refinement
- Custom error messages
- Composable validation rules

## Key Concepts

### Zod Overview

Zod is a TypeScript-first schema validation library that provides:
- Runtime type checking
- Static type inference
- Chainable API
- Composable schemas
- Detailed error messages

## Basic Usage

### Primitive Types

```javascript
import { z } from './validation/zod.js';

// String validation
const stringSchema = z.string();
stringSchema.parse("hello"); // "hello"
stringSchema.parse(123);     // throws ZodError

// Number validation
const numberSchema = z.number();
numberSchema.parse(42);      // 42
numberSchema.parse("42");    // throws ZodError

// Boolean validation
const boolSchema = z.boolean();
boolSchema.parse(true);      // true
boolSchema.parse("true");    // throws ZodError

// Other primitives
z.bigint()
z.date()
z.symbol()
z.undefined()
z.null()
z.void()
z.any()
z.unknown()
z.never()
```

### Object Schemas

```javascript
import { z } from './validation/zod.js';

// Define object schema
const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  age: z.number().int().positive().optional(),
  role: z.enum(['admin', 'user', 'guest']).default('user'),
  metadata: z.record(z.string(), z.any())
});

// Parse and validate
const user = userSchema.parse({
  id: 1,
  name: "John Doe",
  email: "john@example.com",
  age: 30,
  metadata: { verified: true }
});

// Type inference
type User = z.infer<typeof userSchema>;
// {
//   id: number;
//   name: string;
//   email: string;
//   age?: number;
//   role: 'admin' | 'user' | 'guest';
//   metadata: Record<string, any>;
// }
```

### Array Schemas

```javascript
import { z } from './validation/zod.js';

// Array of strings
const stringArraySchema = z.array(z.string());
stringArraySchema.parse(["a", "b", "c"]); // ["a", "b", "c"]

// Array with constraints
const limitedArray = z.array(z.number())
  .min(1, "At least one item required")
  .max(10, "Maximum 10 items allowed")
  .nonempty("Array cannot be empty");

// Non-empty array
const nonEmptyArray = z.string().array().nonempty();
```

### Union and Intersection

```javascript
import { z } from './validation/zod.js';

// Union types (OR)
const stringOrNumber = z.union([z.string(), z.number()]);
stringOrNumber.parse("hello"); // "hello"
stringOrNumber.parse(42);      // 42

// Discriminated unions
const eventSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('click'),
    x: z.number(),
    y: z.number()
  }),
  z.object({
    type: z.literal('keypress'),
    key: z.string()
  })
]);

// Intersection types (AND)
const withId = z.object({ id: z.string() });
const withTimestamp = z.object({ timestamp: z.number() });
const entity = z.intersection(withId, withTimestamp);
// Same as: z.object({ id: z.string(), timestamp: z.number() })
```

### Optional and Nullable

```javascript
import { z } from './validation/zod.js';

// Optional (value | undefined)
const optionalString = z.string().optional();
optionalString.parse("hello");     // "hello"
optionalString.parse(undefined);   // undefined
optionalString.parse(null);        // throws ZodError

// Nullable (value | null)
const nullableString = z.string().nullable();
nullableString.parse("hello");     // "hello"
nullableString.parse(null);        // null
nullableString.parse(undefined);   // throws ZodError

// Both (value | null | undefined)
const optionalNullable = z.string().optional().nullable();
// or: z.string().nullable().optional()
```

### Default Values

```javascript
import { z } from './validation/zod.js';

const configSchema = z.object({
  host: z.string().default("localhost"),
  port: z.number().default(3000),
  debug: z.boolean().default(false)
});

configSchema.parse({});
// { host: "localhost", port: 3000, debug: false }

configSchema.parse({ port: 8080 });
// { host: "localhost", port: 8080, debug: false }
```

## String Validation

### String Constraints

```javascript
import { z } from './validation/zod.js';

// Length constraints
z.string().min(3, "Too short")
z.string().max(255, "Too long")
z.string().length(10, "Must be exactly 10 characters")

// Pattern matching
z.string().regex(/^[a-z]+$/, "Lowercase letters only")
z.string().startsWith("prefix")
z.string().endsWith("suffix")
z.string().includes("substring")

// Built-in formats
z.string().email("Invalid email")
z.string().url("Invalid URL")
z.string().uuid("Invalid UUID")
z.string().cuid("Invalid CUID")
z.string().datetime("Invalid ISO datetime")

// Transformations
z.string().trim()
z.string().toLowerCase()
z.string().toUpperCase()
```

### Example: Email Validation

```javascript
const emailSchema = z.string()
  .email("Invalid email address")
  .toLowerCase()
  .trim();

emailSchema.parse("  USER@EXAMPLE.COM  ");
// "user@example.com"
```

## Number Validation

### Number Constraints

```javascript
import { z } from './validation/zod.js';

// Range constraints
z.number().min(0, "Must be positive")
z.number().max(100, "Too large")
z.number().positive("Must be positive")
z.number().negative("Must be negative")
z.number().nonnegative("Must be non-negative")
z.number().nonpositive("Must be non-positive")

// Type constraints
z.number().int("Must be an integer")
z.number().finite("Must be finite")
z.number().safe("Must be a safe integer")

// Multiple constraints
z.number()
  .int()
  .positive()
  .min(1)
  .max(100);
```

## Advanced Schemas

### Refinements

Add custom validation logic:

```javascript
import { z } from './validation/zod.js';

// Simple refinement
const evenNumber = z.number().refine(
  (n) => n % 2 === 0,
  { message: "Must be an even number" }
);

// Async refinement
const uniqueUsername = z.string().refine(
  async (username) => {
    return await checkUsernameAvailability(username);
  },
  { message: "Username already taken" }
);

// Multiple refinements
const passwordSchema = z.string()
  .min(8, "Password too short")
  .refine(
    (pwd) => /[A-Z]/.test(pwd),
    { message: "Must contain uppercase letter" }
  )
  .refine(
    (pwd) => /[a-z]/.test(pwd),
    { message: "Must contain lowercase letter" }
  )
  .refine(
    (pwd) => /[0-9]/.test(pwd),
    { message: "Must contain number" }
  );
```

### Transformations

Transform validated data:

```javascript
import { z } from './validation/zod.js';

// Basic transformation
const numberFromString = z.string().transform((val) => parseInt(val));
numberFromString.parse("123"); // 123 (number)

// Chained transformations
const normalizedEmail = z.string()
  .email()
  .transform((email) => email.toLowerCase())
  .transform((email) => email.trim());

// Transform with validation
const dateFromString = z.string()
  .datetime()
  .transform((str) => new Date(str))
  .refine((date) => date > new Date(), {
    message: "Date must be in the future"
  });
```

### Pipelines

Combine schemas with transformations:

```javascript
import { z } from './validation/zod.js';

// Create pipeline
const stringToNumber = z.string().pipe(z.number());

// Multi-stage pipeline
const userInput = z.string()
  .transform((s) => s.trim())
  .pipe(z.string().min(1))
  .transform((s) => parseInt(s))
  .pipe(z.number().positive());
```

## Error Handling

### Safe Parsing

```javascript
import { z } from './validation/zod.js';

const schema = z.string().email();

// Regular parsing (throws on error)
try {
  const result = schema.parse("invalid");
} catch (error) {
  console.error(error.errors);
}

// Safe parsing (returns result object)
const result = schema.safeParse("invalid");

if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error.errors);
}
```

### Custom Error Messages

```javascript
import { z } from './validation/zod.js';

// Method 1: In validation method
const schema = z.string().min(5, "Too short!");

// Method 2: In refinement
const schema2 = z.number().refine(
  (n) => n > 0,
  { message: "Must be positive" }
);

// Method 3: Error map
const schema3 = z.string({
  required_error: "Field is required",
  invalid_type_error: "Must be a string"
});
```

### Error Structure

```javascript
{
  errors: [
    {
      code: "too_small",
      minimum: 5,
      type: "string",
      inclusive: true,
      message: "String must contain at least 5 character(s)",
      path: ["name"]
    }
  ]
}
```

## Common Patterns

### API Request Validation

```javascript
import { z } from './validation/zod.js';

// Define request schema
const createUserRequest = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().int().positive().optional(),
  role: z.enum(['admin', 'user']).default('user')
});

// Validate request
function handleCreateUser(req, res) {
  const result = createUserRequest.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      errors: result.error.errors
    });
  }

  const validatedData = result.data;
  // Create user with validatedData
}
```

### Configuration Validation

```javascript
import { z } from './validation/zod.js';

const configSchema = z.object({
  server: z.object({
    host: z.string().default('localhost'),
    port: z.number().int().positive().default(3000),
    ssl: z.boolean().default(false)
  }),
  database: z.object({
    url: z.string().url(),
    pool: z.object({
      min: z.number().int().nonnegative().default(0),
      max: z.number().int().positive().default(10)
    })
  }),
  logging: z.object({
    level: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    format: z.enum(['json', 'text']).default('json')
  })
});

// Load and validate config
const config = configSchema.parse(loadConfig());
```

### Environment Variables

```javascript
import { z } from './validation/zod.js';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform((v) => parseInt(v, 10)).pipe(z.number().positive()),
  DATABASE_URL: z.string().url(),
  API_KEY: z.string().min(20),
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.string().transform(Number).optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info')
});

const env = envSchema.parse(process.env);
```

### Form Validation

```javascript
import { z } from './validation/zod.js';

const registrationSchema = z.object({
  username: z.string()
    .min(3, "Username too short")
    .max(20, "Username too long")
    .regex(/^[a-zA-Z0-9_]+$/, "Invalid characters"),

  email: z.string().email("Invalid email"),

  password: z.string()
    .min(8, "Password too short")
    .regex(/[A-Z]/, "Need uppercase letter")
    .regex(/[a-z]/, "Need lowercase letter")
    .regex(/[0-9]/, "Need number"),

  confirmPassword: z.string(),

  age: z.number().int().min(18, "Must be 18+"),

  terms: z.literal(true, {
    errorMap: () => ({ message: "Must accept terms" })
  })
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  }
);
```

## Type Inference

### Extract Types from Schemas

```javascript
import { z } from './validation/zod.js';

const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email()
});

// Infer TypeScript type
type User = z.infer<typeof userSchema>;
// { id: number; name: string; email: string; }

// Input type (before transformation)
type UserInput = z.input<typeof userSchema>;

// Output type (after transformation)
type UserOutput = z.output<typeof userSchema>;
```

## Best Practices

1. **Define schemas once, reuse everywhere**
   ```javascript
   // schemas.js
   export const userSchema = z.object({ ... });

   // api.js
   import { userSchema } from './schemas';
   ```

2. **Use safe parsing in production**
   ```javascript
   const result = schema.safeParse(data);
   if (!result.success) {
     // Handle error
   }
   ```

3. **Provide helpful error messages**
   ```javascript
   z.string().min(5, "Password must be at least 5 characters")
   ```

4. **Validate at system boundaries**
   - API endpoints
   - User input
   - External data sources
   - Configuration files

5. **Use transformations for normalization**
   ```javascript
   z.string().trim().toLowerCase()
   ```

6. **Compose complex schemas from simple ones**
   ```javascript
   const addressSchema = z.object({ ... });
   const userSchema = z.object({
     name: z.string(),
     address: addressSchema
   });
   ```

7. **Use discriminated unions for type safety**
   ```javascript
   z.discriminatedUnion('type', [schema1, schema2])
   ```

## Performance Tips

- Cache compiled schemas
- Use `.strip()` to remove unknown keys (default behavior)
- Use `.passthrough()` to allow unknown keys
- Use `.strict()` to reject unknown keys
- Avoid complex async refinements in hot paths
- Use `.partial()` for optional-all schemas
- Use `.pick()` and `.omit()` to derive schemas

## Related Modules

- **Configuration Module** - Validates config files
- **MCP Protocol Module** - Validates protocol messages
- **HTTP Client Module** - Validates request/response data
- **OAuth Module** - Validates OAuth responses

## Error Codes

Common Zod error codes:
- `invalid_type` - Wrong data type
- `invalid_literal` - Literal mismatch
- `unrecognized_keys` - Unknown object keys
- `invalid_union` - No union member matched
- `invalid_enum_value` - Invalid enum value
- `invalid_string` - String validation failed
- `too_small` - Below minimum
- `too_big` - Above maximum
- `custom` - Custom validation failed

## Migration Guide

### From runtime validation libraries

```javascript
// Before (joi, yup, etc.)
const schema = Joi.object({
  name: Joi.string().required(),
  age: Joi.number().positive()
});

// After (zod)
const schema = z.object({
  name: z.string(),
  age: z.number().positive()
});
```

### From TypeScript interfaces

```javascript
// Before
interface User {
  id: number;
  name: string;
  email?: string;
}

// After (with runtime validation)
const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().optional()
});
type User = z.infer<typeof userSchema>;
```
