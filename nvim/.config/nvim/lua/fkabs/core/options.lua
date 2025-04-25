-- disable netrw
vim.g.loaded_netrw = 1
vim.g.loaded_netrwPlugin = 1

vim.opt.number = true
vim.opt.relativenumber = true

-- tabs & indentation
vim.opt.tabstop = 4
vim.opt.softtabstop = 4
vim.opt.shiftwidth = 4
vim.opt.expandtab = true
vim.opt.autoindent = true
vim.opt.smartindent = true

-- turn off line wrapping
vim.opt.wrap = false

-- search settings
vim.opt.cursorline = true
vim.opt.ignorecase = true
vim.opt.smartcase = true
vim.opt.hlsearch = false
vim.opt.incsearch = true

-- scrolloff
vim.opt.scrolloff = 8

-- turn on termguicolors for rose-pine olorscheme to work
vim.opt.termguicolors = true
vim.opt.background = 'dark'
vim.opt.signcolumn = 'yes'

-- backspace
vim.opt.backspace = 'indent,eol,start'

-- clipboard
vim.opt.clipboard:append('unnamedplus')

-- split windows
vim.opt.splitright = true
vim.opt.splitbelow = true

-- turn off swapfile
vim.opt.swapfile = false
vim.opt.backup = false
vim.opt.undodir = os.getenv('HOME') .. '/.vim/undodir'
vim.opt.undofile = true

-- add @-@ to isfname
vim.opt.isfname:append('@-@')

-- add signcolumn
vim.opt.signcolumn = 'yes'

-- update time
vim.opt.updatetime = 50
