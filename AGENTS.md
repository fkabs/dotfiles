# AGENTS.md

Agent guidance for this repo (Claude Code, pi). pi reads `AGENTS.md` directly; Claude Code reads `CLAUDE.md`, which is a one-line `@AGENTS.md` import (not a symlink) — edit `AGENTS.md`, changes apply to both automatically.

## What This Repo Is

Dotfiles repo managed with [GNU Stow](https://www.gnu.org/software/stow/). Each top-level dir = stow package mirroring `$HOME` structure.

## Installing / Removing Symlinks

`justfile` (repo root) manages stow ops. Requires `just` and `stow` on `PATH`.

```zsh
just install     # symlink all packages into $HOME
just uninstall   # remove all symlinks from $HOME
just restow      # re-stow all packages (fixes broken links)
```

Each recipe optionally takes package names to target a subset, e.g. `just install nvim`.

Managed packages: `bat`, `btop`, `claude`, `ghostty`, `git`, `nvim`, `pi`, `starship`, `tmux`, `zsh`.

## Repository Structure

Each package dir = files relative to `$HOME`. Examples:
- `zsh/.zshenv` → `~/.zshenv`
- `zsh/.config/zsh/.zshrc` → `~/.config/zsh/.zshrc`
- `git/.gitconfig` → `~/.gitconfig`

## Zsh Configuration

Zsh config in `zsh/`, split across files sourced by `.zshrc`:

| File | Purpose |
|------|---------|
| `.zshenv` | Environment variables and `$PATH` — always loaded |
| `.zshrc` | Entry point; loads completions, aliases, plugins |
| `.zsh_aliases` | Shell aliases |
| `.zsh_binds` | Key bindings |
| `.zsh_config` | Shell configuration options |
| `.zsh_opts` | `setopt` / `unsetopt` calls |
| `.zsh_styles` | `zstyle` completion styling |

`ZDOTDIR` → `~/.config/zsh` — zsh reads config there, not `$HOME`.

Plugin management via [antidote](https://github.com/mattmc3/antidote). Plugin list: `zsh/.config/zsh/plugins/.zsh_plugins.txt`.

Custom zsh functions in `zsh/.config/zsh/functions/` autoloaded. Notable: `gpip`/`nopip` (bypass virtualenv pip guard), `venv`/`workon` (virtualenv helpers), `brewup`/`brewzap` (Homebrew helpers), `backup`, `ssh-tunnel`.

## Key Environment Conventions

- `$DOTFILES` → `~/.dotfiles`
- `$ZDOTDIR` → `~/.config/zsh`
- XDG Base Directory spec: `$XDG_CONFIG_HOME`, `$XDG_CACHE_HOME`, `$XDG_DATA_HOME`
- `PIP_REQUIRE_VIRTUALENV=true` — pip blocked outside virtualenvs
- Antidote plugin cache: `$XDG_CACHE_HOME/antidote`
- Tmux plugin cache: `$XDG_CACHE_HOME/tmux/plugins`

## Git (`git/`)

- `git/.gitconfig` — aliases, diff/merge tools (Beyond Compare), SSH signing, rerere
- `git/.gitignore_global` — global gitignore
- `git/.gitattributes` — global gitattributes
- Commits signed with SSH key `~/.ssh/id_ed25519.pub`

## Neovim (`nvim/`)

Config in `nvim/.config/nvim/`. Structure:

- `init.lua` — loads `fkabs.core` and `fkabs.lazy`
- `lua/fkabs/core/` — options and keymaps (leader: `<Space>`, localleader: `\`)
- `lua/fkabs/lazy.lua` — [lazy.nvim](https://github.com/folke/lazy.nvim) bootstrap and plugin spec
- `lua/fkabs/plugins/` — one file per plugin
- `lua/fkabs/plugins/lsp/` — LSP setup (mason, nvim-lspconfig, nvim-cmp)

Plugins: telescope, treesitter, neo-tree, lualine, gitsigns, trouble, which-key, indent-blankline, nvim-autopairs, vim-illuminate, comment, rose-pine.

## Tmux (`tmux/`)

Config at `tmux/.config/tmux/tmux.conf`.

- Prefix: `C-Space`
- Pane navigation: `prefix + h/j/k/l`
- Plugin manager: [TPM](https://github.com/tmux-plugins/tpm) (expected at `~/.tmux/plugins/tpm/tpm`)
- Plugins: tpm, tmux-sensible, tmux-mode-indicator, rose-pine/tmux (moon variant)
- Plugin cache: `$XDG_CACHE_HOME/tmux/plugins`

## Ghostty (`ghostty/`)

Config at `ghostty/.config/ghostty/config`.

- Theme: rose-pine-moon (custom theme in `themes/`)
- Font: FiraCode Nerd Font Mono, 14pt, ligatures disabled
- Global keybind: `Super+`` ` → toggle quick terminal
- Shell integration: sudo passthrough, ssh-terminfo, no cursor/title overrides

## Starship (`starship/`)

Config at `starship/.config/starship/starship.toml`. Uses rose-pine-moon palette. Prompt: username, hostname, directory, git branch/status, python env, time.

## bat (`bat/`)

Config at `bat/.batrc` (path via `$BAT_CONFIG_PATH` in `.zshenv`). Used as `MANPAGER` for rendered man pages.

## btop (`btop/`)

Config at `btop/.config/btop/btop.conf`, custom rose-pine-moon theme at `btop/.config/btop/themes/rose-pine-moon.theme`.

## Pi (`pi/`)

Config at `pi/.pi/agent/`. Tracked content:

| File/Dir | Purpose |
|----------|---------|
| `settings.json` | Default provider, model, thinking level, theme, and packages |
| `AGENTS.md` | Global agent instructions — standalone copy of `claude/.claude/CLAUDE.md`'s content (see below), kept in sync by hand |
| `agents/` | Specialized agent prompts (e.g. `code-reviewer.md`) |
| `commands/` | Slash commands (empty) |
| `mcp.json` | MCP server config |
| `skills/` | Tracked skill packs (e.g. `agents-sdk`, `cloudflare-email-service`) |
| `themes/` | UI themes |

Packages (`settings.json` → `packages`): `npm:pi-mcp-adapter`, `npm:pi-subagents`, `git:github.com/DietrichGebert/ponytail`, `git:github.com/obra/superpowers`, `npm:pi-rules`, `git:github.com/jonjonrankin/pi-caveman`.

## Claude Code (`claude/`)

Config at `claude/.claude/`. Tracked files (config only — cache/runtime dirs untracked):

| File/Dir | Purpose |
|----------|---------|
| `settings.json` | Env, permissions, model/advisor model, hooks, status line |
| `CLAUDE.md` | Global Claude instructions — `pi/.pi/agent/AGENTS.md` holds an independent copy of this content, kept in sync by hand (see below) |
| `rules/` | Auto-loaded user rules (e.g. git safety) |
| `commands/` | Custom slash commands (empty) |
| `skills/` | Tracked skill packs (`supacode-cli`, `supacode-deeplinks`) |

`settings.json` is stowed. If it ever reappears as a regular file in `~/.claude/`, some writer (Claude Code itself, supacode) replaced the symlink — re-sync with `cp ~/.claude/settings.json claude/.claude/settings.json`, then `just install claude`.

## VIA (`via/`)

Keyboard layout files for Monsgeek M1V5 (ISO layout). Not stowed to `$HOME` — excluded by omission from the `packages` variable in `justfile`, not by ignore rules; `via/.stow-local-ignore` is empty and vestigial. `just install via` would stow it anyway (footgun — don't). Import layout JSON manually into the VIA app.

## Claude Code vs pi Portability

The `claude/` and `pi/` packages cannot share extension config — different runtimes:

| Thing | Claude Code | pi | Portable? |
|---|---|---|---|
| Skills | `skills/<name>/SKILL.md` | `skills/<name>/SKILL.md` | Yes — byte-identical layout, e.g. `agents-sdk/SKILL.md` |
| Commands | `.md` + YAML frontmatter (`allowed-tools`, `description`) | `.toml` (`description`, `prompt`) | No — different format |
| Plugins / extensions | `.claude-plugin/{plugin.json,marketplace.json}`; hooks are shell commands; `/plugin marketplace add` | `package.json` `"pi"` key → `extensions/*.ts` (TypeScript), or `plugin.yaml`; hooks are named lifecycle events (`before_agent_start`, `pre_llm_call`); `pi install git:`/`npm:` | No — different runtime entirely |
| Global instructions | `~/.claude/CLAUDE.md` | `~/.pi/agent/AGENTS.md` | No — kept as two independently maintained files, no automated sync (see Pi/Claude Code tables above) |

Cross-tool packages solve this by shipping per-tool adapters from one repo, not a shared format (e.g. `ponytail` ships `.claude-plugin/`, `.cursor/`, `.windsurf/`, `.opencode/`, plus one shared `skills/` dir).

## Adding a New Package

1. Create top-level dir matching package name.
2. Add files mirroring `$HOME` paths.
3. Add package name to `packages` in `justfile`.
4. Run `just install <pkg>` to symlink.
