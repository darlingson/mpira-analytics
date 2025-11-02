import { neon } from "@neondatabase/serverless";

export default defineEventHandler(async () => {
  const { databaseUrl } = useRuntimeConfig();
  const db = neon(databaseUrl);

  // 🧠 Step 1: Fetch all matches
  const matches = await db`SELECT home_team, away_team FROM matches`;

  // 🧠 Step 2: Build a set of unique team names (Dynamic Programming-style cache)
  const uniqueTeams = new Set<string>();
  for (const match of matches) {
    if (match.home_team) uniqueTeams.add(match.home_team.trim());
    if (match.away_team) uniqueTeams.add(match.away_team.trim());
  }

  // 🧠 Step 3: Fetch existing teams (only names) — acts as our DP memo table
  const existingTeamsRows = await db`SELECT name FROM teams`;
  const existingTeams = new Set(existingTeamsRows.map((t) => t.name));

  // 🧠 Step 4: Filter out already-known teams
  const newTeams = [...uniqueTeams].filter((team) => !existingTeams.has(team));

  // 🧠 Step 5: Insert only new teams
  for (const team of newTeams) {
    await db`
      INSERT INTO teams (name, team_slug, league, home_district, home_stadium)
      VALUES (${team}, ${slugify(team)}, 'Super League', NULL, NULL)
    `;
  }

  return {
    status: "success",
    inserted_count: newTeams.length,
    new_teams: newTeams,
  };
});

/**
 * Simple slugify helper for team names
 */
function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
