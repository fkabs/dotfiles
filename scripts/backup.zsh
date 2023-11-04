#!/bin/zsh

# Declare variables
DOTFILES=$HOME/.dotfiles

# Make a brew dump file
echo "\n# Dumping Brewfile"
brew bundle dump --force --file=$DOTFILES/brew/Brewfile
echo "Dumped file to $DOTFILES/brew/Brewfile"

# Exporting dock layout
echo "# Exporting dock layout to $DOTFILES/dock/dock-layout.plist"
defaults export com.apple.dock $DOTFILES/dock/dock-layout.plist
