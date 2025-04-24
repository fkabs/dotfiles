-- use system keyboard for yank
vim.opt.clipboard = 'unnamedplus'

-- set line numbers -- set line numbers
vim.opt.nu = true
-- use relative line numbers
vim.opt.relativenumber = true

-- set tab size to 4 spaces
vim.opt.tabstop = 4
vim.opt.softtabstop = 4
vim.opt.shiftwidth = 4
vim.opt.expandtab = true
vim.opt.smartindent = true

vim.opt.wrap = false

-- incremental search
vim.opt.incsearch = true

-- set 24-bit color in the terminal
vim.opt.termguicolors = true

-- disable netrw at the very start of your init.lua
vim.g.loaded_netrw = 1
vim.g.loaded_netrwPlugin = 1
