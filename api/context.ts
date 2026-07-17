import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.APP_SECRET || "business-loan-lead-system-secret";

export type UserContext = {
  id: number;
  staffId: string;
  staffName: string;
  username: string;
  email: string;
  mobileNumber: string;
  role: "Admin" | "Staff";
  isActive: boolean;
};

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user: UserContext | null;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const token = extractToken(opts.req);
  let user: UserContext | null = null;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      const db = getDb();
      const found = await db.query.users.findFirst({
        where: eq(users.id, decoded.userId),
      });
      if (found && found.isActive) {
        user = {
          id: found.id,
          staffId: found.staffId,
          staffName: found.staffName,
          username: found.username,
          email: found.email,
          mobileNumber: found.mobileNumber,
          role: found.role as "Admin" | "Staff",
          isActive: found.isActive,
        };
      }
    } catch {
      user = null;
    }
  }

  return { req: opts.req, resHeaders: opts.resHeaders, user };
}

function extractToken(req: Request): string | null {
  const cookie = req.headers.get("cookie");
  if (cookie) {
    const match = cookie.match(/auth_token=([^;]+)/);
    if (match) return match[1];
  }
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return null;
}
