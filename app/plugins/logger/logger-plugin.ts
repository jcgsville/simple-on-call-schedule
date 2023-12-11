export type LogFunction = (
    message: string,
    additionalLabels?: { [key: string]: any },
) => void

export type HttpLogInformation = {
    method: string
    url: string
    status: number
    responseTimeMs: number | undefined
}

export type HttpLogFunction = (httpLogInformation: HttpLogInformation) => void

export type LoggerPlugin = {
    http: HttpLogFunction
    debug: LogFunction
    info: LogFunction
    warn: LogFunction
    error: LogFunction
}
