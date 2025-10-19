import { neon } from '@neondatabase/serverless';

export default defineCachedEventHandler(async (event) => {
  const { databaseUrl } = useRuntimeConfig();
  const db = neon(databaseUrl);

  // 1. Fetch all matches
  const matches = await db`SELECT * FROM matches;`;

  // 2. Fetch all goal events
  const events = await db`SELECT * FROM events WHERE type = 'goal';`;

  // Helper to parse minute string to number
  const parseMinute = (minuteStr: string | null): number => {
    if (!minuteStr) return 9999;

    const cleaned = minuteStr.replace(/'/g, '');
    if (/^\d+$/.test(cleaned)) return parseInt(cleaned, 10);

    if (/^\d+\+\d+$/.test(cleaned)) {
      const [base, extra] = cleaned.split('+').map(Number);
      return base + extra;
    }

    return 9999; // for "LIVE", "HT", etc.
  };

  // Group events by match_id
  const eventsByMatch = events.reduce((acc, event) => {
    if (!acc[event.match_id]) acc[event.match_id] = [];
    acc[event.match_id].push(event);
    return acc;
  }, {} as Record<number, typeof events>);

  // Map matches by id for easy lookup
  const matchesById = Object.fromEntries(matches.map((m) => [m.id, m]));

  // For each match, find the first goal event (lowest minute)
  // Then check if the team that scored first lost the match
  const heartbreaks: Record<
    string,
    {
      scored_first_but_lost: number;
      matches: {
        match: typeof matches[0];
        goals: typeof events;
        first_goal_team: string;
      }[];
    }
  > = {};

  for (const match of matches) {
    const matchGoals = eventsByMatch[match.id] || [];

    if (matchGoals.length === 0) continue;

    // Sort goals by parsed minute
    matchGoals.sort((a:any, b:any) => parseMinute(a.minute) - parseMinute(b.minute));

    const firstGoal = matchGoals[0];
    const firstGoalTeam = firstGoal.team;

    if (!match.final_score || !firstGoalTeam) continue;

    const [homeScore, awayScore] = match.final_score
      .split('-')
      .map((s:any) => parseInt(s.trim(), 10));

    // Determine if first scoring team lost
    const firstTeamLost =
      (firstGoalTeam === match.home_team && homeScore < awayScore) ||
      (firstGoalTeam === match.away_team && awayScore < homeScore);

    if (firstTeamLost) {
      if (!heartbreaks[firstGoalTeam]) {
        heartbreaks[firstGoalTeam] = {
          scored_first_but_lost: 0,
          matches: [],
        };
      }

      heartbreaks[firstGoalTeam].scored_first_but_lost += 1;
      heartbreaks[firstGoalTeam].matches.push({
        match,        // full match object exactly as is
        goals: matchGoals,  // all goal events exactly as is
        first_goal_team: firstGoalTeam,
      });
    }
  }

  // Return heartbreak object with full matches and goal events
  return Object.entries(heartbreaks).map(([team, data]) => ({
    team,
    scored_first_but_lost: data.scored_first_but_lost,
    matches: data.matches,
  }));
}, {
  maxAge: 60 * 60 * 24,
});
