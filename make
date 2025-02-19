#!/bin/zsh

_alacritty() {
    mkdir -p "$XDG_CONFIG_HOME/alacritty"
    
    echo "- [alacritty] Linking '$DOTFILES/alacritty/alacritty_$OS_SUFFIX.toml' to '$XDG_CONFIG_HOME/alacritty/alacritty.toml'"
    ln -fs "$DOTFILES/alacritty/alacritty_$OS_SUFFIX.toml" "$XDG_CONFIG_HOME/alacritty/alacritty.toml"
    
    echo "- [alacritty] Linking '$DOTFILES/alacritty/themes' to '$XDG_CONFIG_HOME/alacritty/themes'"
    ln -fs "$DOTFILES/alacritty/themes" "$XDG_CONFIG_HOME/alacritty/themes"
}

_bat() {    
    echo "- [bat] Linking '$DOTFILES/bat' to '$XDG_CONFIG_HOME/bat'"
    ln -fs "$DOTFILES/bat" "$XDG_CONFIG_HOME/bat"
}

_dunst() {
    echo "- [dunst] Linking '$DOTFILES/dunst' to '$XDG_CONFIG_HOME/dunst'"
    ln -fs "$DOTFILES/dunst" "$XDG_CONFIG_HOME/dunst"
}

_ghostty() {
    echo "- [ghostty] Linking '$DOTFILES/ghostty' to '$XDG_CONFIG_HOME/ghostty'"
    ln -fs "$DOTFILES/ghostty" "$XDG_CONFIG_HOME/ghostty"
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

_gtk4() {
    echo "- [gtk-4.0] Linking '$DOTFILES/gtk-4.0' to '$XDG_CONFIG_HOME/gtk-4.0'"
    ln -fs "$DOTFILES/gtk-4.0" "$XDG_CONFIG_HOME/gtk-4.0"
}

_i3() {
    echo "- [i3] Linking '$DOTFILES/i3' to '$XDG_CONFIG_HOME/i3'"
    ln -fs "$DOTFILES/i3" "$XDG_CONFIG_HOME/i3"
}

# _karabiner() {
#     echo "- [karabiner] Linking '$DOTFILES/karabiner' to '$HOME/.config/karabiner'"
#     ln -fs "$DOTFILES/karabiner" "$HOME/.config/karabiner"
# }

_nwg-look() {
    echo "- [nwg-look] Linking '$DOTFILES/nwg-look' to '$XDG_CONFIG_HOME/nwg-look'"
    ln -fs "$DOTFILES/nwg-look" "$XDG_CONFIG_HOME/nwg-look"
}

_rofi() {
    echo "- [rofi] Linking '$DOTFILES/rofi' to '$XDG_CONFIG_HOME/rofi'"
    ln -fs "$DOTFILES/rofi" "$XDG_CONFIG_HOME/rofi"
}

_starship() {
    echo "- [starship] Linking '$DOTFILES/starship' to '$XDG_CONFIG_HOME/starship'"
    ln -fs "$DOTFILES/starship" "$XDG_CONFIG_HOME/starship"
}

_tmux() {
    echo "- [tmux] Linking '$DOTFILES/tmux' to '$XDG_CONFIG_HOME/tmux'"
    ln -fs "$DOTFILES/tmux" "$XDG_CONFIG_HOME/tmux"
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
    
    echo "- [bat] Removing '$XDG_CONFIG_HOME/bat'"
    rm -rf "$XDG_CONFIG_HOME/bat"
    
    echo "- [ghostty] Removing '$XDG_CONFIG_HOME/ghostty'"
    rm -rf "$XDG_CONFIG_HOME/ghostty"
    
    echo "- [git] Removing '$HOME/.gitconfig'"
    rm -f "$HOME/.gitconfig"
    
    echo "- [git] Removing '$HOME/.gitignore_global'"
    rm -f "$HOME/.gitignore_global"
    
    echo "- [starship] Removing '$XDG_CONFIG_HOME/starship'"
    rm -rf "$XDG_CONFIG_HOME/starship"
    
    echo "- [tmux] Removing '$XDG_CONFIG_HOME/tmux'"
    rm -f "$XDG_CONFIG_HOME/tmux"
        
    echo "- [zsh] Removing '$HOME/.zshenv'"
    rm -f "$HOME/.zshenv"
    
    echo "- [zsh] Removing '$XDG_CONFIG_HOME/zsh'"
    rm -rf "$XDG_CONFIG_HOME/zsh"
    
    # if [[ $(uname) == Darwin ]]; then
    #     echo "- [karabiner] Removing '$HOME/.config/karabiner'"
    #     rm -rf "$HOME/.config/karabiner"
    # fi
    
    if [[ $(uname) == Linux ]]; then
        echo "- [dunst] Removing '$XDG_CONFIG_HOME/dunst'"
        rm -rf "$XDG_CONFIG_HOME/dunst"
        
        echo "- [gtk-3.0] Removing '$XDG_CONFIG_HOME/gtk-3.0'"
        rm -rf "$XDG_CONFIG_HOME/gtk-3.0"
        
        echo "- [gtk-4.0] Removing '$XDG_CONFIG_HOME/gtk-4.0'"
        rm -rf "$XDG_CONFIG_HOME/gtk-4.0"
        
        echo "- [i3] Removing '$XDG_CONFIG_HOME/i3'"
        rm -rf "$XDG_CONFIG_HOME/i3"
        
        echo "- [nwg-look] Removing '$XDG_CONFIG_HOME/nwg-look'"
        rm -rf "$XDG_CONFIG_HOME/nwg-look"
        
        echo "- [rofi] Removing '$XDG_CONFIG_HOME/rofi'"
        rm -rf "$XDG_CONFIG_HOME/rofi"
    fi
}

make_install() {
    echo "[install] Creating symlinks..."
    _alacritty
    _bat
    _ghostty
    _git
    _starship
    _tmux
    _zsh
    
    # if [[ $(uname) == Darwin ]]; then
    #     _karabiner
    # fi
    
    if [[ $(uname) == Linux ]]; then
        _dunst
        _gtk3
        _gtk4
        _i3
        _nwg-look
        _rofi
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
