import { verifyRefresh } from "~~/server/utils/jwt";
import { sql } from "../../utils/db";

export default defineEventHandler(async (event) => {
  const rt = getCookie(event, "refreshToken");
  if (rt) {
    try {
      const payload = verifyRefresh(rt);
      await sql`DELETE FROM refresh_tokens WHERE user_id = ${payload.sub}`;
    } catch {}
  }
  deleteCookie(event, "refreshToken");
  return { ok: true };
});