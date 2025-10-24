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

    // --- 4️⃣ Player equalizer stats ---
    const playerStats: Record<
      string,
      {
        equalizers: number;
        matches: {
          // eslint-disable-next-line
          match: any;
          // eslint-disable-next-line
          equalizer_goal: any;
          // eslint-disable-next-line
          all_goals: any[];
        }[];
      }
    > = {};

    // --- 5️⃣ Process each match for equalizers ---
    for (const match of matches) {
      const matchId = Number(match.id);
      const matchGoals = eventsByMatch.get(matchId) || [];

      if (matchGoals.length === 0) continue;

      // Sort goals by time
      matchGoals.sort((a, b) => a.parsedMinute - b.parsedMinute);

      const homeTeam = match.home_team;
      // eslint-disable-next-line
      const awayTeam = match.away_team;

      let homeScore = 0;
      let awayScore = 0;

      for (const goal of matchGoals) {
        const scoringTeam = goal.team;
        const isHomeGoal = scoringTeam === homeTeam;

        // Score before this goal
        const prevHomeScore = homeScore;
        const prevAwayScore = awayScore;

        // Update score
        if (isHomeGoal) {
          homeScore++;
        } else {
          awayScore++;
        }

        // Check if this goal is an equalizer: scoring team was behind, now tied
        const wasBehind = isHomeGoal
          ? prevHomeScore < prevAwayScore
          : prevAwayScore < prevHomeScore;
        const nowTied = homeScore === awayScore;

        if (wasBehind && nowTied) {
          const player = goal.player; // Assuming 'player' column exists in events
          if (player) {
            if (!playerStats[player]) {
              playerStats[player] = {
                equalizers: 0,
                matches: [],
              };
            }
            playerStats[player].equalizers++;
            playerStats[player].matches.push({
              match,
              equalizer_goal: goal,
              all_goals: [...matchGoals], // shallow copy to avoid reference issues
            });
          }
        }
      }
    }

    // --- 6️⃣ Format result: top players by equalizers ---
    const result = Object.entries(playerStats)
      .map(([player, data]) => ({
        player,
        equalizers: data.equalizers,
        matches: data.matches,
      }))
      .sort((a, b) => b.equalizers - a.equalizers);

    return result;
  },
  { maxAge: 60 * 60 * 24 },
);
