import { neon } from "@neondatabase/serverless";

export default defineCachedEventHandler(
  async (_) => {
    const { databaseUrl } = useRuntimeConfig();
    const db = neon(databaseUrl);

    // --- 1️⃣ Fetch data ---
    const matches = await db`SELECT * FROM matches;`;
    const redEvents =
      await db`SELECT * FROM events WHERE type='red_card' AND description ILIKE '%red%';`;

    // --- 2️⃣ Create matches map ---
    // eslint-disable-next-line
    const matchesById = new Map<number, any>();
    for (const match of matches) {
      matchesById.set(Number(match.id), match);
    }

    // --- 3️⃣ Stats container ---
    const teamStats: Record<
      string,
      {
        red_but_not_lost: number;
        matches: {
          // eslint-disable-next-line
          match: any;
          // eslint-disable-next-line
          red_card_event: any;
          final_result: string;
        }[];
      }
    > = {};

    // --- 4️⃣ Process each red card event ---
    for (const e of redEvents) {
      const matchId = Number(e.match_id);
      const match = matchesById.get(matchId);
      if (!match) continue;

      if (!match.final_score || !match.final_score.includes("-")) continue;
      const [homeRaw, awayRaw] = match.final_score.split("-");
      const homeScore = parseInt(homeRaw.trim(), 10);
      const awayScore = parseInt(awayRaw.trim(), 10);
      if (isNaN(homeScore) || isNaN(awayScore)) continue;

      const homeTeam = match.home_team;
      const awayTeam = match.away_team;
      const team = e.team;

      // Determine final result for the team
      let finalResult: string;
      if (team === homeTeam) {
        finalResult =
          homeScore > awayScore
            ? "win"
            : homeScore === awayScore
              ? "draw"
              : "loss";
      } else if (team === awayTeam) {
        finalResult =
          awayScore > homeScore
            ? "win"
            : homeScore === awayScore
              ? "draw"
              : "loss";
      } else {
        continue; // Team not in match
      }

      if (finalResult !== "loss") {
        if (!teamStats[team]) {
          teamStats[team] = {
            red_but_not_lost: 0,
            matches: [],
          };
        }

        teamStats[team].red_but_not_lost++;
        teamStats[team].matches.push({
          match,
          red_card_event: e,
          final_result: finalResult,
        });
      }
    }

    // --- 5️⃣ Format result ---
    const result = Object.entries(teamStats).map(([team, data]) => ({
      team,
      red_but_not_lost: data.red_but_not_lost,
      matches: data.matches,
    }));

    return result;
  },
  { maxAge: 60 * 60 * 24 },
);
