#!/bin/zsh
#
# .zprofile - Zsh file loaded on login.
#

# Checks all known prefixes for homebrew (macOS arm64/Intel, Linuxbrew) so it
# self-guards without a uname check
for _brew in /opt/homebrew/bin/brew /usr/local/bin/brew /home/linuxbrew/.linuxbrew/bin/brew; do
    [[ -x $_brew ]] && eval "$($_brew shellenv)" && break
done
unset _brew
