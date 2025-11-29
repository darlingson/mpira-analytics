import jwt from "jsonwebtoken";

const ACCESS_SECRET  = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export const generateTokens = (userId: string) => ({
  accessToken: jwt.sign({ sub: userId, type: "access"  }, ACCESS_SECRET,  { expiresIn: "15m" }),
  refreshToken: jwt.sign({ sub: userId, type: "refresh" }, REFRESH_SECRET, { expiresIn: "7d"  })
});

export const verifyAccess  = (token: string) => jwt.verify(token, ACCESS_SECRET) as jwt.JwtPayload;
export const verifyRefresh = (token: string) => jwt.verify(token, REFRESH_SECRET) as jwt.JwtPayload;