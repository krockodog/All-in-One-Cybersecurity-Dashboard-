/**
 * Advanced OSINT Router
 * tRPC procedures for ShadowFinder, Unfurl, Export, Automation, and AI Token Management
 */

import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { ShadowFinderService } from '../services/shadowfinder';
import { UnfurlService } from '../services/unfurl';
import { ExportService } from '../services/exportService';
import { workflowAutomationEngine } from '../services/workflowAutomation';
import { aiTokenManager } from '../services/aiTokenManager';
import { TRPCError } from '@trpc/server';

export const advancedOsintRouter = router({
  /**
   * ShadowFinder - Analyze domain for shadow IT
   */
  shadowfinder: router({
    analyzeDomain: protectedProcedure
      .input(z.object({ domain: z.string() }))
      .query(async ({ input }) => {
        try {
          const result = await ShadowFinderService.analyzeDomain(input.domain);
          return { success: true, result };
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to analyze domain',
          });
        }
      }),
  }),

  /**
   * Unfurl - Analyze and unfurl data
   */
  unfurl: router({
    analyze: protectedProcedure
      .input(z.object({ input: z.string() }))
      .query(async ({ input }) => {
        try {
          const result = await UnfurlService.unfurl(input.input);
          return { success: true, result };
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to analyze data',
          });
        }
      }),
  }),

  /**
   * Export - Export results to multiple formats
   */
  export: router({
    toTXT: protectedProcedure
      .input(z.object({ data: z.any() }))
      .mutation(async ({ input }) => {
        try {
          const content = ExportService.exportToTXT(input.data);
          const { filename } = ExportService.exportToFile(input.data, 'txt');
          return { success: true, filename, content };
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to export to TXT',
          });
        }
      }),

    toCSV: protectedProcedure
      .input(z.object({ data: z.any() }))
      .mutation(async ({ input }) => {
        try {
          const content = ExportService.exportToCSV(input.data);
          const { filename } = ExportService.exportToFile(input.data, 'csv');
          return { success: true, filename, content };
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to export to CSV',
          });
        }
      }),

    toJSON: protectedProcedure
      .input(z.object({ data: z.any() }))
      .mutation(async ({ input }) => {
        try {
          const content = ExportService.exportToJSON(input.data);
          const { filename } = ExportService.exportToFile(input.data, 'json');
          return { success: true, filename, content };
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to export to JSON',
          });
        }
      }),

    toHTML: protectedProcedure
      .input(z.object({ data: z.any() }))
      .mutation(async ({ input }) => {
        try {
          const content = ExportService.exportToHTML(input.data);
          const { filename } = ExportService.exportToFile(input.data, 'html');
          return { success: true, filename, content };
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to export to HTML',
          });
        }
      }),
  }),

  /**
   * Workflow Automation
   */
  automation: router({
    executeWorkflow: protectedProcedure
      .input(z.object({ triggerData: z.any() }))
      .mutation(async ({ input }) => {
        try {
          const execution = await workflowAutomationEngine.executeWorkflow(input.triggerData);
          return { success: true, execution };
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to execute workflow',
          });
        }
      }),

    getExecutionHistory: protectedProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ input }) => {
        try {
          const history = workflowAutomationEngine.getExecutionHistory(input.limit);
          return { success: true, history };
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to get execution history',
          });
        }
      }),

    getDefaultRules: protectedProcedure.query(async () => {
      try {
        const rules = workflowAutomationEngine.getDefaultRules();
        return { success: true, rules };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get default rules',
        });
      }
    }),
  }),

  /**
   * AI Token Management
   */
  aiTokens: router({
    getAllProviders: protectedProcedure.query(async () => {
      try {
        const providers = aiTokenManager.getAllProviders();
        return { success: true, providers };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get providers',
        });
      }
    }),

    getProvider: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        try {
          const provider = aiTokenManager.getProvider(input.id);
          return { success: true, provider };
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to get provider',
          });
        }
      }),

    updateProvider: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          config: z.any(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          aiTokenManager.updateProvider(input.id, input.config);
          const provider = aiTokenManager.getProvider(input.id);
          return { success: true, provider };
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update provider',
          });
        }
      }),

    validateProvider: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        try {
          const isValid = aiTokenManager.validateProvider(input.id);
          const provider = aiTokenManager.getProvider(input.id);
          return { success: true, isValid, provider };
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to validate provider',
          });
        }
      }),

    checkUsageQuota: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        try {
          const quota = aiTokenManager.checkUsageQuota(input.id);
          return { success: true, quota };
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to check usage quota',
          });
        }
      }),

    getTokenDashboard: protectedProcedure.query(async () => {
      try {
        const dashboard = aiTokenManager.getTokenDashboard();
        return { success: true, dashboard };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get token dashboard',
        });
      }
    }),

    recordUsage: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          tokensUsed: z.number(),
          cost: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          aiTokenManager.recordUsage(input.id, input.tokensUsed, input.cost);
          return { success: true };
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to record usage',
          });
        }
      }),

    resolveAlert: protectedProcedure
      .input(z.object({ alertID: z.string() }))
      .mutation(async ({ input }) => {
        try {
          aiTokenManager.resolveAlert(input.alertID);
          return { success: true };
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to resolve alert',
          });
        }
      }),
  }),
});
