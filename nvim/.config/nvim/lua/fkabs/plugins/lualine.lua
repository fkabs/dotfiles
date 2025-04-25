return {
    'nvim-lualine/lualine.nvim',
    dependencies = { 'nvim-tree/nvim-web-devicons' },
    config = function()
        lualine = require('lualine')
        
        local p = require('rose-pine.palette')
        local config = require('rose-pine.config')

        local bg_base = p.base
        if config.options.styles.transparency then
            bg_base = 'NONE'
        end

        rose_pine = {
            normal = {
                a = { bg = p.rose, fg = p.base, gui = 'bold' },
                b = { bg = p.overlay, fg = p.rose },
                c = { bg = bg_base, fg = p.text },
            },
            insert = {
                a = { bg = p.foam, fg = p.base, gui = 'bold' },
                b = { bg = p.overlay, fg = p.foam },
                c = { bg = bg_base, fg = p.text },
            },
            visual = {
                a = { bg = p.iris, fg = p.base, gui = 'bold' },
                b = { bg = p.overlay, fg = p.iris },
                c = { bg = bg_base, fg = p.text },
            },
            replace = {
                a = { bg = p.pine, fg = p.base, gui = 'bold' },
                b = { bg = p.overlay, fg = p.pine },
                c = { bg = bg_base, fg = p.text },
            },
            command = {
                a = { bg = p.love, fg = p.base, gui = 'bold' },
                b = { bg = p.overlay, fg = p.love },
                c = { bg = bg_base, fg = p.text },
            },
            inactive = {
                a = { bg = bg_base, fg = p.muted, gui = 'bold' },
                b = { bg = bg_base, fg = p.muted },
                c = { bg = bg_base, fg = p.muted },
            },
        }
        
        lualine.setup {
            options = {
                icons_enabled = true,
                theme = rose_pine,
                component_separators = { left = '', right = ''},
                section_separators = { left = '', right = ''},
                disabled_filetypes = {
                    statusline = {},
                    winbar = {},
                },
                ignore_focus = {},
                always_divide_middle = true,
                always_show_tabline = true,
                globalstatus = false,
                refresh = {
                    statusline = 100,
                    tabline = 100,
                    winbar = 100,
                }
            },
            sections = {
                lualine_a = {'mode'},
                lualine_b = {'branch', 'diff', 'diagnostics'},
                lualine_c = {'filename'},
                lualine_x = {'encoding', 'fileformat', 'filetype'},
                lualine_y = {'progress'},
                lualine_z = {'location'}
            },
            inactive_sections = {
                lualine_a = {},
                lualine_b = {},
                lualine_c = {'filename'},
                lualine_x = {'location'},
                lualine_y = {},
                lualine_z = {}
            },
            tabline = {},
            winbar = {},
            inactive_winbar = {},
            extensions = {}
        }
    end
}