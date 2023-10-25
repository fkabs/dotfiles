# init brew
eval $(/opt/homebrew/bin/brew shellenv)

# init pyenv
export PYENV_ROOT="$HOME/.pyenv"
export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init --path)"
