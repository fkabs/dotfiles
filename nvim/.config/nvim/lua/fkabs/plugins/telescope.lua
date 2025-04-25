return {
    'nvim-telescope/telescope.nvim',
    tag = '0.1.8',
    dependencies = { 
        'nvim-lua/plenary.nvim',
        { 'nvim-telescope/telescope-fzf-native.nvim', build = 'make' },
    },
    keys = {
        { '<leader>ff', '<cmd>Telescope find_files hidden=true<cr>', desc = 'Fuzzy find files in cwd' },
        { '<leader>fg', '<cmd>Telescope git_files hidden=true<cr>', desc = 'Fuzzy find git files in cwd' },
        { '<leader>fr', '<cmd>Telescope oldfiles<cr>', desc = 'Fuzzy find recent files' },
        { '<leader>fs', '<cmd>Telescope live_grep<cr>', desc = 'Find string in cwd' },
        { '<leader>fc', '<cmd>Telescope grep_string<cr>', desc = 'Find string under cursor in cwd' },
    },
    config = function()
        local telescope = require('telescope')
        local actions = require('telescope.actions')
        local transform_mod = require('telescope.actions.mt').transform_mod

        local trouble = require('trouble')
        local trouble_telescope = require('trouble.sources.telescope')

        -- or create your custom action
        local custom_actions = transform_mod({
            open_trouble_qflist = function(prompt_bufnr)
                trouble.toggle('quickfix')
            end,
        })

        telescope.setup({
            defaults = {
                path_display = { 'smart' },
                mappings = {
                    i = {
                        ['<C-k>'] = actions.move_selection_previous, -- move to prev result
                        ['<C-j>'] = actions.move_selection_next, -- move to next result
                        ['<C-q>'] = actions.send_selected_to_qflist + custom_actions.open_trouble_qflist,
                        ['<C-t>'] = trouble_telescope.open,
                    },
                },
            },
        })

        telescope.load_extension('fzf')
    end
}
