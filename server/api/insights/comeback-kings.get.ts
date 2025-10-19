import { neon } from '@neondatabase/serverless';

export default defineCachedEventHandler(
  async (event) => {
    const { databaseUrl } = useRuntimeConfig();
    const db = neon(databaseUrl);
    const result = await db`SELECT team, COUNT(*) AS ht_trail_final_win
FROM (
    SELECT m.*,
           split_part(half_time,'-',1)::int AS home_ht,
           split_part(half_time,'-',2)::int AS away_ht
    FROM matches m
) sub,
LATERAL (
    SELECT home_team AS team WHERE home_ht < away_ht AND split_part(final_score,'-',1)::int > split_part(final_score,'-',2)::int
    UNION ALL
    SELECT away_team AS team WHERE away_ht < home_ht AND split_part(final_score,'-',2)::int > split_part(final_score,'-',1)::int
) v
GROUP BY team;`;
    return result;
  },
  {
    maxAge: 60 * 60 * 24,
  }
);