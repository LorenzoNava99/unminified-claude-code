# Phase 6: Dependency Extraction Plan

## Overview

The final phase of the deobfuscation project focuses on extracting embedded third-party libraries and replacing them with npm package imports. This will:
- Reduce codebase size significantly
- Improve maintainability
- Enable version updates for dependencies
- Follow standard Node.js practices

---

## Identified Embedded Libraries

### 1. **Axios** - HTTP Client
**Current Status:** Embedded in deobfuscated-documented.js
**Lines:** ~8,000 lines
**Usage:** HTTP requests, interceptors, API calls

**Key Components:**
- `InterceptorManager` class
- `Axios` class
- HTTP adapters
- Form data handling
- Request/response transformation

**Replacement:**
```javascript
// Current (embedded)
class Axios { ... }

// Target (npm package)
import axios from 'axios';
```

---

### 2. **Zod** - Validation
**Current Status:** Embedded in deobfuscated-documented.js
**Lines:** ~4,781 lines
**Usage:** Schema validation, type checking

**Key Components:**
- `ZodType` base class
- `ParseStatus` class
- `ParseContext` class
- Schema validators
- Type inference

**Replacement:**
```javascript
// Current (embedded)
class ZodType { ... }

// Target (npm package)
import { z } from 'zod';
```

---

### 3. **LocalForage** - Storage
**Current Status:** Embedded in deobfuscated-documented.js
**Lines:** ~1,000-2,000 lines
**Usage:** Client-side storage, IndexedDB wrapper

**Key Components:**
- Storage provider abstraction
- IndexedDB backend
- WebSQL backend
- localStorage fallback

**Replacement:**
```javascript
// Current (embedded)
const localforage = { ... }

// Target (npm package)
import localforage from 'localforage';
```

---

### 4. **AWS SDK v3** - AWS Integration (Partial)
**Current Status:** Embedded signatures and utilities
**Lines:** ~350 lines
**Usage:** AWS Signature V4, Bedrock API

**Note:** Only signature utilities are embedded, not full SDK.

**Replacement:**
```javascript
// Current (embedded utilities)
function signRequest(...) { ... }

// Target (npm package)
import { SignatureV4 } from '@aws-sdk/signature-v4';
```

---

## Extraction Strategy

### Phase 6.1: Analysis & Mapping
1. ✅ Identify all embedded library code
2. ⏳ Map library usage throughout codebase
3. ⏳ Document all import points
4. ⏳ Identify any custom modifications

### Phase 6.2: Dependency Installation
1. ⏳ Add npm packages to package.json
2. ⏳ Install dependencies
3. ⏳ Verify compatibility versions

### Phase 6.3: Code Replacement
1. ⏳ Replace Axios embedded code with imports
2. ⏳ Replace Zod embedded code with imports
3. ⏳ Replace LocalForage embedded code with imports
4. ⏳ Replace AWS SDK utilities with imports

### Phase 6.4: Import Updates
1. ⏳ Update all import statements
2. ⏳ Fix module references
3. ⏳ Update re-exports

### Phase 6.5: Verification
1. ⏳ Run validation tests
2. ⏳ Verify functionality
3. ⏳ Check for regressions
4. ⏳ Update documentation

---

## Implementation Approach

### Option 1: Gradual Replacement (Recommended)
Replace one library at a time, validate after each replacement.

**Advantages:**
- Lower risk of breaking changes
- Easier to debug issues
- Can validate incrementally

**Order:**
1. LocalForage (smallest, lowest risk)
2. Zod (medium complexity)
3. Axios (largest, highest impact)
4. AWS SDK utilities (minimal changes)

### Option 2: Comprehensive Replacement
Replace all libraries simultaneously.

**Advantages:**
- Faster completion
- Single validation pass

**Disadvantages:**
- Higher risk
- Harder to isolate issues

**Decision:** Use Option 1 (Gradual Replacement)

---

## Expected Benefits

### 1. Codebase Size Reduction
**Before:** ~515,464 lines, 15.38 MB
**After:** ~502,000 lines (estimated), ~14.5 MB

**Reduction:** ~13,000 lines, ~0.9 MB

### 2. Maintainability Improvements
- Dependencies can be updated independently
- Security patches easier to apply
- Community support for libraries
- Standard npm ecosystem practices

### 3. Development Experience
- Better IDE support
- Type definitions from DefinitelyTyped
- Easier onboarding for new developers
- Familiar library interfaces

---

## Dependency Versions

### Proposed package.json additions:

```json
{
  "dependencies": {
    "axios": "^1.6.2",
    "zod": "^3.22.4",
    "localforage": "^1.10.0",
    "@aws-sdk/signature-v4": "^3.450.0",
    "@aws-sdk/sha256-js": "^3.450.0"
  }
}
```

---

## Risk Assessment

### Low Risk
- ✅ LocalForage replacement
  - Standard API, minimal customization
  - Well-documented migration path

### Medium Risk
- ⚠️ Zod replacement
  - May have custom validators
  - Schema definitions need verification

### High Risk
- ⚠️⚠️ Axios replacement
  - Largest embedded library
  - Custom interceptors may need adjustment
  - Error handling differences

### Mitigation Strategies
1. Comprehensive testing after each replacement
2. Keep original code commented for reference
3. Document any behavioral differences
4. Run full validation suite after changes

---

## Success Criteria

### Phase 6 Complete When:
- [ ] All npm packages installed
- [ ] All embedded library code removed
- [ ] All imports updated to use npm packages
- [ ] All tests pass (47/47 validation tests)
- [ ] No regressions detected
- [ ] Documentation updated
- [ ] Code size reduced by ~13,000 lines
- [ ] Final validation complete

---

## Timeline Estimate

| Task | Estimated Time |
|------|----------------|
| Analysis & Mapping | 2-3 hours |
| LocalForage Extraction | 1-2 hours |
| Zod Extraction | 2-3 hours |
| Axios Extraction | 3-4 hours |
| AWS SDK Extraction | 1 hour |
| Testing & Validation | 2 hours |
| Documentation Updates | 1 hour |
| **Total** | **12-16 hours** |

---

## Deliverables

1. **Updated package.json** with all dependencies
2. **Modified deobfuscated code** with npm imports
3. **Validation report** confirming no regressions
4. **Migration documentation** explaining changes
5. **Final project report** summarizing entire transformation

---

## Next Steps

1. ✅ Create extraction plan (this document)
2. ⏳ Analyze library boundaries in code
3. ⏳ Install npm dependencies
4. ⏳ Begin LocalForage extraction
5. ⏳ Continue with remaining libraries
6. ⏳ Final validation and documentation

---

**Status:** Phase 6 Initiated
**Progress:** 0% → Target: 100%
**Overall Project:** 90% → Target: 100%
