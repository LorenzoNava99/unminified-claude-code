# Phase 6: Dependency Extraction Plan

**Status:** In Progress (25% → 100%)
**Date:** 2025-11-13
**Goal:** Extract ~20,000 lines of embedded library code to npm dependencies

---

## Overview

The deobfuscated code currently has three major libraries embedded in the bundle:

| Library | Line Range | Lines | Estimated Size | Status |
|---------|-----------|-------|----------------|--------|
| **LocalForage** | (extracted) | 2,492 | ~2.5KB | ✅ Complete |
| **Zod** | 10,072 - 14,461 | 4,390 | ~4.2KB | ⏳ Pending |
| **Axios** | 25,979 - 40,472 | 14,494 | ~8.0KB | ⏳ Pending |
| **AWS SDK** | 115,197 - 116,268 | 1,072 | ~350B | ⏳ Pending |
| **Total** | - | **22,448** | **~15KB** | 25% |

---

## Extraction Strategy

### Approach: Incremental Extraction

Extract libraries in order of **increasing complexity**:

1. ✅ **LocalForage** (DONE) - Smallest, already extracted (2,492 lines)
2. 🎯 **AWS SDK** (NEXT) - Simple, well-bounded (1,072 lines)
3. 🎯 **Zod** - Medium complexity (4,390 lines)
4. 🎯 **Axios** - Most complex, many internal references (14,494 lines)

**Rationale:** Start with smallest/simplest to validate approach before tackling larger libraries.

---

## Detailed Library Analysis

### 1. AWS SDK Signature V4 (Lines 115,197 - 116,268)

**Total Lines:** 1,072
**Complexity:** LOW
**Risk:** LOW

**Key Components:**
- `ql0` → `SignatureV4Base` class (Line 115,668)
- `f94` → `SignatureV4` class (Line 115,746)
- `HW1` → `AwsSdkSigV4Signer` class (Line 116,008)
- `r94` → `AwsSdkSigV4ASigner` class (Line 116,072)
- `Hl0` → `getSigningKey` function (Line 115,411)
- `ZW1` → `getCanonicalHeaders` function (Line 115,438)

**Export Variable:** `Al0` (Line 115,319)

**Replacement Plan:**
```javascript
// BEFORE (embedded)
var Al0 = {};
$94(Al0, {
  SignatureV4: () => f94,
  SignatureV4Base: () => ql0,
  getSigningKey: () => Hl0,
  // ... ~30 exports
});

// AFTER (npm import)
import { SignatureV4 } from '@aws-sdk/signature-v4';
import { fromNodeProviderChain } from '@aws-sdk/credential-providers';
```

**npm Dependencies:**
```json
{
  "@aws-sdk/signature-v4": "^3.450.0",
  "@aws-sdk/credential-providers": "^3.450.0"
}
```

**Extraction Steps:**
1. Identify all references to `Al0` exports in the codebase
2. Map obfuscated names to AWS SDK exports
3. Remove lines 115,197 - 116,268
4. Add import statements at the top
5. Update all references (e.g., `Al0.SignatureV4` → `SignatureV4`)
6. Test AWS Bedrock integration

**Estimated Effort:** 2-3 hours

---

### 2. Zod Validation Library (Lines 10,072 - 14,461)

**Total Lines:** 4,390
**Complexity:** MEDIUM
**Risk:** MEDIUM

**Key Components:**
- `dE` → `ZodError` class (Line 10,209)
- `QC` → `ParseStatus` class (Line 10,442)
- `k8` → `ZodType` base class
- `rL` → `ZodString` (Line 11,343)
- `Mf` → `ZodNumber`
- `DZ` → `ZodObject`
- `VB` → `ZodIssueCode` enum (Line 10,208)

**Export Variable:** `k` (Line 14,338)

