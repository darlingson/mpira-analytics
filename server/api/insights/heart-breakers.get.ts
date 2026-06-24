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
      SELECT me.match_id, me.minute, p.name AS player_name,
        m.home_team_id, m.away_team_id,
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

    const teamData = new Map<number, {
      label: string
      heartbreaks: number
      matches: any[]
    }>()

    for (const team of teamNames) {
      teamData.set(team.id, { label: team.name, heartbreaks: 0, matches: [] })
    }

    for (const match of allMatches) {
      const homeId = match.home_team_id
      const awayId = match.away_team_id
      const homeScore = match.score_home ?? 0
      const awayScore = match.score_away ?? 0

      if (homeScore === awayScore) continue

      const winnerId = homeScore > awayScore ? homeId : awayId

      const goals = goalsByMatch.get(match.id) ?? []
      if (goals.length === 0) {
        if (homeScore > 0 && awayScore === 0) continue
        if (awayScore > 0 && homeScore === 0) continue
        continue
      }

      const events: any[] = []
      let hScore = 0
      let aScore = 0
      let firstScorerId: number | null = null

      for (const goal of goals) {
        const teamId = goal.scorer_team_id
        if (!teamId) continue

        if (teamId === homeId) hScore++
        else if (teamId === awayId) aScore++

        if (firstScorerId === null) firstScorerId = teamId

        events.push({
          minute: `${goal.minute}'`,
          team: teamNameMap.get(teamId) ?? '',
          player: goal.player_name,
          score_at_event: `${hScore} - ${aScore}`,
        })
      }

      if (!firstScorerId) continue
      if (firstScorerId === winnerId) continue

      const td = teamData.get(firstScorerId)
      if (!td) continue

      td.heartbreaks++

      const oppId = firstScorerId === homeId ? awayId : homeId

      td.matches.push({
        match: {
          home_team: teamNameMap.get(homeId) ?? '',
          away_team: teamNameMap.get(awayId) ?? '',
          final_score: `${homeScore} - ${awayScore}`,
          match_date: match.date,
        },
        events,
      })
    }

    return Array.from(teamData.values())
      .filter(t => t.heartbreaks > 0)
      .map(t => ({
        team: t.label,
        heartbreaks: t.heartbreaks,
        matches: t.matches,
      }))
      .sort((a, b) => b.heartbreaks - a.heartbreaks)
  } catch (error) {
    console.error('Failed to fetch heart-breakers:', error)
    throw createError({ statusCode: 500, message: 'Failed to fetch insights' })
  }
})
