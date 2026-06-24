---
description: Scan the plans directory and rename any files that don't follow the YYYY-MM-DD_short-description.md scheme.
disable-model-invocation: true
allowed-tools: Read Glob Bash
---

Rename plan files that don't follow the `YYYY-MM-DD_short-description.md` naming scheme.

## Steps

1. **Resolve the plans directory** — check each of the following for a `plansDirectory` key
   and use the first value found; fall back to `~/.claude/plans` if none is set:
   - `./.claude/settings.local.json`
   - `./.claude/settings.json`
   - `~/.claude/settings.json`
   Expand `~` to the home directory.

2. **List all `*.md` files** in that directory (non-recursive).

3. **Identify non-conforming files** — any file whose name does not match the pattern
   `^\d{4}-\d{2}-\d{2}_`.

4. **Choose the new name for each** non-conforming file:
   - Read its first line. If it is a Markdown H1 (`# `) whose content already matches
     `YYYY-MM-DD_slug` (e.g. `# 2026-06-16_my-plan`), rename the file to `<slug>.md`.
   - Otherwise, prefix the file's mtime date using
     `stat -f '%Sm' -t '%Y-%m-%d' <file>` and produce `<date>_<original-filename>`.
   - The description part must be kebab or snake-case; strip any trailing random filler
     words if the original name is clearly harness-generated (random word pairs at end).

5. **Rename each file** with `mv`. If the target name already exists, skip it and report
   the collision — never overwrite.

6. **Report** a table of: old name → new name (or "skipped: target exists"). If nothing
   needed renaming, say "All plan files already conform."

7. **Update memory references** — for each successfully renamed file, search the current
   project's memory directory (`~/.claude/projects/*/memory/` — match the project whose
   path corresponds to the current working directory) for any occurrences of the old
   filename and replace them with the new filename. Also update `MEMORY.md` if it contains
   a pointer. Report which memory files were updated, or "no memory references found" if
   none matched.
