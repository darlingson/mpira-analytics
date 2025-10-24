import { neon } from "@neondatabase/serverless";

export default defineCachedEventHandler(
  async (_) => {
    const { databaseUrl } = useRuntimeConfig();
    const db = neon(databaseUrl);

    // --- 1️⃣ Fetch data ---
    const matches = await db`SELECT * FROM matches;`;
    const events = await db`SELECT * FROM events WHERE type = 'goal';`;

    // --- 2️⃣ Safe minute parsing ---
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

    // --- 3️⃣ Group goals by match ---
    // eslint-disable-next-line
    const eventsByMatch = new Map<number, any[]>();
    for (const e of events) {
      const matchId = Number(e.match_id);
      if (!eventsByMatch.has(matchId)) {
        eventsByMatch.set(matchId, []);
      }
      eventsByMatch.get(matchId)!.push({
        ...e,
        parsedMinute: parseMinute(e.minute),
      });
    }

    // --- 4️⃣ Stats container ---
    const teamStats: Record<
      string,
      {
        scored_first_and_won: number;
        matches: {
          // eslint-disable-next-line
          match: any;
          // eslint-disable-next-line
          first_goal: any;
          // eslint-disable-next-line
          all_goals: any[];
          winner: string | null;
          loser: string | null;
        }[];
      }
    > = {};

    // --- 5️⃣ Process each match ---
    for (const match of matches) {
      const matchId = Number(match.id);
      const matchGoals = eventsByMatch.get(matchId) || [];

      if (!match.final_score || !match.final_score.includes("-")) continue;
      const [homeRaw, awayRaw] = match.final_score.split("-");
      const homeScore = parseInt(homeRaw.trim(), 10);
      const awayScore = parseInt(awayRaw.trim(), 10);
      if (isNaN(homeScore) || isNaN(awayScore)) continue;

      const homeTeam = match.home_team;
      const awayTeam = match.away_team;

      // Determine match winner / loser
      let winner: string | null = null;
      let loser: string | null = null;
      if (homeScore > awayScore) {
        winner = homeTeam;
        loser = awayTeam;
      } else if (awayScore > homeScore) {
        winner = awayTeam;
        loser = homeTeam;
      } else {
        continue; // draw — no winner
      }

      if (matchGoals.length === 0) continue;

      // Sort by earliest goal
      matchGoals.sort((a, b) => a.parsedMinute - b.parsedMinute);
      const firstGoal = matchGoals[0];
      const firstTeam = firstGoal.team;

      // If first-scoring team ended up winning
      if (firstTeam === winner) {
        if (!teamStats[firstTeam]) {
          teamStats[firstTeam] = {
            scored_first_and_won: 0,
            matches: [],
          };
        }

        teamStats[firstTeam].scored_first_and_won++;
        teamStats[firstTeam].matches.push({
          match,
          first_goal: firstGoal,
          all_goals: matchGoals,
          winner,
          loser,
        });
      }
    }

    // --- 6️⃣ Format result ---
    const result = Object.entries(teamStats).map(([team, data]) => ({
      team,
      scored_first_and_won: data.scored_first_and_won,
      matches: data.matches,
    }));

    return result;
  },
  { maxAge: 60 * 60 * 24 },
);
