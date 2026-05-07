import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import {
  createEngagement,
  getEngagementById,
  listEngagements,
  updateEngagementStatus,
  createExecutionJob,
  listExecutionJobs,
  logAuditEvent,
} from "../db";

export const engagementRouter = router({
  /**
   * Create a new engagement (Pentesting project)
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        clientId: z.number(),
        description: z.string().optional(),
        scope: z.object({
          domains: z.array(z.string()),
          ipRanges: z.array(z.string()),
          services: z.array(z.string()),
          exclusions: z.array(z.string()).optional(),
        }),
        authorizationExpires: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Only admins can create engagements
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      const result = await createEngagement({
        name: input.name,
        clientId: input.clientId,
        pentesterId: ctx.user.id,
        description: input.description,
        scope: input.scope,
        authorizationExpires: input.authorizationExpires,
      });

      // Log audit event
      const engagementId = (result as any).insertId || 1;
      await logAuditEvent({
        engagementId,
        userId: ctx.user.id,
        action: "engagement_created",
        details: { name: input.name, scope: input.scope },
        ipAddress: ctx.req?.ip || "unknown",
        userAgent: ctx.req?.get("user-agent") || "unknown",
      });

      return { id: engagementId, success: true };
    }),

  /**
   * Get engagement by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const engagement = await getEngagementById(input.id);

      if (!engagement) {
        throw new Error("Engagement not found");
      }

      // Check authorization
      if (
        ctx.user.role !== "admin" &&
        engagement.pentesterId !== ctx.user.id &&
        engagement.clientId !== ctx.user.id
      ) {
        throw new Error("Unauthorized");
      }

      return engagement;
    }),

  /**
   * List engagements for current user
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    // Return engagements for current user
    return await listEngagements(ctx.user.id);
  }),

  /**
   * Update engagement status
   */
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["planning", "active", "paused", "completed", "archived"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const engagement = await getEngagementById(input.id);

      if (!engagement) {
        throw new Error("Engagement not found");
      }

      // Only pentester or admin can update status
      if (ctx.user.role !== "admin" && engagement.pentesterId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      await updateEngagementStatus(input.id, input.status);

      // Log audit event
      await logAuditEvent({
        engagementId: input.id,
        userId: ctx.user.id,
        action: "engagement_status_updated",
        details: { newStatus: input.status },
        ipAddress: ctx.req?.ip || "unknown",
        userAgent: ctx.req?.get("user-agent") || "unknown",
      });

      return { success: true };
    }),

  /**
   * Start a tool execution within an engagement
   */
  executeToolPhase: protectedProcedure
    .input(
      z.object({
        engagementId: z.number(),
        phase: z.enum(["osint", "recon", "pentest", "post_exploitation", "reporting"]),
        tool: z.string(),
        target: z.string(),
        parameters: z.record(z.string(), z.any()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const engagement = await getEngagementById(input.engagementId);

      if (!engagement) {
        throw new Error("Engagement not found");
      }

      // Check authorization
      if (
        ctx.user.role !== "admin" &&
        engagement.pentesterId !== ctx.user.id
      ) {
        throw new Error("Unauthorized");
      }

      // Verify target is in scope
      const isInScope = verifyTargetInScope(input.target, engagement.scope);
      if (!isInScope) {
        throw new Error("Target is not in authorized scope");
      }

      // Create execution job
      const result = await createExecutionJob({
        engagementId: input.engagementId,
        phase: input.phase,
        tool: input.tool,
        target: input.target,
        parameters: input.parameters || {},
      });

      // Log audit event
      const jobId = (result as any).insertId || 1;
      await logAuditEvent({
        engagementId: input.engagementId,
        userId: ctx.user.id,
        action: "tool_execution_started",
        resource: `job_${jobId}`,
        details: {
          phase: input.phase,
          tool: input.tool,
          target: input.target,
        },
        ipAddress: ctx.req?.ip || "unknown",
        userAgent: ctx.req?.get("user-agent") || "unknown",
      });

      return { jobId, success: true };
    }),

  /**
   * Get execution jobs for an engagement
   */
  getExecutionJobs: protectedProcedure
    .input(z.object({ engagementId: z.number() }))
    .query(async ({ ctx, input }) => {
      const engagement = await getEngagementById(input.engagementId);

      if (!engagement) {
        throw new Error("Engagement not found");
      }

      // Check authorization
      if (
        ctx.user.role !== "admin" &&
        engagement.pentesterId !== ctx.user.id &&
        engagement.clientId !== ctx.user.id
      ) {
        throw new Error("Unauthorized");
      }

      return listExecutionJobs(input.engagementId);
    }),
});

/**
 * Helper function to verify if a target is in the authorized scope
 */
function verifyTargetInScope(target: string, scope: any): boolean {
  if (!scope) return false;

  // Check if target matches any domain in scope
  if (scope.domains && scope.domains.length > 0) {
    for (const domain of scope.domains) {
      if (domain === "*" || target.includes(domain)) {
        return true;
      }
    }
  }

  // Check if target matches any IP range in scope
  if (scope.ipRanges && scope.ipRanges.length > 0) {
    for (const range of scope.ipRanges) {
      if (isIPInRange(target, range)) {
        return true;
      }
    }
  }

  // Check exclusions
  if (scope.exclusions && scope.exclusions.length > 0) {
    for (const exclusion of scope.exclusions) {
      if (target.includes(exclusion)) {
        return false;
      }
    }
  }

  return false;
}

/**
 * Helper function to check if an IP is in a CIDR range
 */
function isIPInRange(ip: string, cidr: string): boolean {
  // Simple implementation - in production use a library like `ip-address`
  const [range, bits] = cidr.split("/");
  if (!bits) return ip === range;

  // For now, just do simple string matching
  return ip.startsWith(range.substring(0, range.lastIndexOf(".")));
}
