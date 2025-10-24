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
        comeback_wins: number;
        matches: {
          // eslint-disable-next-line
          match: any;
          // eslint-disable-next-line
          all_goals: any[];
          comeback_moments: { minute: number; score: string }[];
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

      // Determine winner
      let winner: string | null = null;
      let loser: string | null = null;
      if (homeScore > awayScore) {
        winner = homeTeam;
        loser = awayTeam;
      } else if (awayScore > homeScore) {
        winner = awayTeam;
        // eslint-disable-next-line
        loser = homeTeam;
      } else {
        continue; // draw — no winner
      }

      if (matchGoals.length === 0) continue;

      // Sort goals by time
      matchGoals.sort((a, b) => a.parsedMinute - b.parsedMinute);

      // Simulate score progression
      let currentHomeScore = 0;
      let currentAwayScore = 0;
      const comebackMoments: { minute: number; score: string }[] = [];

      for (const goal of matchGoals) {
        const prevHomeScore = currentHomeScore;
        const prevAwayScore = currentAwayScore;

        if (goal.team === homeTeam) {
          currentHomeScore++;
        } else {
          currentAwayScore++;
        }

        // Check if winner was behind just before this goal (i.e., after previous state)
        if (winner === homeTeam && prevHomeScore < prevAwayScore) {
          comebackMoments.push({
            minute: goal.parsedMinute,
            score: `${prevHomeScore}-${prevAwayScore}`,
          });
        } else if (winner === awayTeam && prevAwayScore < prevHomeScore) {
          comebackMoments.push({
            minute: goal.parsedMinute,
            score: `${prevHomeScore}-${prevAwayScore}`,
          });
        }
      }

      // If there were moments where winner was behind, count as comeback
      if (comebackMoments.length > 0) {
        if (!teamStats[winner!]) {
          teamStats[winner!] = {
            comeback_wins: 0,
            matches: [],
          };
        }

        teamStats[winner!].comeback_wins++;
        teamStats[winner!].matches.push({
          match,
          all_goals: [...matchGoals],
          comeback_moments: comebackMoments,
        });
      }
    }

    // --- 6️⃣ Format result ---
    const result = Object.entries(teamStats).map(([team, data]) => ({
      team,
      comeback_wins: data.comeback_wins,
      matches: data.matches,
    }));

    return result;
  },
  { maxAge: 60 * 60 * 24 },
);
