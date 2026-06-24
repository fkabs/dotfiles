return {
    'folke/trouble.nvim',
    dependencies = { 'nvim-tree/nvim-web-devicons', 'folke/todo-comments.nvim' },
    opts = {
        focus = true,
    },
    cmd = 'Trouble',
    keys = {
        { '<leader>xw', '<cmd>Trouble diagnostics toggle<cr>', desc = 'Open trouble workspace diagnostics' },
        { '<leader>xd', '<cmd>Trouble diagnostics toggle filter.buf=0<cr>', desc = 'Open trouble document diagnostics' },
        { '<leader>xq', '<cmd>Trouble quickfix toggle<cr>', desc = 'Open trouble quickfix list' },
        { '<leader>xl', '<cmd>Trouble loclist toggle<cr>', desc = 'Open trouble location list' },
        { '<leader>xt', '<cmd>Trouble todo toggle<cr>', desc = 'Open todos in trouble' },
    },
}