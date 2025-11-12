# Claude Code Deobfuscation - Next Steps

## Project Status

**Current State:**
- ✅ Extracted npm package tarball
- ✅ Initial deobfuscation with webcrack (515,464 lines)
- ✅ Bundle separated into 4 modules (browserify format)
- ⚠️ Variable names still obfuscated (single letters, short names)
- ⚠️ Code structure needs further analysis

**Files:**
- `deobfuscated.js` - 15MB main bundle (515,464 lines)
- `index.js` - 42KB entry point (1,790 lines) - LocalForage storage library
- `node_modules/1/index.js` - Async task queue (59 lines)
- `node_modules/2/index.js` - Promise polyfill (221 lines)
- `node_modules/3/index.js` - Promise loader (4 lines)

---

## Phase 1: Enhanced Deobfuscation

### 1.1 Install Additional Tools

```bash
# Restringer - Advanced deobfuscation
npm install -g @restringer/cli

# Lebab - ES5 to ES6+ modernization
npm install -g lebab

# Prettier - Code formatting
npm install -g prettier

# Optional: de4js for specific patterns
npm install -g de4js
```

### 1.2 Apply Restringer

**Goal:** Remove remaining obfuscation patterns (string concealing, dead code, control flow flattening)

```bash
# Process main file with multiple passes
restringer deobfuscated.js -o step2-restringer.js --max-iterations 10

# Process each module
restringer index.js -o step2-index.js
restringer node_modules/1/index.js -o step2-module1.js
restringer node_modules/2/index.js -o step2-module2.js
```

**Expected outcome:**
- Cleaner control flow
- Resolved string concatenations
- Removed dead code branches

### 1.3 Modernize Syntax with Lebab

**Goal:** Convert ES5 patterns to modern ES6+ for better readability

```bash
lebab step2-restringer.js -o step3-modern.js \
  --transform arrow,let,template,default-param,arg-rest,obj-method,obj-shorthand,no-strict,commonjs,exponent,multi-var

lebab step2-index.js -o step3-index.js --transform arrow,let,template
```

**Transformations:**
- `var` → `let`/`const`
- Function expressions → Arrow functions
- String concatenation → Template literals
- Object method shorthand
- CommonJS → ES6 modules (where applicable)

---

## Phase 2: Semantic Variable Renaming

### 2.1 JSNice Analysis

**Goal:** Use ML to predict meaningful variable names

**Option A: Web Interface**
1. Split large file into chunks (~5MB each)
2. Upload to http://jsnice.org/
3. Download renamed versions
4. Merge back together

**Option B: Self-hosted JSNice**
```bash
git clone https://github.com/javascript-obfuscator/javascript-obfuscator-ui
# Setup local instance for processing large files
```

**Expected outcome:**
- Context-aware variable names
- Function names based on behavior
- Type annotations where possible

### 2.2 Manual Pattern Analysis

**Identify common patterns:**

```bash
# Find frequently used variable patterns
grep -oP '\b[A-Z][0-9]{2,3}\b' step3-modern.js | sort | uniq -c | sort -rn | head -50

# Find function definitions
grep -n "^function \w\b" step3-modern.js | head -100

# Find class definitions
grep -n "^class \w\b" step3-modern.js | head -50
```

**Create mapping file:**
- Document discovered patterns
- Map obfuscated names to semantic names
- Track API endpoints, important functions

### 2.3 Automated Renaming Script

Create custom Babel plugin or regex-based renaming:

```javascript
// rename-variables.js
const fs = require('fs');
const mappings = {
  'DB9': 'createRequire',
  'FB9': 'objectCreate',
  'CB9': 'getPrototypeOf',
  'h21': 'defineProperty',
  // ... add more mappings
};

// Apply systematic renaming
```

---

## Phase 3: Code Structure Analysis

### 3.1 Identify Major Components

**Search for key functionality:**

