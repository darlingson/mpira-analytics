import { neon } from "@neondatabase/serverless";

export default defineCachedEventHandler(
  async (_) => {
    const { databaseUrl } = useRuntimeConfig();
    const db = neon(databaseUrl);

    // --- 1️⃣ Fetch data ---
    const matches = await db`SELECT * FROM matches;`;
    const cardEvents = await db`SELECT * FROM events WHERE type = 'card';`;
    const goalEvents = await db`SELECT * FROM events WHERE type = 'goal';`;

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

    // --- 3️⃣ Group cards and goals by match and team ---
    // eslint-disable-next-line
    const cardsByMatchTeam = new Map<number, Map<string, any[]>>();
    for (const e of cardEvents) {
      const matchId = Number(e.match_id);
      const team = e.team;
      if (!cardsByMatchTeam.has(matchId)) {
        cardsByMatchTeam.set(matchId, new Map());
      }
      const teamMap = cardsByMatchTeam.get(matchId)!;
      if (!teamMap.has(team)) {
        teamMap.set(team, []);
      }
      teamMap.get(team)!.push({
        ...e,
        parsedMinute: parseMinute(e.minute),
      });
    }

    // eslint-disable-next-line
    const goalsByMatchTeam = new Map<number, Map<string, any[]>>();
    for (const e of goalEvents) {
      const matchId = Number(e.match_id);
      const team = e.team;
      if (!goalsByMatchTeam.has(matchId)) {
        goalsByMatchTeam.set(matchId, new Map());
      }
      const teamMap = goalsByMatchTeam.get(matchId)!;
      if (!teamMap.has(team)) {
        teamMap.set(team, []);
      }
      teamMap.get(team)!.push({
        ...e,
        parsedMinute: parseMinute(e.minute),
      });
    }

    // --- 4️⃣ Stats container ---
    const teamStats: Record<
      string,
      {
        card_1h_goal_2h: number;
        matches: {
          // eslint-disable-next-line
          match: any;
          // eslint-disable-next-line
          first_half_cards: any[];
          // eslint-disable-next-line
          second_half_goals: any[];
        }[];
      }
    > = {};

    // --- 5️⃣ Process each match ---
    for (const match of matches) {
      const matchId = Number(match.id);
      const cardsForMatch = cardsByMatchTeam.get(matchId) || new Map();
      const goalsForMatch = goalsByMatchTeam.get(matchId) || new Map();

      const homeTeam = match.home_team;
      const awayTeam = match.away_team;

      // Check for home team
      const homeCards = cardsForMatch.get(homeTeam) || [];
      // eslint-disable-next-line
      const home1hCards = homeCards.filter((c: any) => c.parsedMinute <= 45);
      const homeGoals = goalsForMatch.get(homeTeam) || [];
      // eslint-disable-next-line
      const home2hGoals = homeGoals.filter((g: any) => g.parsedMinute > 45);

      if (home1hCards.length > 0 && home2hGoals.length > 0) {
        if (!teamStats[homeTeam]) {
          teamStats[homeTeam] = {
            card_1h_goal_2h: 0,
            matches: [],
          };
        }
        teamStats[homeTeam].card_1h_goal_2h++;
        teamStats[homeTeam].matches.push({
          match,
          first_half_cards: [...home1hCards],
          second_half_goals: [...home2hGoals],
        });
      }

      // Check for away team
      const awayCards = cardsForMatch.get(awayTeam) || [];
      // eslint-disable-next-line
      const away1hCards = awayCards.filter((c: any) => c.parsedMinute <= 45);
      const awayGoals = goalsForMatch.get(awayTeam) || [];
      // eslint-disable-next-line
      const away2hGoals = awayGoals.filter((g: any) => g.parsedMinute > 45);

      if (away1hCards.length > 0 && away2hGoals.length > 0) {
        if (!teamStats[awayTeam]) {
          teamStats[awayTeam] = {
            card_1h_goal_2h: 0,
            matches: [],
          };
        }
        teamStats[awayTeam].card_1h_goal_2h++;
        teamStats[awayTeam].matches.push({
          match,
          first_half_cards: [...away1hCards],
          second_half_goals: [...away2hGoals],
        });
      }
    }

    // --- 6️⃣ Format result ---
    const result = Object.entries(teamStats).map(([team, data]) => ({
      team,
      card_1h_goal_2h: data.card_1h_goal_2h,
      matches: data.matches,
    }));

    return result;
  },
  { maxAge: 60 * 60 * 24 },
);
