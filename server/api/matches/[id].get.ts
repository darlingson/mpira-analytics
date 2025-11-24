import { neon } from '@neondatabase/serverless';

export default defineCachedEventHandler(
    async (event) => {
        const { databaseUrl } = useRuntimeConfig();
        const db = neon(databaseUrl);
        const matchId = getRouterParam(event, 'id')
        const matchInfo = await db`SELECT * FROM matches where id = ${matchId} LIMIT 10`;
        const events = await db`SELECT * FROM events where match_id = ${matchId}`;
        const match = {matchInfo, events}
        return match;
    },
    {
        maxAge: 60 * 60 * 24,
    }
);