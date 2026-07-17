import {
  mysqlTable,
  serial,
  varchar,
  text,
  timestamp,
  int,
  decimal,
  boolean,
  mysqlEnum,
  bigint,
} from "drizzle-orm/mysql-core";

// ─── Users Table ───
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  staffId: varchar("staff_id", { length: 20 }).notNull().unique(),
  staffName: varchar("staff_name", { length: 150 }).notNull(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  email: varchar("email", { length: 150 }).notNull(),
  mobileNumber: varchar("mobile_number", { length: 15 }).notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: mysqlEnum("role", ["Admin", "Staff"]).notNull().default("Staff"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdateFn(() => new Date()),
});

// ─── CustomerLeads Table ───
export const customerLeads = mysqlTable("customer_leads", {
  id: serial("id").primaryKey(),
  leadReferenceNumber: varchar("lead_reference_number", { length: 30 }).notNull().unique(),
  customerName: varchar("customer_name", { length: 150 }).notNull(),
  ownerName: varchar("owner_name", { length: 150 }).notNull(),
  mobileNumber: varchar("mobile_number", { length: 10 }).notNull(),
  businessName: varchar("business_name", { length: 200 }).notNull(),
  businessAddress: text("business_address").notNull(),
  cityTown: varchar("city_town", { length: 100 }).notNull(),
  natureOfBusiness: varchar("nature_of_business", { length: 100 }).notNull(),
  otherBusinessType: varchar("other_business_type", { length: 150 }),
  yearsInBusiness: int("years_in_business").notNull(),
  monthlyTurnover: varchar("monthly_turnover", { length: 50 }).notNull(),
  hasExistingBusinessLoan: boolean("has_existing_business_loan").notNull(),
  existingLoanCompanyName: varchar("existing_loan_company_name", { length: 150 }),
  existingLoanOutstandingAmount: decimal("existing_loan_outstanding_amount", { precision: 18, scale: 2 }),
  contactConsent: boolean("contact_consent").notNull(),
  status: mysqlEnum("status", [
    "New",
    "Pending",
    "Contacted",
    "FollowUp",
    "DocumentsPending",
    "DocumentsVerified",
    "Completed",
    "Rejected",
  ]).notNull().default("New"),
  remarks: text("remarks"),
  staffUserId: bigint("staff_user_id", { mode: "number", unsigned: true }).notNull(),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdateFn(() => new Date()),
  isDeleted: boolean("is_deleted").notNull().default(false),
});

// ─── AuditLogs Table ───
export const auditLogs = mysqlTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  entityName: varchar("entity_name", { length: 100 }).notNull(),
  entityId: bigint("entity_id", { mode: "number", unsigned: true }),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
