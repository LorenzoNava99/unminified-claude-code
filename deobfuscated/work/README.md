# Deobfuscation Work Directory

This directory contains all work-in-progress files, analysis results, and tools for deobfuscating the Claude Code CLI.

## Directory Structure

```
work/
├── README.md                           # This file
├── PROGRESS.md                         # Progress tracker (update frequently!)
├── locks/                              # Phase lock files for coordination
│   └── phase1.lock                     # Current: Phase 1 locked
├── analysis/                           # Analysis outputs
│   ├── strings.txt                     # All string literals
│   ├── string-catalog.json             # Categorized strings
│   ├── identifier-frequency.txt        # Identifier usage counts
│   ├── top-identifiers.txt             # Top 500 identifiers
│   ├── entry-points.md                 # Main entry point analysis
│   ├── tool-locations.txt              # Tool implementation locations
│   ├── api-client-section.js           # API client code section
│   ├── network-calls.txt               # All network operations
│   └── module-structure.json           # Dependency graph
├── mappings/                           # Symbol rename mappings
│   ├── initial-mappings.json           # Phase 1 output
│   ├── symbol-map.json                 # Complete mapping database
│   └── validated-mappings.json         # Validated renames
├── tools/                              # Deobfuscation utilities
│   ├── rename-tool.js                  # Automated renaming script
│   ├── extract-strings.js              # String extraction tool
│   └── validate-rename.js              # Validation tool
├── step1-strings-extracted/            # After Phase 1
│   └── deobfuscated-step1.js
├── step2-renamed-high-confidence/      # After Phase 3.1
│   └── deobfuscated-step2.js
├── step3-renamed-medium-confidence/    # After Phase 3.2
│   └── deobfuscated-step3.js
└── final/                              # Final output
    ├── src/                            # Extracted modules
    │   ├── tools/                      # Tool implementations
    │   ├── api/                        # API client
    │   ├── cli/                        # CLI parser
    │   ├── hooks/                      # Hook system
    │   └── agents/                     # Agent system
    ├── package.json
    └── README.md
```

## Usage Guidelines

### Before Starting Any Work

1. **Check for locks:**
   ```bash
   ls -la locks/
   cat locks/*.lock
   ```

2. **Read progress:**
   ```bash
   cat PROGRESS.md
   ```

3. **Check git history:**
   ```bash
   git log --oneline -20
   ```

### Starting a New Phase

1. **Create lock file:**
   ```bash
   echo "Phase: X
   Agent: <your-agent-id>
   Started: $(date)
   Tasks: <what you're working on>" > locks/phaseX.lock
   ```

2. **Update PROGRESS.md:**
   - Change phase status to "🔄 In Progress"
   - Add your agent ID
   - Update started date

3. **Create working branch:**
   ```bash
   git checkout -b deobfuscation/phaseX-<description>
   ```

### During Work

1. **Commit frequently:**
   ```bash
   git add work/
   git commit -m "Phase X: <what you did>"
   ```

2. **Update PROGRESS.md** after each major milestone

3. **Keep lock file updated** if tasks change

### Completing a Phase

1. **Remove lock file:**
   ```bash
   rm locks/phaseX.lock
   ```

2. **Update PROGRESS.md:**
   - Mark phase as ✅ Complete
   - Add completion date
   - Update overall progress

3. **Create deliverables summary:**
   ```bash
   ls -lh analysis/  # Show what was created
   ```

4. **Push branch:**
   ```bash
   git push -u origin deobfuscation/phaseX-<description>
   ```

## Coordination Rules

### Lock File Protocol

- **Active lock** = Agent working (< 2 hours old)
- **Stale lock** = No activity > 2 hours, can be claimed
- **No lock** = Phase available

### Priority Rules

1. Phases should generally be completed in order (1→2→3→4→5→6)
2. Phase 2.2 (tool search) can start while Phase 1 is in progress
3. Multiple agents can work on different phases simultaneously
4. Never modify `deobfuscated.js` directly - work in `step*/` folders

### Conflict Resolution

If two agents start the same phase:
1. Earlier git timestamp wins
2. Other agent should move to next available phase
3. Communicate via commit messages
4. Update PROGRESS.md to clarify who's doing what

## File Safety

### Never Modify
- `../deobfuscated.js` - Original deobfuscated file (reference only)
- `../index.js` - LocalForage module
- `../node_modules/` - Extracted modules
- `../bundle.json` - Bundle metadata

### Safe to Modify
- Everything in `work/` directory
- Files in `step*/` directories
- Files in `final/` directory

### Backup Strategy
```bash
# Before major changes
cp step2-renamed-high-confidence/deobfuscated-step2.js \
   step2-renamed-high-confidence/deobfuscated-step2.js.backup

# After validation
rm *.backup
```

## Quick Reference

### Extract Strings
```bash
grep -oP '"[^"]+"' ../deobfuscated.js | sort -u > analysis/strings.txt
```

### Find Tool References
```bash
grep -n '"Read"' ../deobfuscated.js > analysis/read-tool-locations.txt
```

### Count Identifiers
```bash
grep -oE '\b[A-Za-z_$][A-Za-z0-9_$]*\b' ../deobfuscated.js | \
  sort | uniq -c | sort -rn > analysis/identifier-frequency.txt
```

### Search for Patterns
```bash
# Find API endpoints
grep -n "https://" ../deobfuscated.js

# Find imports
grep -n "^import\|require(" ../deobfuscated.js

# Find specific identifier
grep -n "\bDB9\b" ../deobfuscated.js
```

## Resources

### Extracted Symbols
`../../claude-code-docs/extracted-symbols/`
- 17 tools
- 33 slash commands
- 110 CLI flags
- 560+ total symbols

### Documentation
`../../claude-code-docs/` (30 markdown files)

### Plans
- `../DEOBFUSCATION_PLAN.md` - Comprehensive 6-phase plan
- `../NEXT_STEPS.md` - Original 7-phase roadmap
- `PROGRESS.md` - Current progress tracker

## Contact

If you're an agent working on this project:
- Update PROGRESS.md with your agent ID
- Leave detailed commit messages
- Check locks before starting
- Ask questions via commit messages if needed

---

**Created:** 2025-11-12
**Current Phase:** 1 (Analysis)
**Active Agent:** claude/explore-project-setup-011CV4E2HNUYpg1m6kcyiSou
