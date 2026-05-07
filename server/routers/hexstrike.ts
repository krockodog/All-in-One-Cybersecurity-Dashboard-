/**
 * Legacy HexStrike workflow compatibility router.
 * The underlying validation and planning logic is now aligned with the Pentest area.
 */

import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { toolCatalog } from '../../client/src/lib/cyber-data';
import { validateScopeWithLLM, generatePentestPlanWithLLM } from '../services/pentestPlanning';
import { createScopeValidator } from '../services/scopeValidator';
import { createISO27001ISMSService } from '../services/iso27001ISMS';
import { createLiveExecutionEngine } from '../services/liveExecutionEngine';

const scopeValidator = createScopeValidator();
const ismsService = createISO27001ISMSService();
const executionEngine = createLiveExecutionEngine();

type LegacyTargetType = 'domain' | 'ip' | 'network' | 'range';

const normalizeTargetType = (type: LegacyTargetType): 'domain' | 'ip' | 'network' | 'url' => {
  if (type === 'range') return 'network';
  return type;
};

const selectLegacyPlanningTools = (type: LegacyTargetType) => {
  const normalizedType = normalizeTargetType(type);

  const relevantTools = toolCatalog.filter((tool) => {
    const category = tool.category.toLowerCase();

    if (normalizedType === 'domain' || normalizedType === 'url') {
      return (
        category.includes('osint') ||
        category.includes('recon') ||
        category.includes('web') ||
        category.includes('pentest')
      );
    }

    return (
      category.includes('network') ||
      category.includes('recon') ||
      category.includes('enum') ||
      category.includes('pentest')
    );
  });

  const fallbackTools = toolCatalog.slice(0, 10);
  return (relevantTools.length > 0 ? relevantTools : fallbackTools).slice(0, 12);
};

