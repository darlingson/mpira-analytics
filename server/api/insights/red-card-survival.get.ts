import { neon } from '@neondatabase/serverless';

export default defineCachedEventHandler(
  async (event) => {
    const { databaseUrl } = useRuntimeConfig();
    const db = neon(databaseUrl);
    const result = await db`SELECT e.team, COUNT(*) FILTER (WHERE final_result != 'loss') AS red_but_not_lost
FROM matches m
JOIN events e ON e.match_id = m.id AND e.type='red_card' AND e.description ILIKE '%red%'
JOIN LATERAL (
    SELECT CASE
        WHEN e.team = home_team AND split_part(final_score,'-',1)::int > split_part(final_score,'-',2)::int THEN 'win'
        WHEN e.team = away_team AND split_part(final_score,'-',2)::int > split_part(final_score,'-',1)::int THEN 'win'
        WHEN split_part(final_score,'-',1)::int = split_part(final_score,'-',2)::int THEN 'draw'
        ELSE 'loss'
    END AS final_result
) r ON true
GROUP BY e.team;`;
    return result;
  },
  {
    maxAge: 60 * 60 * 24,
  }
);