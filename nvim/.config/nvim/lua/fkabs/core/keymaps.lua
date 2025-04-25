-- set leader key to space and localleader key to backslash
vim.g.mapleader = ' '
vim.g.maplocalleader = '\\'

local keymap = vim.keymap

-- general
keymap.set('n', 'J', 'mzJ`z', { desc = 'Join lines and keep cursor position' })
keymap.set('n', 'Q', '<nop>', { desc = 'Disable Ex mode' })

-- comment
keymap.set('n', '<C-\\>', '<Plug>(comment_toggle_linewise_current)', { desc = 'Toggle comment' })

-- search & replace
keymap.set('n', 'n', 'nzzzv', { desc = 'Next search result and center' })
keymap.set('n', 'N', 'Nzzzv', { desc = 'Previous search result and center' })
keymap.set('n', '<leader>s', ':%s/\\<<C-r><C-w>\\>/<C-r><C-w>/gI<Left><Left><Left>', { desc = 'Search and replace word under cursor' })

-- copy & paste
keymap.set('n', '<leader>p', '\'_dP', { desc = 'Paste without overwrite' })

-- increment/decrement numbers
keymap.set('n', '<leader>+', '<C-a>', { desc = 'Increment number' }) -- increment
keymap.set('n', '<leader>-', '<C-x>', { desc = 'Decrement number' }) -- decrement

-- page navigation
keymap.set('n', '<C-d>', '<C-d>zz', { desc = 'Half page down and center' })
keymap.set('n', '<C-u>', '<C-u>zz', { desc = 'Half page up and center' })

-- window management
keymap.set('n', '<leader>sv', '<C-w>v', { desc = 'Split window vertically' }) -- split window vertically
keymap.set('n', '<leader>sh', '<C-w>s', { desc = 'Split window horizontally' }) -- split window horizontally
keymap.set('n', '<leader>se', '<C-w>=', { desc = 'Make splits equal size' }) -- make split windows equal width & height
keymap.set('n', '<leader>sx', '<cmd>close<cr>', { desc = 'Close current split' }) -- close current split window
keymap.set('n', '<leader>to', '<cmd>tabnew<cr>', { desc = 'Open new tab' }) -- open new tab
keymap.set('n', '<leader>tx', '<cmd>tabclose<cr>', { desc = 'Close current tab' }) -- close current tab
keymap.set('n', '<leader>tn', '<cmd>tabn<cr>', { desc = 'Go to next tab' }) --  go to next tab
keymap.set('n', '<leader>tp', '<cmd>tabp<cr>', { desc = 'Go to previous tab' }) --  go to previous tab
keymap.set('n', '<leader>tf', '<cmd>tabnew %<cr>', { desc = 'Open current buffer in new tab' }) --  move current buffer to new tab

-- lazy
keymap.set('n', '<leader>la', '<cmd>Lazy<cr>', { desc = 'Open Lazy' })

-- neotree
keymap.set('n', '<C-b>', '<cmd>Neotree toggle<cr>', { desc = 'Toggle file explorer' })

-- telescope
keymap.set('n', '<leader>ff', '<cmd>Telescope find_files hidden=true<cr>', { desc = 'Fuzzy find files in cwd' })
keymap.set('n', '<leader>fr', '<cmd>Telescope oldfiles<cr>', { desc = 'Fuzzy find recent files' })
keymap.set('n', '<leader>fs', '<cmd>Telescope live_grep<cr>', { desc = 'Find string in cwd' })
keymap.set('n', '<leader>fc', '<cmd>Telescope grep_string<cr>', { desc = 'Find string under cursor in cwd' })

