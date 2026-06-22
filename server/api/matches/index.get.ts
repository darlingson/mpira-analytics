export default defineEventHandler(async () => {
  try {
    const matches = await db.query.matches.findMany({
      with: {
        competition: true,
        team_homeTeamId: true,
        team_awayTeamId: true,
      },
      orderBy: (matches, { desc }) => [desc(matches.date)],
    })

    return matches.map(m => ({
      id: m.id,
      date: m.date,
      competition: m.competition.name,
      competitionId: m.competition.id,
      homeTeam: m.team_homeTeamId.name,
      homeTeamId: m.team_homeTeamId.id,
      awayTeam: m.team_awayTeamId.name,
      awayTeamId: m.team_awayTeamId.id,
      scoreHome: m.scoreHome,
      scoreAway: m.scoreAway,
      venue: m.venue,
    }))
  } catch (error) {
    console.error('Failed to fetch matches:', error)
    throw createError({ statusCode: 500, message: 'Failed to fetch matches' })
  }
})
