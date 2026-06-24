export default defineEventHandler(async () => {
  try {
    const teams = await db.query.teams.findMany({
      orderBy: (teams, { asc }) => [asc(teams.name)],
    })

    return teams.map(t => ({
      id: t.id,
      name: t.name,
      shortName: t.shortName,
      logoUrl: t.logoUrl,
      country: t.country,
    }))
  } catch (error) {
    console.error('Failed to fetch teams:', error)
    throw createError({ statusCode: 500, message: 'Failed to fetch teams' })
  }
})
