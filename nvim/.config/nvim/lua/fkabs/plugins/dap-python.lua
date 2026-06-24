return {
    'mfussenegger/nvim-dap-python',
    dependencies = { 'mfussenegger/nvim-dap' },
    ft = 'python',
    config = function()
        require('dap-python').setup(vim.fn.expand('~/.local/share/uv/tools/debugpy/bin/python'))
    end,
}
