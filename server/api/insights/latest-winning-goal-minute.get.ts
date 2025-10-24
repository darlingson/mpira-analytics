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
        latest_winner: number;
        matches: {
          // eslint-disable-next-line
          match: any;
          // eslint-disable-next-line
          winning_goal: any;
          // eslint-disable-next-line
          all_goals: any[];
        }[];
      }
    > = {};

    // --- 5️⃣ Process each match ---
    for (const match of matches) {
      const matchId = Number(match.id);
      const matchGoals = eventsByMatch.get(matchId) || [];

      if (matchGoals.length === 0) continue;

      if (!match.final_score || !match.final_score.includes("-")) continue;
      const [homeRaw, awayRaw] = match.final_score.split("-");
      const homeScore = parseInt(homeRaw.trim(), 10);
      const awayScore = parseInt(awayRaw.trim(), 10);
      if (isNaN(homeScore) || isNaN(awayScore)) continue;

      const homeTeam = match.home_team;
      const awayTeam = match.away_team;

      // Determine winner
      let winner: string | null = null;
      if (homeScore > awayScore) {
        winner = homeTeam;
      } else if (awayScore > homeScore) {
        winner = awayTeam;
      } else {
        continue; // draw
      }

      // Sort goals by time
      matchGoals.sort((a, b) => a.parsedMinute - b.parsedMinute);

      // Find the last goal by the winner
      // eslint-disable-next-line
      let winningGoal: any | null = null;
      let maxMinute = -1;
      for (const goal of matchGoals) {
        if (goal.team === winner && goal.parsedMinute > maxMinute) {
          maxMinute = goal.parsedMinute;
          winningGoal = goal;
        }
      }

      if (!winningGoal) continue;

      const team = winner;
      // eslint-disable-next-line
      // @ts-expect-error
      if (!teamStats[team]) {
        // eslint-disable-next-line
        // @ts-expect-error
        teamStats[team] = {
          latest_winner: 0,
          matches: [],
        };
      }
      // eslint-disable-next-line
      // @ts-expect-error
      teamStats[team].matches.push({
        match,
        winning_goal: winningGoal,
        all_goals: [...matchGoals],
      });

      // Update latest_winner if this is later
      // eslint-disable-next-line
      // @ts-expect-error
      if (winningGoal.parsedMinute > teamStats[team].latest_winner) {
        // eslint-disable-next-line
        // @ts-expect-error
        teamStats[team].latest_winner = winningGoal.parsedMinute;
      }
    }

    // --- 6️⃣ Format result ---
    const result = Object.entries(teamStats).map(([team, data]) => ({
      team,
      latest_winner: data.latest_winner,
      matches: data.matches,
    }));

    return result;
  },
  { maxAge: 60 * 60 * 24 },
);
