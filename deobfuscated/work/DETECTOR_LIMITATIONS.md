# Enhanced Dependency Detector Limitations

**Date:** 2025-11-13
**Status:** Detector has 18% false negative rate (misses 2/11 Type 1 classifications)

---

## Executive Summary

The enhanced-dependency-detector correctly identifies **9 of 11 Type 1 modules** (82% accuracy), but misses dependencies on **small utility modules with obfuscated names** like `ti1` and `xl`.

**Root Cause:** Detector only checks for renamed symbols from Waves 1-8, missing unrenamed utility functions.

---

## False Negatives Found

### 1. OtelSemanticAttributes (567 lines)

**Detector Classification:** Type 1 (Independent) ❌
**Actual Status:** Type 2 (Depends on ti1 module)

**Dependency Code:**
```javascript
var otelSemanticAttributesExport = createCommonJSModule(OtelSemanticAttributes => {
  // ...
  var sN = ti1();  // ← Depends on ti1()
  // ...
});
```

**ti1 Module (Lines 402461-402479, 18 lines):**
```javascript
var ti1 = createCommonJSModule(R42 => {
  Object.defineProperty(R42, "__esModule", {
    value: true
  });
  R42.createConstMap = undefined;
  function uW5(A) {
    let B = {};
    let Q = A.length;
    for (let I = 0; I < Q; I++) {
      let G = A[I];
      if (G) {
        B[String(G).toUpperCase().replace(/[-.]/g, "_")] = G;
      }
    }
    return B;
  }
  R42.createConstMap = uW5;
});
```

**Why Detector Missed It:**
- `ti1` is a 3-character obfuscated identifier
- Not in Waves 1-8 renamed symbols database
- Pattern `var sN = ti1();` looks like a regular function call
- Detector doesn't validate if called functions exist

**Extraction Impact:**
```
ReferenceError: ti1 is not defined
    at file:///path/to/otel-semantic-attributes.js:12:15
```

---

### 2. ValidationErrorExports (41 lines)

**Detector Classification:** Type 1 (Independent) ❌
**Actual Status:** Type 2 (Depends on xl module)

**Dependency Code:**
```javascript
var sOA = createCommonJSModule(ValidationErrorExports => {
  // ...
  var nOA = xl();  // ← Depends on xl()
  // ...
  (0, nOA._addWindowEventListenerSafe)("focus", ...);
  (0, nOA._addWindowEventListenerSafe)("blur", ...);
  (0, nOA._addDocumentEventListenerSafe)("visibilitychange", ...);
});
```

**xl Module (Lines 40771-40825, 54 lines):**
```javascript
var xl = createCommonJSModule(eD0 => {
  Object.defineProperty(eD0, "__esModule", {
    value: true
  });
  eD0._getCurrentPageUrlSafe = eD0._addDocumentEventListenerSafe =
      eD0._addWindowEventListenerSafe = eD0._isServerEnv =
      eD0._getDocumentSafe = eD0._getWindowSafe = undefined;

  var ZD9 = () => {
    if (typeof window !== "undefined") {
      return window;
    } else {
      return null;
    }
  };
  eD0._getWindowSafe = ZD9;
  // ... more browser safety utilities
});
```

**Why Detector Missed It:**
- `xl` is a 2-character obfuscated identifier
- Not in Waves 1-8 renamed symbols database
- Pattern `var nOA = xl();` looks like a regular function call
- Detector doesn't track all function definitions in the codebase

**Extraction Impact:**
```
ReferenceError: xl is not defined
    at file:///path/to/validation-error-exports.js:8:15
```

---

## Detector Algorithm Analysis

### Current Detection Logic

```javascript
// 1. Check if it's a built-in
if (builtIns.has(funcName)) continue;

// 2. Check if it's a renamed symbol from Waves 1-8
if (renamedSymbols.has(funcName)) {
  renamedDeps.push(funcName);
  continue;
}

// 3. Check if it's a static method
if (/static\s+funcName\s*\(/.test(code)) continue;

// 4. Check if defined locally
if (/(function|var|const|let)\s+funcName\s*=/.test(code)) continue;

// 5. Check if it's a method call (obj.funcName())
if (/\.funcName\s*\(/.test(code)) continue;

// 6. Otherwise, flag as unrenamed dependency ← PROBLEM
unnamedDeps.push(funcName);
```

### What It Misses

**Short obfuscated identifiers like ti1, xl that are:**
1. Not in renamed symbols database
2. Not defined locally within the module
3. Called as standalone functions: `var x = ti1();`
4. Actual module dependencies

The detector assumes:
- ✅ All important symbols were renamed in Waves 1-8
- ❌ **False assumption**: Many utility modules remain unrenamed

---

## Why These Modules Weren't Renamed

The ti1 and xl modules weren't included in Waves 1-8 because:

1. **Too generic:** Short names like `ti1`, `xl` don't clearly indicate purpose
2. **Internal utilities:** Not exported as major features
3. **Not in top 137:** Waves 1-8 focused on most important/frequently used symbols
4. **Helper functions:** Small utility modules between major modules

---

## Accuracy Statistics

