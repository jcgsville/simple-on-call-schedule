import type { DataStorePlugin } from '~/plugins/data-store/data-store-plugin'
import type { Schedule } from '~/models/Schedule'

let schedules: Schedule[] = []

export const InMemoryDataStore: DataStorePlugin = {
    initialize: async (): Promise<DataStorePlugin> => InMemoryDataStore,
    getAllSchedules: async () => {
        return schedules
    },
    getScheduleById: async (id: string) => {
        return schedules.find((schedule) => schedule.id === id) || null
    },
    createSchedule: async (schedule: Schedule): Promise<Schedule> => {
        schedules.push(schedule)
        return schedule
    },
}