```bash
# Find CLI argument parsing
grep -n "process\.argv\|commander\|yargs\|minimist" step3-modern.js

# Find API calls
grep -n "fetch\|axios\|https\?://\|api\.anthropic" step3-modern.js

# Find authentication
grep -n "apiKey\|token\|auth\|bearer\|session" step3-modern.js

# Find file operations
grep -n "readFile\|writeFile\|fs\.\|path\." step3-modern.js

# Find LLM interaction
grep -n "claude\|sonnet\|opus\|haiku\|anthropic" step3-modern.js -i

# Find tool/function calling
grep -n "tool\|function_call\|execute\|invoke" step3-modern.js -i
```

### 3.2 Create Module Map

Document discovered modules:

```markdown
## Module Structure

1. **CLI Entry Point** (index.js)
   - Command parsing
   - Configuration loading
   - Main event loop

2. **API Client** (lines X-Y in deobfuscated.js)
   - Anthropic API communication
   - Message streaming
   - Token counting

3. **Tool System** (lines A-B)
   - File operations (Read, Write, Edit)
   - Bash execution
   - Web fetching
   - Git operations

4. **Agent System** (lines C-D)
   - Subagent spawning
   - Task delegation
   - Context management

5. **Storage/Cache** (LocalForage wrapper)
   - Conversation history
   - Configuration persistence
```

### 3.3 Extract Strings and Constants

```bash
# Extract all string literals
grep -oP '["'\''][^"'\'']{10,}["'\'']' step3-modern.js | sort | uniq > strings.txt

# Find URLs and endpoints
grep -oP 'https?://[^\s"'\'']+' step3-modern.js > urls.txt

# Find error messages
grep -oP '(Error|Exception|Warning).*?["'\''][^"'\'']+["'\'']' step3-modern.js > errors.txt
```

---

## Phase 4: Dynamic Analysis

### 4.1 Setup Debug Environment

```bash
# Create test environment
mkdir debug-env
cd debug-env

# Link deobfuscated code
ln -s ../step3-modern.js cli-debug.js

# Add debug wrapper
cat > run-debug.sh << 'EOF'
#!/bin/bash
NODE_OPTIONS="--inspect-brk=0.0.0.0:9229" node cli-debug.js "$@"
EOF
chmod +x run-debug.sh
```

### 4.2 Runtime Analysis

**Trace execution:**
```bash
# Run with strace to see system calls
strace -o trace.log node step3-modern.js --help

# Run with node inspector
node --inspect-brk step3-modern.js --help
# Then connect Chrome DevTools
```

**Monitor network traffic:**
```bash
# Use mitmproxy or similar
mitmproxy -p 8080
export HTTP_PROXY=http://localhost:8080
export HTTPS_PROXY=http://localhost:8080
node step3-modern.js [command]
```

### 4.3 API Endpoint Discovery

**Goals:**
- Map all API endpoints
- Document request/response formats
- Understand authentication flow
- Identify rate limiting logic

---

## Phase 5: Documentation & Reconstruction

### 5.1 Generate Documentation

**Tools:**
- JSDoc comments based on discovered functionality
- TypeScript definitions (`.d.ts` files)
- API documentation (endpoints, parameters)
- Architecture diagrams (using mermaid or similar)

```bash
# Generate initial JSDoc
npm install -g jsdoc
jsdoc step3-modern.js -d docs/

# Generate TypeScript definitions
npm install -g dtslint
# Create manual .d.ts based on discoveries
```

### 5.2 Create Clean Reimplementation

**Option A: Reference Implementation**
- Use discoveries to create clean TypeScript implementation
- Maintain API compatibility
- Add proper types and documentation

**Option B: Enhanced Fork**
- Keep core logic
- Add debugging capabilities
- Improve error messages
- Add telemetry/logging

---

## Phase 6: Advanced Analysis

### 6.1 Security Audit

**Check for:**
- Hardcoded secrets or API keys
- Insecure data handling
- Command injection vulnerabilities
- Unsafe file operations
- Network security issues

```bash
# Search for potential secrets
grep -i "api.?key\|secret\|password\|token" step3-modern.js

# Check for eval/Function usage
grep -n "eval\(\\|new Function\\|require.*eval" step3-modern.js
```

### 6.2 Performance Analysis

```bash
# Profile execution
node --prof step3-modern.js [command]
node --prof-process isolate-*.log > profile.txt

# Memory profiling
node --inspect --expose-gc step3-modern.js [command]
```

