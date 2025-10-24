import { neon } from "@neondatabase/serverless";

export default defineCachedEventHandler(
  async (_) => {
    const { databaseUrl } = useRuntimeConfig();
    const db = neon(databaseUrl);

    // --- 1️⃣ Fetch data (explicit columns for safety/debugging) ---
    const matches =
      await db`SELECT id, home_team, away_team, final_score FROM matches;`;
    const events =
      await db`SELECT id, match_id, type, minute, team, player FROM events WHERE type = 'goal';`;

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
        points_swung_after75: number;
        matches: {
          // eslint-disable-next-line
          match: any;
          // eslint-disable-next-line
          all_goals: any[];
          // eslint-disable-next-line
          early_goals: any[];
          // eslint-disable-next-line
          late_goals: any[];
          hypo_score: string;
          actual_score: string;
          swing: number;
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

      // Actual points (full result, including draws)
      const actual_home_points =
        homeScore > awayScore ? 3 : homeScore === awayScore ? 1 : 0;
      const actual_away_points =
        awayScore > homeScore ? 3 : homeScore === awayScore ? 1 : 0;

      // Sort goals by time
      matchGoals.sort((a, b) => a.parsedMinute - b.parsedMinute);

      // Early and late goals
      const earlyGoals = matchGoals.filter((g) => g.parsedMinute < 75);
      const lateGoals = matchGoals.filter((g) => g.parsedMinute >= 75);

      if (lateGoals.length === 0) continue; // No late drama

      // Early scores (hypothetical without late goals)
      const early_home_count = earlyGoals.filter(
        (g) => g.team === homeTeam,
      ).length;
      const early_away_count = earlyGoals.filter(
        (g) => g.team === awayTeam,
      ).length; // More precise than length - home_count

      // Hypothetical points without late goals
      const hypo_home_win = early_home_count > early_away_count;
      const hypo_draw = early_home_count === early_away_count;
      const hypo_home_points = hypo_home_win ? 3 : hypo_draw ? 1 : 0;
      const hypo_away_points = hypo_home_win ? 0 : hypo_draw ? 1 : 3;

      // Swings due to late goals
      const swing_home = actual_home_points - hypo_home_points;
      const swing_away = actual_away_points - hypo_away_points;

      const commonData = {
        match,
        all_goals: [...matchGoals.map((g) => ({ ...g }))], // Deep-ish copy
        early_goals: earlyGoals.map((g) => ({ ...g })),
        late_goals: lateGoals.map((g) => ({ ...g })),
        hypo_score: `${early_home_count}-${early_away_count}`,
        actual_score: `${homeScore}-${awayScore}`,
      };

      // Update home team
      if (!teamStats[homeTeam]) {
        teamStats[homeTeam] = {
          points_swung_after75: 0,
          matches: [],
        };
      }
      teamStats[homeTeam].points_swung_after75 += swing_home;
      teamStats[homeTeam].matches.push({
        ...commonData,
        swing: swing_home,
      });

      // Update away team
      if (!teamStats[awayTeam]) {
        teamStats[awayTeam] = {
          points_swung_after75: 0,
          matches: [],
        };
      }
      teamStats[awayTeam].points_swung_after75 += swing_away;
      teamStats[awayTeam].matches.push({
        ...commonData,
        swing: swing_away,
      });
    }

    // --- 6️⃣ Format result ---
    const result = Object.entries(teamStats).map(([team, data]) => ({
      team,
      points_swung_after75: data.points_swung_after75,
      matches: data.matches,
    }));

    return result;
  },
  { maxAge: 60 * 60 * 24 },
);
