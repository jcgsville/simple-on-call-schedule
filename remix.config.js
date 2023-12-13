const { withEsbuildOverride } = require('remix-esbuild-override')
const styledComponentsPlugin = require('./styled-components-esbuild-plugin')

withEsbuildOverride((option) => {
    option.plugins.unshift(styledComponentsPlugin())

    return option
})

/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
    ignoredRouteFiles: ['**/.*'],
    serverModuleFormat: 'cjs',
}
