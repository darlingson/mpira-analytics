import { neon } from '@neondatabase/serverless';

export default defineCachedEventHandler(
  async (event) => {
    const { databaseUrl } = useRuntimeConfig();
    const db = neon(databaseUrl);
    const result = await db`SELECT * FROM events`;
    return result;
  },
  {
    maxAge: 60 * 60 * 24,
  }
);