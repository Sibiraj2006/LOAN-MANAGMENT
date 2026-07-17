import { z } from "zod";
import { createRouter, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { users } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const staffRouter = createRouter({
  // ─── List all staff ───
  list: adminQuery.query(async () => {
    const db = getDb();
    const all = await db.query.users.findMany({
      where: eq(users.role, "Staff"),
      orderBy: desc(users.createdAt),
    });
    return all;
  }),

  // ─── Get single staff ───
  getById: adminQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.users.findFirst({
        where: eq(users.id, input.id),
      });
    }),

  // ─── Create staff ───
  create: adminQuery
    .input(
      z.object({
        staffName: z.string().min(2),
        username: z.string().min(3),
        email: z.string().email(),
        mobileNumber: z.string().min(10).max(15),
        password: z.string().min(6),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      
      const existing = await db.query.users.findFirst({
        where: eq(users.username, input.username),
      });
      if (existing) {
        return { success: false, message: "Username already exists." };
      }

      
      const staffId = "STF" + Math.floor(100 + Math.random() * 900);

      const hash = input.password;

      await db.insert(users).values({
        staffId,
        staffName: input.staffName,
        username: input.username,
        email: input.email,
        mobileNumber: input.mobileNumber,
        passwordHash: hash,
        role: "Staff",
        isActive: true,
      });

      return { success: true, message: `Staff created with ID: ${staffId}` };
    }),
  // ─── Toggle active status ───
  toggleStatus: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const staff = await db.query.users.findFirst({
        where: eq(users.id, input.id),
      });
      if (!staff) return { success: false, message: "Staff not found." };

      await db.update(users)
        .set({ isActive: !staff.isActive })
        .where(eq(users.id, input.id));

      return {
        success: true,
        message: `Staff ${staff.isActive ? "deactivated" : "activated"} successfully.`,
      };
    }),
});