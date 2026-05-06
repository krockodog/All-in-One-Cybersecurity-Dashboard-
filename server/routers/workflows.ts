import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  executeWorkflow,
  generateWorkflowRecommendations,
  analyzeWorkflowResults,
  PREDEFINED_WORKFLOWS,
} from "../workflows/workflowEngine";
import { getEngagementById, logAuditEvent } from "../db";

export const workflowRouter = router({
  /**
   * List available workflows
   */
  listWorkflows: protectedProcedure.query(() => {
    return Object.entries(PREDEFINED_WORKFLOWS).map(([id, workflow]) => ({
      id,
      name: workflow.name,
      description: workflow.description,
      stepCount: workflow.steps.length,
    }));
  }),

  /**
   * Get workflow details
   */
  getWorkflow: protectedProcedure
    .input(z.object({ workflowId: z.string() }))
    .query(({ input }) => {
      const workflow = PREDEFINED_WORKFLOWS[input.workflowId];
      if (!workflow) {
        throw new Error("Workflow not found");
      }
      return workflow;
    }),

  /**
   * Start a workflow execution
   */
  startWorkflow: protectedProcedure
    .input(
      z.object({
        engagementId: z.number(),
        workflowId: z.string(),
        target: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify engagement access
      const engagement = await getEngagementById(input.engagementId);
      if (!engagement) {
        throw new Error("Engagement not found");
      }

      if (
        ctx.user.role !== "admin" &&
        engagement.pentesterId !== ctx.user.id
      ) {
        throw new Error("Unauthorized");
      }

      // Log audit event
      await logAuditEvent({
        engagementId: input.engagementId,
        userId: ctx.user.id,
        action: "workflow_started",
        resource: input.workflowId,
        details: {
          target: input.target,
          workflow: input.workflowId,
        },
        ipAddress: ctx.req?.ip || "unknown",
        userAgent: ctx.req?.get("user-agent") || "unknown",
      });

      // Execute workflow asynchronously
      executeWorkflow(input.engagementId, input.workflowId, input.target, ctx.user.id).catch(
        (error) => {
          console.error("Workflow execution error:", error);
        },
      );

      return {
        success: true,
        message: `Workflow ${input.workflowId} started for target ${input.target}`,
      };
    }),

  /**
   * Get workflow recommendations for a target
   */
  getRecommendations: protectedProcedure
    .input(
      z.object({
        target: z.string(),
        targetType: z.enum(["domain", "ip", "url", "network"]),
      }),
    )
    .query(async ({ input }) => {
      return generateWorkflowRecommendations(input.target, input.targetType);
    }),

  /**
   * Analyze workflow results
   */
  analyzeResults: protectedProcedure
    .input(
      z.object({
        engagementId: z.number(),
        workflowId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Verify engagement access
      const engagement = await getEngagementById(input.engagementId);
      if (!engagement) {
        throw new Error("Engagement not found");
      }

      if (
        ctx.user.role !== "admin" &&
        engagement.pentesterId !== ctx.user.id &&
        engagement.clientId !== ctx.user.id
      ) {
        throw new Error("Unauthorized");
      }

      // Get execution results (placeholder)
      // In a real implementation, this would retrieve stored execution results
      return {
        summary: "Workflow analysis not yet available",
        riskLevel: "medium" as const,
        recommendations: [],
        nextSteps: [],
      };
    }),
});
