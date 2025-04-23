#!/bin/zsh

make_cleanup() {
    echo "[cleanup] Removing symlinked stow packages..."
    
    # remove packages
    for PKG in "${STOW_PACKAGES[@]}"; do
        echo "[stow] $PKG"
        stow -D -t "$HOME" "$PKG"
    done
}

make_install() {
    echo "[install] stowing packages..."
    
    # stow packages
    for PKG in "${STOW_PACKAGES[@]}"; do
        echo "[stow] $PKG"
        stow -t "$HOME" "$PKG"
    done
}

# Set packages to be stowed
STOW_PACKAGES=(
    "bat"
    "ghostty"
    "git"
    "starship"
    "tmux"
    "zsh"
)

# Set command as $1
command=$1

case $command in
    cleanup|install)
        make_$command ;;
    *) echo "Usage: make {cleanup|install|dock}" ; return 1 ;;
esac
