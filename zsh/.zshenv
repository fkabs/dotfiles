#!/bin/zsh
#
# .zshenv - Zsh environment file, loaded always.
#
# NOTE: .zshenv needs to live at ~/.zshenv, not in $ZDOTDIR!
# >> ln -s ~/.dotfiles/zsh/.zshenv ~/.zshenv
#

# DOTFILES directory
export DOTFILES="$HOME/.dotfiles"

# ZDOTDIR for zsh config
export ZDOTDIR="$DOTFILES/zsh"

# Antidote plugin directory
export ANTIDOTE_HOME=${XDG_CACHE_HOME:-$HOME/.cache}/antidote

# ASDF .asdfrf location
export ASDF_CONFIG_FILE="$DOTFILES/asdf/.asdfrc"

# BAT
export BAT_CONFIG_PATH=$DOTFILES/bat/.batrc

# Browser
if [[ "$OSTYPE" == darwin* ]]; then
  export BROWSER='open'
fi

# Editors for shell
export EDITOR=vim
export VISUAL=vim

# Homebrew
export HOMEBREW_NO_ANALYTICS=1

# Pagers
export MANPAGER="sh -c 'col -bx | bat -l man -p'"
export PAGER=less

# Require pip to be run within a virtualenv (can be bypassed with gpip or nopip)
export PIP_REQUIRE_VIRTUALENV=true

# Virtualenv (venv) config
export VIRTUALENV_DIR=$HOME/.virtualenvs

# Path of zsh dumps
export ZSH_COMPDUMP="${XDG_CACHE_HOME:-$HOME/.cache}/zsh/.zcompdump-${HOST/.*/}-${ZSH_VERSION}"

# Path to the zsh-z database file
export ZSHZ_DATA="${XDG_CACHE_HOME:-$HOME/.cache}/z/.zdb"
