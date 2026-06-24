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

    const teamStats = new Map<number, { count: number; label: string }>()

    for (const match of allMatches) {
      const homeId = match.home_team_id
      const awayId = match.away_team_id
      const homeScore = match.score_home ?? 0
      const awayScore = match.score_away ?? 0

      const goals = goalsByMatch.get(match.id) ?? []
      const firstGoal = goals[0]
      if (!firstGoal) {
        if (homeScore > 0 && awayScore === 0) {
          if (!teamStats.has(homeId)) teamStats.set(homeId, { count: 0, label: teamNameMap.get(homeId) ?? '' })
          teamStats.get(homeId)!.count++
        }
        if (awayScore > 0 && homeScore === 0) {
          if (!teamStats.has(awayId)) teamStats.set(awayId, { count: 0, label: teamNameMap.get(awayId) ?? '' })
          teamStats.get(awayId)!.count++
        }
        continue
      }

      const firstScorer = firstGoal.scorer_team_id
      if (!firstScorer) continue

      const isHome = firstScorer === homeId
      const teamScore = isHome ? homeScore : awayScore
      const oppScore = isHome ? awayScore : homeScore

      if (teamScore > 0 && oppScore === 0) {
        if (!teamStats.has(firstScorer)) teamStats.set(firstScorer, { count: 0, label: teamNameMap.get(firstScorer) ?? '' })
        teamStats.get(firstScorer)!.count++
      }
    }

    return Array.from(teamStats.values())
      .map(s => ({ team: s.label, clean_sheet_when_scoring_first: s.count }))
      .sort((a, b) => b.clean_sheet_when_scoring_first - a.clean_sheet_when_scoring_first)
  } catch (error) {
    console.error('Failed to fetch clean-sheet-when-scoring-first:', error)
    throw createError({ statusCode: 500, message: 'Failed to fetch insights' })
  }
})
