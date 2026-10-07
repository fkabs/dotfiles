packages := "bat btop claude ghostty git herdr nvim opencode pi starship tmux zsh"

default:
    @just --list

# herdr, claude, opencode get --no-folding: their apps write runtime state next to tracked files, keep it out of the repo
install *pkgs=packages:
    for p in {{pkgs}}; do stow -v $(case $p in (herdr|claude|opencode) echo --no-folding;; esac) -t "$HOME" "$p" || exit; done

uninstall *pkgs=packages:
    for p in {{pkgs}}; do stow -v $(case $p in (herdr|claude|opencode) echo --no-folding;; esac) -D -t "$HOME" "$p" || exit; done

restow *pkgs=packages:
    for p in {{pkgs}}; do stow -v $(case $p in (herdr|claude|opencode) echo --no-folding;; esac) -R -t "$HOME" "$p" || exit; done
