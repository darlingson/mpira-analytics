import { neon } from "@neondatabase/serverless";

export default defineEventHandler(async (event) => {
  const { databaseUrl } = useRuntimeConfig();
  const db = neon(databaseUrl);
  const body = await readBody(event);

  const { name, team_slug, league, home_district, home_stadium } = body;

  await db`
    INSERT INTO teams (name, team_slug, league, home_district, home_stadium)
    VALUES (${name}, ${team_slug}, ${league}, ${home_district}, ${home_stadium})
  `;

  return { status: "success", message: "Team added" };
});