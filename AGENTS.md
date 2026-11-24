# AGENTS.md

Agent guidance for this repo (Claude Code, pi, opencode). pi and opencode read `AGENTS.md`
directly; Claude Code reads `CLAUDE.md`, a one-line `@AGENTS.md` import. Edit this file only.

## Overview

Dotfiles for macOS and Linux (work laptop, Linux laptop, headless servers), managed
with [GNU Stow](https://www.gnu.org/software/stow/). Each top-level dir is a stow
package mirroring `$HOME` (`zsh/.config/zsh/.zshrc` → `~/.config/zsh/.zshrc`).
Config-only: tools are installed separately, see [README.md](README.md).

Packages: `bat`, `btop`, `claude`, `ghostty`, `git`, `herdr-app`, `nvim`,
`opencode`, `pi`, `starship`, `stow`, `tmux`, `zsh`. `via/` is not a package (see [VIA](#via)).

## Commands

```zsh
just install              # stow all packages
just install nvim tmux    # stow only these
just uninstall [pkgs]     # remove symlinks
just restow [pkgs]        # re-link (after adding/removing files in a package)
stow -n -v -R -t "$HOME" <pkg>   # dry run, check before touching $HOME
```

Checks after an edit: `zsh -n <file>` for zsh, `jq empty <file>` for JSON, the dry run
above for anything that adds, moves or removes a file.

Commits run a [betterleaks](https://github.com/betterleaks/betterleaks) secret scan via
pre-commit (`.pre-commit-config.yaml`). Never bypass it. The hook is per clone
(`pre-commit install`) and calls the `betterleaks` binary on `PATH`.

Commit scope is usually the package name (`feat(herdr-app):`), comma-separated for several
(`feat(claude,pi,opencode):`).

## Stow Folding

- **Default: folded.** Stow links a whole dir when it can (`~/.config/nvim` → repo).
  New repo files show up instantly, but anything the app writes there lands in the
  repo. Intended for `btop` (it rewrites `btop.conf`, expect a dirty `git status`).
- **`herdr-app`, `claude` and `opencode`: `--no-folding`** (the `case` in
  `justfile`). Their apps (and, for opencode, the superpowers installer) write runtime
  state next to tracked config, so only tracked files are linked into real dirs. Cost: a
  new tracked file needs `just restow <pkg>`, and a file the app creates in `$HOME`
  (e.g. a skill made inside Claude Code) must be moved into the repo and restowed.
- **A missing target dir is folded whole.** On a machine without `~/.pi`, `just install`
  links `~/.pi` itself into the repo, and pi then writes `auth.json`, sessions and caches
  into `pi/.pi/agent/` (untracked, not ignored). Same for `~/.config` when every installed
  package reaches it through one package (`just install zsh git` on a fresh server). So:
  `mkdir -p ~/.config ~/.pi/agent` before the first install (README, step 2). `~/.pi/rules`
  and, below `~/.pi/agent`, `skills`, `agents`, `themes` and `extensions` are still dir
  links: what pi writes there lands in the repo.
- Stow ignores `.gitignore`: any untracked file physically inside a package dir gets
  linked too. Keep app state out of package dirs.
- The ignore list is tracked: `stow/.stow-global-ignore` → `~/.stow-global-ignore`, stow's
  built-in list plus `.DS_Store` (a global file replaces the built-in list, so keep the
  defaults in it).
- Docs inside a package: only `<pkg>/README.md` at the package root is safe (the
  ignore list has `^/README.*`). An `AGENTS.md` there, or a README deeper down, is linked
  into `$HOME`.
- **Symlink replaced by a regular file.** Some writers swap the link for a real file
  (Claude Code → `~/.claude/settings.json`; possibly herdr-app's `settings.json`/`keys.json`
  when saved from its Settings UI or after `app.reset`, not verified).
  Fix: `cp` the file back into the repo, `rm` the target (stow won't link over a
  regular file), `just install <pkg>`.

## Cross-Platform: OS Gates, Not Tool Checks

Tools the README lists as required are assumed installed; never guard those on "is X on
PATH". Guard only what has no Linux equivalent at all, and optional tools (`.zsh_config`:
`docker`, `mole`, `~/.elan/bin`, `~/.opencode/bin`):

- `zsh/.zshenv`: `[[ $(uname) == Darwin/Linux ]]` for `$BROWSER`, `$SSH_AUTH_SOCK`,
  TeX Live. `.zshenv` stays exports-only.
- `zsh/.config/zsh/.zprofile`: loads Homebrew by probing all three prefixes (macOS
  arm64/Intel, Linuxbrew). It's an `eval`, so login shells only.
- `functions/{brewup,brewzap,backup}`: `(( $+commands[mas] ))`,
  `(( $+commands[defaults] ))` guard macOS-only APIs; `antidote`/`brew`/`nvim`/`claude`/`hc`/
  `opencode`/`pi` calls are unconditional.
- `.zsh_aliases`: `localip` keys off `ipconfig`; `pbcopy`/`pbpaste` shim to
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
  `sudo -E HOME=$HOME ` so root tools read user config. `EDITOR`, `VISUAL` and
  `SUDO_EDITOR` are `vim` (real binary; the `vim`→`nvim` alias doesn't apply under sudo
  or when git opens an editor).
- Names that don't mean the usual thing in an interactive shell: `cat` is `bat`,
  `fzf` adds a preview, `cd` is a function
  that also activates/deactivates `./.venv`, `pi` is a wrapper that filters one stderr
  warning. In a function or alias that needs the real one, write `command <name>`
  (`builtin cd`).

## Neovim (`nvim/`)

`init.lua` loads `fkabs.core` (options, keymaps; leader `<Space>`, localleader `\`) and
`fkabs.lazy` (lazy.nvim bootstrap). One file per plugin in `lua/fkabs/plugins/`, LSP
in `plugins/lsp/`; both dirs are auto-imported, so a new plugin is just a new file.
`lazy-lock.json` is tracked (pinned plugin versions across machines): commit it after
`:Lazy update` or `brewup` (which runs `Lazy! sync`). Python tools are not Mason's: `ruff`
and `debugpy` come from `uv tool install`, and `dap-python.lua` hardcodes
`~/.local/share/uv/tools/debugpy/bin/python`.

## Other Packages

- **git**: SSH signing is set up (key `~/.ssh/keys/id_ed25519.pub`,
  `~/.ssh/allowed_signers`, neither in the repo) but not switched on: there is no
  `commit.gpgsign`, sign with `-S`. Rerere, aliases, four difftools (`bc` default,
  `vscode`, `difft`, `exiftool`).
- **tmux**: prefix `C-Space`, TPM at `~/.tmux/plugins/tpm/tpm`, plugins cached in
  `$XDG_CACHE_HOME/tmux/plugins`.
- **herdr-app**: config for the Herdr desktop app (`~/.config/herdr-app`, `--no-folding`):
  `keys.json`, `settings.json`, the theme, the `home` layout, the `tmux-prefix` mod and
  four mods of my own. **Read [herdr-app/README.md](herdr-app/README.md) before changing
  anything in it**; it is not loaded automatically. It has what each mod does, the test
  commands, the third-party mods and the new-machine steps. The rules that bite most:
  - After editing a stowed mod, `touch -h ~/.config/herdr-app/mods/<mod>/main.js`: the app
    doesn't notice edits made through a symlink and keeps running the old code.
  - Run `herdr-app check` on the linked `~/.config/herdr-app/mods/<mod>` copy, never on the
    repo path (there it writes `gpui-kit.d.ts` and `jsconfig.json` into the repo).
  - One `main.js` per mod, no relative imports (they can't be stow-linked). Third-party
    mods are copied by hand and stay out of the repo.
- **btop**: config format 1.4.7+ (GPU keys).
- **Theme**: rose-pine-moon everywhere (ghostty, herdr-app, tmux, starship, btop, nvim,
  pi, claude theme and statusline, opencode). bat uses `--theme=ansi` to inherit the terminal palette.

## Claude Code, pi & opencode (`claude/`, `pi/`, `opencode/`)

| | Claude Code (`claude/.claude/`) | pi (`pi/.pi/`) | opencode (`opencode/.config/opencode/`) |
|---|---|---|---|
| Settings | `settings.json` | `agent/settings.json`, `agent/mcp.json`, `agent/models.json`, `agent/keybindings.json` | `opencode.json` (plugins, provider, mcp), `cli.json` (theme) |
| Global instructions | `CLAUDE.md` | `agent/AGENTS.md` | `AGENTS.md` (+ rules inlined) |
| Rules | `rules/` | `rules/` | inlined in `AGENTS.md` |
| Skills | `skills/` | `agent/skills/` | reads `~/.claude/skills`; tracked: `anatomy`, `diagram-design`, `hc`, `herdr-app`, `security-audit` |
| Hooks / extensions | none tracked; plugins via `enabledPlugins` in `settings.json` | `agent/extensions/` (TypeScript) | plugins via `plugins` in `opencode.json` |
| Agents | — | `agent/agents/` | `agents/` |
| Themes | `themes/` | `agent/themes/` | `themes/` |
| Statusline | `claude-powerline.json` ([claude-powerline](https://github.com/Owloops/claude-powerline), TUI style) | — | — |

Kept in sync by hand, no automation:

- `claude/.claude/CLAUDE.md` ↔ `pi/.pi/agent/AGENTS.md` ↔ `opencode/.config/opencode/AGENTS.md`:
  same body, only the H1 differs.
- `claude/.claude/rules/*.md` ↔ `pi/.pi/rules/*.md`: same body, pi copies add
  `pi-rules` frontmatter (`description`, `tools`, `dedupe`).
- Rules in opencode are **appended to its `AGENTS.md`** (each under a
  `<!-- rule: <name> -->` comment, verbatim). The `instructions` key in `opencode.json`
  did not load them (tested v2.0.24, glob and explicit paths, `~` and `{env:HOME}`).
- `security-audit` from
  [cloudflare/security-audit-skill](https://github.com/cloudflare/security-audit-skill),
  its `skills/security-audit/`; refresh by replacing all copies: byte-identical copies in
  claude and pi, plus an identical copy in opencode (like `diagram-design`).
- `hc` (herdr-core manual): identical copies in all three. `SKILL.md` is a frontmatter
  block (name, description) plus the verbatim output of `hc --skill`; it goes stale when
  herdr-core updates. Refresh: regenerate the claude copy (same frontmatter, then
  `hc --skill`), `cp` it over the pi and opencode copies. Terminals hc starts get secrets and
  PATH from herdr-core's environment: after a reboot run `hc server restart --fresh` once from
  a terminal outside Herdr (with `.zsh_secrets` loaded).
- `herdr-app` (the app's window, layouts, keys and mods): same shape as `hc`, built from `herdr-app --skill`;
  identical copies in all three, refreshed the same way. The app also writes a longer guide to
  `~/.config/herdr-app/AGENTS.md` on every start, which the skill tells an agent to read first.
- `anatomy` ([wheresryan22/anatomy](https://github.com/wheresryan22/anatomy), repo root
  is the skill): identical copies in all three. Trimmed to 2 MB: no `.github`, `tests`,
  `evals`, community docs, README, nor the built `examples/*.html`/`*.pdf` (25 MB,
  regenerated by each example's `build.mjs`). Refresh by re-cloning and re-applying that trim.
- `diagram-design`: Claude Code gets it as a plugin (`settings.json`), pi as a `packages`
  entry, opencode as a tracked copy in `opencode/.../skills/diagram-design` (from the
  plugin's `skills/diagram-design/`; refresh by replacing the dir from a newer checkout,
  then `just restow opencode`).
- `pi/.pi/agent/agents/*.md` ↔ `opencode/.../agents/*.md`: same body, opencode adds
  `mode: subagent`.
- `pi/.pi/agent/mcp.json` ↔ `mcp` in `opencode.json`: context7 and github in both
  (different schema). Secrets come from `.zsh_secrets` via `{env:VAR}`; no OAuth needed.
- Claude Code MCP servers (none at user scope now; context7 and github come from plugins)
  would live in untracked `~/.claude.json`, not tracked here.
- USTP model limits live in four places, keep them in sync: `pi/.pi/agent/models.json`
  (`modelOverrides` for the `bifrost` provider), `pi/.pi/agent/extensions/ustp-openwebui.ts`,
  and `limit` per model in the opencode `ustp-bifrost` and `ustp-openwebui` providers.
  Neither Bifrost nor Open WebUI report limits, so without them pi falls back to 128k/8k. Values are the
  served `max_model_len` (read from vLLM's rejection of an oversized `max_tokens`, not
  the model cards: Gemma 4 and Mistral Large 4 serve 131072, the Qwens 262144, GLM 5.3
  Flash 1048576) with output capped at a quarter of that, because a request fails when
  prompt + `max_tokens` exceeds the window.

Only skills are portable between the three; commands, plugins and hooks use different
formats/runtimes.

### USTP providers

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

### pi specifics

- Packages (`packages` in `settings.json`, installed at startup): `pi-subagents`,
  superpowers, `pi-rules`, `pi-bifrost-provider`, diagram-design, `@narumitw/pi-herdr`,
  `pi-powerline-footer`.
- Keep `pi` out of the `--no-folding` case: `pi-rules` skips a rule file whose real path
  is outside the rules dir ("symlink escape"). `~/.pi/rules` is one dir link, so pi's
  rules load; as per-file links they would not. It also scans `~/.claude/rules`, where the
  files are per-file links: those are the skips the `pi` wrapper in `.zsh_aliases` hides.
- `pi-powerline-footer` draws pi's footer (model/path/git + context, below the editor, no cost
  segments — the USTP models report no pricing). Config lives in the `powerline` block in
  `pi/.pi/agent/settings.json`; segment colors are pinned in
  `pi/.pi/agent/extensions/powerline-footer/theme.json` (agent-dir theme override). The npm
  package is in `packages` (auto-installed at startup); the theme-dir symlink needs nothing on
  a new machine (`just install pi` fold-links the tracked dir).

### opencode specifics

- superpowers installs from `plugins` in `opencode.json`.
- Never track `service.json` (password) or `opencode.json.bak`.
- opencode runs a background service that caches config and its own env: after edits run
  `opencode service restart` (from a shell with `.zsh_secrets` loaded).

## VIA

`via/` holds Monsgeek M1V5 (ISO) layout JSON, imported manually in the VIA app. It is
excluded from `packages` in `justfile`; `just install via` would still stow it, don't
(its empty `.stow-local-ignore` replaces stow's default ignore list, so the JSON files
would be linked into `$HOME`).

## Adding a Package

1. Create a top-level dir mirroring `$HOME` paths.
2. Add it to `packages` in `justfile`; if the app writes runtime files next to its
   config, also add it to the `--no-folding` `case`.
3. Dry-run, then `just install <pkg>`.
4. Add it to the package table and, if it needs a tool, the tool lists in `README.md`.
