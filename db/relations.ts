import { relations } from "drizzle-orm";
import { users, customerLeads, auditLogs } from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  customerLeads: many(customerLeads),
  auditLogs: many(auditLogs),
}));

export const customerLeadsRelations = relations(customerLeads, ({ one }) => ({
  staffUser: one(users, {
    fields: [customerLeads.staffUserId],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));
