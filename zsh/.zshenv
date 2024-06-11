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
# catppuccin-macchiato theme
export FZF_DEFAULT_OPTS=" \
--color=bg+:#363a4f,bg:#24273a,spinner:#f4dbd6,hl:#ed8796 \
--color=fg:#cad3f5,header:#ed8796,info:#c6a0f6,pointer:#f4dbd6 \
--color=marker:#f4dbd6,fg+:#cad3f5,prompt:#c6a0f6,hl+:#ed8796"

# Homebrew
export HOMEBREW_NO_ANALYTICS=1

# Pagers
export MANPAGER="sh -c 'col -bx | bat -l man -p'"
export PAGER=less

# Require pip to be run within a virtualenv (can be bypassed with gpip or nopip)
export PIP_REQUIRE_VIRTUALENV=true

# pyenv
export PYENV_ROOT="$HOME/.pyenv"
export PYENV_VIRTUALENV_DISABLE_PROMPT=1
export PATH="$PYENV_ROOT/bin:$PATH"

# SSH authetication socket
if [[ $(uname) == Linux && -z "${SSH_CONNECTION}" ]]; then
    export SSH_AUTH_SOCK="$XDG_RUNTIME_DIR/ssh-agent.socket"
fi

# Starhip config
export STARSHIP_CONFIG="${XDG_CONFIG_HOME:-$HOME/.config}/starship/starship.toml"

# Tex Live release and architecture
# install dir: /usr/local/texlive/2023/bin/universal-darwin
export TEXLIVE_DIR=/usr/local/texlive
export TEXLIVE_RELEASE=2023

if [[ $(uname) == Darwin ]]; then
    export TEXLIVE_ARCH=universal-darwin
else
    export TEXLIVE_ARCH=linux
fi

export TEXLIVE_PATH="$TEXLIVE_DIR/$TEXLIVE_RELEASE/bin/$TEXLIVE_ARCH"

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
