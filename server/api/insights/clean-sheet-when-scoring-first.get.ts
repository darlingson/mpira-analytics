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

    // Group events by match_id
    const eventsByMatch = new Map<number, any[]>();
    for (const e of events) {
      const matchId = Number(e.match_id);
      if (!eventsByMatch.has(matchId)) {
        eventsByMatch.set(matchId, []);
      }
      eventsByMatch.get(matchId)!.push({ ...e, parsedMinute: parseMinute(e.minute) });
    }

    // Compute per-team data
    const teamStats: Record<
      string,
      {
        scored_first: number;
        scored_first_and_clean: number;
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

      // Sort to find first goal
      matchGoals.sort((a, b) => a.parsedMinute - b.parsedMinute);
      const firstGoal = matchGoals[0];
      const firstTeam = firstGoal.team;

      // Validate final score
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
        continue;
      }

      // Initialize team stats
      if (!teamStats[firstTeam]) {
        teamStats[firstTeam] = {
          scored_first: 0,
          scored_first_and_clean: 0,
          matches: [],
        };
      }

      teamStats[firstTeam].scored_first += 1;

      if (concededGoals === 0) {
        teamStats[firstTeam].scored_first_and_clean += 1;
      }

      teamStats[firstTeam].matches.push({
        match,
        goals: matchGoals,
      });
    }

    // Return result
    const result = Object.entries(teamStats).map(([team, data]) => ({
      team,
      scored_first: data.scored_first,
      scored_first_and_clean: data.scored_first_and_clean,
      matches: data.matches,
    }));

    return result;
  },
  {
    maxAge: 60 * 60 * 24, // cache for 24 hours
  }
);
