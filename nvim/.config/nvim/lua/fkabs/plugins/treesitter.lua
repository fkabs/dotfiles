return {
    'nvim-treesitter/nvim-treesitter',
    branch = 'main',
    lazy = false,
    build = ':TSUpdate',
    config = function()
        -- no-op for parsers already installed; runs async
        require('nvim-treesitter').install({
            'c', 'lua', 'vim', 'vimdoc', 'query', 'markdown', 'markdown_inline', 'python',
        })

        vim.api.nvim_create_autocmd('FileType', {
            callback = function(args)
                local max_filesize = 100 * 1024 -- 100 KB
                local ok, stats = pcall(vim.uv.fs_stat, vim.api.nvim_buf_get_name(args.buf))
                if ok and stats and stats.size > max_filesize then
                    return
                end
                -- start() errors when no parser for this filetype -> pcall
                if pcall(vim.treesitter.start, args.buf) then
                    vim.bo[args.buf].indentexpr = "v:lua.require'nvim-treesitter'.indentexpr()"
                end
            end,
        })
    end,
}
