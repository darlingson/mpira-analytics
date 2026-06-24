export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'Invalid team id' })

  try {
    const team = await db.query.teams.findFirst({
      where: (teams, { eq }) => eq(teams.id, id),
      with: {
        playerTeamHistories: {
          where: (pth, { isNull }) => isNull(pth.endDate),
          with: {
            player: true,
          },
        },
      },
    })

    if (!team) throw createError({ statusCode: 404, message: 'Team not found' })

    const [homeMatches, awayMatches] = await Promise.all([
      db.query.matches.findMany({
        where: (matches, { eq }) => eq(matches.homeTeamId, id),
        with: {
          competition: true,
          team_awayTeamId: true,
        },
        orderBy: (matches, { desc }) => [desc(matches.date)],
        limit: 10,
      }),
      db.query.matches.findMany({
        where: (matches, { eq }) => eq(matches.awayTeamId, id),
        with: {
          competition: true,
          team_homeTeamId: true,
        },
        orderBy: (matches, { desc }) => [desc(matches.date)],
        limit: 10,
      }),
    ])

    const recentMatches = [
      ...homeMatches.map(m => ({
        id: m.id,
        date: m.date,
        competition: m.competition.name,
        homeTeam: m.team_homeTeamId?.name ?? team.name,
        awayTeam: m.team_awayTeamId.name,
        scoreHome: m.scoreHome,
        scoreAway: m.scoreAway,
        venue: m.venue,
      })),
      ...awayMatches.map(m => ({
        id: m.id,
        date: m.date,
        competition: m.competition.name,
        homeTeam: m.team_homeTeamId.name,
        awayTeam: m.team_awayTeamId?.name ?? team.name,
        scoreHome: m.scoreHome,
        scoreAway: m.scoreAway,
        venue: m.venue,
      })),
    ]

    recentMatches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return {
      id: team.id,
      name: team.name,
      shortName: team.shortName,
      logoUrl: team.logoUrl,
      country: team.country,
      squad: team.playerTeamHistories.map(pth => ({
        id: pth.player.id,
        name: pth.player.name,
        shortName: pth.player.shortName,
        position: pth.player.position,
        nationality: pth.player.nationality,
        photoUrl: pth.player.photoUrl,
      })),
      recentMatches: recentMatches.slice(0, 10),
    }
  } catch (error) {
    if (error.statusCode) throw error
    console.error('Failed to fetch team:', error)
    throw createError({ statusCode: 500, message: 'Failed to fetch team' })
  }
})
