return {
    'mason-org/mason.nvim',
    dependencies = {
        'mason-org/mason-lspconfig.nvim',
        'WhoIsSethDaniel/mason-tool-installer.nvim',
    },
    keys = {
        { '<leader>ms', '<cmd>Mason<cr>', desc = 'Open Mason' },
    },
    lazy = false,
    config = function()
        -- import mason
        local mason = require('mason')

        -- import mason-lspconfig
        local mason_lspconfig = require('mason-lspconfig')

        local mason_tool_installer = require('mason-tool-installer')

        -- enable mason and configure icons
        mason.setup({
            ui = {
                icons = {
                    package_installed = '✓',
                    package_pending = '➜',
                    package_uninstalled = '✗',
                },
            },
        })

        mason_lspconfig.setup({
            -- lsp
            ensure_installed = {
                'bashls',
                'docker_compose_language_service',
                'dockerls',
                'jsonls',
                'lua_ls',
                'marksman',
                'pyright',
                -- 'ruff',      installed via uv tool install ruff
                'sqlls',
                'yamlls',
            },

        })

        mason_tool_installer.setup({
            -- dap, formatter, and linter
            ensure_installed = {
                -- 'black',     installed via uv tool install black
                -- 'debugpy',   installed via uv tool install debugpy (needs ../dap-python.lua)
                -- 'isort',     installed via uv tool install isort
                'prettier',
                'shellcheck',
                'shfmt',
                'sql-formatter',
            },
            auto_update = true,
            run_on_start = true,
            integrations = {
                ['mason-lspconfig'] = true,
                ['mason-null-ls'] = false,
                ['mason-nvim-dap'] = false,
            },
        })

        vim.lsp.enable('ruff')
    end,
}
