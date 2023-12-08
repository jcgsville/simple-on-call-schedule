import { v4 } from 'uuid'
import type { Schedule } from '~/models/Schedule'
import { addScheduleToRepo } from './schedule-repo'

export const createEmptySchedule = async (): Promise<Schedule> => {
    const schedule: Schedule = {
        id: v4(),
        name: null,
        description: null,
    }
    addScheduleToRepo(schedule)
    return schedule
}
