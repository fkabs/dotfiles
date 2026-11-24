# Dotfiles

Personal dotfiles for macOS and Linux, managed with [GNU Stow](https://www.gnu.org/software/stow/).
Each top-level directory is a stow package that mirrors `$HOME`.
See [AGENTS.md](AGENTS.md) for conventions and gotchas (written for coding agents, the
reference for humans too).

## Packages

| Package | Linked to | What |
|---|---|---|
| `bat` | `~/.config/bat` | theme `ansi` (takes the terminal's colors), style |
| `btop` | `~/.config/btop` | config, theme |
| `claude` | `~/.claude` | Claude Code: settings, global instructions, rules, skills, theme, statusline |
| `ghostty` | `~/.config/ghostty` | terminal config, theme |
| `git` | `~/.gitconfig`, `~/.gitignore_global`, `~/.gitattributes` | aliases, difftools, SSH signing key |
| `herdr-app` | `~/.config/herdr-app` | [Herdr](https://herdr.dev) keys, settings, theme, layout and mods, see [herdr-app/README.md](herdr-app/README.md) |
| `nvim` | `~/.config/nvim` | Neovim with lazy.nvim, one file per plugin |
| `opencode` | `~/.config/opencode` | opencode: providers, MCP, instructions, skills, theme |
| `pi` | `~/.pi` | pi: settings, models, MCP, instructions, rules, skills, theme |
| `starship` | `~/.config/starship` | prompt |
| `stow` | `~/.stow-global-ignore` | stow's ignore list: its defaults plus `.DS_Store` |
| `tmux` | `~/.config/tmux` | prefix `C-Space`, TPM plugins |
| `zsh` | `~/.zshenv`, `~/.config/zsh` | shell config, functions, completions, plugin list |

`via/` is not a package: keyboard layouts for the VIA app, imported by hand.

## Install

This repo is config-only: it symlinks config into `$HOME`, it does not install the
CLI tools those configs assume. **Install the [tools](#tools) yourself first** (Homebrew
on both macOS and Linux, or however you prefer); almost nothing here checks whether a
tool is installed before using it; a missing one just errors loudly at shell startup.

1. Clone to `~/.dotfiles` (`.zshenv` sets `DOTFILES` to that path).
2. `mkdir -p ~/.config ~/.pi/agent`. Stow links a whole directory when the target does
   not exist yet; without this, `~/.pi` (and on a small install `~/.config`) becomes a
   link into the repo and apps write their state, logins included, into it.
3. `cp zsh/.config/zsh/.zsh_secrets.example zsh/.config/zsh/.zsh_secrets` and fill it in
   (gitignored; the shell warns while it is missing).
4. `just install`, or only some packages: `just install zsh git nvim tmux`.
5. `pre-commit install`: every commit is scanned for secrets by
   [betterleaks](https://github.com/betterleaks/betterleaks), which must be on `PATH`.

Then, per package:

- **tmux**: `git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm`, start
  tmux, prefix + `I` installs the plugins.
- **nvim**: the first start installs plugins and Mason tools. `uv tool install ruff debugpy`
  (not from Mason; the debugger looks for `~/.local/share/uv/tools/debugpy`).
- **git**: the signing key `~/.ssh/keys/id_ed25519.pub` and `~/.ssh/allowed_signers` are
  not in the repo.
- **herdr-app**: see [herdr-app/README.md](herdr-app/README.md) (third-party mods, layout switch).
- **opencode**: `opencode service restart` from a shell that has `.zsh_secrets` loaded.

## Tools

### Required

Assumed installed and on `PATH`. Nothing is guarded against these being missing:

- [`zsh`](https://www.zsh.org/)
- [`git`](https://git-scm.com/)
- [GNU `stow`](https://www.gnu.org/software/stow/)
- [`just`](https://github.com/casey/just)
- **Homebrew**: macOS (`/opt/homebrew` or `/usr/local`) or [Linuxbrew](https://docs.brew.sh/Homebrew-on-Linux) (`/home/linuxbrew/.linuxbrew`). Auto-detected from all three prefixes
- [`bat`](https://github.com/sharkdp/bat): replaces `cat`, used as `$MANPAGER`
- [`eza`](https://github.com/eza-community/eza): directory previews in `fzf-tab`
- [`fzf`](https://github.com/junegunn/fzf): fuzzy completion and keybindings
- [`zoxide`](https://github.com/ajeetdsouza/zoxide): smart `cd`
- [`starship`](https://starship.rs/): prompt
- [`direnv`](https://direnv.net/): per-directory env loading
- [`uv`](https://docs.astral.sh/uv/): Python tool manager, shell completions loaded at startup
- [`neovim`](https://neovim.io/): `vi`/`vim` alias to `nvim`. **0.12.0+** (required by
  nvim-treesitter's `main` branch)
- [`tree-sitter`](https://github.com/tree-sitter/tree-sitter) CLI, **0.26.1+**
  (`brew install tree-sitter-cli`, the `tree-sitter` formula is lib-only): parser
  compilation for nvim-treesitter; not npm
- a C compiler (`cc`/`gcc`/`clang`) and `make`: parser compilation for nvim-treesitter,
  build of telescope-fzf-native; present by default on macOS (Xcode CLT), may be missing
  on a headless Linux box
- [`ripgrep`](https://github.com/BurntSushi/ripgrep): Telescope's text search in nvim
- Node.js (`npm`, `npx`): Mason installs most language servers with npm; Claude Code's
  statusline runs through `npx`
- [`tmux`](https://github.com/tmux/tmux)
- [`gh`](https://cli.github.com/): git credential helper
- [`antidote`](https://github.com/mattmc3/antidote): zsh plugin manager; self-clones
  to `~/.antidote` on first shell start, no manual install needed
- [`pre-commit`](https://pre-commit.com/) and
  [`betterleaks`](https://github.com/betterleaks/betterleaks): the secret scan on commit
- a [Nerd Font](https://www.nerdfonts.com/), here FiraCode Nerd Font (Mono for the
  terminal, Propo for Herdr's sidebar icons): the prompt, tmux and Herdr use its glyphs

### Apps and agents

Only needed for their own package, but `brewup` updates the four CLIs without checking:

- [Ghostty](https://ghostty.org/)
- [Herdr](https://herdr.dev): the app (`herdr-app`) and `hc` (herdr-core)
- Claude Code (`claude`), pi (`pi`), opencode (`opencode`)

### Optional

Only used on demand, or genuinely macOS-only regardless of what's installed:

- Difftools for `git difftool -t <name>`: Beyond Compare (`bc`, the default, also the
  mergetool), VS Code (`vscode`, needs `code` on `PATH`),
  [`difftastic`](https://github.com/Wilfred/difftastic) (`difft`), `exiftool`
- [`lazygit`](https://github.com/jesseduffield/lazygit): opened from Herdr's Changes panel
- [`btop`](https://github.com/aristocratos/btop): **1.4.7+** config format (GPU keys)
- [Ghostscript](https://www.ghostscript.com/) (`gs`): used by the `cpdf` zsh function
- `docker`: completions, the `dockervol` function and two aliases
- `dig`: the `myip` alias (public IP address)
- `wl-clipboard` or `xclip` (Linux): `pbcopy`/`pbpaste`
- `mas`: Mac App Store CLI, only used by `brewup` (macOS only, no Linux equivalent)
- `vim`: `$EDITOR`, `$VISUAL` and `$SUDO_EDITOR`; needs a real `vim` on `PATH` since the
  `vim`/`nvim` alias only applies in an interactive shell (not under sudo, not when git
  opens an editor)
