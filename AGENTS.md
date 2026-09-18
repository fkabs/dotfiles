# AGENTS.md

Agent guidance for this repo (Claude Code, pi). pi reads `AGENTS.md` directly; Claude Code reads `CLAUDE.md`, which is a one-line `@AGENTS.md` import (not a symlink): edit `AGENTS.md`, changes apply to both automatically.

## What This Repo Is

Dotfiles repo managed with [GNU Stow](https://www.gnu.org/software/stow/), portable
across macOS and Linux (work laptop, Linux laptop, headless servers, no Homebrew
there). Each top-level dir = stow package mirroring `$HOME` structure. Every package
stows on every OS: there's no per-OS package split; macOS-only behavior is guarded
inline at runtime instead (see below).

## Installing / Removing Symlinks

`justfile` (repo root) manages stow ops. Requires `just` and `stow` on `PATH`.

```zsh
just install            # symlink all packages into $HOME
just install nvim tmux  # symlink (or restow) just these packages
just uninstall          # remove all symlinks from $HOME
just restow             # re-stow all packages (fixes broken links)
```

This repo is config-only: it doesn't install the CLI tools it configures. See
[README.md](README.md) for what needs to already be on `PATH`.

Managed packages: `bat`, `btop`, `claude`, `ghostty`, `git`, `herdr`, `nvim`, `pi`,
`starship`, `tmux`, `zsh`. `via` is never stowed (excluded by omission, as before).

## Cross-Platform: OS Gates, Not Tool-Presence Checks

Tools are assumed installed (Homebrew or Linuxbrew, wherever this is stowed); nothing
guards on "is this tool on PATH". What's guarded is code that has no Linux equivalent
*at all*, regardless of what's installed:

- `zsh/.config/zsh/.zprofile`: Homebrew is loaded by checking all three known prefixes
  (`/opt/homebrew/bin/brew`, `/usr/local/bin/brew`, `/home/linuxbrew/.linuxbrew/bin/brew`,
  for macOS arm64/Intel and Linuxbrew) rather than a `uname` check, since the prefix
  differs by platform even when brew itself is guaranteed present. It's an `eval`, not a
  plain env var, so it lives in `.zprofile` (login shells only) rather than `.zshenv`
  (which stays exports-only, loaded for every shell). `$BROWSER`, `$SSH_AUTH_SOCK`, and
  the whole TeX Live block are behind explicit `[[ $(uname) == Darwin/Linux ]]` checks in
  `.zshenv`: these are OS API/toolchain differences, not missing packages.
- `zsh/.config/zsh/functions/{brewup,brewzap,backup}`: only the pieces with no Linux
  equivalent are guarded: `(( $+commands[mas] ))` (Mac App Store CLI, brew can't make
  this exist on Linux) and `(( $+commands[defaults] ))` (macOS Dock/preferences API).
  `brew`/`antidote`/`nvim`/`claude`/`pi` calls are unconditional.
- `git/.gitconfig`: credential helper is bare `!gh auth git-credential` (PATH-resolved,
  no more hardcoded `/opt/homebrew/bin/`); `bc` (Beyond Compare) stays the unconditional
  default diff/merge tool as before, that only matters if `git difftool`/`git
  mergetool` is invoked explicitly, so a missing `bc` on Linux is a soft failure, not a
  startup break. `difft` remains available via `git difftool -t difft` on any OS.

`localip`/`ips` (`.zsh_aliases`) key off `ipconfig`'s presence as an OS-detection proxy
(no Linux distro ships a binary by that name); the `pbcopy`/`pbpaste` clipboard shim
picks between `wl-copy`/`xclip` since macOS's names for these don't exist on Linux under
any name, install or not.

## Repository Structure

Each package dir = files relative to `$HOME`. Examples:
- `zsh/.zshenv` → `~/.zshenv`
- `zsh/.config/zsh/.zshrc` → `~/.config/zsh/.zshrc`
- `git/.gitconfig` → `~/.gitconfig`

## Zsh Configuration

Zsh config in `zsh/`, split across files sourced by `.zshrc`:

| File | Purpose |
|------|---------|
| `.zshenv` | Environment variables and `$PATH`, always loaded |
| `.zshrc` | Entry point; loads completions, aliases, plugins |
| `.zsh_aliases` | Shell aliases |
| `.zsh_binds` | Key bindings |
| `.zsh_config` | Shell configuration options |
| `.zsh_opts` | `setopt` / `unsetopt` calls |
| `.zsh_styles` | `zstyle` completion styling |

`ZDOTDIR` → `~/.config/zsh`: zsh reads config there, not `$HOME`.

`sudo` and `please` (`.zsh_aliases`) expand to `sudo -E HOME=$HOME ` (env and `$HOME`
preserved so root-run tools read the user's config; trailing space keeps alias
expansion of the next word).

Plugin management via [antidote](https://github.com/mattmc3/antidote). Plugin list: `zsh/.config/zsh/plugins/.zsh_plugins.txt`.

Custom zsh functions in `zsh/.config/zsh/functions/` autoloaded. Notable: `gpip`/`nopip` (bypass virtualenv pip guard), `venv`/`workon` (virtualenv helpers), `ssh-tunnel`, `backup`/`brewup`/`brewzap` (macOS-specific sections internally guarded by tool presence), see [Cross-Platform: Guards, Not Packages](#cross-platform-guards-not-packages).

## Key Environment Conventions

- `$DOTFILES` → `~/.dotfiles`
- `$ZDOTDIR` → `~/.config/zsh`
- XDG Base Directory spec: `$XDG_CONFIG_HOME`, `$XDG_CACHE_HOME`, `$XDG_DATA_HOME`
- `PIP_REQUIRE_VIRTUALENV=true`: pip blocked outside virtualenvs
- `SUDO_EDITOR=vim`: used by `sudoedit`; resolves the real `vim` binary, not the
  `vim`/`nvim` alias, since sudo runs it through a non-interactive shell
- Antidote plugin cache: `$XDG_CACHE_HOME/antidote`
- Tmux plugin cache: `$XDG_CACHE_HOME/tmux/plugins`

## Git (`git/`)

- `git/.gitconfig`: aliases, diff/merge tools (Beyond Compare, PATH-resolved `gh`
  credential helper), SSH signing, rerere
- `git/.gitignore_global`: global gitignore
- `git/.gitattributes`: global gitattributes
- Commits signed with SSH key `~/.ssh/keys/id_ed25519.pub`

## Herdr (`herdr/`)

Config at `herdr/.config/herdr/config.toml` (terminal workspace manager for AI
coding agents). `config.toml` and `plugins.json` are tracked; `session.json`,
`*.log`, `.plugins.lock` and `plugins/` in `~/.config/herdr/` are runtime state
and gitignored.
Reload a running server after edits: `herdr server reload-config`.
Validate: `herdr config check`.

`config.toml` is stowed. `herdr config reset-keys` (and possibly the onboarding
flow) writes it: if it reappears as a regular file in `~/.config/herdr/`,
re-sync with `cp ~/.config/herdr/config.toml herdr/.config/herdr/config.toml`,
then `just install herdr`.

## Neovim (`nvim/`)

Config in `nvim/.config/nvim/`. Structure:

- `init.lua`: loads `fkabs.core` and `fkabs.lazy`
- `lua/fkabs/core/`: options and keymaps (leader: `<Space>`, localleader: `\`)
- `lua/fkabs/lazy.lua`: [lazy.nvim](https://github.com/folke/lazy.nvim) bootstrap and plugin spec
- `lua/fkabs/plugins/`: one file per plugin
- `lua/fkabs/plugins/lsp/`: LSP setup (mason, nvim-lspconfig, nvim-cmp)

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

Config at `bat/.config/bat/config`, bat's native XDG location, found automatically
via `$XDG_CONFIG_HOME` (no `$BAT_CONFIG_PATH` override needed). Uses `--theme=ansi` so
syntax highlighting picks up the terminal's own ANSI colors (Ghostty's
`theme = rose-pine-moon`) instead of a hardcoded bat theme. Also used as `MANPAGER` for
rendered man pages.

## btop (`btop/`)

Config at `btop/.config/btop/btop.conf`, custom rose-pine-moon theme at `btop/.config/btop/themes/rose-pine-moon.theme`. Config format is btop **1.4.7+** (includes the GPU block: `show_gpu_info`, `shown_gpus`, `custom_gpu_name0..5`, etc.).

`~/.config/btop` is a folded stow symlink (`~/.config/btop` → `btop/.config/btop`), so if btop ever writes its own config back out, that write lands straight in the tracked repo file, not a copy: expect `btop.conf` to show up dirty in `git status` after running btop in that case; commit or discard the diff.

## Pi (`pi/`)

Config at `pi/.pi/agent/`. Tracked content:

| File/Dir | Purpose |
|----------|---------|
| `settings.json` | Default provider, model, thinking level, theme, and packages |
| `AGENTS.md` | Global agent instructions, standalone copy of `claude/.claude/CLAUDE.md`'s content (see below), kept in sync by hand |
| `agents/` | Specialized agent prompts (e.g. `code-reviewer.md`) |
| `commands/` | Slash commands (empty) |
| `mcp.json` | MCP server config |
| `skills/` | Tracked skill packs (e.g. `agents-sdk`, `cloudflare-email-service`) |
| `themes/` | UI themes |

Packages (`settings.json` → `packages`): `npm:pi-mcp-adapter`, `npm:pi-subagents`, `git:github.com/DietrichGebert/ponytail`, `git:github.com/obra/superpowers`, `npm:pi-rules`, `git:github.com/jonjonrankin/pi-caveman`.

## Claude Code (`claude/`)

Config at `claude/.claude/`. Tracked files (config only, cache/runtime dirs untracked):

| File/Dir | Purpose |
|----------|---------|
| `settings.json` | Env, permissions, model/advisor model, hooks, status line |
| `CLAUDE.md` | Global Claude instructions, `pi/.pi/agent/AGENTS.md` holds an independent copy of this content, kept in sync by hand (see below) |
| `rules/` | Auto-loaded user rules (e.g. git safety) |
| `commands/` | Custom slash commands (empty) |
| `skills/` | Tracked skill packs (`supacode-cli`, `supacode-deeplinks`) |

`settings.json` is stowed. If it ever reappears as a regular file in `~/.claude/`, some writer (Claude Code itself, supacode) replaced the symlink: re-sync with `cp ~/.claude/settings.json claude/.claude/settings.json`, then `just install claude`.

## VIA (`via/`)

Keyboard layout files for Monsgeek M1V5 (ISO layout). Not stowed to `$HOME`, excluded by omission from the `packages` variable in `justfile`, not by ignore rules; `via/.stow-local-ignore` is empty and vestigial. `just install via` would stow it anyway (footgun, don't). Import layout JSON manually into the VIA app.

## Claude Code vs pi Portability

The `claude/` and `pi/` packages cannot share extension config: different runtimes:

| Thing | Claude Code | pi | Portable? |
|---|---|---|---|
| Skills | `skills/<name>/SKILL.md` | `skills/<name>/SKILL.md` | Yes, byte-identical layout, e.g. `agents-sdk/SKILL.md` |
| Commands | `.md` + YAML frontmatter (`allowed-tools`, `description`) | `.toml` (`description`, `prompt`) | No, different format |
| Plugins / extensions | `.claude-plugin/{plugin.json,marketplace.json}`; hooks are shell commands; `/plugin marketplace add` | `package.json` `"pi"` key → `extensions/*.ts` (TypeScript), or `plugin.yaml`; hooks are named lifecycle events (`before_agent_start`, `pre_llm_call`); `pi install git:`/`npm:` | No, different runtime entirely |
| Global instructions | `~/.claude/CLAUDE.md` | `~/.pi/agent/AGENTS.md` | No, kept as two independently maintained files, no automated sync (see Pi/Claude Code tables above) |

Cross-tool packages solve this by shipping per-tool adapters from one repo, not a shared format (e.g. `ponytail` ships `.claude-plugin/`, `.cursor/`, `.windsurf/`, `.opencode/`, plus one shared `skills/` dir).

## Adding a New Package

1. Create top-level dir matching package name.
2. Add files mirroring `$HOME` paths.
3. Add package name to `packages` in `justfile`.
4. Run `just install <pkg>` to symlink.
