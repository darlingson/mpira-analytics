import { neon } from "@neondatabase/serverless";

export default defineEventHandler(async (event) => {
  const { databaseUrl } = useRuntimeConfig();
  const db = neon(databaseUrl);
  const body = await readBody(event);

  const { match_id, minute, player, team, type, description, score_at_event } = body;

  await db`
    INSERT INTO events (match_id, minute, player, team, type, description, score_at_event)
    VALUES (${match_id}, ${minute}, ${player}, ${team}, ${type}, ${description}, ${score_at_event})
  `;

  return { status: "success", message: "Event added" };
});