const PROTECTED: Array<{ method: string; path: string }> = [
  { method: "POST", path: "/api/events" },
  { method: "POST", path: "/api/matches" },
];

export default defineEventHandler(async (event) => {
  const url   = getRequestURL(event).pathname;
  const method = event.node.req.method?.toUpperCase() || "";

  const needsAuth = PROTECTED.some(p => p.method === method && url === p.path);
  if (!needsAuth) return;

  const { userId } = event.context.auth || {};
  if (!userId) throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
});
