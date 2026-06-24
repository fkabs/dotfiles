-- set leader key to space and localleader key to backslash
vim.g.mapleader = ' '
vim.g.maplocalleader = '\\'

-- general
vim.keymap.set('n', 'J', 'mzJ`z', { desc = 'Join lines and keep cursor position' })
vim.keymap.set('n', 'Q', '<nop>', { desc = 'Disable Ex mode' })

-- search & replace
vim.keymap.set('n', 'n', 'nzzzv', { desc = 'Next search result and center' })
vim.keymap.set('n', 'N', 'Nzzzv', { desc = 'Previous search result and center' })
vim.keymap.set("n", "<leader>s", [[:%s/\<<C-r><C-w>\>/<C-r><C-w>/gI<Left><Left><Left>]], { desc = 'Search and replace word under cursor' })

-- copy & paste
vim.keymap.set('n', '<leader>p', '\'_dP', { desc = 'Paste without overwriting register' })
vim.keymap.set('n', '<leader>+', '<C-a>', { desc = 'Increment number' })
vim.keymap.set('n', '<leader>-', '<C-x>', { desc = 'Decrement number' })
vim.keymap.set('n', '<leader>y', [["+y]], { desc = 'Copy to system clipboard' })
vim.keymap.set('v', '<leader>y', [["+y]], { desc = 'Copy to system clipboard' })
vim.keymap.set('n', '<leader>Y', [["+Y]], { desc = 'Copy to system clipboard' })

-- indent & move commands
vim.keymap.set('v', '<', '<gv', { desc = 'Indent left' })
vim.keymap.set('v', '>', '>gv', { desc = 'Indent right' })
vim.keymap.set('v', 'J', [[:m '>+1<CR>gv=gv]], { desc = 'Move selected lines down' })
vim.keymap.set('v', 'K', [[:m '<-2<CR>gv=gv]], { desc = 'Move selected lines up' })

-- page navigation
vim.keymap.set('n', '<C-d>', '<C-d>zz', { desc = 'Half page down and center' })
vim.keymap.set('n', '<C-u>', '<C-u>zz', { desc = 'Half page up and center' })

-- window management
vim.keymap.set('n', '<C-h>', '<C-w>h', { desc = 'Move to left window' })
vim.keymap.set('n', '<C-j>', '<C-w>j', { desc = 'Move to bottom window' })
vim.keymap.set('n', '<C-k>', '<C-w>k', { desc = 'Move to top window' })
vim.keymap.set('n', '<C-l>', '<C-w>l', { desc = 'Move to right window' })
vim.keymap.set('n', '<leader>sv', '<C-w>v', { desc = 'Split window vertically' })
vim.keymap.set('n', '<leader>sh', '<C-w>s', { desc = 'Split window horizontally' })
vim.keymap.set('n', '<leader>se', '<C-w>=', { desc = 'Make splits equal size' })
vim.keymap.set('n', '<leader>sx', '<cmd>close<cr>', { desc = 'Close current split' })
vim.keymap.set('n', '<leader>to', '<cmd>tabnew<cr>', { desc = 'Open new tab' })
vim.keymap.set('n', '<leader>tx', '<cmd>tabclose<cr>', { desc = 'Close current tab' })
vim.keymap.set('n', '<leader>tn', '<cmd>tabn<cr>', { desc = 'Go to next tab' })
vim.keymap.set('n', '<leader>tp', '<cmd>tabp<cr>', { desc = 'Go to previous tab' })
vim.keymap.set('n', '<leader>tf', '<cmd>tabnew %<cr>', { desc = 'Open current buffer in new tab' })
