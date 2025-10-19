import { neon } from '@neondatabase/serverless';

export default defineCachedEventHandler(
  async (event) => {
    const { databaseUrl } = useRuntimeConfig();
    const db = neon(databaseUrl);
    const result = await db`SELECT team,
       COUNT(*) FILTER (WHERE scored_first=1) AS scored_first,
       COUNT(*) FILTER (WHERE scored_first=1 AND final_conceded=0) AS scored_first_and_clean
FROM (
    SELECT m.*,
           split_part(final_score,'-',2)::int AS home_final_conceded,
           split_part(final_score,'-',1)::int AS away_final_conceded,
           ROW_NUMBER() OVER (PARTITION BY m.id ORDER BY e.minute::int) AS first_goal,
           e.team
    FROM matches m
    JOIN events e ON e.match_id = m.id AND e.type='goal'
) t,
LATERAL (
    VALUES (home_team, home_final_conceded),
           (away_team, away_final_conceded)
) v(team,final_conceded)
WHERE (team = e.team AND first_goal = 1)
GROUP BY team;`;
    return result;
  },
  {
    maxAge: 60 * 60 * 24,
  }
);