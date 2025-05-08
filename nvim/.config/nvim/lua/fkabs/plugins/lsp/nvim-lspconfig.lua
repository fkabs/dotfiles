return {
    'neovim/nvim-lspconfig',
    config = function()
        -- import lspconfig
        local lspconfig = require('lspconfig')
        local util = require('lspconfig.util')
        
        -- log level
        vim.lsp.set_log_level('debug')
        
        -- ensure_installed = {
        --     "bashls",
        --     "docker_compose_language_service",
        --     "dockerls",
        --     "jsonls",
        --     "lua_ls",
        --     "marksman",
        --     "pyright",
        --     "ruff",
        --     "sqlls",
        --     "yamlls",
        -- },
        
        -- bashls
        vim.lsp.enable('bashls')
        
        -- docker_compose_language_service
        vim.lsp.enable('docker_compose_language_service')
        
        -- dockerls
        vim.lsp.enable('dockerls')
        
        -- jsonls
        vim.lsp.enable('jsonls')
        
        -- lua_ls
        vim.lsp.enable('lua_ls')
        vim.lsp.config('lua_ls', {
            filetypes = { 'lua' },
            root_dir = util.root_pattern('.git', '.'),
            single_file_support = true,
            settings = {
                Lua = {
                    diagnostics = {
                        globals = { 'vim' },
                    },
                },
            },
        })
        
        -- marksman
        vim.lsp.enable('marksman')
        
        -- pyright
        vim.lsp.enable('pyright')
        vim.lsp.config('pyright', {
            filetypes = { 'python' },
            root_dir = util.root_pattern('.git', '.'),
            single_file_support = true,
            settings = {
                python = {
                    analysis = {
                        autoSearchPaths = true,
                        useLibraryCodeForTypes = true,
                        venvPath = vim.fn.getcwd() .. '/.venv',
                        venv = vim.fn.getcwd() .. '/.venv/bin/python',
                    },
                },
            },
        })
        
        -- ruff
        vim.lsp.enable('ruff')
        
        -- sqlls
        vim.lsp.enable('sqlls')
        
        -- yamlls
        vim.lsp.enable('yamlls')
        
        -- Setup keymaps
        local keymap = vim.keymap
        keymap.set('n', '<leader>lD', vim.lsp.buf.declaration, { desc = 'LSP: Declaration' })
        keymap.set('n', '<leader>lK', vim.lsp.buf.hover, { desc = 'LSP: Hover' })
        keymap.set('n', '<leader>lI', vim.lsp.buf.implementation, { desc = 'LSP: Implementation' })
        keymap.set('n', '<leader>lR', vim.lsp.buf.rename, { desc = 'LSP: Rename' })
        keymap.set('n', '<leader>lF', vim.lsp.buf.format, { desc = 'LSP: Format' })
        keymap.set('n', '<leader>lA', vim.lsp.buf.code_action, { desc = 'LSP: Code Action' })
    
    end,
}