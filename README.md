# Dotfiles

Personal dotfiles for macOS and Linux, managed with [GNU Stow](https://www.gnu.org/software/stow/).
See [AGENTS.md](AGENTS.md) for repo structure and conventions.

## Install

```zsh
just install
```

This repo is config-only — it symlinks config into `$HOME`, it does not install the
CLI tools those configs assume. **Install the tools yourself first** (Homebrew on both
macOS and Linux, or however you prefer) — nothing here checks whether a tool is
installed before using it; a missing one just errors loudly at shell startup.

## Tools

### Required

Assumed installed and on `PATH`. Nothing is guarded against these being missing:

- [`zsh`](https://www.zsh.org/)
- [`git`](https://git-scm.com/)
- [GNU `stow`](https://www.gnu.org/software/stow/)
- [`just`](https://github.com/casey/just)
- **Homebrew** — macOS (`/opt/homebrew` or `/usr/local`) or [Linuxbrew](https://docs.brew.sh/Homebrew-on-Linux) (`/home/linuxbrew/.linuxbrew`). Auto-detected from all three prefixes
- [`bat`](https://github.com/sharkdp/bat) — replaces `cat`, used as `$MANPAGER`
- [`eza`](https://github.com/eza-community/eza) — directory previews in `fzf-tab`
- [`fzf`](https://github.com/junegunn/fzf) — fuzzy completion and keybindings
- [`zoxide`](https://github.com/ajeetdsouza/zoxide) — smart `cd`
- [`starship`](https://starship.rs/) — prompt
- [`direnv`](https://direnv.net/) — per-directory env loading
- [`uv`](https://docs.astral.sh/uv/) — Python tool manager, shell completions loaded at startup
- [`neovim`](https://neovim.io/) — `vi`/`vim` alias to `nvim`
- [`tmux`](https://github.com/tmux/tmux)
- [`gh`](https://cli.github.com/) — git credential helper
- [`antidote`](https://github.com/mattmc3/antidote) — zsh plugin manager; self-clones
  to `~/.antidote` on first shell start, no manual install needed

### Optional

Only used on demand, or genuinely macOS-only regardless of what's installed:

- [`git-delta`](https://github.com/dandavison/delta) / [`difftastic`](https://github.com/Wilfred/difftastic) — alternate `git difftool -t <name>` backends
- [`btop`](https://github.com/aristocratos/btop)
- [Ghostscript](https://www.ghostscript.com/) (`gs`) — used by the `cpdf` zsh function
- `mas` — Mac App Store CLI, only used by `brewup` (macOS only, no Linux equivalent)
