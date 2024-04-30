#!/bin/zsh

_alacritty() {
    mkdir -p "$HOME/.config/alacritty"
    
    echo "- [alacritty] Linking '$DOTFILES/alacritty/alacritty_$OS_SUFFIX.toml' to '$HOME/.config/alacritty/alacritty.toml'"
    ln -fs "$DOTFILES/alacritty/alacritty_$OS_SUFFIX.toml" "$HOME/.config/alacritty/alacritty.toml"
    
    echo "- [alacritty] Linking '$DOTFILES/alacritty/onehalf_dark.toml' to '$HOME/.config/alacritty/onehalf_dark.toml'"
    ln -fs "$DOTFILES/alacritty/onehalf_dark.toml" "$HOME/.config/alacritty/onehalf_dark.toml"
}

_asdf() {
    echo "- [asdf] Linking '$DOTFILES/asdf/.tool-versions' to '$HOME/.tool-versions'"
    ln -fs "$DOTFILES/asdf/.tool-versions" "$HOME/.tool-versions"
}

_direnv() {
    echo "- [direnv] Linking '$DOTFILES/direnv/.direnvrc' to '$HOME/.direnvrc'"
    ln -fs "$DOTFILES/direnv/.direnvrc" "$HOME/.direnvrc"
}

_git() {
    echo "- [git] Linking '$DOTFILES/git/.gitconfig' to '$HOME/.gitconfig'"
    ln -fs "$DOTFILES/git/.gitconfig" "$HOME/.gitconfig"
    
    echo "- [git] Linking '$DOTFILES/git/.gitignore_global' to '$HOME/.gitignore_global'"
    ln -fs "$DOTFILES/git/.gitignore_global" "$HOME/.gitignore_global"
}

_gtk3() {
    echo "- [gtk-3.0] Linking '$DOTFILES/gtk-3.0' to '$HOME/.config/gtk-3.0'"
    ln -fs "$DOTFILES/gtk-3.0" "$HOME/.config/gtk-3.0"
}

_kitty() {
    mkdir -p "$HOME/.config/kitty"
    
    echo "- [kitty] Linking '$DOTFILES/kitty/kitty_$OS_SUFFIX.conf' to '$HOME/.config/kitty/kitty.conf'"
    ln -fs "$DOTFILES/kitty/kitty_$OS_SUFFIX.conf" "$HOME/.config/kitty/kitty.conf"
    
    echo "- [kitty] Linking '$DOTFILES/kitty/onehalf_dark.conf' to '$HOME/.config/kitty/onehalf_dark.conf'"
    ln -fs "$DOTFILES/kitty/onehalf_dark.conf" "$HOME/.config/kitty/onehalf_dark.conf"
}

_mako() {
    echo "- [mako] Linking '$DOTFILES/mako' to '$HOME/.config/mako'"
    ln -fs "$DOTFILES/mako" "$HOME/.config/mako"
}

_p10k() {
    echo "- [p10k] Linking '$DOTFILES/p10k' to '$HOME/.config/p10k'"
    ln -fs "$DOTFILES/p10k" "$HOME/.config/p10k"
}

_sway() {
    echo "- [sway] Linking '$DOTFILES/sway' to '$HOME/.config/sway'"
    ln -fs "$DOTFILES/sway" "$HOME/.config/sway"
}

_swaylock() {
    echo "- [swaylock] Linking '$DOTFILES/swaylock' to '$HOME/.config/swaylock'"
    ln -fs "$DOTFILES/swaylock" "$HOME/.config/swaylock"
}

_waybar() {
    echo "- [waybar] Linking '$DOTFILES/waybar' to '$HOME/.config/waybar'"
    ln -fs "$DOTFILES/waybar" "$HOME/.config/waybar"
}

_wofi() {
    echo "- [wofi] Linking '$DOTFILES/wofi' to '$HOME/.config/wofi'"
    ln -fs "$DOTFILES/wofi" "$HOME/.config/wofi"
}

_zsh() {
    echo "- [zsh] Linking '$DOTFILES/zsh/.zshenv' to '$HOME/.zshenv'"
    ln -fs "$DOTFILES/zsh/.zshenv" "$HOME/.zshenv"
}


make_cleanup() {
    echo "[cleanup] Removing existing symlinks..."
    
    echo "- [alacritty] Removing '$HOME/.config/alacritty'"
    rm -rff "$HOME/.config/alacritty"
    
    echo "- [asdf] Removing '$HOME/.tool-versions'"
    rm -f "$HOME/.tool-versions"
    
    echo "- [direnv] Removing '$HOME/.direnvrc'"
    rm -f "$HOME/.direnvrc"
    
    echo "- [git] Removing '$HOME/.gitconfig'"
    rm -f "$HOME/.gitconfig"
    
    echo "- [git] Removing '$HOME/.gitignore_global'"
    rm -f "$HOME/.gitignore_global"
    
    echo "- [kitty] Removing '$HOME/.config/kitty'"
    rm -rf "$HOME/.config/kitty"
    
    echo "- [p10k] Removing '$HOME/.config/p10k'"
    rm -rf "$HOME/.config/p10k"
    
    echo "- [zsh] Removing '$HOME/.zshenv'"
    rm -f "$HOME/.zshenv"
    
    if [[ $(uname) == Linux ]]; then
        echo "- [gtk-3.0] Removing '$HOME/.config/gtk-3.0'"
        rm -rf "$HOME/.config/gtk-3.0"
        
        echo "- [mako] Removing '$HOME/.config/mako'"
        rm -rf "$HOME/.config/mako"
        
        echo "- [sway] Removing '$HOME/.config/sway'"
        rm -rf "$HOME/.config/sway"
        
        echo "- [swaylock] Removing '$HOME/.config/swaylock'"
        rm -rf "$HOME/.config/swaylock"
        
        echo "- [waybar] Removing '$HOME/.config/waybar'"
        rm -rf "$HOME/.config/waybar"
        
        echo "- [wofi] Removing '$HOME/.config/wofi'"
        rm -rf "$HOME/.config/wofi"
    fi
}

make_install() {
    echo "[install] Creating symlinks..."
    _alacritty
    _asdf
    _direnv
    _git
    _kitty
    _p10k
    _zsh
    
    if [[ $(uname) == Linux ]]; then
        _gtk3
        _mako
        _sway
        _swaylock
        _waybar
        _wofi
    fi
}

make_dock() {
    if [[ $(uname) == Darwin ]]; then
        echo "- [dock] Importing com.apple.dock from '$DOTFILES/dock/dock-layout.plist'"
        defaults import com.apple.dock "$DOTFILES/dock/dock-layout.plist"
        killall Dock
    fi
}


# Set DOTFILES variable
DOTFILES="$(dirname $(realpath $0))"

# Determine OS suffix
uname_result="$(uname)"
if [[ "$uname_result" == "Darwin" ]]; then
    OS_SUFFIX="darwin"
else
    OS_SUFFIX="linux"
fi

# Set verbose mode for "log" function if it is not set
if [ -z "$_VERBOSE" ]; then
    _VERBOSE=1
fi

# Set command as $1
command=$1

case $command in
    cleanup|install|dock)
        make_$command ;;
    *) echo "Usage: make {cleanup|install|dock}" ; return 1 ;;
esac
