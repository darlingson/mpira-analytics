import { neon } from '@neondatabase/serverless';

export default defineCachedEventHandler(
  async (event) => {
    const { databaseUrl } = useRuntimeConfig();
    const db = neon(databaseUrl);

    // Fetch all matches and goal events
    const matches = await db`SELECT * FROM matches;`;
    const events = await db`SELECT * FROM events WHERE type = 'goal';`;

    // Parse minute safely
    const parseMinute = (minute: string | null): number => {
      if (!minute) return 9999;
      const cleaned = minute.replace(/'/g, '');
      if (/^\d+$/.test(cleaned)) return parseInt(cleaned, 10);
      if (/^\d+\+\d+$/.test(cleaned)) {
        const [base, extra] = cleaned.split('+').map(Number);
        return base + extra;
      }
      return 9999;
    };

    // Group goal events by match
    const eventsByMatch = new Map<number, any[]>();
    for (const e of events) {
      const matchId = Number(e.match_id);
      if (!eventsByMatch.has(matchId)) {
        eventsByMatch.set(matchId, []);
      }
      eventsByMatch.get(matchId)!.push({ ...e, parsedMinute: parseMinute(e.minute) });
    }

    // Prepare result: only matches where first scoring team kept clean sheet
    const teamStats: Record<
      string,
      {
        count: number;
        matches: {
          match: any;
          goals: any[];
        }[];
      }
    > = {};

    for (const match of matches) {
      const matchId = Number(match.id);
      const matchGoals = eventsByMatch.get(matchId) || [];

      if (matchGoals.length === 0) continue;

      // Sort by parsed minute to find the first goal
      matchGoals.sort((a, b) => a.parsedMinute - b.parsedMinute);
      const firstGoal = matchGoals[0];
      const firstTeam = firstGoal.team;

      if (!match.final_score || !match.final_score.includes('-')) continue;

      const parts = match.final_score.split('-');
      if (parts.length !== 2) continue;

      const [homeScoreRaw, awayScoreRaw] = parts;
      const homeScore = parseInt(homeScoreRaw.trim(), 10);
      const awayScore = parseInt(awayScoreRaw.trim(), 10);

      let concededGoals: number | null = null;

      if (firstTeam === match.home_team) {
        concededGoals = awayScore;
      } else if (firstTeam === match.away_team) {
        concededGoals = homeScore;
      } else {
        continue; // Invalid team
      }

      // Only care about clean sheet after scoring first
      if (concededGoals !== 0) continue;

      // Add to result
      if (!teamStats[firstTeam]) {
        teamStats[firstTeam] = {
          count: 0,
          matches: [],
        };
      }

      teamStats[firstTeam].count += 1;
      teamStats[firstTeam].matches.push({
        match,
        goals: matchGoals,
      });
    }

    // Format output
    const result = Object.entries(teamStats).map(([team, data]) => ({
      team,
      clean_sheet_after_scoring_first: data.count,
      matches: data.matches,
    }));

    return result;
  },
  {
    maxAge: 60 * 60 * 24, // 24 hours
  }
);
