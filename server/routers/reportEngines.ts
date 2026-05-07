/**
 * Report Engines Router - tRPC procedures for Humanizer, Findings, and Pentest Analysis compatibility.
 */

import { publicProcedure, protectedProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import { HumanizerEngine } from '../services/humanizer';
import { FindingStructureEngine, Finding } from '../services/findingStructureEngine';
import { HexStrikeIntegration as PentestAnalysisIntegration } from '../services/hexstrike';

const humanizer = new HumanizerEngine();
const findingEngine = new FindingStructureEngine();
const pentestAnalysis = new PentestAnalysisIntegration();

const pentestAnalysisRouter = router({
  /**
   * Initialize pentest analysis engine.
   */
  initialize: protectedProcedure.mutation(async () => {
    try {
      await pentestAnalysis.initialize();
      return { success: true, message: 'Pentest analysis engine initialized' };
    } catch (error) {
      return { success: false, message: String(error) };
    }
  }),

  /**
   * Analyze target in the pentest context.
   */
  analyzeTarget: protectedProcedure
    .input(z.object({ target: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const analysis = await pentestAnalysis.analyzeTarget(input.target);
        return { success: true, analysis };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),

  /**
   * Generate report from a pentest analysis result.
   */
  generateReport: publicProcedure
    .input(z.object({ analysis: z.any() }))
    .mutation(async ({ input }) => {
      try {
        const report = await pentestAnalysis.generateReport(input.analysis);
        return { success: true, report };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),

  /**
   * Get pentest analysis configuration.
   */
  getConfig: protectedProcedure.query(() => {
    return pentestAnalysis.getConfig();
  }),

  /**
   * Update pentest analysis configuration.
   */
  updateConfig: protectedProcedure
    .input(
      z.object({
        enabled: z.boolean().optional(),
        pythonPath: z.string().optional(),
        hexstrikePath: z.string().optional(),
        apiKey: z.string().optional(),
        maxConcurrentScans: z.number().optional(),
        timeout: z.number().optional(),
      })
    )
    .mutation(({ input }) => {
      pentestAnalysis.setConfig(input);
      return pentestAnalysis.getConfig();
    }),

  /**
   * Get active scans count.
   */
  getActiveScanCount: publicProcedure.query(() => {
    return { count: pentestAnalysis.getActiveScanCount() };
  }),
});

export const reportEnginesRouter = router({
  // ============ HUMANIZER ENGINE ============
  humanizer: router({
    /**
     * Humanize report text
     */
    humanizeText: publicProcedure
      .input(
        z.object({
          text: z.string(),
          language: z.enum(['de', 'en']),
          professionLevel: z.enum(['technical', 'management', 'mixed']),
          tonality: z.enum(['formal', 'semi-formal', 'direct']),
        })
      )
      .mutation(async ({ input }) => {
        humanizer.setConfig({
          language: input.language,
          professionLevel: input.professionLevel,
          tonality: input.tonality,
        });

        const humanized = humanizer.humanize(input.text);
        return { humanized };
      }),

    /**
     * Get humanizer preview (before/after)
     */
    getPreview: publicProcedure
      .input(
        z.object({
          text: z.string(),
          language: z.enum(['de', 'en']),
        })
      )
      .query(({ input }) => {
        humanizer.setConfig({ language: input.language });
        return humanizer.getPreview(input.text);
      }),

    /**
     * Get humanizer configuration
     */
    getConfig: publicProcedure.query(() => {
      return humanizer.getConfig();
    }),

    /**
     * Update humanizer configuration
     */
    updateConfig: protectedProcedure
      .input(
        z.object({
          language: z.enum(['de', 'en']).optional(),
          professionLevel: z.enum(['technical', 'management', 'mixed']).optional(),
          sentenceVariation: z.boolean().optional(),
          activeVoicePreference: z.boolean().optional(),
          tonality: z.enum(['formal', 'semi-formal', 'direct']).optional(),
          avoidAIPhrases: z.boolean().optional(),
          industryTerminology: z.boolean().optional(),
        })
      )
      .mutation(({ input }) => {
        humanizer.setConfig(input);
        return humanizer.getConfig();
      }),
  }),

  // ============ FINDING STRUCTURE ENGINE ============
  findings: router({
    /**
     * Create a new finding
     */
    createFinding: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          severity: z.enum(['critical', 'high', 'medium', 'low', 'info']),
          cvssScore: z.number().min(0).max(10),
          description: z.string(),
          impact: z.string(),
          affectedSystems: z.array(z.string()),
          poc: z.object({
            title: z.string(),
            steps: z.array(z.string()),
            code: z.string().optional(),
            screenshots: z.array(z.string()).optional(),
          }),
          remediation: z.string(),
          remediationEffort: z.enum(['low', 'medium', 'high']),
          cveId: z.string().optional(),
          cweId: z.string().optional(),
        })
      )
      .mutation(({ input }) => {
        const finding = findingEngine.createFinding({
          ...input,
          discoveredBy: 'User',
        });
        return finding;
      }),

    /**
     * Format finding for report
     */
    formatFinding: publicProcedure
      .input(z.object({ finding: z.any() }))
      .query(({ input }) => {
        const formatted = findingEngine.formatFinding(input.finding as Finding);
        return { formatted };
      }),

    /**
     * Format multiple findings
     */
    formatFindings: publicProcedure
      .input(z.object({ findings: z.array(z.any()) }))
      .query(({ input }) => {
        const formatted = findingEngine.formatFindings(input.findings as Finding[]);
        return { formatted };
      }),

    /**
     * Get CVSS severity from score
     */
    getCVSSSeverity: publicProcedure
      .input(z.object({ score: z.number() }))
      .query(({ input }) => {
        const severity = findingEngine.getSeverityFromCVSS(input.score);
        return { severity };
      }),

    /**
     * List templates
     */
    listTemplates: publicProcedure.query(() => {
      return findingEngine.listTemplates();
    }),
  }),

  // ============ PENTEST ANALYSIS ENGINE ============
  pentestAnalysis: pentestAnalysisRouter,

  // Legacy compatibility alias. Keep until all remaining consumers are migrated.
  hexstrike: pentestAnalysisRouter,
});
