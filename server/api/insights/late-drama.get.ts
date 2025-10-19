import { neon } from '@neondatabase/serverless';

export default defineCachedEventHandler(
  async (event) => {
    const { databaseUrl } = useRuntimeConfig();
    const db = neon(databaseUrl);
    const result = await db`SELECT team,
       SUM(CASE WHEN scorer = team THEN 1 ELSE -1 END) AS points_swung_after75
FROM (
    SELECT m.*,
           e.team AS scorer,
           e.minute::int AS min,
           CASE
               WHEN e.team = home_team THEN
                   CASE WHEN split_part(final_score,'-',1)::int > split_part(final_score,'-',2)::int THEN 3 ELSE 0 END
               ELSE
                   CASE WHEN split_part(final_score,'-',2)::int > split_part(final_score,'-',1)::int THEN 3 ELSE 0 END
           END AS points
    FROM matches m
    JOIN events e ON e.match_id = m.id AND e.type='goal' AND e.minute::int >=75
) t
GROUP BY team;`;
    return result;
  },
  {
    maxAge: 60 * 60 * 24,
  }
);