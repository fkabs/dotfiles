# Conventional Commits

Based on the [Conventional Commits](https://www.conventionalcommits.org/) spec.

## Structure

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Rules

- **Type** — required noun prefix. `feat` = new feature, `fix` = bug fix. Others allowed:
  `docs`, `chore`, `refactor`, `test`, `style`, `ci`, `build`, `perf`.
- **Scope** — optional noun in parens naming the affected codebase section
  (e.g. `fix(parser):`). Omit if broad.
- **Description** — required; follows the colon + space. Short, imperative, lowercase.
  Keep the subject line ≤ 72 chars.
- **Body** — optional; free-form, begins one blank line after the description. Multiple
  paragraphs allowed. For multiple notable changes, use `- ` bullets:
  ```
  type(scope): short summary of what changed

  - Change A: why/what
  - Change B: why/what
  ```
  Omit the body for trivial single-area changes.
- **Footers** — optional; one blank line after the body. `token: value` or `token #value`;
  use `-` for spaces in tokens (e.g. `Reviewed-by`).
- **Breaking changes** — flag with `!` before the colon (e.g. `feat(api)!:`) or a
  `BREAKING CHANGE: <desc>` footer. `BREAKING CHANGE` MUST be uppercase; with `!` the
  footer may be omitted.

## Examples

Multi-change (bullet body):
```
chore(claude): add plan-naming rule and /fix-plan-names command

- Add rules/making-plans.md: auto-loaded naming convention (YYYY-MM-DD_short-desc.md),
  no hardcoded path, references /fix-plan-names for bulk fixes
- Add commands/fix-plan-names.md: user-only slash command that resolves plansDirectory
  from settings, renames non-conforming plan files, updates memory references
- Remove dead SessionStart hook (context-mode-cache-heal.mjs; plugin uninstalled)
- Delete code-reviewer agent (no longer available)
- Fix repo doc table: remove phantom commands/ and hooks/ rows, add real rules/ and commands/
- Update plan naming format string (short-description) in CLAUDE.md
- zsh: add direnv hook
```

Trivial single-area change (subject only):
```
chore(dotfiles): update pi settings and difftool
```

## Grouping

Group related changes across multiple files/areas into one logical commit.
Split unrelated work into separate commits.
Goal: each commit tells one coherent story; history stays clean and bisectable.
