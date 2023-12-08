import type { Schedule } from '~/models/Schedule'
import { getAllSchedulesFromRepo } from './schedule-repo'

export const getAllSchedules = async (): Promise<Schedule[]> =>
    getAllSchedulesFromRepo()
