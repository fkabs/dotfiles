#!/bin/zsh

_alacritty() {
    mkdir -p "$XDG_CONFIG_HOME/alacritty"
    
    echo "- [alacritty] Linking '$DOTFILES/alacritty/alacritty_$OS_SUFFIX.toml' to '$XDG_CONFIG_HOME/alacritty/alacritty.toml'"
    ln -fs "$DOTFILES/alacritty/alacritty_$OS_SUFFIX.toml" "$XDG_CONFIG_HOME/alacritty/alacritty.toml"
    
    echo "- [alacritty] Linking '$DOTFILES/alacritty/onehalf_dark.toml' to '$XDG_CONFIG_HOME/alacritty/onehalf_dark.toml'"
    ln -fs "$DOTFILES/alacritty/onehalf_dark.toml" "$XDG_CONFIG_HOME/alacritty/onehalf_dark.toml"
}

_asdf() {
    echo "- [asdf] Linking '$DOTFILES/asdf/.tool-versions' to '$HOME/.tool-versions'"
    ln -fs "$DOTFILES/asdf/.tool-versions" "$HOME/.tool-versions"
}

_bat() {    
    echo "- [bat] Linking '$DOTFILES/bat' to '$XDG_CONFIG_HOME/bat'"
    ln -fs "$DOTFILES/bat" "$XDG_CONFIG_HOME/bat"
}

_direnv() {
    mkdir -p "$XDG_CONFIG_HOME/direnv"
    
    echo "- [direnv] Linking '$DOTFILES/direnv/.direnvrc' to '$XDG_CONFIG_HOME/direnv/direnvrc'"
    ln -fs "$DOTFILES/direnv/.direnvrc" "$XDG_CONFIG_HOME/direnv/direnvrc"
}

_git() {
    echo "- [git] Linking '$DOTFILES/git/.gitconfig' to '$HOME/.gitconfig'"
    ln -fs "$DOTFILES/git/.gitconfig" "$HOME/.gitconfig"
    
    echo "- [git] Linking '$DOTFILES/git/.gitignore_global' to '$HOME/.gitignore_global'"
    ln -fs "$DOTFILES/git/.gitignore_global" "$HOME/.gitignore_global"
}

_gtk3() {
    echo "- [gtk-3.0] Linking '$DOTFILES/gtk-3.0' to '$XDG_CONFIG_HOME/gtk-3.0'"
    ln -fs "$DOTFILES/gtk-3.0" "$XDG_CONFIG_HOME/gtk-3.0"
}

_kitty() {
    mkdir -p "$XDG_CONFIG_HOME/kitty"
    
    echo "- [kitty] Linking '$DOTFILES/kitty/kitty_$OS_SUFFIX.conf' to '$XDG_CONFIG_HOME/kitty/kitty.conf'"
    ln -fs "$DOTFILES/kitty/kitty_$OS_SUFFIX.conf" "$XDG_CONFIG_HOME/kitty/kitty.conf"
    
    echo "- [kitty] Linking '$DOTFILES/kitty/onehalf_dark.conf' to '$XDG_CONFIG_HOME/kitty/onehalf_dark.conf'"
    ln -fs "$DOTFILES/kitty/onehalf_dark.conf" "$XDG_CONFIG_HOME/kitty/onehalf_dark.conf"
}

_mako() {
    echo "- [mako] Linking '$DOTFILES/mako' to '$XDG_CONFIG_HOME/mako'"
    ln -fs "$DOTFILES/mako" "$XDG_CONFIG_HOME/mako"
}

_nvim() {
    echo "- [nvim] Linking '$DOTFILES/nvim' to '$XDG_CONFIG_HOME/nvim'"
    ln -fs "$DOTFILES/nvim" "$XDG_CONFIG_HOME/nvim"
}

_p10k() {
    echo "- [p10k] Linking '$DOTFILES/p10k' to '$XDG_CONFIG_HOME/p10k'"
    ln -fs "$DOTFILES/p10k" "$XDG_CONFIG_HOME/p10k"
}

_sway() {
    echo "- [sway] Linking '$DOTFILES/sway' to '$XDG_CONFIG_HOME/sway'"
    ln -fs "$DOTFILES/sway" "$XDG_CONFIG_HOME/sway"
}

_swaylock() {
    echo "- [swaylock] Linking '$DOTFILES/swaylock' to '$XDG_CONFIG_HOME/swaylock'"
    ln -fs "$DOTFILES/swaylock" "$XDG_CONFIG_HOME/swaylock"
}

