import { v4 } from 'uuid'
import type { DataStorePlugin } from '~/plugins/data-store/data-store-plugin'
import type { Schedule } from '~/models/Schedule'

export const createEmptySchedule = async (
    store: DataStorePlugin,
): Promise<Schedule> => {
    const schedule: Schedule = {
        id: v4(),
        name: null,
        description: null,
    }
    return store.createSchedule(schedule)
}
