packages := "bat btop claude ghostty git nvim pi starship tmux zsh"

default:
    @just --list

install *pkgs=packages:
    stow -v -t "$HOME" {{pkgs}}

uninstall *pkgs=packages:
    stow -v -D -t "$HOME" {{pkgs}}

restow *pkgs=packages:
    stow -v -R -t "$HOME" {{pkgs}}
