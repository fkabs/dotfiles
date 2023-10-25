# Enable Powerlevel10k instant prompt. Should stay close to the top of ~/.zshrc.
# Initialization code that may require console input (password prompts, [y/n]
# confirmations, etc.) must go above this block; everything else may go below.
if [[ -r "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh" ]]; then
  source "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh"
fi

# Add brew zsh-completions to fpath
fpath=("/opt/homebrew/share/zsh-completions" $fpath)

# If you come from bash you might have to change your $PATH.
# export PATH=$HOME/bin:/usr/local/bin:$PATH

# User configuration

# export MANPATH="/usr/local/man:$MANPATH"

# You may need to manually set your language environment
# export LANG=en_US.UTF-8

# Preferred editor for local and remote sessions
# if [[ -n $SSH_CONNECTION ]]; then
#   export EDITOR='vim'
# else
#   export EDITOR='mvim'
# fi

# Compilation flags
# export ARCHFLAGS="-arch x86_64"

# Set personal aliases, overriding those provided by oh-my-zsh libs,
# plugins, and themes. Aliases can be placed here, though oh-my-zsh
# users are encouraged to define aliases within the ZSH_CUSTOM folder.
# For a full list of active aliases, run `alias`.
#
# Example aliases
# alias zshconfig="mate ~/.zshrc"
# alias ohmyzsh="mate ~/.oh-my-zsh"

# Load aliases, exports, functions and oh-my-zsh settings
[[ -f "$ZDOTDIR/_aliases" ]] && source "$ZDOTDIR/_aliases"
[[ -f "$ZDOTDIR/_functions" ]] && source "$ZDOTDIR/_functions"
[[ -f "$ZDOTDIR/_oh-my-zsh" ]] && source "$ZDOTDIR/_oh-my-zsh"

# To customize prompt, run `p10k configure` or edit ~/.dotfiles/_p10k
[[ -f "$ZDOTDIR/_p10k" ]] && source "$ZDOTDIR/_p10k"
