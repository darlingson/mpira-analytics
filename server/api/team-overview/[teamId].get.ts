// eslint-disable-next-line
// @ts-nocheck

import { neon } from "@neondatabase/serverless";

type RawMatch = Awaited<ReturnType<typeof neon>>[number];
type RawEvent = Awaited<ReturnType<typeof neon>>[number];
interface GoalEvent extends RawEvent {
  parsedMinute: number;
}

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

    const goalsByMatch = new Map<number, GoalEvent[]>();
    for (const e of events) {
      const mid = Number(e.match_id);
      if (!goalsByMatch.has(mid)) goalsByMatch.set(mid, []);
      goalsByMatch
        .get(mid)!
        .push({ ...e, parsedMinute: parseMinute(e.minute) });
    }

    /* ---------- containers ---------- */
    let goalsFor = 0;
    let goalsAgainst = 0;
    let biggestWin: {
      score: string;
      opponent: string;
      match: RawMatch;
    } | null = null;
    const scorerMap = new Map<string, number>();
    const highScoring: { match: RawMatch; scored: number; conceded: number }[] =
      [];

    /* ---------- loop ---------- */
    for (const m of matches as RawMatch[]) {
      if (!m.final_score || !m.final_score.includes("-")) continue;
      const [hStr, aStr] = m.final_score.split("-").map((s) => s.trim());
      const h = Number(hStr);
      const a = Number(aStr);
      if (isNaN(h) || isNaN(a)) continue;

      const isHome = m.home_team_id === teamId;
      const isAway = m.away_team_id === teamId;
      if (!isHome && !isAway) continue;

      const goals = goalsByMatch.get(Number(m.id)) || [];
      const scored = isHome
        ? goals.filter((g) => g.team === m.home_team).length
        : goals.filter((g) => g.team === m.away_team).length;
      const conceded = isHome ? a : h;

      goalsFor += scored;
      goalsAgainst += conceded;

      /* ---- top scorers ---- */
      goals
        .filter((g) => g.team === teamName && g.player)
        .forEach((g) =>
          scorerMap.set(g.player, (scorerMap.get(g.player) || 0) + 1),
        );

      /* ---- biggest win ---- */
      const winMargin = isHome ? h - a : a - h;
      if (winMargin > 0) {
        if (
          !biggestWin ||
          winMargin >
            Number(biggestWin.score.split("-")[0]) -
              Number(biggestWin.score.split("-")[1])
        ) {
          biggestWin = {
            score: `${scored}-${conceded}`,
            opponent: isHome ? m.away_team : m.home_team,
            match: m,
          };
        }
      }

      /* ---- high-scoring affairs (≥ 3 goals scored) ---- */
      if (scored >= 3) {
        highScoring.push({ match: m, scored, conceded });
      }
    }

    const matchesPlayed = matches.filter(
      (m) => m.home_team_id === teamId || m.away_team_id === teamId,
    ).length;

    const topScorers = Array.from(scorerMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, goals]) => ({ name, goals }));

    return {
      team: { id: teamId, name: teamName },
      matchesPlayed,
      goalsFor,
      goalsAgainst,
      goalsPerMatch: matchesPlayed
        ? Number((goalsFor / matchesPlayed).toFixed(2))
        : 0,
      topScorers,
      biggestWin,
      highScoringMatches: highScoring
        .sort((a, b) => b.scored - a.scored)
        .slice(0, 4),
    };
  },
  { maxAge: 60 * 60 * 24 },
);
