local which_key = require('which-key')
local telescope_builtin = require('telescope.builtin')

local non_lsp_mappings = {
    { '<C-b>', '<Cmd>Neotree toggle<CR>', desc = 'Toggle file explorer' },
    { '<C-d>', '<C-d>zz', desc = 'Half page down and center' },
    { '<C-u>', '<C-u>zz', desc = 'Half page up and center' },
    { '<C-\\>', '<Plug>(comment_toggle_linewise_current)', desc = 'Toggle comment' },
    { '<leader>ff', function() telescope_builtin.find_files() end, desc = 'Telescope find files' },
    { '<leader>fg', function() telescope_builtin.live_grep() end, desc = 'Telescope live grep' },
    { '<leader>fb', function() telescope_builtin.buffers() end, desc = 'Telescope buffers' },
    { '<leader>fh', function() telescope_builtin.help_tags() end, desc = 'Telescope help tags' },
    { '<leader>la', '<Cmd>Lazy<CR>', desc = 'Open Lazy' },
    { '<leader>p', '\'_dP', desc = 'Paste without overwrite' },
    { '<leader>s', ':%s/\\<<C-r><C-w>\\>/<C-r><C-w>/gI<Left><Left><Left>', desc = 'Search and replace word under cursor' },
    { 'J', 'mzJ`z', desc = 'Join lines and keep cursor position' },
    { 'N', 'Nzzzv', desc = 'Previous search result and center' },
    { 'Q', '<nop>', desc = 'Disable Ex mode' },
    { 'n', 'nzzzv', desc = 'Next search result and center' },
}

which_key.add(non_lsp_mappings)