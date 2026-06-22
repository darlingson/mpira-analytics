export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'Invalid match id' })

  try {
    const match = await db.query.matches.findFirst({
      where: (matches, { eq }) => eq(matches.id, id),
      with: {
        competition: {
          with: {
            league: true,
          },
        },
        team_homeTeamId: true,
        team_awayTeamId: true,
        matchEvents: {
          with: {
            player_playerId: true,
            player_assistingPlayerId: true,
          },
          orderBy: (events, { asc }) => [asc(events.minute)],
        },
      },
    })

    if (!match) throw createError({ statusCode: 404, message: 'Match not found' })

    return {
      id: match.id,
      date: match.date,
      competition: match.competition.name,
      competitionId: match.competition.id,
      season: match.competition.season,
      league: match.competition.league?.name ?? null,
      homeTeam: match.team_homeTeamId.name,
      homeTeamId: match.team_homeTeamId.id,
      awayTeam: match.team_awayTeamId.name,
      awayTeamId: match.team_awayTeamId.id,
      scoreHome: match.scoreHome,
      scoreAway: match.scoreAway,
      venue: match.venue,
      events: match.matchEvents.map(e => ({
        id: e.id,
        minute: e.minute,
        eventType: e.eventType,
        player: e.player_playerId.name,
        playerId: e.player_playerId.id,
        assistingPlayer: e.player_assistingPlayerId?.name ?? null,
        assistingPlayerId: e.player_assistingPlayerId?.id ?? null,
      })),
    }
  } catch (error) {
    if (error.statusCode) throw error
    console.error('Failed to fetch match:', error)
    throw createError({ statusCode: 500, message: 'Failed to fetch match' })
  }
})
