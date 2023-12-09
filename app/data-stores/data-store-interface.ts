import type { Schedule } from '~/models/Schedule'

export type DataStoreInterface = {
    initialize: () => Promise<DataStoreInterface>
    getAllSchedules: () => Promise<Schedule[]>
    getScheduleById: (id: string) => Promise<Schedule | null>
    createSchedule: (schedule: Schedule) => Promise<Schedule>
}
