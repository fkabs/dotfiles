return {
    "lukas-reineke/indent-blankline.nvim",
    main = "ibl",
    ---@module "ibl"
    ---@type ibl.config
    opts = {
        -- fill any relevant options here
        indent = {
            char = "▏",
            -- char = "│",
            -- char = "┊",
            -- char = "┆",
            -- char = "┊",
            highlight = "LineNr",
        },
        scope = {
            enabled = true,
            show_start = false,
            show_end = false,
        },
        exclude = {
            filetypes = { "help", "alpha", "lazy" },
            buftypes = { "terminal" },
        },
    },
    config = function(_, opts)
        require("ibl").setup(opts)
    end,
}