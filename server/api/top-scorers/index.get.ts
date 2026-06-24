import { sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const season = query.season ? String(query.season) : null

    let seasonFilter = sql``
    if (season) {
      seasonFilter = sql`AND c.season = ${season}`
    }

    const result = await db.execute(sql`
      SELECT
        p.id AS player_id,
        p.name AS player_name,
        t.name AS team_name,
        COUNT(*) AS goals
      FROM match_events me
      JOIN matches m ON me.match_id = m.id
      JOIN competitions c ON m.competition_id = c.id
      JOIN players p ON me.player_id = p.id
      JOIN teams t ON t.id IN (m.home_team_id, m.away_team_id)
      LEFT JOIN player_team_history pth ON pth.player_id = me.player_id
        AND pth.team_id = t.id
      WHERE me.event_type = 'goal'
        AND pth.team_id IS NOT NULL
        ${seasonFilter}
      GROUP BY p.id, p.name, t.name
      ORDER BY goals DESC, p.name ASC
    `)

    return (result.rows as any[]).map(r => ({
      player: r.player_name,
      team: r.team_name,
      goals: Number(r.goals),
    }))
  } catch (error) {
    console.error('Failed to fetch top scorers:', error)
    throw createError({ statusCode: 500, message: 'Failed to fetch top scorers' })
  }
})
