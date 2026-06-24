import { sql } from 'drizzle-orm'

export default defineEventHandler(async () => {
  try {
    const matches = await db.execute(sql`
      SELECT m.id, m.home_team_id, m.away_team_id, m.score_home, m.score_away, m.date, m.competition_id,
             c.season
      FROM matches m
      JOIN competitions c ON m.competition_id = c.id
      WHERE m.score_home IS NOT NULL AND m.score_away IS NOT NULL
    `)
    const allMatches = matches.rows as any[]
    if (allMatches.length === 0) return []

    const teamNames = await db.query.teams.findMany({
      columns: { id: true, name: true },
    })
    const teamNameMap = new Map(teamNames.map(t => [t.id, t.name]))

    const seasons = [...new Set(allMatches.map(m => m.season))].sort()

    const seasonTeamMap = new Map<string, {
      season: string
      teamId: number
      teamName: string
      played: number
      wins: number
      draws: number
      losses: number
      goalsScored: number
      goalsConceded: number
      homeGoals: number
      awayGoals: number
      homeMatches: number
      homeWins: number
      homeDraws: number
      homeLosses: number
      awayMatches: number
      awayWins: number
      awayDraws: number
      awayLosses: number
      cleanSheets: number
      failedToScore: number
    }>()

    for (const match of allMatches) {
      const homeId = match.home_team_id
      const awayId = match.away_team_id
      const homeScore = match.score_home ?? 0
      const awayScore = match.score_away ?? 0

      for (const [teamId, isHome] of [[homeId, true], [awayId, false]] as [number, boolean][]) {
        const key = `${match.season}-${teamId}`
        if (!seasonTeamMap.has(key)) {
          seasonTeamMap.set(key, {
            season: match.season,
            teamId,
            teamName: teamNameMap.get(teamId) ?? 'Unknown',
            played: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            goalsScored: 0,
            goalsConceded: 0,
            homeGoals: 0,
            awayGoals: 0,
            homeMatches: 0,
            homeWins: 0,
            homeDraws: 0,
            homeLosses: 0,
            awayMatches: 0,
            awayWins: 0,
            awayDraws: 0,
            awayLosses: 0,
            cleanSheets: 0,
            failedToScore: 0,
          })
        }

        const s = seasonTeamMap.get(key)!
        s.played++

        const teamScore = isHome ? homeScore : awayScore
        const oppScore = isHome ? awayScore : homeScore
        s.goalsScored += teamScore
        s.goalsConceded += oppScore

        if (isHome) {
          s.homeMatches++
          s.homeGoals += teamScore
        } else {
          s.awayMatches++
          s.awayGoals += teamScore
        }

        if (teamScore > oppScore) {
          s.wins++
          if (isHome) s.homeWins++
          else s.awayWins++
        } else if (teamScore === oppScore) {
          s.draws++
          if (isHome) s.homeDraws++
          else s.awayDraws++
        } else {
          s.losses++
          if (isHome) s.homeLosses++
          else s.awayLosses++
        }

        if (oppScore === 0) s.cleanSheets++
        if (teamScore === 0) s.failedToScore++
      }
    }

    return Array.from(seasonTeamMap.values()).map(s => ({
      season: s.season,
      team: s.teamName,
      matchesPlayed: s.played,
      wins: s.wins,
      draws: s.draws,
      losses: s.losses,
      goalsScored: s.goalsScored,
      goalsConceded: s.goalsConceded,
      goalDifference: s.goalsScored - s.goalsConceded,
      homeGoals: s.homeGoals,
      awayGoals: s.awayGoals,
      avgGoalsPerGame: +(s.goalsScored / s.played).toFixed(2),
      avgGoalsConcededPerGame: +(s.goalsConceded / s.played).toFixed(2),
      cleanSheets: s.cleanSheets,
      failedToScore: s.failedToScore,
      homeRecord: `${s.homeWins}W-${s.homeDraws}D-${s.homeLosses}L`,
      awayRecord: `${s.awayWins}W-${s.awayDraws}D-${s.awayLosses}L`,
    }))
  } catch (error) {
    console.error('Failed to fetch season performance:', error)
    throw createError({ statusCode: 500, message: 'Failed to fetch season stats' })
  }
})