### Type 1 Module Predictions (11 total)

| Module | Lines | Detector Says | Actual | Result |
|--------|-------|---------------|--------|---------|
| OtelSemanticConventions | 144 | Type 1 | Type 1 | ✅ Extracted |
| otelCoreUtils | 105 | Type 1 | Type 1 | ✅ Extracted |
| GenericErrorExports | 95 | Type 1 | Type 1 | ✅ Extracted |
| OtelMetrics | 57 | Type 1 | Type 1 | ✅ Extracted |
| GrpcChannelOptionsExports | 54 | Type 1 | Type 1 | ✅ Extracted |
| PredicateExports | 50 | Type 1 | Type 1 | ✅ Extracted |
| OtlpSharedConfigExports | 35 | Type 1 | Type 1 | ✅ Extracted |
| PlatformNormalizerExports | 29 | Type 1 | Type 1 | ✅ Extracted |
| StatsigMetadataExports | 16 | Type 1 | Type 1 | ✅ Extracted |
| **OtelSemanticAttributes** | **567** | **Type 1** | **Type 2** | **❌ False negative** |
| **ValidationErrorExports** | **41** | **Type 1** | **Type 2** | **❌ False negative** |

**Metrics:**
- True Positives: 9/11 (82%)
- False Negatives: 2/11 (18%)
- False Positives: 0/9 tested (0%)

---

## Solutions

### Option 1: AST-Based Analysis (High Accuracy, High Cost)
Parse JavaScript with a proper AST parser (esprima, acorn, babel):
- Identify all function definitions
- Build complete call graph
- Validate all function calls have definitions
- **Pros:** 95%+ accuracy
- **Cons:** Slower, more complex, memory intensive

### Option 2: Global Function Registry (Medium Accuracy, Medium Cost)
Scan entire codebase once to find all function definitions:
```javascript
// Build registry of ALL function definitions
const allFunctions = new Set();
// var funcName = ...
// function funcName(...)
// const funcName = ...
```
Then check dependencies against this registry.
- **Pros:** Catches ti1, xl, and similar
- **Cons:** Still regex-based, ~10% error rate

### Option 3: Manual Verification (Current Approach)
Accept 18% false negative rate and test all extractions:
- Try to extract each Type 1 module
- Run tests to validate
- If it fails, investigate dependency
- **Pros:** Simple, no detector changes needed
- **Cons:** Wastes time on failed extractions

### Option 4: Extract Dependency Chains (Strategic)
Since ti1 and xl are small modules, extract them first:
1. Extract ti1 (18 lines) as Type 1
2. Then extract OtelSemanticAttributes as Type 2 (depends on ti1)
3. Extract xl (54 lines) as Type 1
4. Then extract ValidationErrorExports as Type 2 (depends on xl)
- **Pros:** Works within current detector limitations
- **Cons:** Requires identifying and extracting utilities first

---

## Recommendation

**Use Option 4: Extract Dependency Chains**

1. **Phase 1:** Extract ti1 and xl utility modules
   - ti1: 18 lines (createConstMap utility)
   - xl: 54 lines (browser safety utilities)
   - Both appear to be Type 1 (can verify with detector)

2. **Phase 2:** Extract modules that depend on them
   - OtelSemanticAttributes (567 lines) depends on ti1
   - ValidationErrorExports (41 lines) depends on xl

3. **Result:** All 11 Type 1 candidates extracted (as Type 1 or Type 2)

---

## Detector Improvement Plan

### Immediate (Phase 1)
- ✅ Add static method detection
- ✅ Add module system runtime to safe list
- ⬜ Add global function registry (Option 2)

### Short Term (Phase 2)
- ⬜ Scan for all `var X = createCommonJSModule(...)` patterns
- ⬜ Build database of ALL module names (not just renamed ones)
- ⬜ Check dependencies against complete module database

### Long Term (Phase 3)
- ⬜ Migrate to AST-based analysis (Option 1)
- ⬜ Build complete dependency graph for entire codebase
- ⬜ Enable automatic dependency chain extraction

---

## Impact on Extraction Strategy

### Original Plan
Extract all Type 1 modules → Extract Type 2 modules → Extract Type 3 modules

### Revised Plan (Accounting for False Negatives)
1. Extract validated Type 1 modules (9 done ✅)
2. **Extract small utility modules** (ti1, xl)
3. Extract modules depending on extracted utilities
4. Continue with Type 2 extraction
5. Build dependency-aware batch extractor

---

## Key Takeaways

1. **Short identifiers are dangerous:** ti1, xl, q6, t2, etc. are easy to miss
2. **Not everything is renamed:** 76 "unknown" modules remain unanalyzed
3. **Testing is essential:** 18% false negative rate means test before trusting
4. **Utilities first:** Extract small utility modules before their dependents
5. **Dependency chains exist:** Many modules form chains (A → B → C)

---

**Generated:** 2025-11-13
**Detector Version:** enhanced-dependency-detector.js v2 (with static method detection)
**False Negative Rate:** 18% (2/11 Type 1 candidates)
**Recommendation:** Extract ti1 and xl utility modules to unlock remaining modules
