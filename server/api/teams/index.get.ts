import { neon } from "@neondatabase/serverless";

export default defineEventHandler(async () => {
  const { databaseUrl } = useRuntimeConfig();
  const db = neon(databaseUrl);
  return await db`SELECT * FROM teams ORDER BY name`;
});