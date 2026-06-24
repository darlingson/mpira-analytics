import { sql } from 'drizzle-orm'

export default defineEventHandler(async () => {
  try {
    const matches = await db.execute(sql`
      SELECT id, home_team_id, away_team_id, score_home, score_away
      FROM matches
      WHERE score_home IS NOT NULL AND score_away IS NOT NULL
    `)
    const allMatches = matches.rows as any[]
    if (allMatches.length === 0) return []

    const matchIds = allMatches.map(m => m.id)

    const goalsResult = await db.execute(sql`
      SELECT me.match_id, me.minute,
        CASE WHEN pth.team_id = m.home_team_id THEN m.home_team_id
             WHEN pth.team_id = m.away_team_id THEN m.away_team_id
             ELSE NULL END AS scorer_team_id
      FROM match_events me
      JOIN matches m ON me.match_id = m.id
      LEFT JOIN player_team_history pth ON pth.player_id = me.player_id
        AND pth.team_id IN (m.home_team_id, m.away_team_id)
      WHERE me.event_type = 'goal'
        AND me.match_id = ANY(ARRAY[${sql.join(matchIds, sql`, `)}]::int[])
      ORDER BY me.match_id, me.minute
    `)
    const allGoals = goalsResult.rows as any[]

    const goalsByMatch = new Map<number, any[]>()
    for (const g of allGoals) {
      if (!goalsByMatch.has(g.match_id)) goalsByMatch.set(g.match_id, [])
      goalsByMatch.get(g.match_id)!.push(g)
    }

    const teamNames = await db.query.teams.findMany({
      columns: { id: true, name: true },
    })
    const teamNameMap = new Map(teamNames.map(t => [t.id, t.name]))

    const teamStats = new Map<number, { earlyGoals: number; wins: number; label: string }>()

    for (const match of allMatches) {
      const homeId = match.home_team_id
      const awayId = match.away_team_id
      const homeScore = match.score_home ?? 0
      const awayScore = match.score_away ?? 0

      for (const teamId of [homeId, awayId]) {
        if (!teamStats.has(teamId)) {
          teamStats.set(teamId, { earlyGoals: 0, wins: 0, label: teamNameMap.get(teamId) ?? 'Unknown' })
        }
      }

      const goals = goalsByMatch.get(match.id) ?? []
      const earlyTeams = new Set<number>()

      for (const goal of goals) {
        if (goal.minute <= 5 && goal.scorer_team_id) {
          earlyTeams.add(goal.scorer_team_id)
        }
      }

      if (earlyTeams.size === 0) continue

      const isHome = homeScore > awayScore
      const winnerId = homeScore === awayScore ? null : (isHome ? homeId : awayId)

      for (const teamId of earlyTeams) {
        const s = teamStats.get(teamId)!
        s.earlyGoals++
        if (winnerId === teamId) s.wins++
      }
    }

    return Array.from(teamStats.values())
      .filter(s => s.earlyGoals > 0)
      .map(s => ({
        team: s.label,
        early_goals: s.earlyGoals,
        wins: s.wins,
        win_rate: s.earlyGoals > 0 ? +((s.wins / s.earlyGoals * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.win_rate - a.win_rate)
  } catch (error) {
    console.error('Failed to fetch win-rate-inside-five:', error)
    throw createError({ statusCode: 500, message: 'Failed to fetch insights' })
  }
})
