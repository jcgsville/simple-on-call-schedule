import chalk from 'chalk'
import type {
    HttpLogInformation,
    LogFunction,
    LoggerPlugin,
} from './logger-plugin'

type ApplicationLogLevel = Omit<keyof LoggerPlugin, 'http'>

/**
 * In production, the default logger plugin writes logs structured as JSON to stdout.
 * In development, it writes logs to stdout in a more readonable format.
 */
export const createDefaultLogger = (): LoggerPlugin => {
    const simpleLogFunction =
        (
            consoleFunctionName: 'log' | 'error',
            level: ApplicationLogLevel,
        ): LogFunction =>
        (message, additionalLabels) => {
            if (process.env.NODE_ENV === 'development') {
                console[consoleFunctionName](
                    `${coloredLogLevel(level)}: ${message}`,
                    additionalLabels,
                )
            } else {
                console[consoleFunctionName]({
                    level,
                    message,
                    ...additionalLabels,
                })
            }
        }

    const httpLogFunction = (httpLogInformation: HttpLogInformation): void => {
        if (process.env.NODE_ENV === 'development') {
            console.log(
                httpLogInformation.method,
                httpLogInformation.url,
                coloredStatusCode(httpLogInformation.status),
                `${httpLogInformation.responseTimeMs} ms`,
            )
        } else {
            console.log({
                level: 'http',
                ...httpLogInformation,
            })
        }
    }

    return {
        http: httpLogFunction,
        debug: simpleLogFunction('log', 'debug'),
        info: simpleLogFunction('log', 'info'),
        warn: simpleLogFunction('log', 'warn'),
        error: simpleLogFunction('log', 'error'),
    }
}

const coloredLogLevel = (level: ApplicationLogLevel): string => {
    const capitalizedLogLevel = level.toUpperCase()
    switch (level) {
        case 'debug':
            return chalk.gray(capitalizedLogLevel)
        case 'info':
            return chalk.blue(capitalizedLogLevel)
        case 'warn':
            return chalk.yellow(capitalizedLogLevel)
        case 'error':
            return chalk.red(capitalizedLogLevel)
        default:
            throw new Error(`Unknown log level: ${level}`)
    }
}

const coloredStatusCode = (statusCode: number): string => {
    if (statusCode >= 500) {
        return chalk.red(statusCode)
    } else if (statusCode >= 400) {
        return chalk.yellow(statusCode)
    } else if (statusCode >= 300) {
        return chalk.cyan(statusCode)
    } else if (statusCode >= 200) {
        return chalk.green(statusCode)
    } else {
        return chalk.white(statusCode)
    }
}
