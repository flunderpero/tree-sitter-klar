# Tree-sitter Grammar For Klar

## Configure NeoVim

Update your NeoVim configuration with this:

    local parser_config = require("nvim-treesitter.parsers").get_parser_configs()
    parser_config.klar = {
        install_info = {
            url = "<path to this directory>",
            files = { "src/parser.c" },
        },
        filetype = "kl",
    }
    -- Make sure `nvim-treesitter` finds the queries.
    vim.o.runtimepath = vim.o.runtimepath .. ",<path to this directory>"

    -- Add our filetype.
    vim.api.nvim_command("autocmd BufRead,BufNewFile *.kl set filetype=klar")

## Development

First, edit your local Tree-sitter config file. For MacOS you'll find it here:

    /Users/[name]/Library/Application Support/tree-sitter/config.json

There update `parser-directories` to include the path to this directory.

Of course you'll have to download half the Internet via `npm i`, of course.

Build and test:

    ./node_modules/.bin/tree-sitter generate && ./node_modules/.bin/tree-sitter test

Update grammar in NeoVim:

    :TSUpdate
