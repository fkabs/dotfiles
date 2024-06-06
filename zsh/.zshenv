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

# ASDF .asdfrc location
export ASDF_CONFIG_FILE="$DOTFILES/asdf/.asdfrc"

# BACKUP directory
export BACKUP_HOME=$HOME/.backup

# BAT
export BAT_CONFIG_PATH=$DOTFILES/bat/.batrc

# BROWSER
if [[ $(uname) == Darwin ]]; then
    export BROWSER="open"
fi

# Editors for shell
export EDITOR=emacs
export VISUAL=emacs

# FZF
# # rose-pine
# export FZF_DEFAULT_OPTS="
# 	--color=fg:#908caa,bg:#191724,hl:#ebbcba
# 	--color=fg+:#e0def4,bg+:#26233a,hl+:#ebbcba
# 	--color=border:#403d52,header:#31748f,gutter:#191724
# 	--color=spinner:#f6c177,info:#9ccfd8,separator:#403d52
# 	--color=pointer:#c4a7e7,marker:#eb6f92,prompt:#908caa"

# rose-pine-moon
export FZF_DEFAULT_OPTS="
	--color=fg:#908caa,bg:#232136,hl:#ea9a97
	--color=fg+:#e0def4,bg+:#393552,hl+:#ea9a97
	--color=border:#44415a,header:#3e8fb0,gutter:#232136
	--color=spinner:#f6c177,info:#9ccfd8,separator:#44415a
	--color=pointer:#c4a7e7,marker:#eb6f92,prompt:#908caa"

# # rose-pine-dawn
# export FZF_DEFAULT_OPTS="
# 	--color=fg:#797593,bg:#faf4ed,hl:#d7827e
# 	--color=fg+:#575279,bg+:#f2e9e1,hl+:#d7827e
# 	--color=border:#dfdad9,header:#286983,gutter:#faf4ed
# 	--color=spinner:#ea9d34,info:#56949f,separator:#dfdad9
# 	--color=pointer:#907aa9,marker:#b4637a,prompt:#797593"

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
