/// <reference types="@remix-run/dev" />
import type { AppLoadContext as OriginalAppLoadContext } from '@remix-run/node'
import type { DataStorePlugin } from '~/plugins/data-store/data-store-plugin'

declare module '@remix-run/node' {
    export interface AppLoadContext extends OriginalAppLoadContext {
        dataStore: DataStorePlugin
        logger: LoggerPlugin
    }
}
