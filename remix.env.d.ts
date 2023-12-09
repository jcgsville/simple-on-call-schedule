/// <reference types="@remix-run/dev" />
import type { AppLoadContext as OriginalAppLoadContext } from '@remix-run/node'
import type { DataStoreInterface } from '~/data-stores/data-store-interface'

declare module '@remix-run/node' {
    export interface AppLoadContext extends OriginalAppLoadContext {
        dataStore: DataStoreInterface
    }
}
