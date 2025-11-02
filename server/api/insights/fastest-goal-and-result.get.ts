import { neon } from "@neondatabase/serverless";

export default defineCachedEventHandler(
  async (_) => {
    const { databaseUrl } = useRuntimeConfig();
    const db = neon(databaseUrl);
    const result =
      await db`SELECT team, MIN(minute::int) AS fastest_goal_seconds,
       FIRST_VALUE(final_result) OVER (PARTITION BY team ORDER BY minute::int) AS match_result
FROM (
    SELECT m.*, e.team, e.minute,
           CASE
               WHEN (e.team = home_team AND split_part(final_score,'-',1)::int > split_part(final_score,'-',2)::int) OR
                    (e.team = away_team AND split_part(final_score,'-',2)::int > split_part(final_score,'-',1)::int)
               THEN 'win'
               ELSE 'no-win'
           END AS final_result
    FROM matches m
    JOIN events e ON e.match_id = m.id AND e.type='goal'
) t
GROUP BY team;`;
    return result;
  },
  {
    maxAge: 60 * 60 * 24,
  },
);
