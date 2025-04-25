-- disable netrw
vim.g.loaded_netrw = 1
vim.g.loaded_netrwPlugin = 1

-- set leader key to space and localleader key to backslash
vim.g.mapleader = ' '
vim.g.maplocalleader = '\\'

require('config.lazy')
require('config.remap')
require('config.set')
