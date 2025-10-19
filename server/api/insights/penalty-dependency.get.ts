import { neon } from '@neondatabase/serverless';

export default defineCachedEventHandler(
  async (event) => {
    const { databaseUrl } = useRuntimeConfig();
    const db = neon(databaseUrl);
    const result = await db`SELECT team,
       COUNT(*) FILTER (WHERE description ILIKE '%penalty%') AS pen_goals,
       COUNT(*) AS total_goals
FROM matches m
JOIN events e ON e.match_id = m.id AND e.type='goal'
GROUP BY team;`;
    return result;
  },
  {
    maxAge: 60 * 60 * 24,
  }
);