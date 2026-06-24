import { sql, eq } from 'drizzle-orm'

interface GoalRow {
  match_id: number
  minute: number
  player_id: number
  player_name: string
  home_team_id: number
  away_team_id: number
  score_home: number | null
  score_away: number | null
  match_date: string
  is_our_team: boolean
}

export default defineEventHandler(async (event) => {
  const teamId = Number(getRouterParam(event, 'teamId'))
  if (isNaN(teamId)) throw createError({ statusCode: 400, message: 'Invalid team id' })

  try {
    const team = await db.query.teams.findFirst({
      where: (teams, { eq }) => eq(teams.id, teamId),
    })
    if (!team) throw createError({ statusCode: 404, message: 'Team not found' })

    const matchesForTeam = await db.execute(sql`
      SELECT id, home_team_id, away_team_id, score_home, score_away
      FROM matches
      WHERE (home_team_id = ${teamId} OR away_team_id = ${teamId})
        AND score_home IS NOT NULL AND score_away IS NOT NULL
    `)
    const teamMatches = matchesForTeam.rows as any[]

    if (teamMatches.length === 0) {
      return { fastestGoal: null, latestWinningGoal: null, equalizers: [], first5WinRate: 0 }
    }

    const matchIds = teamMatches.map(m => m.id)

    const teamIds = new Set<number>()
    for (const m of teamMatches) {
      teamIds.add(m.home_team_id)
      teamIds.add(m.away_team_id)
    }
    const teamNames = await db.query.teams.findMany({
      where: (teams, { eq, inArray: ia }) => ia(teams.id, Array.from(teamIds)),
      columns: { id: true, name: true },
    })
    const teamNameMap = new Map(teamNames.map(t => [t.id, t.name]))

    const goalsResult = await db.execute(sql`
      SELECT me.match_id, me.minute, me.player_id, p.name AS player_name,
        m.home_team_id, m.away_team_id, m.score_home, m.score_away,
        m.date::text AS match_date,
        CASE WHEN pth.team_id = ${teamId} THEN true ELSE false END AS is_our_team
      FROM match_events me
      JOIN matches m ON me.match_id = m.id
      JOIN players p ON me.player_id = p.id
      LEFT JOIN player_team_history pth ON pth.player_id = me.player_id AND pth.team_id = ${teamId}
      WHERE me.event_type = 'goal'
        AND me.match_id = ANY(ARRAY[${sql.join(matchIds, sql`, `)}]::int[])
      ORDER BY me.match_id, me.minute
    `)
    const allGoals = goalsResult.rows as any[]

    const goalsByMatch = new Map<number, any[]>()
    for (const g of allGoals) {
      if (!goalsByMatch.has(g.match_id)) {
        goalsByMatch.set(g.match_id, [])
      }
      goalsByMatch.get(g.match_id)!.push(g)
    }

    let fastestGoal: { minute: number; player: string; opponent: string; date: string } | null = null
    let latestWinningGoal: { minute: number; player: string; opponent: string; date: string } | null = null
    const equalizerMap = new Map<number, { playerId: number; player: string; count: number }>()
    let matchesWithFirst5Goal = 0
    let matchesWithFirst5GoalAndWon = 0

    for (const match of teamMatches) {
      const goals = goalsByMatch.get(match.id) ?? []
      if (goals.length === 0) continue

      let ourScore = 0
      let oppScore = 0
      const isHome = match.home_team_id === teamId
      const opponentId = isHome ? match.away_team_id : match.home_team_id
      const opponentName = teamNameMap.get(opponentId) ?? 'Unknown'

      let scoredInFirst5 = false

      for (const goal of goals) {
        if (goal.is_our_team) {
          ourScore++

          if (goal.minute <= 5) {
            scoredInFirst5 = true
          }

          if (fastestGoal === null || goal.minute < fastestGoal.minute) {
            fastestGoal = { minute: goal.minute, player: goal.player_name, opponent: opponentName, date: goal.match_date }
          }

          if (ourScore > oppScore && ourScore - 1 <= oppScore) {
            latestWinningGoal = { minute: goal.minute, player: goal.player_name, opponent: opponentName, date: goal.match_date }
          }

          if (ourScore - 1 < oppScore && ourScore === oppScore) {
            const existing = equalizerMap.get(goal.player_id)
            if (existing) {
              existing.count++
            } else {
              equalizerMap.set(goal.player_id, { playerId: goal.player_id, player: goal.player_name, count: 1 })
            }
          }
        } else {
          oppScore++
        }
      }

      if (scoredInFirst5) {
        matchesWithFirst5Goal++
        const homeScore = match.score_home ?? 0
        const awayScore = match.score_away ?? 0
        const teamScore = isHome ? homeScore : awayScore
        const oppTeamScore = isHome ? awayScore : homeScore
        if (teamScore > oppTeamScore) {
          matchesWithFirst5GoalAndWon++
        }
      }
    }

    const first5WinRate = matchesWithFirst5Goal > 0
      ? +((matchesWithFirst5GoalAndWon / matchesWithFirst5Goal * 100).toFixed(1))
      : 0

    return {
      fastestGoal,
      latestWinningGoal,
      equalizers: Array.from(equalizerMap.values()).sort((a, b) => b.count - a.count),
      first5WinRate,
    }
  } catch (error) {
    if (error.statusCode) throw error
    console.error('Failed to fetch team attack insights:', error)
    throw createError({ statusCode: 500, message: 'Failed to fetch team attack insights' })
  }
})
