import type { ActionFunction, LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import { createEmptySchedule } from '~/control-plane/create-empty-schedule'

export const loader: LoaderFunction = async ({ context }) => {
    const schedules = await context.dataStore.getAllSchedules()
    return json({ schedules })
}

export const action: ActionFunction = async ({ context }) => {
    const newSchedule = createEmptySchedule(context.dataStore)
    return json(newSchedule)
}

export default function Schedules() {
    const { schedules } = useLoaderData<typeof loader>()

    return (
        <div>
            <p>All schedules</p>
            {schedules.map((schedule: any) => (
                <p key={schedule.id}>{schedule.name || '<Untitled>'}</p>
            ))}
            <Form method="post">
                <button type="submit">Create new schedule</button>
            </Form>
        </div>
    )
}
