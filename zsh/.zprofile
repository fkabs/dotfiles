#!/bin/zsh
#
# .zprofile - Zsh file loaded on login.
#

# init brew if system is macos
if [[ $(UNAME) == Darwin ]]; then
    eval $(/opt/homebrew/bin/brew shellenv)
fi
