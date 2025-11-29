import { neon } from "@neondatabase/serverless";
export const sql = neon(process.env.NUXT_DATABASE_URL!);