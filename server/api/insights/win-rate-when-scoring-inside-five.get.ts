import { neon } from '@neondatabase/serverless';

export default defineCachedEventHandler(
    async (event) => {
        const { databaseUrl } = useRuntimeConfig();
        const db = neon(databaseUrl);
        const result = await db`SELECT team,
       COUNT(*) FILTER (WHERE minute::int <=5) AS scored_first5,
       COUNT(*) FILTER (WHERE minute::int <=5 AND
                         ((team = home_team AND split_part(final_score,'-',1)::int > split_part(final_score,'-',2)::int) OR
                          (team = away_team AND split_part(final_score,'-',2)::int > split_part(final_score,'-',1)::int))) AS first5_and_win
FROM events e
JOIN matches m ON m.id = e.match_id
WHERE e.type='goal'
GROUP BY team;`;
        return result;
    },
    {
        maxAge: 60 * 60 * 24,
    }
);