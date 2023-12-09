import { v4 } from 'uuid'
import type { DataStoreInterface } from '~/data-stores/data-store-interface'
import type { Schedule } from '~/models/Schedule'

export const createEmptySchedule = async (
    store: DataStoreInterface,
): Promise<Schedule> => {
    const schedule: Schedule = {
        id: v4(),
        name: null,
        description: null,
    }
    return store.createSchedule(schedule)
}
