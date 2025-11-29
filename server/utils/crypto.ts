import { hash, compare } from "bcrypt";
export const hashPassword    = (pw: string) => hash(pw, 12);
export const verifyPassword  = (pw: string, hash: string) => compare(pw, hash);