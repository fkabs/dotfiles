---
description: Conventional commit format
tools: "*"
dedupe: session
---
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
fix(git): show author consistently in log aliases

- ln: author was missing, showed committer instead ([%cn] -> [%an])
- ll: drop always-shown committer pair [a:,c:], keep [%an] only
- graph/lol: add author block via custom pretty format (replaces --oneline)
```

Trivial single-area change (subject only):
```
chore(dotfiles): update pi settings and difftool
```

## Grouping

Group related changes across multiple files/areas into one logical commit.
Split unrelated work into separate commits.
Goal: each commit tells one coherent story; history stays clean and bisectable.
