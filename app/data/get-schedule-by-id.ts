import type { Schedule } from '~/models/Schedule'
import { getScheduleByIdFromRepo } from './schedule-repo'

export const getScheduleById = async (id: string): Promise<Schedule | null> =>
    getScheduleByIdFromRepo(id)
