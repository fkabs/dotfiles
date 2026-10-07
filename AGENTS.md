# AGENTS.md

Agent guidance for this repo (Claude Code, pi, opencode). pi and opencode read `AGENTS.md`
directly; Claude Code reads `CLAUDE.md`, a one-line `@AGENTS.md` import. Edit this file only.

## Overview

Dotfiles for macOS and Linux (work laptop, Linux laptop, headless servers), managed
with [GNU Stow](https://www.gnu.org/software/stow/). Each top-level dir is a stow
package mirroring `$HOME` (`zsh/.config/zsh/.zshrc` → `~/.config/zsh/.zshrc`).
Config-only: tools are installed separately, see [README.md](README.md).

Packages: `bat`, `btop`, `claude`, `ghostty`, `git`, `herdr`, `nvim`, `opencode`,
`pi`, `starship`, `tmux`, `zsh`. `via/` is not a package (see [VIA](#via)).

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
- **`herdr`, `claude` and `opencode`: `--no-folding`** (the `case` in `justfile`). Their
  apps (and, for opencode, the caveman/ponytail/superpowers installers) write runtime
  state next to tracked config, so only tracked files are linked into real dirs. Cost: a
  new tracked file needs `just restow <pkg>`, and a file the app creates in `$HOME`
  (e.g. a skill made inside Claude Code) must be moved into the repo and restowed.
- Stow ignores `.gitignore`: any untracked file physically inside a package dir gets
  linked too. Keep app state out of package dirs.
- **Symlink replaced by a regular file.** Some writers swap the link for a real file
  (Claude Code → `~/.claude/settings.json`, `herdr config reset-keys` →
  `~/.config/herdr/config.toml`, herdr integration updates → `herdr-agent-state.*`,
  `herdr-tui-session.js`).
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
  theme and statusline, opencode). bat uses `--theme=ansi` to inherit the terminal palette.

## Claude Code, pi & opencode (`claude/`, `pi/`, `opencode/`)

| | Claude Code (`claude/.claude/`) | pi (`pi/.pi/`) | opencode (`opencode/.config/opencode/`) |
|---|---|---|---|
| Settings | `settings.json` | `agent/settings.json`, `agent/mcp.json` | `opencode.json` (plugins, provider, mcp), `cli.json` (theme) |
| Global instructions | `CLAUDE.md` | `agent/AGENTS.md` | `AGENTS.md` (+ rules inlined, caveman block) |
| Rules | `rules/` | `rules/` | inlined in `AGENTS.md` |
| Skills | `skills/` | `agent/skills/` | reads `~/.claude/skills`; no tracked skills |
| Hooks / extensions | `hooks/` (shell) | `agent/extensions/` (TypeScript) | plugins via `plugins` in `opencode.json` |
| Agents | — | `agent/agents/` | `agents/` |
| Themes | `themes/` | — | `themes/` |
| Statusline | `claude-powerline.json` ([claude-powerline](https://github.com/Owloops/claude-powerline), TUI style) | — | — |

Kept in sync by hand, no automation:

- `claude/.claude/CLAUDE.md` ↔ `pi/.pi/agent/AGENTS.md` ↔ `opencode/.config/opencode/AGENTS.md`:
  same body, only the H1 differs.
- `claude/.claude/rules/*.md` ↔ `pi/.pi/rules/*.md`: same body, pi copies add
  `pi-rules` frontmatter (`description`, `tools`, `dedupe`).
- Rules in opencode are **appended to its `AGENTS.md`** (each under a
  `<!-- rule: <name> -->` comment, verbatim). The `instructions` key in `opencode.json`
  did not load them (tested v2.0.24, glob and explicit paths, `~` and `{env:HOME}`).
- Skills present in both claude and pi (`herdr`): byte-identical copies. opencode reads
  that one from `~/.claude/skills`, so it has no copy.
- `pi/.pi/agent/agents/*.md` ↔ `opencode/.../agents/*.md`: same body, opencode adds
  `mode: subagent`.
- `pi/.pi/agent/mcp.json` ↔ `mcp` in `opencode.json`: context7 and github in both
  (different schema); Linear is opencode-only. Secrets come from `.zsh_secrets` via
  `{env:VAR}`; Linear uses OAuth (`opencode mcp auth linear`, once per machine).
- USTP model limits live in four places, keep them in sync: `pi/.pi/agent/models.json`
  (`modelOverrides` for the `bifrost` provider), `pi/.pi/agent/extensions/ustp-openwebui.ts`,
  and `limit` per model in the opencode `ustp-bifrost` and `ustp-openwebui` providers.
  Neither Bifrost nor Open WebUI report limits, so without them pi falls back to 128k/8k. Values are the
  served `max_model_len` (read from vLLM's rejection of an oversized `max_tokens`, not
  the model cards: Gemma 4 serves 131072, the Qwens 262144) with output capped lower,
  because a request fails when prompt + `max_tokens` exceeds the window.

`herdr-agent-state.{sh,ts,js}` are installed and overwritten by herdr's integration:
don't edit, add custom hooks beside them. For opencode (`herdr integration install
opencode`) that is `plugins/herdr-agent-state.js`, `herdr-tui-session.js`,
`herdr-opencode/tui.js`, `tui.jsonc`, plus the `plugins` entry in `cli.json`; all are
tracked in `opencode/`.

Only skills are portable between the three; commands, plugins and hooks use different
formats/runtimes.

### opencode specifics

- `ustp-bifrost` provider = the Bifrost backend pi uses (there it keeps the plugin's fixed
  id `bifrost`; `pi-bifrost-provider` hardcodes it) (`BIFROST_URL`, `BIFROST_API_KEY`,
  `BIFROST_VIRTUAL_KEY` from `.zsh_secrets`, key sent as `Authorization` plus
  `x-bf-vk`). The model list is static: opencode does not auto-discover from `/models`
  like `pi-bifrost-provider`, so add new Bifrost models to `opencode.json` by hand.
- `ustp-openwebui` provider = the same models through Open WebUI (`OPENWEBUI_URL` incl. `/api`,
  `OPENWEBUI_API_KEY` from `.zsh_secrets`; key under Settings > Account), reachable
  worldwide while Bifrost only works inside the USTP network. Model IDs are identical.
  pi gets it from the `ustp-openwebui.ts` extension (`models.json` can't read the URL from an
  env var); pi's default stays `bifrost`, switch with `/model` when off the USTP network.
- The caveman installer owns the `<!-- caveman-begin -->…<!-- caveman-end -->` block in
  `AGENTS.md`, plus untracked `plugins/caveman/`, `commands/`, `agents/cavecrew-*`,
  `skills/cave*`. A caveman update shows up as a diff in the tracked `AGENTS.md`.
  On a new machine run the caveman installer; ponytail and superpowers install from
  `plugins`.
- Never track `service.json` (password), `opencode.json.bak` or
  `.caveman-opencode-ownership.json`.
- opencode runs a background service that caches config and its own env: after edits run
  `opencode service restart` (from a shell with `.zsh_secrets` loaded).

## VIA

`via/` holds Monsgeek M1V5 (ISO) layout JSON, imported manually in the VIA app. It is
excluded from `packages` in `justfile`; `just install via` would still stow it, don't.

## Adding a Package

1. Create a top-level dir mirroring `$HOME` paths.
2. Add it to `packages` in `justfile`; if the app writes runtime files next to its
   config, also add it to the `--no-folding` `case`.
3. Dry-run, then `just install <pkg>`.
