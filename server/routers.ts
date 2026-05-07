import { z } from "zod";
import { COOKIE_NAME } from "../shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { runTool } from "./toolRunner";
import { engagementRouter } from "./routers/engagements";
import { workflowRouter } from "./routers/workflows";
import { hexstrikeRouter as pentestWorkflowRouter } from "./routers/hexstrike";
import { pentestRouter } from "./routers/pentest";
import { aiChatRouter } from "./routers/aiChat";
import { pipelinesRouter } from "./routers/pipelines";
import { streamingRouter } from "./routers/streaming";
import { threatIntelRouter } from "./routers/threatIntel";
import { snapshotsRouter } from "./routers/snapshots";
import { iso27001Router } from "./routers/iso27001Router";
import { exportsRouter } from "./routers/exports";
import { notificationsRouter } from "./routers/notifications";

export type ToolCategory = "osint" | "pentest" | "recon" | "cloud" | "forensics" | "binary";

const toolRunSchema = z.object({
  toolId: z.string().min(1),
  toolName: z.string().min(1),
  baseCommand: z.string().min(1),
  target: z.string().min(1),
  options: z.string().default(""),
  category: z.enum(["osint", "pentest", "recon", "cloud", "forensics", "binary"]),
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
  pentestWorkflow: pentestWorkflowRouter,
  pentest: pentestRouter,
  aiChat: aiChatRouter,
  pipelines: pipelinesRouter,
  streaming: streamingRouter,
  threatIntel: threatIntelRouter,
  snapshots: snapshotsRouter,
  iso27001: iso27001Router,
  exports: exportsRouter,
  notifications: notificationsRouter,
});

export type AppRouter = typeof appRouter;
