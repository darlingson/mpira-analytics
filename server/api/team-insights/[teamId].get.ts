import { neon } from "@neondatabase/serverless";

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
    const teamName = teams[0].name;
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
    // eslint-disable-next-line
    const goalsByMatch = new Map<number, any[]>();
    for (const e of events) {
      const mid = Number(e.match_id);
      if (!goalsByMatch.has(mid)) goalsByMatch.set(mid, []);
      goalsByMatch
        .get(mid)!
        .push({ ...e, parsedMinute: parseMinute(e.minute) });
    }

    // eslint-disable-next-line
    const comeback = { count: 0, matches: [] as any[] };
    // eslint-disable-next-line
    const firstWon = { count: 0, matches: [] as any[] };
    // eslint-disable-next-line
    const firstLost = { count: 0, matches: [] as any[] };
    // eslint-disable-next-line
    const clean = { count: 0, matches: [] as any[] };

    for (const m of matches) {
      if (!m.final_score || !m.final_score.includes("-")) continue;
      const [hRaw, aRaw] = m.final_score
        .split("-")
        .map((s: string) => Number(s.trim()));
      if (isNaN(hRaw) || isNaN(aRaw)) continue;

      const isHome = m.home_team_id === teamId;
      const isAway = m.away_team_id === teamId;
      if (!isHome && !isAway) continue;

      const goals = (goalsByMatch.get(Number(m.id)) || []).sort(
        (x, y) => x.parsedMinute - y.parsedMinute,
      );

      const conceded = isHome ? aRaw : hRaw;
      if (conceded === 0) {
        clean.count++;
        clean.matches.push({
          match: m,
          goals,
        });
      }

      if (hRaw === aRaw) continue;

      const winner = hRaw > aRaw ? m.home_team : m.away_team;
      const _ = hRaw > aRaw ? m.away_team : m.home_team;
      const weWon = winner === teamName;

      if (weWon && goals.length) {
        let home = 0,
          away = 0;
        const moments: { minute: number; score: string }[] = [];
        for (const g of goals) {
          const prevHome = home,
            prevAway = away;
          if (g.team === m.home_team) home++;
          else away++;

          if (
            (isHome && prevHome < prevAway) ||
            (isAway && prevAway < prevHome)
          ) {
            moments.push({
              minute: g.parsedMinute,
              score: `${prevHome}-${prevAway}`,
            });
          }
        }
        if (moments.length) {
          comeback.count++;
          comeback.matches.push({
            match: m,
            goals,
            comeback_moments: moments,
          });
        }
      }

      if (goals.length) {
        const first = goals[0];
        if (first.team === teamName) {
          if (weWon) {
            firstWon.count++;
            firstWon.matches.push({ match: m, goals, first_goal: first });
          } else {
            firstLost.count++;
            firstLost.matches.push({ match: m, goals, first_goal: first });
          }
        }
      }
    }

    return {
      team: { id: teamId, name: teamName },
      comeback_wins: comeback,
      scored_first_and_won: firstWon,
      scored_first_and_lost: firstLost,
      clean_sheets: clean,
    };
  },
  { maxAge: 60 * 60 * 24 },
);
