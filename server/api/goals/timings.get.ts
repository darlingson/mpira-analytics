import { sql } from 'drizzle-orm'

export default defineEventHandler(async () => {
  try {
    const matches = await db.execute(sql`
      SELECT id, home_team_id, away_team_id
      FROM matches
      WHERE score_home IS NOT NULL AND score_away IS NOT NULL
    `)
    const allMatches = matches.rows as any[]
    if (allMatches.length === 0) return { average_goal_time_per_team: [], goals_by_period: [], minute_histogram: [] }

    const matchIds = allMatches.map(m => m.id)

    const goalsResult = await db.execute(sql`
      SELECT me.match_id, me.minute, me.player_id, p.name AS player_name,
        m.home_team_id, m.away_team_id,
        CASE WHEN pth.team_id = m.home_team_id THEN m.home_team_id
             WHEN pth.team_id = m.away_team_id THEN m.away_team_id
             ELSE NULL END AS scorer_team_id
      FROM match_events me
      JOIN matches m ON me.match_id = m.id
      JOIN players p ON me.player_id = p.id
      LEFT JOIN player_team_history pth ON pth.player_id = me.player_id
        AND pth.team_id IN (m.home_team_id, m.away_team_id)
      WHERE me.event_type = 'goal'
        AND me.match_id = ANY(ARRAY[${sql.join(matchIds, sql`, `)}]::int[])
    `)
    const allGoals = goalsResult.rows as any[]

    const teamNames = await db.query.teams.findMany({
      columns: { id: true, name: true },
    })
    const teamNameMap = new Map(teamNames.map(t => [t.id, t.name]))

    const teamMinutes = new Map<number, { label: string; minutes: number[] }>()
    const periods: Record<string, number> = {
      '0-15': 0, '16-30': 0, '31-45': 0, '46-60': 0, '61-75': 0, '76-90': 0,
    }
    const perMinute = new Array(91).fill(0)

    for (const goal of allGoals) {
      const teamId = goal.scorer_team_id
      const minute = goal.minute
      if (!teamId) continue

      if (!teamMinutes.has(teamId)) {
        teamMinutes.set(teamId, { label: teamNameMap.get(teamId) ?? 'Unknown', minutes: [] })
      }
      teamMinutes.get(teamId)!.minutes.push(minute)

      if (minute <= 15) periods['0-15']++
      else if (minute <= 30) periods['16-30']++
      else if (minute <= 45) periods['31-45']++
      else if (minute <= 60) periods['46-60']++
      else if (minute <= 75) periods['61-75']++
      else periods['76-90']++

      if (minute >= 0 && minute <= 90) perMinute[minute]++
    }

    const avgGoalTimePerTeam = Array.from(teamMinutes.values())
      .map(t => ({
        team: t.label,
        average_minute: t.minutes.length > 0
          ? +(t.minutes.reduce((a, b) => a + b, 0) / t.minutes.length).toFixed(1)
          : 0,
        total_goals: t.minutes.length,
      }))
      .sort((a, b) => a.average_minute - b.average_minute)

    const goalsByPeriod = Object.entries(periods).map(([period, count]) => ({
      period,
      goals: count,
    }))

    const minuteHistogram = perMinute
      .map((count, minute) => ({ minute, goals: count }))
      .filter(h => h.goals > 0)

    return {
      average_goal_time_per_team: avgGoalTimePerTeam,
      goals_by_period: goalsByPeriod,
      minute_histogram: minuteHistogram,
    }
  } catch (error) {
    console.error('Failed to fetch goal timings:', error)
    throw createError({ statusCode: 500, message: 'Failed to fetch goal timings' })
  }
})
