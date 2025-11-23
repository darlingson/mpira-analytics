import { neon } from "@neondatabase/serverless";

export default defineEventHandler(async (event) => {
  const { databaseUrl } = useRuntimeConfig();
  const db = neon(databaseUrl);
  const body = await readBody(event);

  const { season, match_date, home_team, away_team, final_score, half_time } = body;

  await db`
    INSERT INTO matches (season, match_date, home_team, away_team, final_score, half_time)
    VALUES (${season}, ${match_date}, ${home_team}, ${away_team}, ${final_score}, ${half_time})
  `;

  return { status: "success", message: "Match created" };
});