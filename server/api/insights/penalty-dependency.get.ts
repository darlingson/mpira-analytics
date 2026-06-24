export default defineEventHandler(async () => {
  // Penalty goals cannot be identified because `match_events` stores
  // all goals with event_type = 'goal' and no penalty-specific subtype.
  // Only `penalty_miss` exists as a separate event_type.
  return []
})
