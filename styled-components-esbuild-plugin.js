const babel = require('@babel/core')
const babelPluginStyledComponents = require('babel-plugin-styled-components')
const fs = require('node:fs')
const path = require('path')
const { applyHMR } = require('@remix-run/dev/dist/compiler/js/plugins/hmr.js')

// This esbuild plugin prevents the hydration errors from using styled components. It was adaptoed
// from the following article and then pretty dramatically changed to support HMR.
// https://mortenbarklund.com/blog/styled-components-remix/. Thanks, Morten!

function styledComponentsPlugin(appDirectory) {
    return {
        name: 'styled-components',
        setup(build) {
            const root = process.cwd()
            const cache = new Map()
            // This has to be in here before the primary builder below because it needs to run
            // first. By running first, it establishes remix:hmr as being in its own namespace so
            // that it can be run using the onBuild in the remix-owned plugin. Not the onBuild below
            build.onResolve(
                {
                    filter: /^remix:hmr$/,
                },
                (args) => {
                    return {
                        namespace: 'hmr-runtime',
                        path: args.path,
                    }
                },
            )
            build.onLoad(
                {
                    filter: /.*/,
                    namespace: 'file',
                },
                async (args) => {
                    if (!codeNeedsToBeTransformed(args.path, appDirectory)) {
                        return undefined
                    }
                    let sourceCode = await fs.promises.readFile(
                        args.path,
                        'utf8',
                    )
                    let value = cache.get(args.path)
                    if (!value || value.sourceCode !== sourceCode) {
                        // First, we apply the HMR transformation because the onBuild that does
                        // this in the remix compiler won't be run.
                        let resultCode = await applyHMR(
                            sourceCode,
                            args,
                            {
                                rootDirectory: root,
                            },
                            !!build.initialOptions.sourcemap,
                            args.path.startsWith(appDirectory)
                                ? fs.statSync(args.path).mtimeMs
                                : undefined,
                        )
                        value = {
                            sourceCode,
                            output: {
                                // Then, we use babel to transform the code to improve support for
                                // styled components.
                                contents: await transformTsWithStyledComponents(
                                    root,
                                    args.path,
                                    resultCode,
                                ),
                                loader: args.path.endsWith('.ts')
                                    ? 'ts'
                                    : 'tsx',
                                resolveDir: path.dirname(args.path),
                            },
                        }
                        cache.set(args.path, value)
                    }
                    return value.output
                },
            )
        },
    }
}

const codeNeedsToBeTransformed = (path, appDirectory) => {
    return (
        path.match(/@remix-run[/\\]react[/\\]dist[/\\]esm[/\\]browser.js$/) ||
        path.match(/react-router[-dom]?[/\\]$/) ||
        (path.match(/\.[tj]sx?$/) &&
            fs.existsSync(path) &&
            path.startsWith(appDirectory))
    )
}

const transformTsWithStyledComponents = async (
    cwd,
    path,
    untransformedSourceCode,
) => {
    let babelParserPlugins = [
        'importMeta',
        'topLevelAwait',
        'classProperties',
        'classPrivateProperties',
        'classPrivateMethods',
        'jsx',
    ]
    if (path.endsWith('.tsx') || path.endsWith('.ts')) {
        babelParserPlugins.push('typescript')
    }
    const result = await babel.transformAsync(untransformedSourceCode, {
        babelrc: false,
        configFile: false,
        ast: false,
        root: cwd,
        filename: path,
        parserOpts: {
            sourceType: 'module',
            allowAwaitOutsideFunction: true,
            plugins: babelParserPlugins,
        },
        generatorOpts: {
            decoratorsBeforeExport: true,
        },
        plugins: [babelPluginStyledComponents],
        sourceMaps: true,
        inputSourceMap: false,
    })
    return result.code
}

module.exports = styledComponentsPlugin
