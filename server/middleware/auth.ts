import { verifyAccess } from "../utils/jwt";

const PROTECTED: Array<{ method: string; path: string }> = [
  { method: "POST", path: "/api/events" },
  { method: "POST", path: "/api/matches" },
];

export default defineEventHandler(async (event) => {
  const url   = getRequestURL(event).pathname;
  const method = event.node.req.method?.toUpperCase() || "";

  const needsAuth = PROTECTED.some(p => p.method === method && url === p.path);
  if (!needsAuth) return;

  const hdr = getHeader(event, "authorization") || "";
  const token = hdr.replace("Bearer ", "");
  if (!token) throw createError({ statusCode: 401, statusMessage: "Missing token" });

  try {
    event.context.auth = verifyAccess(token);
  } catch {
    throw createError({ statusCode: 401, statusMessage: "Invalid token" });
  }
});