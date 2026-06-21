import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as tables from "../database/schema";
import * as relations from "../database/relations";

const sql = neon(process.env.NUXT_DATABASE_URL!);
export const db = drizzle(sql, { schema: { ...tables, ...relations } });
