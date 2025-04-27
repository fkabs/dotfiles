return {
    'nvim-telescope/telescope.nvim',
    tag = '0.1.8',
    dependencies = { 
        'nvim-lua/plenary.nvim',
        { 'nvim-telescope/telescope-fzf-native.nvim', build = 'make' },
    },
    keys = {
        { '<leader>ff', '<cmd>Telescope find_files<cr>', desc = 'Fuzzy find files in cwd' },
        { '<leader>fa', '<cmd>Telescope find_files follow=true no_ignore=true hidden=true<cr>', desc = 'Fuzzy find all files in cwd' },
        { '<leader>fo', '<cmd>Telescope oldfiles<cr>', desc = 'Fuzzy find oldfiles' },
        { '<leader>fb', '<cmd>Telescope buffers<cr>', desc = 'Fuzzy find open buffers' },
        { '<leader>fg', '<cmd>Telescope git_files hidden=true<cr>', desc = 'Fuzzy find git files in cwd' },
        { '<leader>fr', '<cmd>Telescope oldfiles<cr>', desc = 'Fuzzy find recent files' },
        { '<leader>fw', '<cmd>Telescope live_grep<cr>', desc = 'Fuzzy fstring in cwd' },
        { '<leader>fc', '<cmd>Telescope grep_string<cr>', desc = 'Fuzzy find string under cursor in cwd' },
        { '<leader>fh', '<cmd>Telescope help_tags<cr>', desc = 'Fuzzy find help tags' },
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
