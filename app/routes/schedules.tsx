import type { LoaderFunction} from '@remix-run/node';
import { json } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import { createEmptySchedule } from '~/control-plane/create-empty-schedule'

export const loader: LoaderFunction = async ({ context }) => {
    const schedules = await getAllSchedules()
    console.log('bs', schedules)
    return json({ schedules })
}

export const action = async () => {
    const newSchedule = await createEmptySchedule()
    return json(newSchedule)
}

export default function Schedules() {
    const { schedules } = useLoaderData<typeof loader>()

    return (
        <div>
            <p>Hello, schedules</p>
            {schedules.map((schedule) => (
                <p key={schedule.id}>{schedule.name || '<Untitled>'}</p>
            ))}
            <Form method="post">
                <button type="submit">Create new schedule</button>
            </Form>
        </div>
    )
}