_tmux() {
    echo "- [tmux] Linking '$DOTFILES/tmux' to '$XDG_CONFIG_HOME/tmux'"
    ln -fs "$DOTFILES/tmux" "$XDG_CONFIG_HOME/tmux"
}

_waybar() {
    echo "- [waybar] Linking '$DOTFILES/waybar' to '$XDG_CONFIG_HOME/waybar'"
    ln -fs "$DOTFILES/waybar" "$XDG_CONFIG_HOME/waybar"
}

_wofi() {
    echo "- [wofi] Linking '$DOTFILES/wofi' to '$XDG_CONFIG_HOME/wofi'"
    ln -fs "$DOTFILES/wofi" "$XDG_CONFIG_HOME/wofi"
}

_zsh() {
    echo "- [zsh] Linking '$DOTFILES/zsh/.zshenv' to '$HOME/.zshenv'"
    ln -fs "$DOTFILES/zsh/.zshenv" "$HOME/.zshenv"
    
    echo "- [zsh] Linking '$DOTFILES/zsh' to '$XDG_CONFIG_HOME/zsh'"
    ln -fs "$DOTFILES/zsh" "$XDG_CONFIG_HOME/zsh"
}


make_cleanup() {
    echo "[cleanup] Removing existing symlinks..."
    
    echo "- [alacritty] Removing '$XDG_CONFIG_HOME/alacritty'"
    rm -rff "$XDG_CONFIG_HOME/alacritty"
    
    echo "- [asdf] Removing '$HOME/.tool-versions'"
    rm -f "$HOME/.tool-versions"
    
    echo "- [bat] Removing '$XDG_CONFIG_HOME/bat'"
    rm -rf "$XDG_CONFIG_HOME/bat"
    
    echo "- [direnv] Removing '$XDG_CONFIG_HOME/direnv/direnvrc'"
    rm -f "$XDG_CONFIG_HOME/direnv/direnvrc"
    
    echo "- [git] Removing '$HOME/.gitconfig'"
    rm -f "$HOME/.gitconfig"
    
    echo "- [git] Removing '$HOME/.gitignore_global'"
    rm -f "$HOME/.gitignore_global"
    
    echo "- [kitty] Removing '$XDG_CONFIG_HOME/kitty'"
    rm -rf "$XDG_CONFIG_HOME/kitty"
    
    echo "- [nvim] Removing '$XDG_CONFIG_HOME/nvim'"
    rm -rf "$XDG_CONFIG_HOME/nvim"
    
    echo "- [p10k] Removing '$XDG_CONFIG_HOME/p10k'"
    rm -rf "$XDG_CONFIG_HOME/p10k"
    
    echo "- [tmux] Removing '$XDG_CONFIG_HOME/tmux'"
    rm -f "$XDG_CONFIG_HOME/tmux"
        
    echo "- [zsh] Removing '$HOME/.zshenv'"
    rm -f "$HOME/.zshenv"
    
    echo "- [zsh] Removing '$XDG_CONFIG_HOME/zsh'"
    rm -rf "$XDG_CONFIG_HOME/zsh"
    
    if [[ $(uname) == Linux ]]; then
        echo "- [gtk-3.0] Removing '$XDG_CONFIG_HOME/gtk-3.0'"
        rm -rf "$XDG_CONFIG_HOME/gtk-3.0"
        
        echo "- [mako] Removing '$XDG_CONFIG_HOME/mako'"
        rm -rf "$XDG_CONFIG_HOME/mako"
        
        echo "- [sway] Removing '$XDG_CONFIG_HOME/sway'"
        rm -rf "$XDG_CONFIG_HOME/sway"
        
        echo "- [swaylock] Removing '$XDG_CONFIG_HOME/swaylock'"
        rm -rf "$XDG_CONFIG_HOME/swaylock"
        
        echo "- [waybar] Removing '$XDG_CONFIG_HOME/waybar'"
        rm -rf "$XDG_CONFIG_HOME/waybar"
        
        echo "- [wofi] Removing '$XDG_CONFIG_HOME/wofi'"
        rm -rf "$XDG_CONFIG_HOME/wofi"
    fi
}

make_install() {
    echo "[install] Creating symlinks..."
    _alacritty
    _asdf
    _bat
    _direnv
    _git
    _kitty
    _p10k
    _tmux
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


# Set XDG_CONFIG_HOME and DOTFILES variables
XDG_CONFIG_HOME="${XDG_CONFIG_HOME:-$HOME/.config}"
DOTFILES="${DOTFILES:-$HOME/.dotfiles}"

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
