import type { Schedule } from '~/models/Schedule'

export type DataStorePlugin = {
    initialize: () => Promise<DataStorePlugin>
    getAllSchedules: () => Promise<Schedule[]>
    getScheduleById: (id: string) => Promise<Schedule | null>
    createSchedule: (schedule: Schedule) => Promise<Schedule>
}