### 6.3 Dependency Analysis

**Identify embedded libraries:**
- LocalForage (already identified)
- Promise polyfill (already identified)
- Other bundled dependencies

**Extract version information:**
```bash
grep -oP 'version["\s:]+["'\'']\d+\.\d+\.\d+' step3-modern.js
```

---

## Phase 7: Tool Development

### 7.1 Build Analysis Tools

**Create utilities:**

1. **Symbol Table Generator**
   - Maps obfuscated → semantic names
   - Tracks confidence levels
   - Allows manual overrides

2. **Code Navigator**
   - Jump to function definitions
   - Show call graphs
   - Display data flow

3. **Diff Tool**
   - Compare original vs deobfuscated
   - Track transformation stages
   - Verify functionality preservation

### 7.2 Automated Testing

```bash
# Create test suite
mkdir tests/
cat > tests/basic.test.js << 'EOF'
// Test basic CLI functionality
const { exec } = require('child_process');

test('CLI shows help', (done) => {
  exec('node step3-modern.js --help', (err, stdout) => {
    expect(stdout).toContain('Usage:');
    done();
  });
});
EOF
```

---

## Expected Deliverables

### Short-term (1-2 weeks)
- [ ] Restringer-processed code
- [ ] Modernized ES6+ syntax
- [ ] Initial variable mapping (top 100 symbols)
- [ ] Module structure documentation
- [ ] String/constant extraction

### Medium-term (2-4 weeks)
- [ ] JSNice semantic renaming complete
- [ ] Component map with all major systems
- [ ] API endpoint documentation
- [ ] Debug environment setup
- [ ] Security audit report

### Long-term (1-2 months)
- [ ] Complete semantic renaming
- [ ] Full TypeScript definitions
- [ ] Architecture documentation
- [ ] Clean reference implementation (optional)
- [ ] Analysis tools suite

---

## Challenges & Considerations

### Technical Challenges
1. **File Size** - 15MB file is difficult to process
   - Solution: Split into logical modules first

2. **Obfuscation Depth** - Multiple layers of obfuscation
   - Solution: Iterative approach with multiple tools

3. **Lost Context** - Minification removes comments/types
   - Solution: Combine static + dynamic analysis

### Legal Considerations
⚠️ **Important:** This is reverse engineering of proprietary software
- Ensure compliance with Terms of Service
- Use only for educational/research purposes
- Respect intellectual property rights
- Do not redistribute deobfuscated code publicly

### Ethical Considerations
- Document security vulnerabilities responsibly
- Report findings to Anthropic if security issues found
- Consider contributing improvements upstream

---

## Resources

### Tools
- [webcrack](https://github.com/j4k0xb/webcrack) - Initial deobfuscation ✅
- [restringer](https://github.com/PerimeterX/restringer) - Advanced deobfuscation
- [JSNice](http://jsnice.org/) - ML-based renaming
- [Lebab](https://github.com/lebab/lebab) - ES6 modernization
- [Babel](https://babeljs.io/) - AST manipulation

### References
- [JavaScript Deobfuscation Guide](https://deobfuscate.io/)
- [AST Explorer](https://astexplorer.net/) - Visualize code structure
- [Anthropic Docs](https://docs.anthropic.com/) - Official API reference

### Community
- r/ReverseEngineering
- Stack Overflow - javascript-obfuscation tag

---

## Getting Started

**Recommended first steps:**

```bash
# 1. Install tools
npm install -g @restringer/cli lebab prettier

# 2. Create working directory
mkdir -p work/{step2,step3,step4,analysis}

# 3. Run restringer
restringer deobfuscated.js -o work/step2/restringer.js

# 4. Modernize
lebab work/step2/restringer.js -o work/step3/modern.js --transform arrow,let,template

# 5. Format
prettier --write work/step3/modern.js

# 6. Analyze
grep -oP '\bfunction \w+' work/step3/modern.js | head -100 > work/analysis/functions.txt
```

**Next:** Document findings in `work/analysis/discoveries.md`

---

*Last Updated: 2025-11-12*
*Status: Phase 1 Ready*
