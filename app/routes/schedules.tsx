import type { ActionFunction, LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import type { FunctionComponent } from 'react'
import styled from 'styled-components'
import { createEmptySchedule } from '~/control-plane/create-empty-schedule'
import type { Schedule } from '~/models/Schedule'

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
                <ScheduleListItem schedule={schedule} key={schedule.id} />
            ))}
            <Form method="post">
                <button type="submit">Create new schedule</button>
            </Form>
        </div>
    )
}

const StyledP = styled.p({ color: 'blue' })

const ScheduleListItem: FunctionComponent<{ schedule: Schedule }> = ({
    schedule,
}) => {
    return (
        <div>
            <StyledP>Redd: {schedule.name || '<Untitled>'}</StyledP>
        </div>
    )
}
