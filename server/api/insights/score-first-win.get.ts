import { neon } from '@neondatabase/serverless';

export default defineCachedEventHandler(
  async (event) => {
    const { databaseUrl } = useRuntimeConfig();
    const db = neon(databaseUrl);
    const result = await db`SELECT * FROM matchesSELECT team,
       COUNT(*) FILTER (WHERE fh_goals > 0 AND final_result = 'win')::numeric
       / NULLIF(COUNT(*) FILTER (WHERE fh_goals > 0),0) AS fh_score_win_ratio
FROM (
    SELECT m.*,
           split_part(half_time,'-',1)::int AS home_fh,
           split_part(half_time,'-',2)::int AS away_fh,
           CASE
               WHEN split_part(final_score,'-',1)::int > split_part(final_score,'-',2)::int THEN 'win'
               WHEN split_part(final_score,'-',1)::int < split_part(final_score,'-',2)::int THEN 'loss'
               ELSE 'draw'
           END AS final_result
    FROM matches m
) sub,
LATERAL (VALUES
   (home_team, home_fh),
   (away_team, away_fh)
) v(team,fh_goals)
GROUP BY team;`;
    return result;
  },
  {
    maxAge: 60 * 60 * 24,
  }
);