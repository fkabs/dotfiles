# Naming plan files

Plan files live in the plans directory (`plansDirectory` in `~/.claude/settings.json`;
default `~/.claude/plans/`).

**All plan files MUST be named `YYYY-MM-DD_short-description.md`** — today's date + a concise
kebab or snake-case description. No random words. No generic names.

Good: `2026-06-16_add-fix-plan-names-command.md`
Bad: `what-plugins-and-skills-functional-catmull.md`

Use this format when creating any new plan file.
To fix existing files that don't follow the scheme, run `/fix-plan-names`.
