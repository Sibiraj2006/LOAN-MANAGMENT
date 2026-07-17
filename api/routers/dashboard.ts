import { createRouter, adminQuery, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { users, customerLeads } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const dashboardRouter = createRouter({
  // ─── Staff Dashboard Stats ───
  staffStats: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const staffId = ctx.user.id;

    // Date ranges
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const allMyLeads = await db.query.customerLeads.findMany({
      where: eq(customerLeads.staffUserId, staffId),
    });

    const todayForms = allMyLeads.filter(l => new Date(l.submittedAt) >= todayStart).length;
    const weekForms = allMyLeads.filter(l => new Date(l.submittedAt) >= weekStart).length;
    const monthForms = allMyLeads.filter(l => new Date(l.submittedAt) >= monthStart).length;
    const totalForms = allMyLeads.length;

    const recentLeads = await db.query.customerLeads.findMany({
      where: eq(customerLeads.staffUserId, staffId),
      orderBy: desc(customerLeads.submittedAt),
      limit: 10,
    });

    return {
      staffName: ctx.user.staffName,
      staffId: ctx.user.staffId,
      todayForms,
      weekForms,
      monthForms,
      totalForms,
      recentLeads: recentLeads.map(l => ({
        id: l.id,
        date: l.submittedAt,
        customerName: l.customerName,
        mobileNumber: l.mobileNumber,
        businessName: l.businessName,
        businessType: l.natureOfBusiness,
        cityTown: l.cityTown,
        status: l.status,
      })),
    };
  }),

  // ─── Admin Dashboard Stats ───
  adminStats: adminQuery.query(async () => {
    const db = getDb();

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const allStaff = await db.query.users.findMany({
      where: eq(users.role, "Staff"),
    });
    const activeStaff = allStaff.filter(s => s.isActive).length;

    const allLeads = await db.query.customerLeads.findMany({
      with: { staffUser: true },
    });

    const todayForms = allLeads.filter(l => new Date(l.submittedAt) >= todayStart).length;
    const weekForms = allLeads.filter(l => new Date(l.submittedAt) >= weekStart).length;
    const monthForms = allLeads.filter(l => new Date(l.submittedAt) >= monthStart).length;
    const totalLeads = allLeads.length;
    const completedLeads = allLeads.filter(l => l.status === "Completed").length;
    const pendingLeads = allLeads.filter(l =>
      ["New", "Pending", "Contacted", "FollowUp", "DocumentsPending"].includes(l.status)
    ).length;

    // Staff performance
    const staffPerformance = allStaff.map(staff => {
      const staffLeads = allLeads.filter(l => l.staffUserId === staff.id);
      return {
        staffName: staff.staffName,
        staffId: staff.staffId,
        todayForms: staffLeads.filter(l => new Date(l.submittedAt) >= todayStart).length,
        weeklyForms: staffLeads.filter(l => new Date(l.submittedAt) >= weekStart).length,
        monthlyForms: staffLeads.filter(l => new Date(l.submittedAt) >= monthStart).length,
        totalForms: staffLeads.length,
      };
    }).sort((a, b) => b.totalForms - a.totalForms);

    // Last 7 days counts
    const last7DaysLabels: string[] = [];
    const last7DaysCounts: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayStart);
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" });
      const count = allLeads.filter(l => {
        const ld = new Date(l.submittedAt);
        return ld >= d && ld < new Date(d.getTime() + 86400000);
      }).length;
      last7DaysLabels.push(label);
      last7DaysCounts.push(count);
    }

    // Monthly counts for current year
    const monthlyLabels: string[] = [];
    const monthlyCounts: number[] = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    for (let i = 0; i < 12; i++) {
      const mStart = new Date(now.getFullYear(), i, 1);
      const mEnd = new Date(now.getFullYear(), i + 1, 1);
      monthlyLabels.push(monthNames[i]);
      monthlyCounts.push(allLeads.filter(l => {
        const ld = new Date(l.submittedAt);
        return ld >= mStart && ld < mEnd;
      }).length);
    }

    return {
      totalStaff: allStaff.length,
      activeStaff,
      todayForms,
      todayCustomers: todayForms,
      weekForms,
      monthForms,
      totalCustomerLeads: totalLeads,
      completedLeads,
      pendingLeads,
      staffPerformance,
      last7DaysLabels,
      last7DaysCounts,
      monthlyLabels,
      monthlyCounts,
    };
  }),
});
