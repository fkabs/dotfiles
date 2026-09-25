# AGENTS.md

Agent guidance for this repo (Claude Code, pi). pi reads `AGENTS.md` directly; Claude
Code reads `CLAUDE.md`, a one-line `@AGENTS.md` import. Edit this file only.

## Overview

Dotfiles for macOS and Linux (work laptop, Linux laptop, headless servers), managed
with [GNU Stow](https://www.gnu.org/software/stow/). Each top-level dir is a stow
package mirroring `$HOME` (`zsh/.config/zsh/.zshrc` → `~/.config/zsh/.zshrc`).
Config-only: tools are installed separately, see [README.md](README.md).

Packages: `bat`, `btop`, `claude`, `ghostty`, `git`, `herdr`, `nvim`, `pi`,
`starship`, `tmux`, `zsh`. `via/` is not a package (see [VIA](#via)).

## Commands

```zsh
just install              # stow all packages
just install nvim tmux    # stow only these
just uninstall [pkgs]     # remove symlinks
just restow [pkgs]        # re-link (after adding/removing files in a package)
stow -n -v -R -t "$HOME" <pkg>   # dry run, check before touching $HOME
```

Commits run a [betterleaks](https://github.com/betterleaks/betterleaks) secret scan via
pre-commit (`.pre-commit-config.yaml`). Never bypass it.

## Stow Folding

- **Default: folded.** Stow links a whole dir when it can (`~/.config/nvim` → repo).
  New repo files show up instantly, but anything the app writes there lands in the
  repo. Intended for `btop` (it rewrites `btop.conf`, expect a dirty `git status`).
- **`herdr` and `claude`: `--no-folding`** (the `case` in `justfile`). Their apps write
  runtime state next to tracked config, so only tracked files are linked into real
  dirs. Cost: a new tracked file needs `just restow <pkg>`, and a file the app creates
  in `$HOME` (e.g. a skill made inside Claude Code) must be moved into the repo and
  restowed.
- Stow ignores `.gitignore`: any untracked file physically inside a package dir gets
  linked too. Keep app state out of package dirs.
- **Symlink replaced by a regular file.** Some writers swap the link for a real file
  (Claude Code/supacode → `~/.claude/settings.json`, `herdr config reset-keys` →
  `~/.config/herdr/config.toml`, herdr integration updates → `herdr-agent-state.*`).
  Fix: `cp` the file back into the repo, `rm` the target (stow won't link over a
  regular file), `just install <pkg>`.

## Cross-Platform: OS Gates, Not Tool Checks

Tools are assumed installed; never guard on "is X on PATH". Guard only what has no
Linux equivalent at all:

- `zsh/.zshenv`: `[[ $(uname) == Darwin/Linux ]]` for `$BROWSER`, `$SSH_AUTH_SOCK`,
  TeX Live. `.zshenv` stays exports-only.
- `zsh/.config/zsh/.zprofile`: loads Homebrew by probing all three prefixes (macOS
  arm64/Intel, Linuxbrew). It's an `eval`, so login shells only.
- `functions/{brewup,brewzap,backup}`: `(( $+commands[mas] ))`,
  `(( $+commands[defaults] ))` guard macOS-only APIs; `brew`/`nvim`/`claude`/`pi`
  calls are unconditional.
- `.zsh_aliases`: `localip`/`ips` key off `ipconfig`; `pbcopy`/`pbpaste` shim to
  `wl-copy`/`xclip` on Linux.
- `git/.gitconfig`: credential helper is PATH-resolved `gh`; Beyond Compare (`bc`)
  stays default difftool/mergetool (soft failure on Linux, `-t difft` works anywhere).

## Zsh (`zsh/`)

- `ZDOTDIR=~/.config/zsh`; only `~/.zshenv` lives in `$HOME`.
- `.zshrc` sources `.zsh_{aliases,binds,config,opts,styles}`, then `.zsh_secrets`.
- Secrets: `.zsh_secrets` holds real values (gitignored, never commit, never print);
  `.zsh_secrets.example` is the tracked template. Add new vars to both. `.zshrc` warns
  on stderr if `.zsh_secrets` is missing.
- History, compdump and uv completion cache live in `$XDG_STATE_HOME/zsh`, not
  `$ZDOTDIR`.
- `functions/` autoloaded; matching completions in `completions/_<name>`.
- Plugins: antidote, list in `plugins/.zsh_plugins.txt` (self-clones to `~/.antidote`).
- `PIP_REQUIRE_VIRTUALENV=true` (bypass: `gpip`/`nopip`). `sudo`/`please` expand to
  `sudo -E HOME=$HOME ` so root tools read user config. `SUDO_EDITOR=vim` (real
  binary; the `vim`→`nvim` alias doesn't apply under sudo).

## Neovim (`nvim/`)

`init.lua` loads `fkabs.core` (options, keymaps; leader `<Space>`, localleader `\`) and
`fkabs.lazy` (lazy.nvim bootstrap). One file per plugin in `lua/fkabs/plugins/`, LSP
in `plugins/lsp/`; both dirs are auto-imported, so a new plugin is just a new file.
`lazy-lock.json` is tracked (pinned plugin versions across machines): commit it after
`:Lazy update`.

## Other Packages

- **git**: SSH-signed commits (`~/.ssh/keys/id_ed25519.pub`), rerere, aliases.
- **tmux**: prefix `C-Space`, TPM at `~/.tmux/plugins/tpm/tpm`, plugins cached in
  `$XDG_CACHE_HOME/tmux/plugins`.
- **herdr**: after edits `herdr config check`, then `herdr server reload-config`.
- **btop**: config format 1.4.7+ (GPU keys).
- **Theme**: rose-pine-moon everywhere (ghostty, tmux, starship, btop, nvim, pi, claude
  theme and statusline). bat uses `--theme=ansi` to inherit the terminal palette.

## Claude Code & pi (`claude/`, `pi/`)

| | Claude Code (`claude/.claude/`) | pi (`pi/.pi/`) |
|---|---|---|
| Settings | `settings.json` | `agent/settings.json`, `agent/mcp.json` |
| Global instructions | `CLAUDE.md` | `agent/AGENTS.md` |
| Rules | `rules/` | `rules/` |
| Skills | `skills/` | `agent/skills/` |
| Hooks / extensions | `hooks/` (shell) | `agent/extensions/` (TypeScript) |
| Agents | — | `agent/agents/` |
| Themes | `themes/` | — |
| Statusline | `claude-powerline.json` ([claude-powerline](https://github.com/Owloops/claude-powerline), TUI style) | — |

Kept in sync by hand, no automation:

- `claude/.claude/CLAUDE.md` ↔ `pi/.pi/agent/AGENTS.md`: same body, only the H1 differs.
- `claude/.claude/rules/*.md` ↔ `pi/.pi/rules/*.md`: same body, pi copies add
  `pi-rules` frontmatter (`description`, `tools`, `dedupe`).
- Skills present in both (`herdr`, `supacode-*`): byte-identical copies.

`herdr-agent-state.{sh,ts}` are installed and overwritten by herdr's integration:
don't edit, add custom hooks beside them.

Only skills are portable between the two; commands, plugins and hooks use different
formats/runtimes.

## VIA

`via/` holds Monsgeek M1V5 (ISO) layout JSON, imported manually in the VIA app. It is
excluded from `packages` in `justfile`; `just install via` would still stow it, don't.

## Adding a Package

1. Create a top-level dir mirroring `$HOME` paths.
2. Add it to `packages` in `justfile`; if the app writes runtime files next to its
   config, also add it to the `--no-folding` `case`.
3. Dry-run, then `just install <pkg>`.
