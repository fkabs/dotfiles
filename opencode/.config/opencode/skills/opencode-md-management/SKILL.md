---
name: opencode-md-improver
description: Audit and improve AGENTS.md files in repositories. Use when user asks to check, audit, update, improve, or fix AGENTS.md files. Scans for all AGENTS.md files, evaluates quality against templates, outputs quality report, then makes targeted updates. Also use when the user mentions "AGENTS.md maintenance" or "project memory optimization".
tools: Read, Glob, Grep, Bash, Edit
---

# AGENTS.md Improver

Audit, evaluate, and improve AGENTS.md files across a codebase to ensure OpenCode has optimal project context.

**This skill can write to AGENTS.md files.** After presenting a quality report and getting user approval, it updates AGENTS.md files with targeted improvements.

## Workflow

### Phase 1: Discovery

Find all AGENTS.md files (with CLAUDE.md fallback) in the repository:

```bash
# Primary: AGENTS.md. Fallback: CLAUDE.md where no AGENTS.md sibling exists
find . \( -name "AGENTS.md" -o -name "CLAUDE.md" \) 2>/dev/null | head -50
```

**Fallback rule:** OpenCode reads `AGENTS.md` first. If absent in a directory, it falls back to `CLAUDE.md`. When both exist, `AGENTS.md` wins. When auditing, flag any `CLAUDE.md` that has no `AGENTS.md` sibling as a migration opportunity — recommend renaming to `AGENTS.md` for clarity.

**File Types & Locations:**

| Type | Primary | Fallback | Purpose |
|------|---------|----------|---------|
| Project root | `./AGENTS.md` | `./CLAUDE.md` | Primary project context |
| Local overrides | `./.agents.local.md` | — | Personal/local (gitignored) |
| Global defaults | `~/.config/opencode/AGENTS.md` | `~/.config/opencode/CLAUDE.md` | User-wide defaults |
| Package-specific | `./packages/*/AGENTS.md` | `./packages/*/CLAUDE.md` | Monorepo module context |
| Subdirectory | Any `AGENTS.md` | Any `CLAUDE.md` | Feature/domain context |

### Phase 2: Quality Assessment

For each AGENTS.md file, evaluate against quality criteria. See [references/quality-criteria.md](references/quality-criteria.md) for detailed rubrics.

**Quick Assessment Checklist:**

| Criterion | Weight | Check |
|-----------|--------|-------|
| Commands/workflows documented | High | Are build/test/deploy commands present? |
| Architecture clarity | High | Can OpenCode understand the codebase structure? |
| Non-obvious patterns | Medium | Are gotchas and quirks documented? |
| Conciseness | Medium | No verbose explanations or obvious info? |
| Currency | High | Does it reflect current codebase state? |
| Actionability | High | Are instructions executable, not vague? |

**Quality Scores:**
- **A (90-100)**: Comprehensive, current, actionable
- **B (70-89)**: Good coverage, minor gaps
- **C (50-69)**: Basic info, missing key sections
- **D (30-49)**: Sparse or outdated
- **F (0-29)**: Missing or severely outdated

### Phase 3: Quality Report Output

**ALWAYS output the quality report BEFORE making any updates.**

Format:

```
## AGENTS.md Quality Report

### Summary
- Files found: X
- Average score: X/100
- Files needing update: X

### File-by-File Assessment

#### 1. ./AGENTS.md (Project Root)
**Score: XX/100 (Grade: X)**

| Criterion | Score | Notes |
|-----------|-------|-------|
| Commands/workflows | X/20 | ... |
| Architecture clarity | X/20 | ... |
| Non-obvious patterns | X/15 | ... |
| Conciseness | X/15 | ... |
| Currency | X/15 | ... |
| Actionability | X/15 | ... |

**Issues:**
- [List specific problems]

**Recommended additions:**
- [List what should be added]
```

### Phase 4: Targeted Updates

After outputting the quality report, ask user for confirmation before updating.

**Update Guidelines (Critical):**

1. **Propose targeted additions only** - Focus on genuinely useful info:
   - Commands or workflows discovered during analysis
   - Gotchas or non-obvious patterns found in code
   - Package relationships that weren't clear
   - Testing approaches that work
   - Configuration quirks

2. **Keep it minimal** - Avoid:
   - Restating what's obvious from the code
   - Generic best practices already covered
   - One-off fixes unlikely to recur
   - Verbose explanations when a one-liner suffices

3. **Show diffs** - For each change, show:
   - Which AGENTS.md file to update
   - The specific addition (as a diff or quoted block)
   - Brief explanation of why this helps future sessions

**Diff Format:**

```markdown
### Update: ./AGENTS.md

**Why:** Build command was missing, causing confusion about how to run the project.

```diff
+ ## Quick Start
+
+ ```bash
+ npm install
+ npm run dev  # Start development server on port 3000
+ ```
```
```

### Phase 5: Apply Updates

After user approval, apply changes using the Edit tool. Preserve existing content structure.

### Phase 6: Caveman Compress

After applying updates, automatically compress each modified AGENTS.md to reduce input tokens:

```bash
SKILL_DIR="$(find ~/.config/opencode/skills -name "caveman-compress" -type d 2>/dev/null | head -1)"
cd "$SKILL_DIR" && python3 -m scripts <absolute_path_to_updated_file>
```

Run for each file updated in Phase 5. If compress fails, leave file as-is and report error — do not block on compress failure.

## Templates

See [references/templates.md](references/templates.md) for AGENTS.md templates by project type.

## Common Issues to Flag

1. **Stale commands**: Build commands that no longer work
2. **Missing dependencies**: Required tools not mentioned
3. **Outdated architecture**: File structure that's changed
4. **Missing environment setup**: Required env vars or config
5. **Broken test commands**: Test scripts that have changed
6. **Undocumented gotchas**: Non-obvious patterns not captured

## What Makes a Great AGENTS.md

**Key principles:**
- Concise and human-readable
- Actionable commands that can be copy-pasted
- Project-specific patterns, not generic advice
- Non-obvious gotchas and warnings

**Recommended sections** (use only what's relevant):
- Commands (build, test, dev, lint)
- Architecture (directory structure)
- Key Files (entry points, config)
- Code Style (project conventions)
- Environment (required vars, setup)
- Testing (commands, patterns)
- Gotchas (quirks, common mistakes)
- Workflow (when to do what)
