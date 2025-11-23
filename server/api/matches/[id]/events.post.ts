import { neon } from '@neondatabase/serverless'
import { readBody, getRouterParam } from 'h3'

interface EventInsertPayload {
    minute: string
    player?: string
    team: string
    type: string
    description?: string
    score_at_event?: string
    team_id: number
}

export default defineEventHandler(async (event) => {
    const { databaseUrl } = useRuntimeConfig()
    const db = neon(databaseUrl)

    const matchId = Number(getRouterParam(event, 'id'))
    const body = (await readBody(event)) as EventInsertPayload

    if (!matchId || !body.minute || !body.type || !body.team_id) {
        return createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'match id, minute, type and team_id are required',
        })
    }

    const inserted = await db`
    INSERT INTO events (match_id, minute, player, team, type, description, score_at_event, team_id)
    VALUES (${matchId}, ${body.minute}, ${body.player || ''}, ${body.team}, ${body.type}, ${body.description || ''}, ${body.score_at_event || ''}, ${body.team_id})
    RETURNING id, match_id, minute, player, team, type, description, score_at_event, team_id
  `
    const row = inserted?.[0] ?? null

    return { status: 'success', event: row }
})
