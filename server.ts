import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

import type { Express } from 'express'
import express from 'express'
import { createRequestHandler } from '@remix-run/express'
import { broadcastDevReady, installGlobals } from '@remix-run/node'
import compression from 'compression'
import sourceMapSupport from 'source-map-support'
import helmet from 'helmet'
import chokidar from 'chokidar'

import { InMemoryDataStore } from '~/plugins/data-store/in-memory/in-memory-data-store'
import { createDefaultLogger } from '~/plugins/logger/create-default-logger'
import { generateHttpRequestLoggerMiddleware } from '~/utils/http-request-logger-middleware'
import type { DataStorePlugin } from '~/plugins/data-store/data-store-plugin'
import type { LoggerPlugin } from '~/plugins/logger/logger-plugin'

sourceMapSupport.install()
installGlobals()

const run = async () => {
    const dataStore = await InMemoryDataStore.initialize()
    const logger = createDefaultLogger()

    let app = express()

    // Compress response bodies. Most http clients, including browsers, will auto-decompress
    // responses.
    app.use(compression())

    app.use(generateHttpRequestLoggerMiddleware(logger))

    addSecurityMiddleware(app)

    const initialBuild = await importServer()
    await addRemixAppMiddleware(app, dataStore, logger, initialBuild)

    const port = process.env.PORT || 3000
    app.listen(port, async () => {
        logger.info('Express server listening', { port })

        if (process.env.NODE_ENV === 'development') {
            broadcastDevReady(initialBuild)
        }
    })
}

run()

// Following best practices recommended by Express:
// http://expressjs.com/en/advanced/best-practice-security.html
const addSecurityMiddleware = (app: Express): void => {
    app.disable('x-powered-by')
    app.use(helmet())
}

// Add all the Remix-specific middleware to the Express app.
const addRemixAppMiddleware = async (
    app: Express,
    dataStore: DataStorePlugin,
    logger: LoggerPlugin,
    initialBuild: any,
): Promise<void> => {
    // The context generated in this function is passed into remix loaders and actions
    const getLoadContext = () => ({
        dataStore,
        logger,
    })

    // Remix fingerprints its assets so we can cache forever.
    app.use(
        '/build',
        express.static('public/build', { immutable: true, maxAge: '1y' }),
    )
    // Everything else (like favicon.ico) is cached for an hour. We may want to be
    // more aggressive with this caching in the future
    app.use(express.static('public', { maxAge: '1h' }))

    // We use a separate wrapped remix handler for development to make sure it is recreated with
    // the latest build for every request. See the following Remix docs for more details about
    // manual mode: https://remix.run/docs/en/main/guides/manual-mode
    const createDevRequestHandler = async (initialBuild: any) => {
        let build = initialBuild

        // Update the dev server whenever the code changes
        const handleServerUpdate = async (): Promise<void> => {
            // 1. Re-import the built server code
            build = await importServer()
            // 2. Tell Remix that this app server is now up-to-date and ready.
            broadcastDevReady(build)
        }
        chokidar
            // Watch the version file for changes. The version file is updated with the hash of the
            // code.
            .watch(VERSION_PATH, { ignoreInitial: true })
            .on('add', handleServerUpdate)
            .on('change', handleServerUpdate)

        return async (req: any, res: any, next: any) => {
            try {
                return createRequestHandler({
                    build,
                    mode: 'development',
                    getLoadContext,
                })(req, res, next)
            } catch (error) {
                next(error)
            }
        }
    }

    const remixHandler =
        process.env.NODE_ENV === 'development'
            ? await createDevRequestHandler(initialBuild)
            : createRequestHandler({
                  build: initialBuild,
                  mode: initialBuild.mode,
                  getLoadContext,
              })

    app.all('*', remixHandler)
}

const BUILD_PATH = path.resolve('build/index.js')
const VERSION_PATH = path.resolve('build/version.txt')

/**
 * Import the server build for use by Remix.
 */
const importServer = () => {
    // Manually remove the server build from the require cache. This is necessary when using
    // commonjs, and reimporting the server build when the code changes in the dev server.
    Object.keys(require.cache).forEach((key) => {
        if (key.startsWith(BUILD_PATH)) {
            delete require.cache[key]
        }
    })

    const stat = fs.statSync(BUILD_PATH)

    // convert build path to URL for Windows compatibility with dynamic `import`
    const BUILD_URL = url.pathToFileURL(BUILD_PATH).href

    // use a timestamp query parameter to bust the import cache
    return import(BUILD_URL + '?t=' + stat.mtimeMs)
}
