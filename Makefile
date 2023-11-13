# Makefile for managing dotfile symlinks
SHELL = /bin/zsh
DOTFILES = $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))

.DEFAULT_GOAL := all
.PHONY: all cleanup install asdf direnv git zsh


all:
	@$(MAKE) cleanup
	@$(MAKE) install

cleanup:
	@echo "[cleanup] Removing existing symlinks..."
	
	@echo "- [asdf] Removing '$(HOME)/.tool-versions'"
	@rm -f "$(HOME)/.tool-versions"
	
	@echo "- [direnv] Removing '$(HOME)/.direnvrc'"
	@rm -f "$(HOME)/.direnvrc"
	
	@echo "- [git] Removing '$(HOME)/.gitconfig'"
	@rm -f "$(HOME)/.gitconfig"
	
	@echo "- [git] Removing '$(HOME)/.gitignore_global'"
	@rm -f "$(HOME)/.gitignore_global"
	
	@echo "- [zsh] Removing '$(HOME)/.zshenv'"
	@rm -f "$(HOME)/.zshenv"

install:
	@echo "[install] Creating symlinks..."
	@$(MAKE) asdf
	@$(MAKE) direnv
	@$(MAKE) git
	@$(MAKE) zsh


asdf:
	@echo "- [asdf] Linking '$(DOTFILES)/asdf/.tool-versions' to '$(HOME)/.tool-versions'"
	@ln -fs "$(DOTFILES)/asdf/.tool-versions" "$(HOME)/.tool-versions"

direnv:
	@echo "- [direnv] Linking '$(DOTFILES)/direnv/.direnvrc' to '$(HOME)/.direnvrc'"
	@ln -fs "$(DOTFILES)/direnv/.direnvrc" "$(HOME)/.direnvrc"

git:
	@echo "- [git] Linking '$(DOTFILES)/git/.gitconfig' to '$(HOME)/.gitconfig'"
	@ln -fs "$(DOTFILES)/git/.gitconfig" "$(HOME)/.gitconfig"
	
	@echo "- [git] Linking '$(DOTFILES)/git/.gitignore_global' to '$(HOME)/.gitignore_global'"
	@ln -fs "$(DOTFILES)/git/.gitignore_global" "$(HOME)/.gitignore_global"

zsh:
	@echo "- [zsh] Linking '$(DOTFILES)/zsh/.zshenv' to '$(HOME)/.zshenv'"
	@ln -fs "$(DOTFILES)/zsh/.zshenv" "$(HOME)/.zshenv"
