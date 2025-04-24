#!/bin/zsh

make_cleanup() {
    echo "[cleanup] Removing symlinked stow packages..."
    
    # remove packages
    for PKG in "${STOW_PACKAGES[@]}"; do
        echo "[stow] $PKG"
        $STOW -D -t "$HOME" "$PKG"
    done
}

make_install() {
    echo "[install] stowing packages..."
    
    # stow packages
    for PKG in "${STOW_PACKAGES[@]}"; do
        echo "[stow] $PKG"
        $STOW -t "$HOME" "$PKG"
    done
}

# Set packages to be stowed
STOW_PACKAGES=(
    "bat"
    "ghostty"
    "git"
    "nvim"
    "starship"
    "tmux"
    "zsh"
)

# Set stow as absolute path on /opt/homebrew/bin/stow
if [ -d "/opt/homebrew/bin" ]; then
    STOW="/opt/homebrew/bin/stow"
else
    STOW="/usr/local/bin/stow"
fi

# Check if stow is installed
if [ ! -f "$STOW" ]; then
    echo "[stow] Not installed. Please install stow first."
    return 1
fi

# Set command as $1
command=$1

case $command in
    cleanup|install)
        make_$command ;;
    *) echo "Usage: make {cleanup|install|dock}" ; return 1 ;;
esac
