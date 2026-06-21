import { desc } from 'drizzle-orm'

export default defineEventHandler(async () => {
  try {
    const matches = await db.query.matches.findMany({
      with: {
        competition: true,
        team_homeTeamId: true,
        team_awayTeamId: true,
      },
      orderBy: (matches, { desc }) => [desc(matches.date)],
      limit: 10,
    })

    return matches.map(m => ({
      id: m.id,
      date: m.date,
      competition: m.competition.name,
      homeTeam: m.team_homeTeamId.name,
      awayTeam: m.team_awayTeamId.name,
      scoreHome: m.scoreHome,
      scoreAway: m.scoreAway,
      venue: m.venue,
    }))
  } catch (error) {
    console.error('Failed to fetch recent matches:', error)
    throw createError({ statusCode: 500, message: 'Failed to fetch recent matches' })
  }
})