**Replacement Plan:**
```javascript
// BEFORE (embedded)
var k = {};
E$(k, {
  ZodType: () => k8,
  ZodError: () => dE,
  ZodString: () => rL,
  ZodObject: () => DZ,
  z: () => iE,  // Main zod namespace
  // ... ~80 exports
});

// AFTER (npm import)
import { z, ZodError, ZodType } from 'zod';
```

**npm Dependencies:**
```json
{
  "zod": "^3.22.4"
}
```

**Extraction Steps:**
1. Search for all references to `k.ZodError`, `k.z`, etc.
2. Map ~80 Zod exports to standard zod API
3. Remove lines 10,072 - 14,461
4. Add import statement: `import { z, ZodError } from 'zod'`
5. Update all references:
   - `k.z.string()` → `z.string()`
   - `k.ZodError` → `ZodError`
6. Test schema validation throughout app

**Estimated Effort:** 4-6 hours

---

### 3. Axios HTTP Client (Lines 25,979 - 40,472)

**Total Lines:** 14,494
**Complexity:** HIGH
**Risk:** HIGH

**Key Components:**
- `UAA` / `JQ` → `AxiosError` (Line 26,111)
- `vZA` → `Axios` class
- `y1` → utils object (Line 26,110)
- `bf` → `toFormData`
- `EZ` → `AxiosHeaders`
- `iz` → `CanceledError`
- `PD0` → `CancelToken`

**Export Variables:**
- Primary: `SB` (Line 40,434) - Main Axios instance
- Secondary: `lJ` (Line 40,414) - Export wrapper
- Tertiary: `Z3` (Lines 40,452-40,472) - Named exports

**Replacement Plan:**
```javascript
// BEFORE (embedded)
var Z3 = T(() => {
  ({
    Axios: yUI,
    AxiosError: vD0,
    isAxiosError: hUI,
    AxiosHeaders: EZ,
    // ... 20+ exports
  } = SB);
});

// AFTER (npm import)
import axios, {
  AxiosError,
  AxiosHeaders,
  isAxiosError
} from 'axios';
```

**npm Dependencies:**
```json
{
  "axios": "^1.6.2"
}
```

**Extraction Steps:**
1. Map ALL Axios exports (~25 exports)
2. Identify internal utilities (`y1` object)
3. Search for all references to `SB`, `lJ`, `Z3`
4. Remove lines 25,979 - 40,472
5. Add import: `import axios from 'axios'`
6. Update references:
   - `SB.create()` → `axios.create()`
   - `SB.get()` → `axios.get()`
   - `vD0` → `AxiosError`
7. Test all HTTP requests (Anthropic API, Vertex, Bedrock)

**Estimated Effort:** 8-12 hours

---

## Risk Assessment

### High-Risk Areas

1. **Reference Mapping**
   - **Risk:** Missing obfuscated variable references
   - **Mitigation:** Use comprehensive grep/search before extraction
   - **Test:** grep for each export variable name

2. **Breaking Changes**
   - **Risk:** npm version differs from embedded version
   - **Mitigation:** Check version compatibility, test thoroughly
   - **Test:** Run comprehensive validation suite

3. **Internal Dependencies**
   - **Risk:** Libraries depend on each other (e.g., Zod uses Axios)
   - **Mitigation:** Extract in order, verify independence
   - **Test:** Check for cross-library references

### Medium-Risk Areas

4. **Import Statement Placement**
   - **Risk:** Import order affects initialization
   - **Mitigation:** Place imports at top, maintain order
   - **Test:** Verify no runtime errors

5. **Lazy Loading**
   - **Risk:** Some modules may be lazily loaded
   - **Mitigation:** Check for dynamic imports, preserve patterns
   - **Test:** Test all code paths

---

## Validation Strategy

### Per-Library Validation

After each extraction:

1. **Syntax Check**
   ```bash
   node --check deobfuscated.js
   ```

2. **Reference Check**
   ```bash
   # Check for orphaned references
   grep -n "variable_name" deobfuscated.js
   ```

