import { createRouter, publicQuery } from "./middleware";
import { authRouter } from "./routers/auth";
import { staffRouter } from "./routers/staff";
import { leadsRouter } from "./routers/leads";
import { dashboardRouter } from "./routers/dashboard";
import { reportsRouter } from "./routers/reports";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  staff: staffRouter,
  leads: leadsRouter,
  dashboard: dashboardRouter,
  reports: reportsRouter,
});

export type AppRouter = typeof appRouter;
