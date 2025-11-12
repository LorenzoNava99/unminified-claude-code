# Axios Extraction Plan

## Code Analysis Summary

### Embedded Axios Code
**Location:** Lines 36444-41323 (~4,880 lines)

**Structure:**
1. **Utility Functions** (36444-36584):
   - `bC9()` - form data conversion
   - `s61()`, `sV0()`, `aV0()` - validation utilities
   - `xC9()` - visitor pattern utilities

2. **Lazy Modules** (36584-41241):
   - `qZA` - toFlatObject utilities
   - `AK0` - URL encoding
   - `KOA` - HTTP utils
   - `QK0` - InterceptorManager export
   - `DOA` through `kD0` - Axios core components
   - `xD0` (41241) - Main Axios module that assembles everything

3. **Re-export Module** (41293-41323):
   - `Z3` - Destructures SB and re-exports components

### Claude-Specific Integration Code (KEEP)
**Global Axios Instance:**
- Line 41275: `SB = lJ;` → Changes to `SB = axios;`

**Usage Points:**
- Line 58732: Connectivity check (`SB.head(...)`)
- Lines 188702-188730: **Custom proxy interceptor configuration**
- Lines 190435-190752: API requests (`SB.get(...)`)

---

## Extraction Strategy

### Step 1: Add Import
At the top of the file (after existing imports), add:
```javascript
import axios from 'axios';
```

### Step 2: Replace Embedded Library Code
**Remove:** Lines 36444-41323 (entire axios library)

**Replace with:**
```javascript
// Axios HTTP client from npm package
// Replaced ~4,880 lines of embedded axios@1.6.2 library code
var SB = axios;
```

### Step 3: Update Re-exports Module
The `Z3` module (41293-41323) needs to be updated to use the npm axios:
```javascript
var Z3 = createLazyModule(() => {
  ({
    Axios: yUI,
    AxiosError: vD0,
    CanceledError: kUI,
    isCancel: _UI,
    CancelToken: xUI,
    VERSION: vUI,
    all: bUI,
    Cancel: fUI,
    isAxiosError: hUI,
    spread: gUI,
    toFormData: uUI,
    AxiosHeaders: mUI,
    HttpStatusCode: dUI,
    formToJSON: cUI,
    getAdapter: pUI,
    mergeConfig: lUI,
  } = SB);
});
```

This module already correctly destructures from `SB`, so it will work with npm axios.

### Step 4: Verify Integration Points
All Claude-specific code will continue to work:
- `SB.interceptors.request.use(...)` - Standard axios API
- `SB.defaults.proxy = false` - Standard axios API
- `SB.defaults.httpsAgent = ...` - Standard axios API
- `SB.head(...)`, `SB.get(...)` - Standard axios methods

---

## Expected Results

**Before:**
- Total lines: 606,198
- Embedded axios: ~4,880 lines

**After:**
- Total lines: ~601,318 (-4,880 lines, -0.8%)
- Clean import: 1 line
- Integration code: Unchanged

**Benefits:**
- Standard npm package for axios
- Version updates easier to apply
- Security patches from axios maintainers
- Cleaner codebase
- Same functionality preserved

---

## Validation Plan

1. **Syntax Check:** Ensure file parses correctly
2. **Module Loading:** Verify extracted modules still load
3. **HTTP Functionality:** Test that HTTP requests work
4. **Proxy Configuration:** Verify custom interceptors still apply
5. **Unit Tests:** Run existing test suite (98/101 should still pass)

---

## Risks & Mitigation

**Risk:** Axios npm package behavior differs from embedded version
- **Mitigation:** Both are axios@1.6.2, behavior identical
- **Verification:** Integration code uses standard axios APIs

**Risk:** Custom utilities (bC9, s61, etc.) were modified from axios
- **Mitigation:** These appear to be vanilla axios utilities
- **Verification:** Compare with axios@1.6.2 source if needed

**Risk:** Breaking HTTP requests or proxy configuration
- **Mitigation:** Test HTTP functionality before committing
- **Rollback:** Git history allows easy revert if needed

---

## Execution Checklist

- [ ] Add axios import at top of file
- [ ] Remove lines 36444-41323 (embedded axios library)
- [ ] Add replacement code: `var SB = axios;`
- [ ] Verify Z3 module still destructures correctly
- [ ] Test file syntax (no parsing errors)
- [ ] Run unit tests
- [ ] Test HTTP functionality manually
- [ ] Verify proxy configuration applies
- [ ] Commit changes
- [ ] Update documentation

---

**Prepared:** 2025-11-12
**Status:** Ready for Execution
