import { json, type LoaderFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import invariant from 'tiny-invariant'

export const loader: LoaderFunction = async ({ params, context }) => {
    invariant(params.scheduleId, 'Missing scheduleId param')
    const schedule = await context.dataStore.getScheduleById(params.scheduleId)
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
