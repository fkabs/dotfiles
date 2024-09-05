#!/bin/zsh
#
# .zshenv - Zsh environment file, loaded always.
#
# NOTE: .zshenv needs to live at ~/.zshenv, not in $ZDOTDIR!
# >> ln -s ~/.dotfiles/zsh/.zshenv ~/.zshenv
#

# ----------------------------------------------------------------

# DOTFILES directory
export DOTFILES="$HOME/.dotfiles"

# ZDOTDIR for zsh config
export ZDOTDIR="$HOME/.config/zsh"

# XDG Base Directory Specification
export XDG_CONFIG_HOME="$HOME/.config"
export XDG_CACHE_HOME="$HOME/.cache"
export XDG_DATA_HOME="$HOME/.local/share"

# ----------------------------------------------------------------

# Antidote plugin directory
export ANTIDOTE_HOME=${XDG_CACHE_HOME:-$HOME/.cache}/antidote

# BACKUP directory
export BACKUP_HOME=$HOME/.backup

# BAT
export BAT_CONFIG_PATH=$DOTFILES/bat/.batrc

# BROWSER
if [[ $(uname) == Darwin ]]; then
    export BROWSER="open"
fi

# Editors for shell
export EDITOR=vim
export VISUAL=vim

# FZF
# rose-pine moon theme
export FZF_DEFAULT_OPTS="
	--color=fg:#908caa,bg:#232136,hl:#ea9a97
	--color=fg+:#e0def4,bg+:#393552,hl+:#ea9a97
	--color=border:#44415a,header:#3e8fb0,gutter:#232136
	--color=spinner:#f6c177,info:#9ccfd8,separator:#44415a
	--color=pointer:#c4a7e7,marker:#eb6f92,prompt:#908caa"

# Homebrew
export HOMEBREW_NO_ANALYTICS=1

# Pagers
export MANPAGER="sh -c 'col -bx | bat -l man -p'"
export PAGER=less

# Require pip to be run within a virtualenv (can be bypassed with gpip or nopip)
export PIP_REQUIRE_VIRTUALENV=true

# SSH authetication socket
if [[ $(uname) == Linux && -z "${SSH_CONNECTION}" ]]; then
    export SSH_AUTH_SOCK="$XDG_RUNTIME_DIR/ssh-agent.socket"
fi

# Starhip config
export STARSHIP_CONFIG="${XDG_CONFIG_HOME:-$HOME/.config}/starship/starship.toml"
export STARSHIP_CACHE="${XDG_CACHE_HOME:-$HOME/.cache}/starship"

# TeX Live release and architecture
# install dir: /usr/local/texlive/YYYY/bin/universal-darwin
export TEXLIVE_DIR=/usr/local/texlive
export TEXLIVE_RELEASE=2024

if [[ $(uname) == Darwin ]]; then
    export TEXLIVE_ARCH=universal-darwin
else
    export TEXLIVE_ARCH=linux
fi

export TEXLIVE_PATH="$TEXLIVE_DIR/$TEXLIVE_RELEASE/bin/$TEXLIVE_ARCH"

# TeX Live Paths
export TEXDIR="$TEXLIVE_DIR/$TEXLIVE_RELEASE"
export TEXMFLOCAL="$TEXLIVE_DIR/texmf-local"
export TEXMFSYSVAR="$TEXLIVE_DIR/$TEXLIVE_RELEASE/texmf-var"
export TEXMFSYSCONFIG="$TEXLIVE_DIR/$TEXLIVE_RELEASE/texmf-config"
export TEXMFVAR="${XDG_CACHE_HOME:-$HOME/.cache}/texlive/$TEXLIVE_RELEASE/texmf-var"
export TEXMFCONFIG="$HOME/.texlive/$TEXLIVE_RELEASE/texmf-config"
export TEXMFHOME="$HOME/.texlive/texmf"
export TEXMFCACHE="$TEXMFVAR"

# TMUX plugins directory
export TMUX_PLUGIN_MANAGER_PATH=$XDG_CACHE_HOME/tmux/plugins

# Virtualenv (venv) config
export VIRTUALENV_DIR=$HOME/.virtualenvs

# Path to zoxide database
export _ZO_DATA_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/zoxide"

# Path of zsh dumps
export ZSH_COMPDUMP="${XDG_CACHE_HOME:-$HOME/.cache}/zsh/.zcompdump-${HOST/.*/}-${ZSH_VERSION}"

# Path to custom zsh functions
export ZFUNCDIR=$ZDOTDIR/functions

# ZSH profiling
export ZSH_PROFILING=0
