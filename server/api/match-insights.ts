import { neon } from '@neondatabase/serverless';

export default defineCachedEventHandler(async () => {
  const { databaseUrl } = useRuntimeConfig();
  const db = neon(databaseUrl);

  const matches = await db`SELECT * FROM matches`;
  const events = await db`SELECT * FROM events`;

  const result = matches.map((match) => {
    const matchEvents = events.filter(e => e.match_id === match.id);

    const goals = matchEvents.filter(e => e.type === 'goal');
    const totalEvents = matchEvents.length;

    const halfTimeScore = match.half_time.split('-').map(Number);
    const fullTimeScore = match.final_score.split('-').map(Number);

    const goalDifference = Math.abs(fullTimeScore[0] - fullTimeScore[1]);
    const comeback = (
      (halfTimeScore[0] > halfTimeScore[1] && fullTimeScore[0] < fullTimeScore[1]) ||
      (halfTimeScore[1] > halfTimeScore[0] && fullTimeScore[1] < fullTimeScore[0])
    );

    const resultChanged = (
      (halfTimeScore[0] > halfTimeScore[1] && fullTimeScore[0] <= fullTimeScore[1]) ||
      (halfTimeScore[0] < halfTimeScore[1] && fullTimeScore[0] >= fullTimeScore[1])
    );

    const minutes = matchEvents.map(e => parseInt(e.minute.replace("'", ""))).filter(Boolean);
    const duration = minutes.length > 0 ? Math.max(...minutes) : 90;
    const eventsPerMinute = totalEvents / duration;

    return {
      match_id: match.id,
      home_team: match.home_team,
      away_team: match.away_team,
      final_score: match.final_score,
      half_time: match.half_time,
      goal_difference: goalDifference,
      comeback,
      result_changed: resultChanged,
      total_events: totalEvents,
      events_per_minute: parseFloat(eventsPerMinute.toFixed(2)),
    };
  });

  return result;
}, {
  maxAge: 60 * 60 * 24,
});
