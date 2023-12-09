import type { Schedule } from '~/models/Schedule'

export type DataStoreInterface = {
    initialize: () => Promise<void>
    getAllSchedules: () => Promise<Schedule[]>
    getScheduleById: (id: string) => Promise<Schedule | null>
    createSchedule: (schedule: Schedule) => Promise<Schedule>
}
