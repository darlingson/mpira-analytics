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

    const goalsResult = await db.execute(sql`
      SELECT me.match_id, me.minute, me.player_id, p.name AS player_name,
        m.home_team_id, m.away_team_id, m.score_home, m.score_away, m.date,
        CASE WHEN pth.team_id = m.home_team_id THEN m.home_team_id
             WHEN pth.team_id = m.away_team_id THEN m.away_team_id
             ELSE NULL END AS scorer_team_id
      FROM match_events me
      JOIN matches m ON me.match_id = m.id
      JOIN players p ON me.player_id = p.id
      LEFT JOIN player_team_history pth ON pth.player_id = me.player_id
        AND pth.team_id IN (m.home_team_id, m.away_team_id)
      WHERE me.event_type = 'goal'
        AND me.match_id = ANY(ARRAY[${sql.join(matchIds, sql`, `)}]::int[])
      ORDER BY me.match_id, me.minute
    `)
    const allGoals = goalsResult.rows as any[]

    const teamNames = await db.query.teams.findMany({
      columns: { id: true, name: true },
    })
    const teamNameMap = new Map(teamNames.map(t => [t.id, t.name]))

    const teamFastest = new Map<number, {
      minute: number
      player: string
      opponent: string
      date: string
      won: boolean
      label: string
    }>()

    for (const match of allMatches) {
      const homeId = match.home_team_id
      const awayId = match.away_team_id
      const homeScore = match.score_home ?? 0
      const awayScore = match.score_away ?? 0

      for (const teamId of [homeId, awayId]) {
        if (!teamFastest.has(teamId)) {
          teamFastest.set(teamId, {
            minute: 999,
            player: '',
            opponent: '',
            date: '',
            won: false,
            label: teamNameMap.get(teamId) ?? 'Unknown',
          })
        }
      }
    }

    for (const goal of allGoals) {
      const teamId = goal.scorer_team_id
      if (!teamId) continue

      const current = teamFastest.get(teamId)!
      if (goal.minute >= current.minute) continue

      const match = allMatches.find((m: any) => m.id === goal.match_id)
      if (!match) continue

      const homeScore = match.score_home ?? 0
      const awayScore = match.score_away ?? 0
      const oppId = teamId === match.home_team_id ? match.away_team_id : match.home_team_id
      const teamScore = teamId === match.home_team_id ? homeScore : awayScore
      const oppScore = teamId === match.home_team_id ? awayScore : homeScore

      current.minute = goal.minute
      current.player = goal.player_name
      current.opponent = teamNameMap.get(oppId) ?? 'Unknown'
      current.date = match.date
      current.won = teamScore > oppScore
    }

    return Array.from(teamFastest.values())
      .filter(t => t.minute < 999)
      .map(t => ({
        team: t.label,
        fastest_goal: t.minute,
        player: t.player,
        opponent: t.opponent,
        date: t.date,
        won: t.won,
      }))
      .sort((a, b) => a.fastest_goal - b.fastest_goal)
  } catch (error) {
    console.error('Failed to fetch fastest-goal-and-result:', error)
    throw createError({ statusCode: 500, message: 'Failed to fetch insights' })
  }
})
