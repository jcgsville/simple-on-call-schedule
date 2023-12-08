import type { LoaderFunction} from '@remix-run/node';
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import invariant from 'tiny-invariant'
import { getScheduleById } from '~/data/get-schedule-by-id'

export const loader: LoaderFunction = async ({ params }) => {
    invariant(params.scheduleId, 'Missing scheduleId param')
    const schedule = await getScheduleById(params.scheduleId)
    return json({ schedule })
}

export default function Schedule() {
    const { schedule }: any = useLoaderData<typeof loader>()
    return (
        <div>
            <p>Hello, schedule, {schedule.name}</p>
        </div>
    )
}
