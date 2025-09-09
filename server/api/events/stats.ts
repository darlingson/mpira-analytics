import { neon } from '@neondatabase/serverless';

export default defineCachedEventHandler(async () => {
  const { databaseUrl } = useRuntimeConfig();
  const db = neon(databaseUrl);

  const matches = await db`SELECT * FROM matches`;
  const events = await db`SELECT * FROM events`;

  const typeCount: Record<string, number> = {};
  const teamDiscipline: Record<string, { yellow_cards: number, red_cards: number }> = {};

  for (const event of events) {
    typeCount[event.type] = (typeCount[event.type] || 0) + 1;

    if (event.type === 'yellow_card' || event.type === 'red_card') {
      if (!teamDiscipline[event.team]) {
        teamDiscipline[event.team] = { yellow_cards: 0, red_cards: 0 };
      }
      if (event.type === 'yellow_card') {
        teamDiscipline[event.team].yellow_cards += 1;
      } else {
        teamDiscipline[event.team].red_cards += 1;
      }
    }
  }

  const averageEventsPerMatch = parseFloat((events.length / matches.length).toFixed(2));

  return {
    event_counts: typeCount,
    average_events_per_match: averageEventsPerMatch,
    discipline_per_team: Object.entries(teamDiscipline).map(([team, data]) => ({ team, ...data })),
  };
}, {
  maxAge: 60 * 60 * 24,
});