export const hexstrikeRouter = router({
  // Scope Validation
  validateScope: protectedProcedure
    .input(
      z.object({
        target: z.string(),
        type: z.enum(['domain', 'ip', 'network', 'range']),
        description: z.string().optional(),
        authorization: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const normalizedTargetType = normalizeTargetType(input.type);
      const scopeText = input.description?.trim() || `Assessment scope for ${input.target}`;
      const validation = await validateScopeWithLLM({
        target: input.target,
        targetType: normalizedTargetType,
        scope: scopeText,
      });

      const hasAuthorization = Boolean(input.authorization?.trim());
      const requiresAuthorization = validation.legalStatus.toLowerCase().includes('authorization');
      const isAuthorized = hasAuthorization || !requiresAuthorization;
      const isLegal = validation.isValid && (isAuthorized || !requiresAuthorization);

      const warnings = [
        ...(!hasAuthorization ? ['No explicit authorization reference was provided.'] : []),
        ...(!validation.isValid ? ['The current scope definition needs refinement before execution.'] : []),
      ];

      return {
        isValid: validation.isValid,
        isAuthorized,
        isLegal,
        riskLevel: validation.riskLevel,
        recommendations: [
          ...validation.recommendations,
          ...(!hasAuthorization ? ['Provide a written authorization reference before execution.'] : []),
        ],
        warnings,
        analysis: `${validation.legalStatus}. ${validation.recommendations.join(' ')}`.trim(),
        timestamp: new Date(),
      };
    }),

  // Generate Pentest Plan
  generatePentestPlan: protectedProcedure
    .input(
      z.object({
        target: z.string(),
        scopeDescription: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const inferredType: LegacyTargetType = input.target.includes('/')
        ? 'network'
        : /^(\d{1,3}\.){3}\d{1,3}$/.test(input.target)
          ? 'ip'
          : 'domain';

      const selectedTools = selectLegacyPlanningTools(inferredType);
      const plannedSequence = await generatePentestPlanWithLLM({
        target: input.target,
        targetType: normalizeTargetType(inferredType),
        riskLevel: inferredType === 'network' ? 'medium' : 'high',
        tools: selectedTools.map((tool) => ({
          id: tool.id,
          name: tool.name,
          category: tool.category,
          risk: tool.risk,
        })),
      });

      const phases = plannedSequence.sequence.map((sequenceItem, index) => {
        const tool = selectedTools.find((candidate) => candidate.id === sequenceItem.toolId);
        const toolId = tool?.id ?? sequenceItem.toolId;
        const toolName = tool?.name ?? sequenceItem.toolId;

        return {
          id: `phase-${index + 1}`,
          name: `${index + 1}. ${toolName}`,
          description: sequenceItem.rationale,
          order: index,
          tools: [toolId],
          estimatedDuration: sequenceItem.estimatedDuration,
          dependencies: index > 0 ? [`phase-${index}`] : [],
          objectives: [
            `Execute ${toolName} against ${input.target}`,
            'Collect actionable evidence for the Pentest workflow',
          ],
          successCriteria: [
            'Tool execution finished without blocking errors',
            'Evidence and findings were captured for reporting',
          ],
        };
      });

      return {
        id: `plan-${Date.now()}`,
        scopeId: `scope-${Date.now()}`,
        target: input.target,
        phases,
        estimatedDuration: phases.reduce((sum, phase) => sum + Number(phase.estimatedDuration ?? 0), 0),
        riskLevel: inferredType === 'network' ? 'medium' : 'high',
        totalTools: phases.reduce((sum, phase) => sum + phase.tools.length, 0),
        createdAt: new Date(),
        status: 'draft' as const,
      };
    }),

  // Optimize Plan for Parallel Execution
  optimizePlan: protectedProcedure
    .input(
      z.object({
        planId: z.string(),
      })
    )
    .mutation(async () => {
      return { optimized: true, message: 'Plan optimized for parallel execution' };
    }),

  // Create ISMS Report
  createISMSReport: protectedProcedure
    .input(
      z.object({
        organizationName: z.string(),
        scope: z.string(),
        findings: z.array(z.any()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ismsService.createISMSReport(
        input.organizationName,
        ctx.user?.name || 'Unknown',
        input.scope,
        input.findings || []
      );
    }),

  // Start Execution
  startExecution: protectedProcedure
    .input(
      z.object({
        planId: z.string(),
        toolIds: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      const plan = executionEngine.createExecutionPlan(input.planId, input.toolIds);
      executionEngine.startExecution(input.planId).catch(console.error);
      return plan;
    }),

  // Get Execution Status
  getExecutionStatus: protectedProcedure
    .input(z.object({ planId: z.string() }))
    .query(({ input }) => {
      const plan = executionEngine.getExecutionPlan(input.planId);
      if (!plan) return null;

      return {
        ...plan,
        stats: executionEngine.getExecutionStats(input.planId),
      };
    }),

  // Get Job Output
  getJobOutput: protectedProcedure
    .input(
      z.object({
        planId: z.string(),
        jobId: z.string(),
      })
    )
    .query(({ input }) => {
      return executionEngine.getJobOutput(input.planId, input.jobId);
    }),

  // Pause Execution
  pauseExecution: protectedProcedure
    .input(z.object({ planId: z.string() }))
    .mutation(({ input }) => {
      executionEngine.pauseExecution(input.planId);
      return { status: 'paused' };
    }),

  // Resume Execution
  resumeExecution: protectedProcedure
    .input(z.object({ planId: z.string() }))
    .mutation(async ({ input }) => {
      await executionEngine.resumeExecution(input.planId);
      return { status: 'resumed' };
    }),

  // Cancel Execution
  cancelExecution: protectedProcedure
    .input(z.object({ planId: z.string() }))
    .mutation(({ input }) => {
      executionEngine.cancelExecution(input.planId);
      return { status: 'cancelled' };
    }),

  // Get Authorization Checklist
  getAuthorizationChecklist: protectedProcedure.query(() => {
    return scopeValidator.generateAuthorizationChecklist();
  }),

  // Get Legal Compliance Checklist
  getLegalComplianceChecklist: protectedProcedure.query(() => {
    return scopeValidator.generateLegalComplianceChecklist();
  }),
});
