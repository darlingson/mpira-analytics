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
      SELECT me.match_id, me.minute, me.player_id, p.name AS player_name,
        m.home_team_id, m.away_team_id, m.score_home, m.score_away,
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

    const goalsByMatch = new Map<number, any[]>()
    for (const g of allGoals) {
      if (!goalsByMatch.has(g.match_id)) goalsByMatch.set(g.match_id, [])
      goalsByMatch.get(g.match_id)!.push(g)
    }

    const teamNames = await db.query.teams.findMany({
      columns: { id: true, name: true },
    })
    const teamNameMap = new Map(teamNames.map(t => [t.id, t.name]))

    const teamLateDrama = new Map<number, {
      label: string
      points_gained: number
      points_lost: number
      matches: any[]
    }>()

    function pointsFor(scoreTeam: number, scoreOpp: number): number {
      if (scoreTeam > scoreOpp) return 3
      if (scoreTeam === scoreOpp) return 1
      return 0
    }

    for (const match of allMatches) {
      const homeId = match.home_team_id
      const awayId = match.away_team_id
      const homeScore = match.score_home ?? 0
      const awayScore = match.score_away ?? 0

      const goals = goalsByMatch.get(match.id) ?? []

      for (const teamId of [homeId, awayId]) {
        if (!teamLateDrama.has(teamId)) {
          teamLateDrama.set(teamId, { label: teamNameMap.get(teamId) ?? 'Unknown', points_gained: 0, points_lost: 0, matches: [] })
        }
      }

      if (goals.length === 0) continue

      const lateGoals = goals.filter((g: any) => g.scorer_team_id && g.minute >= 75)

      if (lateGoals.length === 0) continue

      let hLate = 0
      let aLate = 0
      for (const g of lateGoals) {
        if (g.scorer_team_id === homeId) hLate++
        else if (g.scorer_team_id === awayId) aLate++
      }

      const hNoLate = homeScore - hLate
      const aNoLate = awayScore - aLate

      for (const teamId of [homeId, awayId]) {
        const data = teamLateDrama.get(teamId)!
        const isHome = teamId === homeId
        const actualScore = isHome ? homeScore : awayScore
        const oppActualScore = isHome ? awayScore : homeScore
        const noLateScore = isHome ? hNoLate : aNoLate
        const oppNoLateScore = isHome ? aNoLate : hNoLate

        const actualPts = pointsFor(actualScore, oppActualScore)
        const noLatePts = pointsFor(noLateScore, oppNoLateScore)
        const diff = actualPts - noLatePts

        if (diff > 0) data.points_gained += diff
        if (diff < 0) data.points_lost += Math.abs(diff)

        if (diff !== 0) {
          data.matches.push({
            home_team: teamNameMap.get(homeId) ?? '',
            away_team: teamNameMap.get(awayId) ?? '',
            final_score: `${homeScore} - ${awayScore}`,
            score_without_late: `${hNoLate} - ${aNoLate}`,
            points_difference: diff,
          })
        }
      }
    }

    return Array.from(teamLateDrama.values())
      .map(t => ({
        team: t.label,
        points_gained: t.points_gained,
        points_lost: t.points_lost,
        net_effect: t.points_gained - t.points_lost,
        matches: t.matches,
      }))
      .filter(t => t.points_gained > 0 || t.points_lost > 0)
      .sort((a, b) => (b.points_gained - b.points_lost) - (a.points_gained - a.points_lost))
  } catch (error) {
    console.error('Failed to fetch late-drama:', error)
    throw createError({ statusCode: 500, message: 'Failed to fetch insights' })
  }
})
