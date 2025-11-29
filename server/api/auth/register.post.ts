import { hashPassword } from "../../utils/crypto";
import { sql } from "../../utils/db";
import { createId } from "@paralleldrive/cuid2";

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event);
  if (!email || !password) throw createError({ statusCode: 400, statusMessage: "Missing fields" });

  const hashed = await hashPassword(password);
  const id = createId();
  try {
    await sql`INSERT INTO users (id, email, password) VALUES (${id}, ${email}, ${hashed})`;
    return { ok: true };
  } catch (e: any) {
    if (e.code === "23505") throw createError({ statusCode: 409, statusMessage: "E-mail already exists" });
    throw e;
  }
});