import { z } from "zod";
import { createRouter, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { users, customerLeads } from "@db/schema";
import { eq, desc, and, gte, lte, like } from "drizzle-orm";

const ReportTypeEnum = z.enum(["Daily", "Weekly", "Monthly", "Custom"]);

export const reportsRouter = createRouter({
  // ─── Generate report data ───
  generate: adminQuery
    .input(
      z.object({
        reportType: ReportTypeEnum,
        selectedDate: z.string().optional(),
        fromDate: z.string().optional(),
        toDate: z.string().optional(),
        month: z.number().optional(),
        year: z.number().optional(),
        staffUserId: z.number().optional(),
        businessType: z.string().optional(),
        status: z.string().optional(),
        cityTown: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();

      // Resolve date range
      let fromDate: Date;
      let toDate: Date;
      let title: string;

      const now = new Date();

      switch (input.reportType) {
        case "Daily": {
          const d = input.selectedDate ? new Date(input.selectedDate) : now;
          fromDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
          toDate = new Date(fromDate.getTime() + 86400000);
          title = "DAILY FORMS & CUSTOMER DETAILS REPORT";
          break;
        }
        case "Weekly": {
          const from = input.fromDate ? new Date(input.fromDate) : now;
          const to = input.toDate ? new Date(input.toDate) : now;
          fromDate = new Date(from.getFullYear(), from.getMonth(), from.getDate());
          toDate = new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59);
          title = "WEEKLY FORMS & CUSTOMER DETAILS REPORT";
          break;
        }
        case "Monthly": {
          const month = input.month ?? now.getMonth();
          const year = input.year ?? now.getFullYear();
          fromDate = new Date(year, month, 1);
          toDate = new Date(year, month + 1, 1);
          title = "MONTHLY FORMS & CUSTOMER DETAILS REPORT";
          break;
        }
        case "Custom": {
          const from = input.fromDate ? new Date(input.fromDate) : now;
          const to = input.toDate ? new Date(input.toDate) : now;
          fromDate = new Date(from.getFullYear(), from.getMonth(), from.getDate());
          toDate = new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59);
          title = "CUSTOMER & FORMS DETAILS REPORT";
          break;
        }
      }

      // Build query conditions
      const conditions = [
        gte(customerLeads.submittedAt, fromDate),
        lte(customerLeads.submittedAt, toDate),
      ];

      if (input.staffUserId) {
        conditions.push(eq(customerLeads.staffUserId, input.staffUserId));
      }
      if (input.businessType) {
        conditions.push(eq(customerLeads.natureOfBusiness, input.businessType));
      }
      if (input.status) {
        conditions.push(eq(customerLeads.status, input.status as typeof customerLeads.status.enumValues[number]));
      }
      if (input.cityTown) {
        // பிழையான sql டெம்ப்ளேட்டுக்கு பதிலாக Drizzle-ன் 'like' பயன்படுத்தப்பட்டுள்ளது
        conditions.push(like(customerLeads.cityTown, `%${input.cityTown}%`));
      }

      const leads = await db.query.customerLeads.findMany({
        where: and(...conditions),
        orderBy: desc(customerLeads.submittedAt),
        with: { staffUser: true },
      });

      const allStaff = await db.query.users.findMany({
        where: eq(users.role, "Staff"),
      });

      // Staff-wise summary
      const staffSummary = allStaff.map(staff => {
        const staffLeads = leads.filter(l => l.staffUserId === staff.id);
        return {
          staffName: staff.staffName,
          staffId: staff.staffId,
          formsCompleted: staffLeads.length,
          customersEntered: staffLeads.length,
        };
      });

      return {
        title,
        fromDate,
        toDate,
        totalStaff: allStaff.length,
        totalForms: leads.length,
        totalCustomers: leads.length,
        staffSummary,
        leads: leads.map(l => ({
          id: l.id,
          date: l.submittedAt,
          time: l.submittedAt,
          staffName: l.staffUser?.staffName || "",
          staffId: l.staffUser?.staffId || "",
          customerName: l.customerName,
          ownerName: l.ownerName,
          mobileNumber: l.mobileNumber,
          businessName: l.businessName,
          businessType: l.natureOfBusiness,
          businessAddress: l.businessAddress,
          cityTown: l.cityTown,
          yearsInBusiness: l.yearsInBusiness,
          monthlyTurnover: l.monthlyTurnover,
          hasExistingBusinessLoan: l.hasExistingBusinessLoan,
          contactConsent: l.contactConsent,
          leadReferenceNumber: l.leadReferenceNumber,
          status: l.status,
     remarks: l.remarks || "",
        })),
      };
    }),
});