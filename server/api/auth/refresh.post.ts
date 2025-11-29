import { verifyRefresh, generateTokens } from "../../utils/jwt";
import { sql } from "../../utils/db";
import { compare,hash } from "bcrypt";

export default defineEventHandler(async (event) => {
  const rt = getCookie(event, "refreshToken");
  if (!rt) throw createError({ statusCode: 401, statusMessage: "No refresh token" });

  let payload;
  try { payload = verifyRefresh(rt); } catch {
    throw createError({ statusCode: 401, statusMessage: "Invalid refresh token" });
  }

  const rows = await sql`
    SELECT token_hash FROM refresh_tokens
    WHERE user_id = ${payload.sub} AND expires_at > NOW()`;
  if (!rows.length || !(await compare(rt, rows[0].tokenHash)))
    throw createError({ statusCode: 401, statusMessage: "Token revoked" });

  await sql`DELETE FROM refresh_tokens WHERE user_id = ${payload.sub}`;
  const { accessToken, refreshToken: newRT } = generateTokens(payload.sub as string);
  const newHash = await hash(newRT, 12);
  await sql`
    INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
    VALUES (${payload.sub}, ${newHash}, NOW() + INTERVAL '7 days')`;

  setCookie(event, "refreshToken", newRT, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7
  });

  return { accessToken };
});