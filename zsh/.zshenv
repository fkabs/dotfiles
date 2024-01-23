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
export ZDOTDIR="$DOTFILES/zsh"

# XDG Base Directory Specification
export XDG_CONFIG_HOME="$HOME/.config"
export XDG_CACHE_HOME="$HOME/.cache"
export XDG_DATA_HOME="$HOME/.local/share"

# ----------------------------------------------------------------

# Antidote plugin directory
export ANTIDOTE_HOME=${XDG_CACHE_HOME:-$HOME/.cache}/antidote

# ASDF .asdfrc location
export ASDF_CONFIG_FILE="$DOTFILES/asdf/.asdfrc"

# BACKUP directory
export BACKUP_HOME=$HOME/.backup

# BAT
export BAT_CONFIG_PATH=$DOTFILES/bat/.batrc

# Browser
if [[ "$OSTYPE" == darwin* ]]; then
  export BROWSER='open'
fi

# Editors for shell
export EDITOR=emcas
export VISUAL=emacs

# Homebrew
export HOMEBREW_NO_ANALYTICS=1

# Pagers
export MANPAGER="sh -c 'col -bx | bat -l man -p'"
export PAGER=less

# Require pip to be run within a virtualenv (can be bypassed with gpip or nopip)
export PIP_REQUIRE_VIRTUALENV=true

# Tex Live release and architecture
# install dir: /usr/local/texlive/2023/bin/universal-darwin
export TEXLIVE_RELEASE=2023
export TEXLIVE_ARCH=universal-darwin

# Virtualenv (venv) config
export VIRTUALENV_DIR=$HOME/.virtualenvs

# Path of zsh dumps
export ZSH_COMPDUMP="${XDG_CACHE_HOME:-$HOME/.cache}/zsh/.zcompdump-${HOST/.*/}-${ZSH_VERSION}"

# Path to the zsh-z database file
export ZSHZ_DATA="${XDG_CACHE_HOME:-$HOME/.cache}/z/.zdb"

# Path to custom zsh functions
export ZFUNCDIR=$ZDOTDIR/functions
