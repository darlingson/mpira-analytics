import { neon } from '@neondatabase/serverless';

export default defineCachedEventHandler(async () => {
  const { databaseUrl } = useRuntimeConfig();
  const db = neon(databaseUrl);

  const matches = await db`SELECT * FROM matches`;
  const seasons = [...new Set(matches.map(m => m.season))];
  const teams = [...new Set(matches.flatMap(m => [m.home_team, m.away_team]))];

  const results = [];

  for (const season of seasons) {
    const teamStatsArray = [];

    for (const team of teams) {
      const teamMatches = matches.filter(
        m => m.season === season && (m.home_team === team || m.away_team === team)
      );

      if (!teamMatches.length) continue;

      let wins = 0, draws = 0, losses = 0;
      let goalsScored = 0, goalsConceded = 0;
      let homeGoals = 0, awayGoals = 0;
      let cleanSheets = 0, failedToScore = 0;
      let homeMatches = 0, awayMatches = 0;
      let homeW = 0, homeD = 0, homeL = 0;
      let awayW = 0, awayD = 0, awayL = 0;

      for (const match of teamMatches) {
        const [homeScore, awayScore] = match.final_score.split(' - ').map(Number);
        const isHome = match.home_team === team;
        const teamScore = isHome ? homeScore : awayScore;
        const opponentScore = isHome ? awayScore : homeScore;

        goalsScored += teamScore;
        goalsConceded += opponentScore;

        if (isHome) {
          homeGoals += teamScore;
          homeMatches++;
        } else {
          awayGoals += teamScore;
          awayMatches++;
        }

        if (teamScore > opponentScore) {
          wins++; isHome ? homeW++ : awayW++;
        } else if (teamScore === opponentScore) {
          draws++; isHome ? homeD++ : awayD++;
        } else {
          losses++; isHome ? homeL++ : awayL++;
        }

        if (opponentScore === 0) cleanSheets++;
        if (teamScore === 0) failedToScore++;
      }

      const matchesPlayed = teamMatches.length;

      teamStatsArray.push({
        team,
        teamStats: {
          matches_played: matchesPlayed,
          wins,
          draws,
          losses,
          goals_scored: goalsScored,
          goals_conceded: goalsConceded,
          goal_difference: goalsScored - goalsConceded,
          home_goals: homeGoals,
          away_goals: awayGoals,
          avg_goals_per_game: +(goalsScored / matchesPlayed).toFixed(2),
          avg_goals_conceded_per_game: +(goalsConceded / matchesPlayed).toFixed(2),
          clean_sheets: cleanSheets,
          failed_to_score: failedToScore,
          home_matches: homeMatches,
          away_matches: awayMatches,
          home_record: `${homeW}W-${homeD}D-${homeL}L`,
          away_record: `${awayW}W-${awayD}D-${awayL}L`
        }
      });
    }

    results.push({
      season,
      stats: teamStatsArray
    });
  }
  return {
    message: "season stats retrieved successfully",
    data: results
  };
}, {
  maxAge: 60 * 60 * 24,
});