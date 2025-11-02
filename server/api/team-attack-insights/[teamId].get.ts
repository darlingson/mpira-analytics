// eslint-disable-next-line
// @ts-nocheck

import { neon } from "@neondatabase/serverless";

type RawMatch = Awaited<ReturnType<typeof neon>>[number];
type RawEvent = Awaited<ReturnType<typeof neon>>[number];
interface GoalEvent extends RawEvent {
  parsedMinute: number;
}

/* ---------- helpers ---------- */
const parseMinute = (m: string | null): number => {
  if (!m) return 9999;
  const c = m.replace(/'/g, "");
  if (/^\d+$/.test(c)) return Number(c);
  if (/^\d+\+\d+$/.test(c)) {
    const [b, e] = c.split("+").map(Number);
    return b + e;
  }
  return 9999;
};

export default defineCachedEventHandler(
  async (event) => {
    const sql = neon(useRuntimeConfig().databaseUrl);
    const teamId = Number(getRouterParam(event, "teamId"));
    if (!teamId || teamId < 1)
      throw createError({ statusCode: 400, statusMessage: "teamId missing" });

    const [matches, events, teams] = await Promise.all([
      sql`SELECT * FROM matches;`,
      sql`SELECT * FROM events WHERE type = 'goal';`,
      sql`SELECT id, name FROM teams WHERE id = ${teamId};`,
    ]);
    if (teams.length === 0)
      throw createError({ statusCode: 404, statusMessage: "Team not found" });
    const teamName = teams[0].name as string;

    /* ---------- containers ---------- */
    let fastestGoalMin: number | null = null;
    let latestWinMin: number | null = null;

    const equalizers: Map<
      string,
      {
        count: number;
        matches: { match: RawMatch; goal: GoalEvent; allGoals: GoalEvent[] }[];
      }
    > = new Map();

    let first5Scored = 0;
    let first5Won = 0;
    const first5Matches: {
      match: RawMatch;
      first5Goals: GoalEvent[];
      allGoals: GoalEvent[];
      won: boolean;
    }[] = [];

    /* ---------- goal stream per match ---------- */
    for (const m of matches as RawMatch[]) {
      if (!m.final_score?.includes("-")) continue;
      const [hRaw, aRaw] = m.final_score
        .split("-")
        .map((s) => Number(s.trim()));
      if (isNaN(hRaw) || isNaN(aRaw)) continue;

      const isHome = m.home_team_id === teamId;
      const isAway = m.away_team_id === teamId;
      if (!isHome && !isAway) continue;

      const goals = events
        .filter((e) => e.match_id === m.id)
        .map((e) => ({ ...e, parsedMinute: parseMinute(e.minute) }))
        .sort((a, b) => a.parsedMinute - b.parsedMinute);

      let home = 0,
        away = 0;
      for (const g of goals) {
        const prevHome = home,
          prevAway = away;
        if (g.team === m.home_team) home++;
        else away++;

        /* 1. fastest goal by team */
        if (g.team === teamName) {
          if (fastestGoalMin === null || g.parsedMinute < fastestGoalMin)
            fastestGoalMin = g.parsedMinute;
        }

        /* 2. latest winning goal (team won) */
        const weLead = (isHome && home > away) || (isAway && away > home);
        if (weLead && g.team === teamName) {
          if (latestWinMin === null || g.parsedMinute > latestWinMin)
            latestWinMin = g.parsedMinute;
        }

        /* 3. equalizer: we were behind, now tied */
        const weWereBehind =
          g.team === teamName &&
          (isHome ? prevHome < prevAway : prevAway < prevHome);
        const nowTied = home === away;
        if (weWereBehind && nowTied && g.player) {
          const entry = equalizers.get(g.player) || { count: 0, matches: [] };
          entry.count++;
          entry.matches.push({ match: m, goal: g, allGoals: goals });
          equalizers.set(g.player, entry);
        }
      }

      /* 4. first-5 win rate */
      const scoredFirst5 = goals.filter(
        (g) => g.team === teamName && g.parsedMinute <= 5,
      );
      if (scoredFirst5.length) {
        first5Scored++;
        const weWon = (isHome && hRaw > aRaw) || (isAway && aRaw > hRaw);
        if (weWon) first5Won++;
        first5Matches.push({
          match: m,
          first5Goals: scoredFirst5,
          allGoals: goals,
          won: weWon,
        });
      }
    }

    /* ---------- shape response ---------- */
    return {
      team: { id: teamId, name: teamName },
      fastestGoal: {
        minute: fastestGoalMin,
        matches:
          fastestGoalMin === null
            ? []
            : first5Matches.filter((m) =>
                m.first5Goals.some((g) => g.parsedMinute === fastestGoalMin),
              ),
      },
      latestWinningGoal: {
        minute: latestWinMin,
        matches:
          latestWinMin === null
            ? []
            : first5Matches.filter((m) =>
                m.allGoals.some(
                  (g) => g.team === teamName && g.parsedMinute === latestWinMin,
                ),
              ),
      },
      equalizers: Array.from(equalizers.entries())
        .map(([player, { count, matches }]) => ({ player, count, matches }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      first5WinRate: first5Scored
        ? Number(((first5Won / first5Scored) * 100).toFixed(1))
        : 0,
      first5Scored,
      first5Won,
      first5Matches, // <-- every match where team scored ≤ 5' (with goals & result)
    };
  },
  { maxAge: 60 * 60 * 24 },
);
