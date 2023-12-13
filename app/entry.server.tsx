/**
 * By default, Remix will handle generating the HTTP Response for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.server
 */
import { Transform } from 'node:stream'

import type { AppLoadContext, EntryContext } from '@remix-run/node'
import { createReadableStreamFromReadable } from '@remix-run/node'
import { RemixServer } from '@remix-run/react'
import isbot from 'isbot'
import { renderToPipeableStream } from 'react-dom/server'
import { ServerStyleSheet } from 'styled-components'

import { STYLES_PLACEHOLDER } from '~/constants/styles-placeholder'

const ABORT_DELAY = 5_000

export default function handleRequest(
    request: Request,
    responseStatusCode: number,
    responseHeaders: Headers,
    remixContext: EntryContext,
    _loadContext: AppLoadContext,
) {
    return isbot(request.headers.get('user-agent'))
        ? handleRequestByType(
              'bot',
              request,
              responseStatusCode,
              responseHeaders,
              remixContext,
          )
        : handleRequestByType(
              'browser',
              request,
              responseStatusCode,
              responseHeaders,
              remixContext,
          )
}

const handleRequestByType = (
    requestType: 'browser' | 'bot',
    request: Request,
    responseStatusCode: number,
    responseHeaders: Headers,
    remixContext: EntryContext,
): Promise<unknown> => {
    return new Promise((resolve, reject) => {
        let shellRendered = false
        const sheet = new ServerStyleSheet()
        const { pipe, abort } = renderToPipeableStream(
            sheet.collectStyles(
                <RemixServer
                    context={remixContext}
                    url={request.url}
                    abortDelay={ABORT_DELAY}
                />,
            ),
            {
                [requestType === 'browser' ? 'onShellReady' : 'onAllReady']() {
                    shellRendered = true
                    const body = new StylesStreamTransform(sheet.getStyleTags())
                    const stream = createReadableStreamFromReadable(body)

                    responseHeaders.set('Content-Type', 'text/html')

                    resolve(
                        new Response(stream, {
                            headers: responseHeaders,
                            status: responseStatusCode,
                        }),
                    )

                    pipe(body)
                },
                onShellError(error: unknown) {
                    reject(error)
                },
                onError(error: unknown) {
                    responseStatusCode = 500
                    // Log streaming rendering errors from inside the shell.  Don't log
                    // errors encountered during initial shell rendering since they'll
                    // reject and get logged in handleDocumentRequest.
                    if (shellRendered) {
                        console.error(error)
                    }
                },
            },
        )

        setTimeout(abort, ABORT_DELAY)
    })
}

export class StylesStreamTransform extends Transform {
    private styles: string
    private previousChunk: string

    constructor(styles: string) {
        super()
        this.styles = styles
        this.previousChunk = ''
    }

    // TODO: Add unit tests for this once we get unit tests setup
    _transform(chunk: any, _encoding: any, callback: any) {
        const chunkString = chunk.toString()
        let didReplaceStyles = false

        // By using the `previousChunk` buffer, we hanlde the case where the styles placeholder is
        // split across two chunks
        const combinedWithPreviousChunk = this.previousChunk + chunkString
        const replaced = combinedWithPreviousChunk.replace(
            STYLES_PLACEHOLDER,
            () => {
                didReplaceStyles = true
                return this.styles
            },
        )

        if (didReplaceStyles) {
            this.push(replaced)
            this.previousChunk = ''
        } else {
            this.push(this.previousChunk)
            this.previousChunk = chunkString
        }

        callback()
    }

    _flush(callback: any) {
        this.push(this.previousChunk)
        callback()
    }
}
