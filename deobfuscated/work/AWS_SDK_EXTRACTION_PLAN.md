# AWS SDK Extraction Plan

**Status:** Ready for Execution
**Date:** 2025-11-13
**Approach:** Smart extraction - Compare with npm packages, extract library code, preserve integration

---

## Discovery Summary

After systematic analysis, I mapped the complete embedded AWS SDK packages:

### Embedded Packages

#### 1. @aws-sdk/client-bedrock
- **Location:** Lines 129138-228951
- **Size:** ~99,813 lines
- **Version:** 3.840.0 (confirmed from package.json at line 129140)
- **Main Export Module:** T9B (line 137054)
- **Integration Variable:** B2A

#### 2. @aws-sdk/client-bedrock-runtime
- **Location:** Lines 228952-237200
- **Size:** ~8,248 lines
- **Version:** 3.797.0 (confirmed from package.json at line 228954)
- **Main Export Module:** WoB (line 233450)
- **Integration Variable:** Lu

**Total Size:** ~108,061 lines to be extracted

---

## Package Structure Analysis

### @aws-sdk/client-bedrock (lines 129138-228951)

**Key Modules:**
- `ir0` (line 129138): Package.json module
- `T9B` (line 137054): Main exports module
- `CH` (line 137455): BedrockClient class definition
- Export: `BedrockClient: () => CH` (line 137111)

**Claude Integration:**
```javascript
// Line 183999-184006: FU1 lazy module
var FU1 = createLazyModule(() => {
  nB();
  noopFunction();
  c1();
  mg();
  k2();
  B2A = interopRequireWildcard(T9B(), 1);  // ← Loads client-bedrock
  ...
});

// Line 183995: Usage
return new B2A.BedrockClient(B);

// Line 184012: Command usage
let I = new B2A.ListInferenceProfilesCommand({...});
```

### @aws-sdk/client-bedrock-runtime (lines 228952-237200)

**Key Modules:**
- `ciB` (line 228952): Package.json module
- `WoB` (line 233450): Main exports module
- `jO1` (line 233706): BedrockRuntimeClient class definition
- Export: `BedrockRuntimeClient: () => jO1` (line 233499)

**Claude Integration:**
```javascript
// Line 237209-237212: CoB lazy module
var CoB = createLazyModule(() => {
  P7 = interopRequireWildcard(flB(), 1);
  Lu = interopRequireWildcard(WoB(), 1);  // ← Loads client-bedrock-runtime
});

// Lines 237073-237114: Exception usage (within WoB module)
let Z = new Lu.InternalServerException({...});
let Z = new Lu.ModelStreamErrorException({...});
let Z = new Lu.ThrottlingException({...});
let Z = new Lu.ValidationException({...});
```

---

## Extraction Strategy

### Step 1: Add npm Imports

At the top of the file (after existing imports around line 11), add:

```javascript
import { BedrockClient, paginateListInferenceProfiles } from "@aws-sdk/client-bedrock";
import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
```

### Step 2: Extract @aws-sdk/client-bedrock

**Remove:** Lines 129138-228951 (99,813 lines of embedded SDK code)

**Replace with:**
```javascript
// ============================================================================
// AWS SDK for JavaScript - Bedrock Client
// ============================================================================
// REMOVED: ~99,813 lines of embedded @aws-sdk/client-bedrock@3.840.0 code
// REPLACED WITH: Standard npm package import (see imports at top of file)
//
// Original location: Lines 129138-228951
// - Package.json module (ir0): line 129138
// - Main export module (T9B): line 137054
// - BedrockClient class (CH): line 137455
// - Commands, pagination, and all SDK functionality
//
// Integration: This module was imported via interopRequireWildcard(T9B(), 1)
// and assigned to the B2A variable (line 184006)
//
// The npm package provides identical functionality with the same API:
// - BedrockClient class with all methods
// - All command classes (ListInferenceProfilesCommand, etc.)
// - Pagination utilities
// - Error classes and types
//
// Claude-specific configuration (AWS credentials, proxy settings, etc.)
// remains unchanged and works with the npm package.
// ============================================================================

// Create a module that mimics the original T9B module structure
var T9B = createCommonJSModule((klI, R9B) => {
  // Import everything from the npm package
  var bedrockClient = nodeRequire("@aws-sdk/client-bedrock");
  // Export it in the same structure as the embedded code
  Object.assign(R9B.exports, bedrockClient);
});
```

### Step 3: Extract @aws-sdk/client-bedrock-runtime

**Remove:** Lines 228952-237200 (8,248 lines of embedded SDK code)

**Replace with:**
```javascript
// ============================================================================
// AWS SDK for JavaScript - Bedrock Runtime Client
// ============================================================================
// REMOVED: ~8,248 lines of embedded @aws-sdk/client-bedrock-runtime@3.797.0
// REPLACED WITH: Standard npm package import (see imports at top of file)
//
// Original location: Lines 228952-237200
// - Package.json module (ciB): line 228952
// - Main export module (WoB): line 233450
// - BedrockRuntimeClient class (jO1): line 233706
// - Commands and all SDK functionality
//
// Integration: This module was imported via interopRequireWildcard(WoB(), 1)
// and assigned to the Lu variable (line 237211)
//
// The npm package provides identical functionality with the same API:
// - BedrockRuntimeClient class
// - All command classes (ConverseCommand, ConverseStreamCommand, etc.)
// - Exception classes (InternalServerException, ModelStreamErrorException, etc.)
// - Streaming utilities
//
// Claude-specific integration (error handling, streaming, etc.) remains
// unchanged and works with the npm package.
// ============================================================================

// Create a module that mimics the original WoB module structure
var WoB = createCommonJSModule((h63, XoB) => {
  // Import everything from the npm package
  var bedrockRuntimeClient = nodeRequire("@aws-sdk/client-bedrock-runtime");
  // Export it in the same structure as the embedded code
  Object.assign(XoB.exports, bedrockRuntimeClient);
});
```

