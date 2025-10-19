import { neon } from '@neondatabase/serverless';

export default defineCachedEventHandler(
  async (event) => {
    const { databaseUrl } = useRuntimeConfig();
    const db = neon(databaseUrl);
    const result = await db`SELECT DISTINCT e.team, COUNT(*) OVER (PARTITION BY e.team) AS card_1h_goal_2h
FROM events e
JOIN matches m ON m.id = e.match_id
WHERE e.type='card' AND e.minute::int <=45
  AND EXISTS (
      SELECT 1
      FROM events e2
      WHERE e2.match_id = m.id
        AND e2.team = e.team
        AND e2.type='goal'
        AND e2.minute::int >45
  );`;
    return result;
  },
  {
    maxAge: 60 * 60 * 24,
  }
);