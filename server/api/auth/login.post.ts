import { verifyPassword } from "../../utils/crypto";
import { generateTokens} from "../../utils/jwt";
import { sql } from "../../utils/db";
import { hash } from "bcrypt";

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event);
  if (!email || !password) throw createError({ statusCode: 400, statusMessage: "Missing fields" });

  const [user] = await sql`SELECT id, password FROM users WHERE email = ${email}`;
  if (!user || !(await verifyPassword(password, user.password)))
    throw createError({ statusCode: 401, statusMessage: "Invalid credentials" });

  const { accessToken, refreshToken } = generateTokens(user.id);

  // store refresh-token hash
  const rtHash = await hash(refreshToken, 12);
  await sql`
    INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
    VALUES (${user.id}, ${rtHash}, NOW() + INTERVAL '7 days')`;

  setCookie(event, "refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7
  });

  return { accessToken };
});