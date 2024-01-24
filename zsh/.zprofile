#!/bin/zsh
#
# .zprofile - Zsh file loaded on login.
#

# init brew if system is macos
if [[ "$OSTYPE" == darwin* ]]; then
    eval $(/opt/homebrew/bin/brew shellenv)
fi
