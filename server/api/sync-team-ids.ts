import { neon } from "@neondatabase/serverless";

export default defineEventHandler(async () => {
  const { databaseUrl } = useRuntimeConfig();
  const db = neon(databaseUrl);

  const teams = await db`SELECT id, name FROM teams`;
  const teamMap: Record<string, number> = {};
  for (const team of teams) {
    teamMap[team.name.trim()] = team.id;
  }

  const matches = await db`SELECT id, home_team, away_team FROM matches`;

  let matchesUpdated = 0;

  for (const match of matches) {
    const homeId = teamMap[match.home_team.trim()];
    const awayId = teamMap[match.away_team.trim()];

    if (!homeId || !awayId) {
      console.warn(`Team not found for match ${match.id}`);
      continue;
    }

    await db`
      UPDATE matches
      SET home_team_id = ${homeId}, away_team_id = ${awayId}
      WHERE id = ${match.id} AND (home_team_id IS NULL OR away_team_id IS NULL)
    `;
    matchesUpdated++;
  }

  const events = await db`SELECT id, team FROM events`;
  let eventsUpdated = 0;

  for (const event of events) {
    const teamId = teamMap[event.team?.trim()];
    if (!teamId) {
      console.warn(`Team not found for event ${event.id}`);
      continue;
    }

    await db`
      UPDATE events
      SET team_id = ${teamId}
      WHERE id = ${event.id} AND team_id IS NULL
    `;
    eventsUpdated++;
  }

  return {
    status: "success",
    matches_updated: matchesUpdated,
    events_updated: eventsUpdated,
  };
});
