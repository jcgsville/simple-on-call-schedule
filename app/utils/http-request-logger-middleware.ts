import onHeaders from 'on-headers'
import onFinished from 'on-finished'
import type { Handler } from 'express'

import type { LoggerPlugin } from '~/plugins/logger/logger-plugin'

/**
 * Generate Express middleware that logs HTTP requests.
 *
 * This was adapted from Morgan: https://github.com/expressjs/morgan
 * Morgan did not support logging structured log requests without stringifying the JSON in the
 * format function and pulling metadata back out.
 */
export const generateHttpRequestLoggerMiddleware =
    (logger: LoggerPlugin): Handler =>
    (request, response, next) => {
        const requestStartAt = process.hrtime()
        let responseStartAt: [number, number] | undefined = undefined

        // When Express starts to write the response headers, we record the "end time"
        onHeaders(response, () => {
            responseStartAt = process.hrtime()
        })

        onFinished(response, () => {
            logger.http({
                method: request.method,
                url: request.originalUrl || request.url,
                status: response.statusCode,
                responseTimeMs: calculateResponseTime(
                    responseStartAt,
                    requestStartAt,
                ),
            })
        })

        next()
    }

const calculateResponseTime = (
    responseStartAt: [number, number] | undefined,
    requestStartAt: [number, number],
): number | undefined => {
    if (!responseStartAt) {
        // missing response start time, just set it to undefined
        return
    }

    // calculate diff
    var responseTimeInMilliseconds =
        (responseStartAt[0] - requestStartAt[0]) * 1e3 +
        (responseStartAt[1] - requestStartAt[1]) * 1e-6

    // return rounded value
    return Math.round(responseTimeInMilliseconds)
}
