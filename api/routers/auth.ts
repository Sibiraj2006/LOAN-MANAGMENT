import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.APP_SECRET || "business-loan-lead-system-secret";

function signToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

export const authRouter = createRouter({
  login: publicQuery
    .input(
      z.object({
        username: z.string().min(1),
        password: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const user = await db.query.users.findFirst({
        where: eq(users.username, input.username),
      });

      if (!user) {
        return { success: false, message: "Invalid username or password." };
      }

      if (!user.isActive) {
        return { success: false, message: "Account is deactivated. Contact admin." };
      }

const valid = input.password === user.passwordHash;
      if (!valid) {
        return { success: false, message: "Invalid username or password." };
      }

      const token = signToken(user.id);

      return {
        success: true,
        token,
        user: {
          id: user.id,
          staffId: user.staffId,
          staffName: user.staffName,
          username: user.username,
          email: user.email,
          mobileNumber: user.mobileNumber,
          role: user.role,
          isActive: user.isActive,
        },
      };
    }),

  me: publicQuery.query(async ({ ctx }) => {
    if (!ctx.user) return null;
    return ctx.user;
  }),

  // ─── Seed initial admin ───
  seedAdmin: publicQuery.mutation(async () => {
    const db = getDb();
    const existing = await db.query.users.findFirst({
      where: eq(users.role, "Admin"),
    });
    if (existing) return { message: "Admin already exists" };

    const hash = await bcrypt.hash("admin123", 10);
    await db.insert(users).values({
      staffId: "ADM001",
      staffName: "System Administrator",
      username: "admin",
      email: "admin@businessloanlead.com",
      mobileNumber: "9999999999",
      passwordHash: hash,
      role: "Admin",
      isActive: true,
    });
    return { message: "Admin created. Username: admin, Password: admin123" };
  }),
});
