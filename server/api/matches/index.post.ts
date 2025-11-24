import { neon } from "@neondatabase/serverless";

interface MatchInsertPayload {
  season: string;
  match_date: string;
  home_team: string;
  away_team: string;
  home_team_id: number;
  away_team_id: number;
  final_score?: string;
  half_time?: string;
}

export default defineEventHandler(async (event) => {
  const { databaseUrl } = useRuntimeConfig();
  const db = neon(databaseUrl);

  const body = (await readBody(event)) as MatchInsertPayload;

  const {
    season,
    match_date,
    home_team,
    away_team,
    home_team_id,
    away_team_id,
    final_score = "",
    half_time = "",
  } = body;

  if (!season || !match_date || !home_team || !away_team || !home_team_id || !away_team_id) {
    return { status: "error", message: "Missing required fields" };
  }

  await db`
    INSERT INTO matches (season, match_date, home_team, away_team, home_team_id, away_team_id, final_score, half_time)
    VALUES (${season}, ${match_date}, ${home_team}, ${away_team}, ${home_team_id}, ${away_team_id}, ${final_score}, ${half_time})
  `;

  return {
    status: "success",
    message: "Match created successfully",
    match: { season, match_date, home_team, away_team, home_team_id, away_team_id, final_score, half_time },
  };
});
