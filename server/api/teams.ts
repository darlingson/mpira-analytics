import { neon } from "@neondatabase/serverless";

export default defineEventHandler(async () => {
  const { databaseUrl } = useRuntimeConfig();
  const db = neon(databaseUrl);

  const teams = await db`
    SELECT id, name, team_slug, league, home_district, home_stadium
    FROM teams
    ORDER BY name
  `;

  return teams.map((team) => ({
    id: team.id,
    name: team.name,
    slug: team.team_slug,
    league: team.league,
    district: team.home_district || "Unknown",
    stadium: team.home_stadium || "Unknown",
    icon: "i-heroicons-shield-check",
  }));
});
