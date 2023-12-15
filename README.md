# Notes on dependencies

- Typescript pinned below 5.2.0 due to lack of eslint support as of 2023-12-07
- Styled components pinned to 6.0.9 because of requirements of babel-plugin-styled-components, to
    avoid simultaneous use of two versions. Also... the styled-components journey was an
    interesting one. See the madness of
    [styled-components-esbuild-plugin.js](styled-components-esbuild-plugin.js)

# Notes on VS Code workspace configuration

- Using beta prettier-eslint VS Code extension linked
    [here](https://github.com/idahogurl/vs-code-prettier-eslint/issues/171#issuecomment-1836665599)
