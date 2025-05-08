return {
    "mason-org/mason.nvim",
    dependencies = {
        "mason-org/mason-lspconfig.nvim",
        "WhoIsSethDaniel/mason-tool-installer.nvim",
    },
    config = function()
        -- import mason
        local mason = require("mason")
        
        -- import mason-lspconfig
        local mason_lspconfig = require("mason-lspconfig")
        
        local mason_tool_installer = require("mason-tool-installer")
        
        -- enable mason and configure icons
        mason.setup({
            ui = {
                icons = {
                    package_installed = "✓",
                    package_pending = "➜",
                    package_uninstalled = "✗",
                },
            },
        })
        
        mason_lspconfig.setup({
            -- list of servers for mason to install
            ensure_installed = {
                "bashls",
                "docker_compose_language_service",
                "dockerls",
                "jsonls",
                "lua_ls",
                "marksman",
                "pyright",
                "ruff",
                "sqlls",
                "yamlls",
            },
            
        })
        
        mason_tool_installer.setup({
            ensure_installed = {
                "black",
                "isort",
                "prettier",
                "shellcheck",
                "shfmt",
                "sql-formatter",
            },
            auto_update = true,
            run_on_start = true,
            integrations = {
                ['mason-lspconfig'] = true,
                ['mason-null-ls'] = false,
                ['mason-nvim-dap'] = false,
            },
        })
    end,
}
