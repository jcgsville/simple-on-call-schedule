# Notes on dependencies

- Typescript pinned below 5.2.0 due to lack of eslint support as of 2023-12-07
- Nodemon is configured with `node --loader ts-node/esm` instead of `ts-node`
    because it fails with Node 20. See
    [this reddit post](https://www.reddit.com/r/typescript/comments/15sk2mt/tsnode_esm_typeerror_err_unknown_file_extension/).

        // "dev": "remix dev --manual -c \"nodemon server.ts\"",

# Notes on VS Code workspace configuration

- Using beta prettier-eslint VS Code extension linked
    [here](https://github.com/idahogurl/vs-code-prettier-eslint/issues/171#issuecomment-1836665599)
