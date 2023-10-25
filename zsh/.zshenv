# DOTFILES directory
export DOTFILES="$HOME/.dotfiles"

# ZDOTDIR for zsh config
export ZDOTDIR="$DOTFILES/zsh"


# Apps
export EDITOR=vim
export VISUAL=code
export PAGER=less

if [[ "$OSTYPE" == darwin* ]]; then
  export BROWSER='open'
fi


# BAT config file
export BAT_CONFIG_PATH="$ZDOTDIR/.batrc"

# DOCKER HOST for podman
# export DOCKER_HOST="unix://$HOME/.local/share/containers/podman/machine/qemu/podman.sock"

# Require pip to be run within a virtualenv (can be bypassed with gpip or nopip)
export PIP_REQUIRE_VIRTUALENV=true

# Disable pyenv-virtualenv prompt
export PYENV_VIRTUALENV_DISABLE_PROMPT=1
