import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  executePipeline,
  createPipelineTemplate,
  PIPELINE_TEMPLATES,
  type Pipeline,
  type PipelineStep,
} from "../toolChaining";

const pipelineStepSchema = z.object({
  id: z.string(),
  toolId: z.string(),
  toolName: z.string(),
  inputs: z.record(z.string(), z.string()),
  dependencies: z.array(z.string()),
  parallel: z.boolean(),
});

const pipelineSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  steps: z.array(pipelineStepSchema),
  scope: z.string(),
});

export const pipelinesRouter = router({
  // Create a custom pipeline
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        steps: z.array(
          z.object({
            toolId: z.string(),
            dependencies: z.array(z.string()).optional(),
            parallel: z.boolean().optional(),
          })
        ),
        scope: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const pipeline: Pipeline = {
        id: `pipeline-${Date.now()}`,
        name: input.name,
        description: input.description,
        scope: input.scope,
        createdAt: new Date(),
        updatedAt: new Date(),
        steps: input.steps.map((step, index) => ({
          id: `step-${index}`,
          toolId: step.toolId,
          toolName: step.toolId,
          inputs: { target: input.scope },
          dependencies: step.dependencies || [],
          parallel: step.parallel || false,
        })),
      };

      return pipeline;
    }),

  // Get predefined templates
  getTemplates: protectedProcedure.query(async () => {
    return {
      reconnaissance: PIPELINE_TEMPLATES.reconnaissance(),
      webAppPentest: PIPELINE_TEMPLATES.webAppPentest(),
      osint: PIPELINE_TEMPLATES.osint(),
      cloudSecurity: PIPELINE_TEMPLATES.cloudSecurity(),
    };
  }),

  // Execute a pipeline
  execute: protectedProcedure
    .input(pipelineSchema)
    .mutation(async ({ input }) => {
      const execution = await executePipeline(input as Pipeline);
      return execution;
    }),

  // Create a pipeline from template
  createFromTemplate: protectedProcedure
    .input(
      z.object({
        template: z.union([
          z.literal("reconnaissance"),
          z.literal("webAppPentest"),
          z.literal("osint"),
          z.literal("cloudSecurity"),
        ]),
        scope: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const templateFn = PIPELINE_TEMPLATES[input.template as keyof typeof PIPELINE_TEMPLATES];
      const pipeline = templateFn();
      pipeline.scope = input.scope;
      pipeline.steps.forEach((step) => {
        step.inputs.target = input.scope;
      });
      return pipeline;
    }),

  // Update a pipeline step
  updateStep: protectedProcedure
    .input(
      z.object({
        pipelineId: z.string(),
        stepId: z.string(),
        updates: z.object({
          inputs: z.record(z.string(), z.string()).optional(),
          dependencies: z.array(z.string()).optional(),
          parallel: z.boolean().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      // In a real app, this would update the database
      return { success: true, stepId: input.stepId };
    }),

  // Delete a pipeline step
  deleteStep: protectedProcedure
    .input(
      z.object({
        pipelineId: z.string(),
        stepId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return { success: true, stepId: input.stepId };
    }),

  // Reorder pipeline steps
  reorderSteps: protectedProcedure
    .input(
      z.object({
        pipelineId: z.string(),
        stepIds: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      return { success: true, stepIds: input.stepIds };
    }),
});
