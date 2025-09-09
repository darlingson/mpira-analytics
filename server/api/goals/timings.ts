import { neon } from '@neondatabase/serverless';

export default defineCachedEventHandler(async () => {
  const { databaseUrl } = useRuntimeConfig();
  const db = neon(databaseUrl);

  const events = await db`SELECT * FROM events WHERE type = 'goal'`;

  const avgGoalTimes: Record<string, number[]> = {};
  const histogram: Record<string, number> = {};
  const periods = {
    '0-15': 0,
    '16-30': 0,
    '31-45': 0,
    '46-60': 0,
    '61-75': 0,
    '76-90': 0,
  };

  for (const event of events) {
    const team = event.team;
    const min = parseInt(event.minute.replace("'", ""));

    if (!avgGoalTimes[team]) avgGoalTimes[team] = [];
    avgGoalTimes[team].push(min);

    const range = min <= 15 ? '0-15'
                : min <= 30 ? '16-30'
                : min <= 45 ? '31-45'
                : min <= 60 ? '46-60'
                : min <= 75 ? '61-75'
                : '76-90';
    periods[range] += 1;

    histogram[min] = (histogram[min] || 0) + 1;
  }

  const average_goal_time_per_team = Object.fromEntries(
    Object.entries(avgGoalTimes).map(([team, mins]) => [
      team,
      Math.round(mins.reduce((a, b) => a + b, 0) / mins.length),
    ])
  );

  return {
    average_goal_time_per_team,
    goals_by_period: periods,
    minute_histogram: histogram,
  };
}, {
  maxAge: 60 * 60 * 24,
});
