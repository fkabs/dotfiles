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

# # GNU utils and manpages
# if [[ $(uname) == Darwin ]]; then
#     # GNU bins
#     for d in "$(brew --prefix)/opt/"*"/libexec/gnubin"; do export PATH=$d:$PATH; done
#     # for d in "$(brew --prefix)/opt/"*"/bin"; do export PATH=$d:$PATH; done
    
#     # GNU manpages
#     for d in "$(brew --prefix)/opt/"*"/libexec/gnuman"; do export MANPATH=$d:$MANPATH; done
#     # for d in "$(brew --prefix)/opt/"*"/share/man/man1"; do export MANPATH=$d:$MANPATH; done
# fi
