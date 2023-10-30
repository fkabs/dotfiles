#!/bin/zsh

# Declare variables
DOTFILES=$HOME/.dotfiles

# Make a brew dump file
brew bundle dump --force --file=$DOTFILES/brew/Brewfile
