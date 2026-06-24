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

    const matchMap = new Map(allMatches.map((m: any) => [m.id, m]))

    const playerData = new Map<number, {
      playerId: number
      playerName: string
      teamId: number
      teamName: string
      total: number
      matches: any[]
    }>()

    for (const match of allMatches) {
      const homeId = match.home_team_id
      const awayId = match.away_team_id

      const goals = goalsByMatch.get(match.id) ?? []
      if (goals.length === 0) continue

      let hScore = 0
      let aScore = 0

      for (const goal of goals) {
        const teamId = goal.scorer_team_id
        if (!teamId) continue

        if (teamId === homeId) hScore++
        else if (teamId === awayId) aScore++

        const ourScore = teamId === homeId ? hScore : aScore
        const oppScore = teamId === homeId ? aScore : hScore

        if (ourScore - 1 < oppScore && ourScore === oppScore) {
          const oppTeamId = teamId === homeId ? awayId : homeId
          const oppTeamName = teamNameMap.get(oppTeamId) ?? ''

          if (!playerData.has(goal.player_id)) {
            playerData.set(goal.player_id, {
              playerId: goal.player_id,
              playerName: goal.player_name,
              teamId,
              teamName: teamNameMap.get(teamId) ?? '',
              total: 0,
              matches: [],
            })
          }

          const pd = playerData.get(goal.player_id)!
          pd.total++
          pd.matches.push({
            match: `vs ${oppTeamName}`,
            minute: `${goal.minute}'`,
            score: `${ourScore} - ${oppScore}`,
            date: match.date,
          })
        }
      }
    }

    return Array.from(playerData.values())
      .sort((a, b) => b.total - a.total)
      .map(p => ({
        player: p.playerName,
        team: p.teamName,
        equalizers: p.total,
        matches: p.matches.slice(0, 5),
      }))
  } catch (error) {
    console.error('Failed to fetch the-equalizers:', error)
    throw createError({ statusCode: 500, message: 'Failed to fetch insights' })
  }
})
