import { neon } from '@neondatabase/serverless';

export default defineCachedEventHandler(async (event) => {
  const { databaseUrl } = useRuntimeConfig();
  const db = neon(databaseUrl);

  const season = getQuery(event).season;
  const matches = await db`SELECT id FROM matches ${season ? db`WHERE season = ${season}` : db``}`;
  const matchIds = matches.map(m => m.id);

  const events = await db`SELECT * FROM events WHERE type = 'goal' AND player IS NOT NULL`;
  const filteredEvents = events.filter(e => matchIds.includes(e.match_id));

  const playerGoals: Record<string, { team: string, goals: number }> = {};
  for (const e of filteredEvents) {
    if (!playerGoals[e.player]) {
      playerGoals[e.player] = { team: e.team, goals: 0 };
    }
    playerGoals[e.player].goals += 1;
  }

  return Object.entries(playerGoals)
    .map(([player, { team, goals }]) => ({ player, team, goals }))
    .sort((a, b) => b.goals - a.goals);
}, {
  maxAge: 60 * 60 * 24,
});
