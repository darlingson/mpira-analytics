import { neon } from '@neondatabase/serverless';

export default defineCachedEventHandler(async () => {
  const { databaseUrl } = useRuntimeConfig();
  const db = neon(databaseUrl);

  const matches = await db`SELECT * FROM matches`;
  const events = await db`SELECT * FROM events WHERE type = 'goal'`;

  const teams = [...new Set([...matches.map(m => m.home_team), ...matches.map(m => m.away_team)])];

  const teamStats = teams.map(team => {
    let scored = 0, conceded = 0, homeGoals = 0, awayGoals = 0;

    matches.forEach(match => {
      const [homeScore, awayScore] = match.final_score.split(' - ').map(Number);

      if (match.home_team === team) {
        scored += homeScore;
        conceded += awayScore;
        homeGoals += homeScore;
      } else if (match.away_team === team) {
        scored += awayScore;
        conceded += homeScore;
        awayGoals += awayScore;
      }
    });

    const players = events
      .filter(e => e.team === team && e.player)
      .reduce((acc, e) => {
        acc[e.player] = (acc[e.player] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const totalGoals = Object.values(players).reduce((a, b) => a + b, 0);
    const topScorers = Object.entries(players).map(([player, goals]) => ({
      player,
      goals,
      contribution_pct: Math.round((goals / totalGoals) * 100),
    }));

    return {
      team,
      goals_scored: scored,
      goals_conceded: conceded,
      home_goals: homeGoals,
      away_goals: awayGoals,
      top_scorers: topScorers.sort((a, b) => b.goals - a.goals),
    };
  });

  return teamStats;
}, {
  maxAge: 60 * 60 * 24,
});
