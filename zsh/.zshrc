#!/bin/zsh
#
# .zshenv - Zsh environment file, loaded always.
#
# NOTE: .zshenv needs to live at ~/.zshenv, not in $ZDOTDIR!
#

# Enable Powerlevel10k instant prompt. Should stay close to the top of ~/.zshrc.
# Initialization code that may require console input (password prompts, [y/n]
# confirmations, etc.) must go above this block; everything else may go below.
if [[ -r "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh" ]]; then
  source "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh"
fi

# Add brew zsh-completions to fpath
fpath=("/opt/homebrew/share/zsh-completions" $fpath)

# Autoload functions
ZFUNCDIR=${ZFUNCDIR:-$ZDOTDIR/functions}
fpath=($ZFUNCDIR $fpath)
autoload -Uz $fpath[1]/*(.:t)

# Compinit (cache .zcompdump for about a day)
autoload -Uz compinit

if [[ $ZSH_COMPDUMP(#qNmh-20) ]]; then
  compinit -C -d "$ZSH_COMPDUMP"
else
  compinit -i -d "$ZSH_COMPDUMP"; touch "$ZSH_COMPDUMP"
fi
{
  if [[ -s "$ZSH_COMPDUMP" && (! -s "${ZSH_COMPDUMP}.zwc" || "$ZSH_COMPDUMP" -nt "${ZSH_COMPDUMP}.zwc") ]]; then
    zcompile "$ZSH_COMPDUMP"
  fi
} &!

# Clone antidote if necessary.
[[ -d $HOME/.antidote ]] ||
  git clone --depth=1 https://github.com/mattmc3/antidote.git $HOME/.antidote

# Load aliases, zconfigs, and zstyles
[[ -e ${ZDOTDIR:-$HOME}/.aliases ]] && source ${ZDOTDIR:-$HOME}/.aliases
[[ -e ${ZDOTDIR:-$HOME}/.zconfig ]] && source ${ZDOTDIR:-$HOME}/.zconfig
[[ -e ${ZDOTDIR:-$HOME}/.zstyles ]] && source ${ZDOTDIR:-$HOME}/.zstyles

# To customize prompt, run `p10k configure` or edit ~/.dotfiles/p10k/.p10k
[[ -e ${DOTFILES:-$HOME}/p10k/.p10k ]] && source ${DOTFILES:-$HOME}/p10k/.p10k

# Load antidote
source $ANTIDOTE_HOME/antidote.zsh
antidote load

# Prompts
autoload -Uz promptinit && promptinit && prompt powerlevel10k
