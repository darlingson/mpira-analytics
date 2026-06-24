import { sql } from 'drizzle-orm'

export default defineEventHandler(async () => {
  try {
    const eventCounts = await db.execute(sql`
      SELECT
        COUNT(*) FILTER (WHERE event_type = 'goal') AS total_goals,
        COUNT(*) FILTER (WHERE event_type = 'yellow_card' OR event_type = 'second_yellow_card') AS total_yellow_cards,
        COUNT(*) FILTER (WHERE event_type = 'red_card' OR event_type = 'second_yellow_card') AS total_red_cards,
        COUNT(*) AS total_events
      FROM match_events
    `)
    const counts = eventCounts.rows[0] as any

    const matchCount = await db.execute(sql`
      SELECT COUNT(*) AS total FROM matches WHERE score_home IS NOT NULL AND score_away IS NOT NULL
    `)
    const totalMatches = Number(matchCount.rows[0]?.total ?? 0)

    const disciplinePerTeam = await db.execute(sql`
      SELECT
        t.id AS team_id,
        t.name AS team_name,
        COUNT(*) FILTER (WHERE me.event_type = 'yellow_card' OR me.event_type = 'second_yellow_card') AS yellow_cards,
        COUNT(*) FILTER (WHERE me.event_type = 'red_card' OR me.event_type = 'second_yellow_card') AS red_cards
      FROM match_events me
      JOIN matches m ON me.match_id = m.id
      JOIN teams t ON t.id IN (m.home_team_id, m.away_team_id)
      LEFT JOIN player_team_history pth ON pth.player_id = me.player_id
        AND pth.team_id = t.id
      WHERE (me.event_type IN ('goal', 'yellow_card', 'red_card', 'second_yellow_card'))
        AND pth.team_id IS NOT NULL
      GROUP BY t.id, t.name
      ORDER BY t.name
    `)
    const discipline = (disciplinePerTeam.rows as any[]).map(d => ({
      team: d.team_name,
      yellow_cards: Number(d.yellow_cards),
      red_cards: Number(d.red_cards),
    }))

    const avgPerMatch = totalMatches > 0
      ? +(Number(counts.total_events) / totalMatches).toFixed(2)
      : 0

    return {
      event_counts: {
        goals: Number(counts.total_goals),
        yellow_cards: Number(counts.total_yellow_cards),
        red_cards: Number(counts.total_red_cards),
      },
      total_matches: totalMatches,
      average_events_per_match: avgPerMatch,
      discipline_per_team: discipline,
    }
  } catch (error) {
    console.error('Failed to fetch event stats:', error)
    throw createError({ statusCode: 500, message: 'Failed to fetch event stats' })
  }
})
