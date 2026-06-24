import { sql } from 'drizzle-orm'

export default defineEventHandler(async () => {
  try {
    const matches = await db.execute(sql`
      SELECT id, home_team_id, away_team_id, score_home, score_away
      FROM matches
      WHERE score_home IS NOT NULL AND score_away IS NOT NULL
    `)
    const allMatches = matches.rows as any[]
    if (allMatches.length === 0) return []

    const matchIds = allMatches.map(m => m.id)

    const redCards = await db.execute(sql`
      SELECT me.match_id,
        CASE WHEN pth.team_id = m.home_team_id THEN m.home_team_id
             WHEN pth.team_id = m.away_team_id THEN m.away_team_id
             ELSE NULL END AS carded_team_id
      FROM match_events me
      JOIN matches m ON me.match_id = m.id
      LEFT JOIN player_team_history pth ON pth.player_id = me.player_id
        AND pth.team_id IN (m.home_team_id, m.away_team_id)
      WHERE me.event_type = 'red_card'
        AND me.match_id = ANY(ARRAY[${sql.join(matchIds, sql`, `)}]::int[])
    `)
    const allRedCards = redCards.rows as any[]

    const teamNames = await db.query.teams.findMany({
      columns: { id: true, name: true },
    })
    const teamNameMap = new Map(teamNames.map(t => [t.id, t.name]))

    const rcByTeam = new Map<number, number>()
    for (const rc of allRedCards) {
      if (rc.carded_team_id) {
        rcByTeam.set(rc.carded_team_id, (rcByTeam.get(rc.carded_team_id) ?? 0) + 1)
      }
    }

    const matchResults = new Map<string, { wins: number; draws: number; losses: number }>()

    for (const rc of allRedCards) {
      const teamId = rc.carded_team_id
      if (!teamId) continue

      const key = `${rc.match_id}-${teamId}`
      if (matchResults.has(key)) continue

      const match = allMatches.find((m: any) => m.id === rc.match_id)
      if (!match) continue

      const homeScore = match.score_home ?? 0
      const awayScore = match.score_away ?? 0
      const isHome = match.home_team_id === teamId
      const teamScore = isHome ? homeScore : awayScore
      const oppScore = isHome ? awayScore : homeScore

      const result = { wins: 0, draws: 0, losses: 0 }
      if (teamScore > oppScore) result.wins++
      else if (teamScore === oppScore) result.draws++
      else result.losses++

      matchResults.set(key, result)
    }

    const perTeam = new Map<number, { redCards: number; wins: number; draws: number; losses: number }>()

    for (const rc of allRedCards) {
      const teamId = rc.carded_team_id
      if (!teamId) continue
      if (!perTeam.has(teamId)) {
        perTeam.set(teamId, { redCards: 0, wins: 0, draws: 0, losses: 0 })
      }
      perTeam.get(teamId)!.redCards++
    }

    for (const [key, result] of matchResults) {
      const teamId = Number(key.split('-')[1])
      const s = perTeam.get(teamId)
      if (s) {
        s.wins += result.wins
        s.draws += result.draws
        s.losses += result.losses
      }
    }

    return Array.from(perTeam.entries())
      .map(([teamId, s]) => ({
        team: teamNameMap.get(teamId) ?? 'Unknown',
        red_cards: s.redCards,
        wins: s.wins,
        draws: s.draws,
        losses: s.losses,
        survival_rate: s.redCards > 0 ? +(((s.wins + s.draws) / s.redCards * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.survival_rate - a.survival_rate)
  } catch (error) {
    console.error('Failed to fetch red-card-survival:', error)
    throw createError({ statusCode: 500, message: 'Failed to fetch insights' })
  }
})
