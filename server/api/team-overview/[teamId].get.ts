import { sql, eq, or, count } from 'drizzle-orm'
import { matches } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const teamId = Number(getRouterParam(event, 'teamId'))
  if (isNaN(teamId)) throw createError({ statusCode: 400, message: 'Invalid team id' })

  try {
    const team = await db.query.teams.findFirst({
      where: (teams, { eq }) => eq(teams.id, teamId),
    })
    if (!team) throw createError({ statusCode: 404, message: 'Team not found' })

    const [matchCount] = await db.select({ count: count() }).from(matches)
      .where(or(eq(matches.homeTeamId, teamId), eq(matches.awayTeamId, teamId)))
    const matchesPlayed = matchCount?.count ?? 0

    const [homeGoals] = await db.select({ total: sql<number>`COALESCE(SUM(score_home), 0)` }).from(matches)
      .where(eq(matches.homeTeamId, teamId))
    const [awayGoals] = await db.select({ total: sql<number>`COALESCE(SUM(score_away), 0)` }).from(matches)
      .where(eq(matches.awayTeamId, teamId))
    const goalsFor = Number(homeGoals?.total ?? 0) + Number(awayGoals?.total ?? 0)

    const [homeConceded] = await db.select({ total: sql<number>`COALESCE(SUM(score_away), 0)` }).from(matches)
      .where(eq(matches.homeTeamId, teamId))
    const [awayConceded] = await db.select({ total: sql<number>`COALESCE(SUM(score_home), 0)` }).from(matches)
      .where(eq(matches.awayTeamId, teamId))
    const goalsAgainst = Number(homeConceded?.total ?? 0) + Number(awayConceded?.total ?? 0)

    const goalsPerMatch = matchesPlayed > 0 ? +((goalsFor / matchesPlayed).toFixed(2)) : 0

    const topScorers = await db.execute(sql`
      SELECT p.id, p.name, COUNT(me.id)::int AS goals
      FROM match_events me
      JOIN matches m ON me.match_id = m.id
      JOIN players p ON me.player_id = p.id
      JOIN player_team_history pth ON pth.player_id = p.id
      WHERE me.event_type = 'goal'
        AND (m.home_team_id = ${teamId} OR m.away_team_id = ${teamId})
        AND pth.team_id = ${teamId}
        AND m.date::date >= pth.start_date
        AND (pth.end_date IS NULL OR m.date::date <= pth.end_date)
      GROUP BY p.id, p.name
      ORDER BY goals DESC
      LIMIT 5
    `)

    const [biggestWin] = await db.execute(sql`
      SELECT m.id, m.date,
        CASE WHEN m.home_team_id = ${teamId} THEN m.score_home - m.score_away
             ELSE m.score_away - m.score_home END AS goal_diff,
        CASE WHEN m.home_team_id = ${teamId} THEN away.name ELSE home.name END AS opponent,
        CASE WHEN m.home_team_id = ${teamId}
          THEN m.score_home || ' - ' || m.score_away
          ELSE m.score_away || ' - ' || m.score_home END AS score
      FROM matches m
      JOIN teams home ON home.id = m.home_team_id
      JOIN teams away ON away.id = m.away_team_id
      WHERE (m.home_team_id = ${teamId} OR m.away_team_id = ${teamId})
        AND m.score_home IS NOT NULL AND m.score_away IS NOT NULL
      ORDER BY goal_diff DESC
      LIMIT 1
    `)

    const highScoringMatches = await db.execute(sql`
      SELECT m.id, m.date,
        CASE WHEN m.home_team_id = ${teamId} THEN m.score_home ELSE m.score_away END AS team_score,
        CASE WHEN m.home_team_id = ${teamId} THEN away.name ELSE home.name END AS opponent,
        CASE WHEN m.home_team_id = ${teamId}
          THEN m.score_home || ' - ' || m.score_away
          ELSE m.score_away || ' - ' || m.score_home END AS score
      FROM matches m
      JOIN teams home ON home.id = m.home_team_id
      JOIN teams away ON away.id = m.away_team_id
      WHERE (m.home_team_id = ${teamId} OR m.away_team_id = ${teamId})
        AND CASE WHEN m.home_team_id = ${teamId} THEN m.score_home ELSE m.score_away END >= 3
      ORDER BY team_score DESC, m.date DESC
      LIMIT 4
    `)

    return {
      matchesPlayed,
      goalsFor,
      goalsAgainst,
      goalsPerMatch,
      topScorers: topScorers.rows ?? [],
      biggestWin: biggestWin?.rows?.[0] ?? null,
      highScoringMatches: highScoringMatches.rows ?? [],
    }
  } catch (error) {
    if (error.statusCode) throw error
    console.error('Failed to fetch team overview:', error)
    throw createError({ statusCode: 500, message: 'Failed to fetch team overview' })
  }
})
