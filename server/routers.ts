import { z } from "zod";
import { COOKIE_NAME } from "../shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { runTool } from "./toolRunner";
import { engagementRouter } from "./routers/engagements";
import { workflowRouter } from "./routers/workflows";

const toolRunSchema = z.object({
  toolId: z.string().min(1),
  toolName: z.string().min(1),
  baseCommand: z.string().min(1),
  target: z.string().min(1),
  options: z.string().default(""),
  category: z.enum(["osint", "pentest", "recon"]),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  tools: router({
    run: protectedProcedure.input(toolRunSchema).mutation(async ({ input }) => {
      const result = await runTool(input);
      return {
        ...result,
        executedAt: Date.now(),
      } as const;
    }),
  }),
  engagements: engagementRouter,
  workflows: workflowRouter,
});

export type AppRouter = typeof appRouter;
