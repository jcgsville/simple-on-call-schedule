const { withEsbuildOverride } = require('remix-esbuild-override')
const styledComponentsPlugin = require('./styled-components-esbuild-plugin')

const APP_DIRECTORY = 'app'

withEsbuildOverride((option) => {
    // This condition ensures that the plugin is added only for the run of esbuild for the client
    // js, not for the CSS bundling or the server build.
    if (option.entryPoints?.['entry.client']) {
        option.plugins.unshift(styledComponentsPlugin(APP_DIRECTORY))
    }

    return option
})

/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
    ignoredRouteFiles: ['**/.*'],
    serverModuleFormat: 'cjs',
    appDirectory: APP_DIRECTORY,
}
