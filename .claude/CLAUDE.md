# CLAUDE.md

Claude Code guidance for this repo.

## What This Repo Is

Dotfiles repo managed with [GNU Stow](https://www.gnu.org/software/stow/). Each top-level dir = stow package mirroring `$HOME` structure.

## Installing / Removing Symlinks

`make` script (zsh, not Makefile) manages stow ops:

```zsh
# Symlink all packages into $HOME
./make install

# Remove all symlinks from $HOME
./make cleanup
```

Stow expected at `/opt/homebrew/bin/stow` (Apple Silicon) or `/usr/local/bin/stow` (Intel).

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
| `AGENTS.md` | Global agent instructions |
| `agents/` | Specialized agent prompts (e.g. `code-reviewer.md`) |
| `commands/` | Slash commands (e.g. `/fix-plan-names`) |
| `rules/` | Auto-loaded rules: `context7.md`, `conventional-commits.md`, `git-safety.md`, `plan-naming.md` |
| `mcp.json` | MCP server config |
| `themes/` | UI themes |

Packages (`settings.json` → `packages`): `npm:pi-mcp-adapter`, `npm:pi-subagents`, `git:github.com/DietrichGebert/ponytail`, `git:github.com/obra/superpowers`, `npm:pi-rules`.

Skills are managed at runtime by the pi-skills plugin (`~/.pi/agent/skills/`) — not tracked in this repo.

## Claude Code (`claude/`)

Config at `claude/.claude/`. Tracked files (config only — cache/runtime dirs untracked):

| File/Dir | Purpose |
|----------|---------|
| `settings.json` | Env, permissions, model/advisor model, hooks, status line |
| `CLAUDE.md` | Global Claude instructions |
| `agents/` | Specialized agent prompts |
| `rules/` | Auto-loaded user rules (e.g. plan naming) |
| `commands/` | Custom slash commands (e.g. `/fix-plan-names`) |

## VIA (`via/`)

Keyboard layout files for Monsgeek M1V5 (ISO layout). Not stowed to `$HOME` — `.stow-local-ignore` excludes JSON files; import manually into VIA app.

## Adding a New Package

1. Create top-level dir matching package name.
2. Add files mirroring `$HOME` paths.
3. Add package name to `STOW_PACKAGES` in `make`.
4. Run `./make install` to symlink.