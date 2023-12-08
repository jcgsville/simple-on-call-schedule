import type { Schedule } from '~/models/Schedule'

let schedules: Schedule[] = []

export async function getAllSchedulesFromRepo() {
    return schedules
}

export async function getScheduleByIdFromRepo(
    id: string,
): Promise<Schedule | null> {
    return schedules.find((schedule) => schedule.id === id) || null
}

export async function addScheduleToRepo(schedule: Schedule) {
    schedules.push(schedule)
}
