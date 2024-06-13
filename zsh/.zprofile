#!/bin/zsh
#
# .zprofile - Zsh file loaded on login.
#

# init brew if system is macos
if [[ $(uname) == Darwin ]]; then
    eval $(/opt/homebrew/bin/brew shellenv)
fi

# mise shims
eval "$(mise activate zsh --shims)"
