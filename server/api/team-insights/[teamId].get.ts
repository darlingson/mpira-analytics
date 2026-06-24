import { sql, eq } from 'drizzle-orm'

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
      return { comebackWins: 0, scoredFirstAndWon: 0, scoredFirstAndLost: 0, cleanSheets: 0 }
    }

    const matchIds = teamMatches.map(m => m.id)

    const goalsResult = await db.execute(sql`
      SELECT me.match_id, me.minute, me.player_id, p.name AS player_name,
        m.home_team_id, m.away_team_id,
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

    let comebackWins = 0
    let scoredFirstAndWon = 0
    let scoredFirstAndLost = 0
    let cleanSheets = 0

    for (const match of teamMatches) {
      const isHome = match.home_team_id === teamId
      const homeScore = match.score_home ?? 0
      const awayScore = match.score_away ?? 0
      const teamScore = isHome ? homeScore : awayScore
      const oppScore = isHome ? awayScore : homeScore

      if (oppScore === 0) {
        cleanSheets++
      }

      const goals = goalsByMatch.get(match.id) ?? []
      if (goals.length === 0) continue

      let ourScore = 0
      let oppScoreTimeline = 0
      let wasBehind = false
      let firstGoalByUs = false
      let firstGoalScored = false

      for (const goal of goals) {
        if (!firstGoalScored) {
          firstGoalScored = true
          firstGoalByUs = goal.is_our_team
        }

        if (goal.is_our_team) {
          ourScore++
          if (ourScore <= oppScoreTimeline) {
            wasBehind = true
          }
        } else {
          oppScoreTimeline++
        }
      }

      const won = teamScore > oppScore

      if (wasBehind && won) {
        comebackWins++
      }

      if (firstGoalByUs && won) {
        scoredFirstAndWon++
      }

      if (firstGoalByUs && !won) {
        scoredFirstAndLost++
      }
    }

    return {
      comebackWins,
      scoredFirstAndWon,
      scoredFirstAndLost,
      cleanSheets,
    }
  } catch (error) {
    if (error.statusCode) throw error
    console.error('Failed to fetch team insights:', error)
    throw createError({ statusCode: 500, message: 'Failed to fetch team insights' })
  }
})
