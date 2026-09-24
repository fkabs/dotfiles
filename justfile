packages := "bat btop claude ghostty git herdr nvim pi starship tmux zsh"

default:
    @just --list

# herdr gets --no-folding so ~/.config/herdr is never a dir symlink into the repo
install *pkgs=packages:
    for p in {{pkgs}}; do stow -v $([ "$p" = herdr ] && echo --no-folding) -t "$HOME" "$p" || exit; done

uninstall *pkgs=packages:
    for p in {{pkgs}}; do stow -v $([ "$p" = herdr ] && echo --no-folding) -D -t "$HOME" "$p" || exit; done

restow *pkgs=packages:
    for p in {{pkgs}}; do stow -v $([ "$p" = herdr ] && echo --no-folding) -R -t "$HOME" "$p" || exit; done
