import type { DataStoreInterface } from '~/data-stores/data-store-interface'
import type { Schedule } from '~/models/Schedule'

let schedules: Schedule[] = []

export const InMemoryDataStore: DataStoreInterface = {
    initialize: async (): Promise<DataStoreInterface> => InMemoryDataStore,
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
