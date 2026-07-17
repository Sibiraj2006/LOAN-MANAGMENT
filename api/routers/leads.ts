import { z } from "zod";
import { createRouter, adminQuery, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { customerLeads } from "@db/schema";
import { eq, desc, like, or, and, gte, lte, count } from "drizzle-orm";

const LeadStatusEnum = z.enum([
  "New", "Pending", "Contacted", "FollowUp",
  "DocumentsPending", "DocumentsVerified", "Completed", "Rejected",
]);

export const leadsRouter = createRouter({
  // ─── Create lead ───
  create: authedQuery
    .input(
      z.object({
        customerName: z.string().min(2),
        ownerName: z.string().min(2),
        mobileNumber: z.string().regex(/^[6-9]\d{9}$/),
        businessName: z.string().min(1),
        businessAddress: z.string().min(1),
        cityTown: z.string().min(1),
        natureOfBusiness: z.string().min(1),
        otherBusinessType: z.string().optional(),
        yearsInBusiness: z.number().min(0).max(100),
        monthlyTurnover: z.string().min(1),
        hasExistingBusinessLoan: z.boolean(),
        existingLoanCompanyName: z.string().optional(),
        existingLoanOutstandingAmount: z.number().optional(),
        contactConsent: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      // Generate lead reference number
      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const prefix = `BLLS-${datePart}-`;
      const todayLeads = await db.select({ count: count() })
        .from(customerLeads)
        .where(like(customerLeads.leadReferenceNumber, `${prefix}%`));
      const sequence = (todayLeads[0]?.count || 0) + 1;
      const leadRefNum = `${prefix}${sequence.toString().padStart(4, "0")}`;

      await db.insert(customerLeads).values({
        leadReferenceNumber: leadRefNum,
        customerName: input.customerName,
        ownerName: input.ownerName,
        mobileNumber: input.mobileNumber,
        businessName: input.businessName,
        businessAddress: input.businessAddress,
        cityTown: input.cityTown,
        natureOfBusiness: input.natureOfBusiness,
        otherBusinessType: input.otherBusinessType,
        yearsInBusiness: input.yearsInBusiness,
        monthlyTurnover: input.monthlyTurnover,
        hasExistingBusinessLoan: input.hasExistingBusinessLoan,
        existingLoanCompanyName: input.existingLoanCompanyName,
        existingLoanOutstandingAmount: input.existingLoanOutstandingAmount
          ? String(input.existingLoanOutstandingAmount)
          : undefined,
        contactConsent: input.contactConsent,
        staffUserId: ctx.user.id,
      });

      return {
        success: true,
        message: "Customer details submitted successfully.",
        leadReferenceNumber: leadRefNum,
      };
    }),

  // ─── Get my leads (staff) ───
  myLeads: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.query.customerLeads.findMany({
      where: eq(customerLeads.staffUserId, ctx.user.id),
      orderBy: desc(customerLeads.submittedAt),
      with: { staffUser: true },
    });
  }),

  // ─── Get single lead ───
  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.customerLeads.findFirst({
        where: eq(customerLeads.id, input.id),
        with: { staffUser: true },
      });
    }),

  // ─── Update lead ───
  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        customerName: z.string().min(2).optional(),
        ownerName: z.string().min(2).optional(),
        mobileNumber: z.string().regex(/^[6-9]\d{9}$/).optional(),
        businessName: z.string().min(1).optional(),
        businessAddress: z.string().min(1).optional(),
        cityTown: z.string().min(1).optional(),
        natureOfBusiness: z.string().min(1).optional(),
        otherBusinessType: z.string().optional(),
        yearsInBusiness: z.number().min(0).max(100).optional(),
        monthlyTurnover: z.string().optional(),
        hasExistingBusinessLoan: z.boolean().optional(),
        existingLoanCompanyName: z.string().optional(),
        existingLoanOutstandingAmount: z.number().optional(),
        contactConsent: z.boolean().optional(),
        status: LeadStatusEnum.optional(),
        remarks: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const { id, ...rawUpdates } = input;

      // Staff can only update their own leads
      if (ctx.user.role === "Staff") {
        const lead = await db.query.customerLeads.findFirst({
          where: eq(customerLeads.id, id),
        });
        if (lead?.staffUserId !== ctx.user.id) {
          return { success: false, message: "You can only edit your own leads." };
        }
      }

      // Convert number to string for decimal column
      const updates: any = { ...rawUpdates };
      if (updates.existingLoanOutstandingAmount !== undefined) {
        updates.existingLoanOutstandingAmount = String(updates.existingLoanOutstandingAmount);
      }

      await db.update(customerLeads).set(updates).where(eq(customerLeads.id, id));
      return { success: true, message: "Lead updated successfully." };
    }),

  // ─── Soft delete lead ───
  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(customerLeads)
        .set({ isDeleted: true })
        .where(eq(customerLeads.id, input.id));
      return { success: true, message: "Lead deleted successfully." };
    }),

  // ─── Search & Filter leads (admin) ───
  search: adminQuery
    .input(
      z.object({
        search: z.string().optional(),
        status: z.string().optional(),
        staffId: z.number().optional(),
        businessType: z.string().optional(),
        cityTown: z.string().optional(),
        fromDate: z.string().optional(),
        toDate: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];

      if (input.search) {
        const s = `%${input.search}%`;
        conditions.push(
          or(
            like(customerLeads.customerName, s),
            like(customerLeads.ownerName, s),
            like(customerLeads.mobileNumber, s),
            like(customerLeads.businessName, s),
            like(customerLeads.leadReferenceNumber, s),
            like(customerLeads.cityTown, s),
          )
        );
      }

      if (input.status) {
        conditions.push(eq(customerLeads.status, input.status as typeof customerLeads.status.enumValues[number]));
      }

      if (input.staffId) {
        conditions.push(eq(customerLeads.staffUserId, input.staffId));
      }

      if (input.businessType) {
        conditions.push(eq(customerLeads.natureOfBusiness, input.businessType));
      }

      if (input.cityTown) {
        conditions.push(like(customerLeads.cityTown, `%${input.cityTown}%`));
      }

      if (input.fromDate) {
        conditions.push(gte(customerLeads.submittedAt, new Date(input.fromDate)));
      }

      if (input.toDate) {
        conditions.push(lte(customerLeads.submittedAt, new Date(input.toDate)));
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const leads = await db.query.customerLeads.findMany({
        where,
        orderBy: desc(customerLeads.submittedAt),
        with: { staffUser: true },
        limit: input.limit,
        offset: (input.page - 1) * input.limit,
      });

      const totalCount = await db.select({ count: count() })
        .from(customerLeads)
        .where(where);

      return {
        leads,
        total: totalCount[0]?.count || 0,
        page: input.page,
        totalPages: Math.ceil((totalCount[0]?.count || 0) / input.limit),
      };
    }),

  // ─── Get all leads for admin ───
  list: adminQuery.query(async () => {
    const db = getDb();
    return db.query.customerLeads.findMany({
      orderBy: desc(customerLeads.submittedAt),
      with: { staffUser: true },
    });
  }),
});
