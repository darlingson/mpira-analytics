import { neon } from "@neondatabase/serverless";

export default defineCachedEventHandler(
  async (_) => {
    const { databaseUrl } = useRuntimeConfig();
    const db = neon(databaseUrl);

    const matches = await db`SELECT * FROM matches;`;

    const safeSplitScore = (
      score: string | null,
    ): [number | null, number | null] => {
      if (!score || !score.includes("-")) return [null, null];
      const parts = score.replace("–", "-").split("-");
      if (parts.length !== 2) return [null, null];
      const home = parseInt(parts[0].trim(), 10);
      const away = parseInt(parts[1].trim(), 10);
      return [
        Number.isFinite(home) ? home : null,
        Number.isFinite(away) ? away : null,
      ];
    };

    const teamStats: Record<
      string,
      {
        games_with_fh_goals: number;
        games_won_after_fh_goal: number;
        matches: {
          // eslint-disable-next-line
          match: any;
          home_fh: number | null;
          away_fh: number | null;
          final_result: string;
        }[];
      }
    > = {};

    for (const match of matches) {
      const [home_fh, away_fh] = safeSplitScore(match.half_time);
      const [home_final, away_final] = safeSplitScore(match.final_score);

      if (
        home_fh == null ||
        away_fh == null ||
        home_final == null ||
        away_final == null
      )
        continue;

      let home_result = "draw";
      if (home_final > away_final) home_result = "win";
      else if (home_final < away_final) home_result = "loss";

      const addStat = (team: string, fh_goals: number, result: string) => {
        if (!team) return;
        if (!teamStats[team]) {
          teamStats[team] = {
            games_with_fh_goals: 0,
            games_won_after_fh_goal: 0,
            matches: [],
          };
        }

        if (fh_goals > 0) {
          teamStats[team].games_with_fh_goals++;
          if (result === "win") teamStats[team].games_won_after_fh_goal++;
          teamStats[team].matches.push({
            match,
            home_fh,
            away_fh,
            final_result: result,
          });
        }
      };

      addStat(match.home_team, home_fh, home_result);

      const away_result =
        home_result === "win"
          ? "loss"
          : home_result === "loss"
            ? "win"
            : "draw";
      addStat(match.away_team, away_fh, away_result);
    }

    const result = Object.entries(teamStats).map(([team, data]) => ({
      team,
      games_with_fh_goals: data.games_with_fh_goals,
      games_won_after_fh_goal: data.games_won_after_fh_goal,
      fh_score_win_ratio:
        data.games_with_fh_goals > 0
          ? Number(
              (
                (data.games_won_after_fh_goal / data.games_with_fh_goals) *
                100
              ).toFixed(1),
            )
          : 0,
      matches: data.matches,
    }));

    return result;
  },
  { maxAge: 60 * 60 * 24 },
);
