import { neon } from '@neondatabase/serverless';

export default defineCachedEventHandler(
  async (event) => {
    const { databaseUrl } = useRuntimeConfig();
    const db = neon(databaseUrl);
    const result = await db`SELECT team, MAX(minute::int) AS latest_winner
FROM (
    SELECT e.*, m.final_score,
           LAG(score_at_event) OVER (PARTITION BY m.id ORDER BY minute::int) AS prev_score
    FROM events e
    JOIN matches m ON m.id = e.match_id
    WHERE e.type='goal'
) t
WHERE prev_score LIKE '%-%' AND score_at_event NOT LIKE '%-%'
  AND ((team = home_team AND split_part(final_score,'-',1)::int > split_part(final_score,'-',2)::int) OR
       (team = away_team AND split_part(final_score,'-',2)::int > split_part(final_score,'-',1)::int))
GROUP BY team;`;
    return result;
  },
  {
    maxAge: 60 * 60 * 24,
  }
);