3. **Import Check**
   ```bash
   # Verify imports resolve
   node -e "import './deobfuscated.js'"
   ```

### Full Integration Testing

After all extractions:

1. **Run existing test suite**
   ```bash
   npm test
   ```

2. **Validate core functionality**
   - Config loading
   - HTTP requests
   - Schema validation
   - AWS signing

3. **Test all three modules**
   ```bash
   npm test -- modules.test.js
   npm test -- utils.test.js
   npm test -- config.test.js
   ```

---

## Execution Plan

### Step 1: AWS SDK Extraction (2-3 hours)

```bash
# 1. Backup
cp deobfuscated.js deobfuscated.js.backup

# 2. Search for references
grep -n "Al0\." deobfuscated.js > aws-sdk-refs.txt

# 3. Create sed script to remove lines 115,197-116,268
sed -i '115197,116268d' deobfuscated.js

# 4. Add import at top
# (manual edit)

# 5. Replace references
# (manual or script-based)

# 6. Test
npm install @aws-sdk/signature-v4 @aws-sdk/credential-providers
node --check deobfuscated.js
```

### Step 2: Zod Extraction (4-6 hours)

```bash
# Similar process for lines 10,072-14,461
# Map ~80 exports to zod API
```

### Step 3: Axios Extraction (8-12 hours)

```bash
# Similar process for lines 25,979-40,472
# Most complex - many internal references
```

### Step 4: Final Validation (2-3 hours)

```bash
# Run full test suite
npm test

# Validate all transformations
npm run validate

# Check file size reduction
wc -l deobfuscated.js
# Expected: ~495,000 lines (down from 515,464)
```

---

## Success Criteria

### Quantitative Goals

- ✅ Remove 22,448 lines of embedded library code
- ✅ Add 4 npm dependencies (LocalForage, Zod, Axios, AWS SDK)
- ✅ Reduce file size by ~15KB
- ✅ All 47 tests still pass
- ✅ No syntax errors
- ✅ No orphaned references

### Qualitative Goals

- ✅ Code follows npm best practices
- ✅ Dependencies are updatable independently
- ✅ Improved maintainability
- ✅ Clearer separation of concerns

---

## Timeline

| Task | Duration | Status |
|------|----------|--------|
| **Planning & Analysis** | 1-2 hours | ✅ Complete |
| **AWS SDK Extraction** | 2-3 hours | ⏳ Next |
| **Zod Extraction** | 4-6 hours | Pending |
| **Axios Extraction** | 8-12 hours | Pending |
| **Final Validation** | 2-3 hours | Pending |
| **Documentation** | 1-2 hours | Pending |
| **Total** | **18-28 hours** | 10% |

---

## Rollback Plan

If extraction fails at any step:

1. **Restore from backup**
   ```bash
   cp deobfuscated.js.backup deobfuscated.js
   ```

2. **Document failure reason**
   - Which library?
   - What error occurred?
   - What was the root cause?

3. **Adjust strategy**
   - Try different mapping approach
   - Consider keeping library embedded
   - Investigate version compatibility

---

## Next Actions

### Immediate (Today)

1. ✅ Create this plan document
2. 🎯 Extract AWS SDK (smallest, lowest risk)
3. 🎯 Validate AWS SDK extraction

### Short-term (This Week)

4. Extract Zod library
5. Validate Zod extraction
6. Extract Axios library
7. Validate Axios extraction

### Medium-term (Next Week)

8. Final comprehensive testing
9. Document Phase 6 completion
10. Commit and push changes

---

## Notes

- **LocalForage already extracted:** 2,492 lines removed (Phase 6: 25% complete)
- **Line numbers will shift:** After each extraction, subsequent line numbers change
- **Use git for safety:** Commit after each successful extraction
- **Test incrementally:** Don't extract all at once

---

**Generated:** 2025-11-13
**Status:** Planning Complete, Ready to Execute
**Next Step:** AWS SDK Extraction (Lines 115,197 - 116,268)