### Step 4: Verify Integration Points

**No changes needed** to these integration points:

1. **B2A assignment** (line 184006):
   ```javascript
   B2A = interopRequireWildcard(T9B(), 1);
   ```
   ✅ T9B now returns npm package exports, works identically

2. **Lu assignment** (line 237211):
   ```javascript
   Lu = interopRequireWildcard(WoB(), 1);
   ```
   ✅ WoB now returns npm package exports, works identically

3. **BedrockClient usage** (line 183995):
   ```javascript
   return new B2A.BedrockClient(B);
   ```
   ✅ Unchanged, works with npm package

4. **Command usage** (line 184012):
   ```javascript
   let I = new B2A.ListInferenceProfilesCommand({...});
   ```
   ✅ Unchanged, works with npm package

---

## What Gets Extracted vs. What Stays

### Extracted (Replaced with npm packages):
✅ **All vanilla AWS SDK code:**
- Complete @aws-sdk/client-bedrock library (~99,813 lines)
- Complete @aws-sdk/client-bedrock-runtime library (~8,248 lines)
- BedrockClient and BedrockRuntimeClient classes
- All command classes
- All exception classes
- Pagination utilities
- Protocol serialization/deserialization
- HTTP middleware

### Preserved (Claude-specific integration):
✅ **All Claude code remains unchanged:**
- AWS credentials configuration (around line 183990)
- Proxy settings and interceptors
- Error handling logic
- Streaming utilities (VoB function at line 237214)
- Model invocation wrappers
- API request methods
- All lazy module definitions (FU1, CoB, etc.)

---

## Validation Plan

### 1. Syntax Check
```bash
cd /home/user/unminified-claude-code/deobfuscated/work/step5-documented
node --check deobfuscated-documented.js
```

### 2. Run Tests
```bash
cd /home/user/unminified-claude-code/deobfuscated/work
npm test
```

**Expected:** 98/101 tests passing (same as current state)

### 3. Verify Bedrock Integration
Check that Claude can:
- Create BedrockClient instances
- Execute ListInferenceProfilesCommand
- Create BedrockRuntimeClient instances
- Handle Bedrock exceptions properly

---

## Risk Assessment

### Low Risk ✅

**Why:**
1. **API Compatibility:** npm packages have identical APIs to embedded code
2. **Same Versions:** npm packages match embedded versions (3.840.0, 3.797.0)
3. **Proven Approach:** Same strategy that worked for Axios (4,809 lines, zero issues)
4. **Integration Preserved:** All Claude-specific code remains unchanged
5. **Reversible:** Backup will be created before extraction

### Comparison to Axios Extraction

| Metric | Axios | AWS SDK |
|--------|-------|---------|
| Lines Removed | 4,809 | 108,061 |
| Integration Points | 1 (SB) | 2 (B2A, Lu) |
| Breaking Changes | 0 | Expected: 0 |
| Test Regressions | 0 | Expected: 0 |

---

## Execution Checklist

- [ ] Create backup of deobfuscated-documented.js
- [ ] Add AWS SDK imports at top of file
- [ ] Extract @aws-sdk/client-bedrock (lines 129138-228951)
  - [ ] Replace with T9B wrapper module
  - [ ] Add documentation comment
- [ ] Extract @aws-sdk/client-bedrock-runtime (lines 228952-237200)
  - [ ] Replace with WoB wrapper module
  - [ ] Add documentation comment
- [ ] Run syntax check
- [ ] Run full test suite
- [ ] Verify no regressions (98/101 tests passing)
- [ ] Update metrics in PHASE_6_PROGRESS.md
- [ ] Update TRANSFORMATION_PROGRESS.md to 100% complete
- [ ] Commit changes with descriptive message
- [ ] Push to remote branch

---

## Expected Results

### Code Reduction
- **Before:** 601,390 lines
- **After:** ~493,329 lines
- **Reduction:** 108,061 lines (-17.9%)

### Phase 6 Completion
- **Previous:** 75% (3 of 4 libraries)
- **After:** 100% (4 of 4 libraries)
- **Total Lines Removed in Phase 6:** 119,697 lines

### Overall Project Status
- **Previous:** 96% complete
- **After:** ~100% complete
- **Readability:** 9/10 (maintained)

---

## Notes

- The embedded AWS SDKs use CommonJS module wrapping, same as LocalForage and Axios
- The npm packages are officially maintained by AWS, well-tested, and stable
- Package versions are recent (client-bedrock: 3.840.0, client-bedrock-runtime: 3.797.0)
- No deprecated packages (unlike @aws-sdk/signature-v4)
- The extraction maintains all Claude-specific AWS configuration and error handling

---

**Ready to Execute:** Yes ✅
**Confidence Level:** High (based on successful Axios extraction)
**Reversibility:** High (backup will be created)
**Expected Duration:** 30-45 minutes
