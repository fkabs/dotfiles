#!/bin/zsh
#
# .zshrc - Sourced by zsh on startup
#

# Enable zsh profiling
if [ "${ZSH_PROFILING}" = "1" ]; then
    zmodload zsh/zprof
fi

# Add Brew zsh-completions and site-functions to fpath
if [[ $(uname) == Darwin ]]; then
    fpath=("$(brew --prefix)/share/zsh/site-functions" $fpath)
fi

# Add custom zsh functions
fpath=($ZFUNCDIR $fpath)
autoload -Uz $ZFUNCDIR/*(.:t)

# Load aliases, binds, config, opts and styles
[[ -e ${ZDOTDIR:-$HOME}/.zsh_aliases ]] && source ${ZDOTDIR:-$HOME}/.zsh_aliases
[[ -e ${ZDOTDIR:-$HOME}/.zsh_binds ]] && source ${ZDOTDIR:-$HOME}/.zsh_binds
[[ -e ${ZDOTDIR:-$HOME}/.zsh_config ]] && source ${ZDOTDIR:-$HOME}/.zsh_config
[[ -e ${ZDOTDIR:-$HOME}/.zsh_opts ]] && source ${ZDOTDIR:-$HOME}/.zsh_opts
[[ -e ${ZDOTDIR:-$HOME}/.zsh_styles ]] && source ${ZDOTDIR:-$HOME}/.zsh_styles

# Clone antidote if necessary.
[[ -d $HOME/.antidote ]] ||
    git clone --depth=1 https://github.com/mattmc3/antidote.git $HOME/.antidote

# Load antidote
source $HOME/.antidote/antidote.zsh
antidote load

# Load docker CLI completions
if command -v docker &> /dev/null; then
    fpath=($HOME/.docker/completions $fpath)
fi

# Compinit (cache .zcompdump for 24 hours)
autoload -Uz compinit

if [[ -n $ZSH_COMPDUMP(#qN.mh+24) ]]; then
    compinit -i -d "$ZSH_COMPDUMP"
else
    compinit -C -d "$ZSH_COMPDUMP"
fi
{
    if [[ -s "$ZSH_COMPDUMP" && (! -s "${ZSH_COMPDUMP}.zwc" || "$ZSH_COMPDUMP" -nt "${ZSH_COMPDUMP}.zwc") ]]; then
        zcompile "$ZSH_COMPDUMP"
    fi
} &!

# Prompt (starship)
eval "$(starship init zsh)"

# Enable zsh profiling
if [ "${ZSH_PROFILING}" = "1" ]; then
    zprof
fi
