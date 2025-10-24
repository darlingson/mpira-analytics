import { neon } from "@neondatabase/serverless";

export default defineCachedEventHandler(
  async (_) => {
    const { databaseUrl } = useRuntimeConfig();
    const db = neon(databaseUrl);

    // Fetch all matches and goal events
    const matches = await db`SELECT * FROM matches;`;
    const events = await db`SELECT * FROM events WHERE type = 'goal';`;

    // --- helpers ---
    const parseMinute = (minute: string | null): number => {
      if (!minute) return 9999;
      const cleaned = minute.replace(/'/g, "");
      if (/^\d+$/.test(cleaned)) return parseInt(cleaned, 10);
      if (/^\d+\+\d+$/.test(cleaned)) {
        const [base, extra] = cleaned.split("+").map(Number);
        return base + extra;
      }
      return 9999;
    };

    // --- group stats ---
    const teamStats: Record<
      string,
      {
        scored_first5: number;
        first5_and_win: number;
        matches: {
          // eslint-disable-next-line
          match: any;
          // eslint-disable-next-line
          first5Goals: any[];
          won: boolean;
        }[];
      }
    > = {};

    for (const match of matches) {
      if (!match.final_score || !match.final_score.includes("-")) continue;
      const [homeRaw, awayRaw] = match.final_score.split("-");
      const homeScore = parseInt(homeRaw.trim(), 10);
      const awayScore = parseInt(awayRaw.trim(), 10);
      if (Number.isNaN(homeScore) || Number.isNaN(awayScore)) continue;

      const matchGoals = events
        .filter((e) => e.match_id === match.id)
        .map((e) => ({ ...e, parsedMinute: parseMinute(e.minute) }));

      if (matchGoals.length === 0) continue;

      // find goals inside first 5 mins
      const first5Goals = matchGoals.filter((g) => g.parsedMinute <= 5);
      if (first5Goals.length === 0) continue;

      for (const goal of first5Goals) {
        // eslint-disable-next-line
        // @ts-ignore
        const team = goal.team;
        if (!team) continue;

        if (!teamStats[team]) {
          teamStats[team] = {
            scored_first5: 0,
            first5_and_win: 0,
            matches: [],
          };
        }

        teamStats[team].scored_first5++;

        const won =
          (team === match.home_team && homeScore > awayScore) ||
          (team === match.away_team && awayScore > homeScore);

        if (won) teamStats[team].first5_and_win++;

        // Record match + events for inspection
        teamStats[team].matches.push({
          match,
          first5Goals,
          won,
        });
      }
    }

    // --- format output ---
    const result = Object.entries(teamStats).map(([team, data]) => ({
      team,
      scored_first5: data.scored_first5,
      first5_and_win: data.first5_and_win,
      win_rate_after_scoring_first5:
        data.scored_first5 > 0
          ? Number(
              ((data.first5_and_win / data.scored_first5) * 100).toFixed(1),
            )
          : 0,
      matches: data.matches, // <-- include matches and first 5-min goal events
    }));

    return result;
  },
  { maxAge: 60 * 60 * 24 },
);
