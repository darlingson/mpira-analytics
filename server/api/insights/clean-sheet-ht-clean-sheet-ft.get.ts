import { neon } from "@neondatabase/serverless";

export default defineCachedEventHandler(
  async (_) => {
    const { databaseUrl } = useRuntimeConfig();
    const db = neon(databaseUrl);
    const result =
      await db`SELECT team, COUNT(*) FILTER (WHERE fh_conceded=0 AND fh_conceded=final_conceded) AS fh_clean_kept_clean
FROM (
    SELECT m.*,
           split_part(half_time,'-',2)::int AS home_fh_conceded,
           split_part(half_time,'-',1)::int AS away_fh_conceded,
           split_part(final_score,'-',2)::int AS home_final_conceded,
           split_part(final_score,'-',1)::int AS away_final_conceded
    FROM matches m
) sub,
LATERAL (
    VALUES (home_team, home_fh_conceded, home_final_conceded),
           (away_team, away_fh_conceded, away_final_conceded)
) v(team,fh_conceded,final_conceded)
GROUP BY team;`;
    return result;
  },
  {
    maxAge: 60 * 60 * 24,
  },
);
