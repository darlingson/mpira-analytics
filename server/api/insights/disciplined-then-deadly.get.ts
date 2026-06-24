import { sql } from 'drizzle-orm'

export default defineEventHandler(async () => {
  try {
    const matches = await db.execute(sql`
      SELECT id, home_team_id, away_team_id, score_home, score_away, date
      FROM matches
      WHERE score_home IS NOT NULL AND score_away IS NOT NULL
    `)
    const allMatches = matches.rows as any[]
    if (allMatches.length === 0) return []

    const matchIds = allMatches.map(m => m.id)

    const eventsResult = await db.execute(sql`
      SELECT me.match_id, me.minute, me.event_type, me.player_id, p.name AS player_name,
        m.home_team_id, m.away_team_id, m.score_home, m.score_away, m.date,
        CASE WHEN pth.team_id = m.home_team_id THEN m.home_team_id
             WHEN pth.team_id = m.away_team_id THEN m.away_team_id
             ELSE NULL END AS team_id
      FROM match_events me
      JOIN matches m ON me.match_id = m.id
      JOIN players p ON me.player_id = p.id
      LEFT JOIN player_team_history pth ON pth.player_id = me.player_id
        AND pth.team_id IN (m.home_team_id, m.away_team_id)
      WHERE (me.event_type IN ('yellow_card', 'red_card', 'second_yellow_card') OR me.event_type = 'goal')
        AND me.match_id = ANY(ARRAY[${sql.join(matchIds, sql`, `)}]::int[])
      ORDER BY me.match_id, me.minute
    `)
    const allEvents = eventsResult.rows as any[]

    const teamNames = await db.query.teams.findMany({
      columns: { id: true, name: true },
    })
    const teamNameMap = new Map(teamNames.map(t => [t.id, t.name]))

    const eventsByMatchAndTeam = new Map<string, { cards: any[]; goals: any[] }>()

    for (const ev of allEvents) {
      if (!ev.team_id) continue
      const key = `${ev.match_id}-${ev.team_id}`
      if (!eventsByMatchAndTeam.has(key)) {
        eventsByMatchAndTeam.set(key, { cards: [], goals: [] })
      }
      const bucket = eventsByMatchAndTeam.get(key)!
      if (ev.event_type === 'goal') {
        bucket.goals.push(ev)
      } else {
        bucket.cards.push(ev)
      }
    }

    const result: any[] = []

    for (const [key, bucket] of eventsByMatchAndTeam) {
      const hasFirstHalfCard = bucket.cards.some(c => c.minute <= 45)
      const hasSecondHalfGoal = bucket.goals.some(g => g.minute >= 46)

      if (!hasFirstHalfCard || !hasSecondHalfGoal) continue

      const [matchIdStr, teamIdStr] = key.split('-')
      const match = allMatches.find((m: any) => m.id === parseInt(matchIdStr))
      if (!match) continue

      const teamId = parseInt(teamIdStr)
      const homeScore = match.score_home ?? 0
      const awayScore = match.score_away ?? 0
      const oppId = teamId === match.home_team_id ? match.away_team_id : match.home_team_id
      const teamScore = teamId === match.home_team_id ? homeScore : awayScore
      const oppScore = teamId === match.home_team_id ? awayScore : homeScore

      result.push({
        team: teamNameMap.get(teamId) ?? 'Unknown',
        opponent: teamNameMap.get(oppId) ?? 'Unknown',
        match_date: match.date,
        final_score: `${homeScore} - ${awayScore}`,
        won: teamScore > oppScore,
        drawn: teamScore === oppScore,
        card_events: bucket.cards.map((c: any) => ({
          minute: c.minute,
          player: c.player_name,
          type: c.event_type,
        })),
        goal_events: bucket.goals.map((g: any) => ({
          minute: g.minute,
          player: g.player_name,
        })),
      })
    }

    return result.sort((a: any, b: any) => a.team.localeCompare(b.team))
  } catch (error) {
    console.error('Failed to fetch disciplined-then-deadly:', error)
    throw createError({ statusCode: 500, message: 'Failed to fetch insights' })
  }
})
