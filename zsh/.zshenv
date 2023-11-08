#!/bin/zsh
#
# .zshenv - Zsh environment file, loaded always.
#
# NOTE: .zshenv needs to live at ~/.zshenv, not in $ZDOTDIR!
#

# DOTFILES directory
export DOTFILES="$HOME/.dotfiles"

# ZDOTDIR for zsh config
export ZDOTDIR="$DOTFILES/zsh"

# Antidote
export ANTIDOTE_HOME=$HOME/.antidote

# BAT
export BAT_CONFIG_PATH=$DOTFILES/bat/.batrc

# Browser
if [[ "$OSTYPE" == darwin* ]]; then
  export BROWSER='open'
fi

# Editors
export EDITOR=vim
export VISUAL=code
export PAGER=less

# Require pip to be run within a virtualenv (can be bypassed with gpip or nopip)
export PIP_REQUIRE_VIRTUALENV=true

# Virtualenvwrapper
export WORKON_HOME="$HOME/.virtualenvs"
export PROJECT_HOME="$HOME/work"
export VIRTUALENVWRAPPER_PYTHON="$(asdf which python)"

# Path of zsh dumps
export ZSH_COMPDUMP="$HOME/.cache/zsh/.zcompdump-${HOST/.*/}-${ZSH_VERSION}"

# Path to the zsh-z database file
export ZSHZ_DATA="$HOME/.cache/z/.zdb"
