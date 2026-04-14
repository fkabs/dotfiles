# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

A dotfiles repository managed with [GNU Stow](https://www.gnu.org/software/stow/). Each top-level directory is a stow package that mirrors the `$HOME` directory structure.

## Installing / Removing Symlinks

The `make` script (a zsh script, not a Makefile) manages stow operations:

```zsh
# Symlink all packages into $HOME
./make install

# Remove all symlinks from $HOME
./make cleanup
```

Stow is expected at `/opt/homebrew/bin/stow` (Apple Silicon) or `/usr/local/bin/stow` (Intel).

The managed packages are: `agents`, `bat`, `btop`, `claude`, `ghostty`, `git`, `nvim`, `opencode`, `starship`, `tmux`, `zsh`.

## Repository Structure

Each package directory contains files laid out exactly as they should appear relative to `$HOME`. For example:
- `zsh/.zshenv` → `~/.zshenv`
- `zsh/.config/zsh/.zshrc` → `~/.config/zsh/.zshrc`
- `git/.gitconfig` → `~/.gitconfig`

## Zsh Configuration

Zsh config lives in `zsh/` and is split across several files sourced by `.zshrc`:

| File | Purpose |
|------|---------|
| `.zshenv` | Environment variables and `$PATH` — always loaded |
| `.zshrc` | Entry point; loads completions, aliases, plugins |
| `.zsh_aliases` | Shell aliases |
| `.zsh_binds` | Key bindings |
| `.zsh_config` | Shell configuration options |
| `.zsh_opts` | `setopt` / `unsetopt` calls |
| `.zsh_styles` | `zstyle` completion styling |

`ZDOTDIR` is set to `~/.config/zsh`, so zsh reads config from there, not `$HOME`.

Plugin management uses [antidote](https://github.com/mattmc3/antidote). Plugin list is in `zsh/.config/zsh/plugins/.zsh_plugins.txt`.

Custom zsh functions in `zsh/.config/zsh/functions/` are autoloaded. Notable functions: `gpip`/`nopip` (bypass virtualenv pip guard), `venv`/`workon` (virtualenv helpers), `brewup`/`brewzap` (Homebrew helpers), `backup`, `ssh-tunnel`.

## Key Environment Conventions

- `$DOTFILES` → `~/.dotfiles`
- `$ZDOTDIR` → `~/.config/zsh`
- XDG Base Directory spec is followed: `$XDG_CONFIG_HOME`, `$XDG_CACHE_HOME`, `$XDG_DATA_HOME`
- `PIP_REQUIRE_VIRTUALENV=true` — pip is blocked outside virtualenvs by default
- Antidote plugin cache: `$XDG_CACHE_HOME/antidote`
- Tmux plugin cache: `$XDG_CACHE_HOME/tmux/plugins`

## Git (`git/`)

- `git/.gitconfig` — aliases, diff/merge tools (Beyond Compare), SSH signing, rerere
- `git/.gitignore_global` — global gitignore
- `git/.gitattributes` — global gitattributes
- Commits are signed with SSH key `~/.ssh/id_ed25519.pub`

## Neovim (`nvim/`)

Config lives in `nvim/.config/nvim/`. Structure:

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
- Plugin cache path: `$XDG_CACHE_HOME/tmux/plugins`

## Ghostty (`ghostty/`)

Config at `ghostty/.config/ghostty/config`.

- Theme: rose-pine-moon (custom theme file in `themes/`)
- Font: FiraCode Nerd Font Mono, 14pt, ligatures disabled
- Global keybind: `Super+`` ` → toggle quick terminal
- Shell integration: sudo passthrough, ssh-terminfo, no cursor/title overrides

## Starship (`starship/`)

Config at `starship/.config/starship/starship.toml`. Uses the rose-pine-moon palette. Prompt shows: username, hostname, directory, git branch/status, python env, time.

## bat (`bat/`)

Config at `bat/.batrc` (path set via `$BAT_CONFIG_PATH` in `.zshenv`). Used as the `MANPAGER` for rendered man pages.

## btop (`btop/`)

Config at `btop/.config/btop/btop.conf` with a custom rose-pine-moon theme at `btop/.config/btop/themes/rose-pine-moon.theme`.

## Claude Code (`claude/`)

Config at `claude/.claude/`. Tracked files (config only — cache/runtime dirs are left untracked):

| File/Dir | Purpose |
|----------|---------|
| `settings.json` | Permissions, enabled plugins, advisor model |
| `CLAUDE.md` | Global Claude instructions |
| `agents/` | Custom agent definitions (subagent specs) |
| `skills/` | Custom skill definitions (slash commands) |

## Agents (`agents/`)

Stows to `~/.agents/`. Contains custom skills for superpowers plugins (caveman variants). Not tracked under `claude/` — these are plugin-managed skill definitions.

## OpenCode (`opencode/`)

Config at `opencode/.config/opencode/`.

- `opencode.json` — default agent: `plan`; permission policy: ask for all, allow reads of `~/.config/opencode/**` and `/tmp/**`
- `tui.json` — TUI theme: `system`
- `AGENTS.md` — global agent instructions (caveman mode)

## VIA (`via/`)

Keyboard layout files for a Monsgeek M1V5 (ISO layout). Not stowed to `$HOME` — the `.stow-local-ignore` file excludes the JSON files from symlinking.

## Adding a New Package

1. Create a new top-level directory matching the package name.
2. Add files mirroring their intended `$HOME` paths.
3. Add the package name to the `STOW_PACKAGES` array in `make`.
4. Run `./make install` to symlink.
