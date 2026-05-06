/**
 * Report Router
 * tRPC procedures for report generation and management
 */

import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { ReportGeneratorService } from '../services/reportGenerator';
import { AIReportAnalyzerService } from '../services/aiReportAnalyzer';
import { ReportExporterService } from '../services/reportExporter';
import { TRPCError } from '@trpc/server';

export const reportsRouter = router({
  /**
   * Generate a professional report
   */
  generateReport: protectedProcedure
    .input(
      z.object({
        engagementId: z.string(),
        reportType: z.enum([
          'executive_summary',
          'technical',
          'risk_assessment',
          'remediation_roadmap',
          'red_team',
        ]),
        includeAIAnalysis: z.boolean().default(true),
        findings: z.array(
          z.object({
            id: z.number(),
            title: z.string(),
            description: z.string().nullable(),
            severity: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Verify engagement ownership
        // In production, check authorization

        // Generate report
        const report = await ReportGeneratorService.generateReport(
          input.engagementId,
          input.findings as any,
          input.reportType,
          input.includeAIAnalysis
        );

        return {
          success: true,
          report,
          reportId: report.metadata.id,
        };
      } catch (error) {
        console.error('Report generation failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate report',
        });
      }
    }),

  /**
   * Analyze report with AI
   */
  analyzeReport: protectedProcedure
    .input(
      z.object({
        reportId: z.string(),
        report: z.any(), // In production, would have proper schema
      })
    )
    .mutation(async ({ input }) => {
      try {
        const analysis = await AIReportAnalyzerService.analyzeReport(input.report);

        return {
          success: true,
          analysis,
        };
      } catch (error) {
        console.error('Report analysis failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to analyze report',
        });
      }
    }),

  /**
   * Validate report completeness
   */
  validateReport: protectedProcedure
    .input(
      z.object({
        report: z.any(),
      })
    )
    .query(async ({ input }) => {
      try {
        const validation = await AIReportAnalyzerService.validateReportCompleteness(input.report);

        return {
          success: true,
          validation,
        };
      } catch (error) {
        console.error('Report validation failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to validate report',
        });
      }
    }),

  /**
   * Export report in specified format
   */
  exportReport: protectedProcedure
    .input(
      z.object({
        report: z.any(),
        format: z.enum(['pdf', 'docx', 'html', 'json']),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await ReportExporterService.exportReport(input.report, input.format);

        return {
          success: true,
          filename: result.filename,
          mimeType: result.mimeType,
          // In production, would return URL to download or base64 content
          content: typeof result.content === 'string' ? result.content : result.content.toString('base64'),
        };
      } catch (error) {
        console.error('Report export failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to export report',
        });
      }
    }),

  /**
   * Generate multiple reports in batch
   */
  generateBatchReports: protectedProcedure
    .input(
      z.object({
        engagementId: z.string(),
        reportTypes: z.array(
          z.enum([
            'executive_summary',
            'technical',
            'risk_assessment',
            'remediation_roadmap',
            'red_team',
          ])
        ),
        exportFormats: z.array(z.enum(['pdf', 'docx', 'html', 'json'])),
        findings: z.array(
          z.object({
            id: z.number(),
            title: z.string(),
            description: z.string().nullable(),
            severity: z.string(),
          })
        ),
        includeAIAnalysis: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const reports = [];

        for (const reportType of input.reportTypes) {
          const report = await ReportGeneratorService.generateReport(
            input.engagementId,
            input.findings as any,
            reportType as any,
            input.includeAIAnalysis
          );

          const exports = [];
          for (const format of input.exportFormats) {
            const exportResult = await ReportExporterService.exportReport(report, format as any);
            exports.push({
              format,
              filename: exportResult.filename,
              mimeType: exportResult.mimeType,
            });
          }

          reports.push({
            reportType,
            reportId: report.metadata.id,
            exports,
          });
        }

        return {
          success: true,
          reports,
          totalReports: reports.length,
          totalExports: reports.reduce((sum, r) => sum + r.exports.length, 0),
        };
      } catch (error) {
        console.error('Batch report generation failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate batch reports',
        });
      }
    }),

  /**
   * Get report template
   */
  getReportTemplate: protectedProcedure
    .input(
      z.object({
        reportType: z.enum([
          'executive_summary',
          'technical',
          'risk_assessment',
          'remediation_roadmap',
          'red_team',
        ]),
      })
    )
    .query(({ input }) => {
      const templates: Record<string, any> = {
        executive_summary: {
          title: 'Executive Summary Report',
          description: 'High-level overview for management and stakeholders',
          sections: ['Overview', 'Key Findings', 'Risk Score', 'Recommendations'],
        },
        technical: {
          title: 'Technical Security Assessment',
          description: 'Detailed technical findings and analysis',
          sections: [
            'Findings',
            'CVSS Scoring',
            'CWE References',
            'Proof of Concept',
            'Remediation',
          ],
        },
        risk_assessment: {
          title: 'Risk Assessment Report',
          description: 'Risk scoring and prioritization',
          sections: ['Risk Matrix', 'Impact Analysis', 'Likelihood Assessment', 'Prioritization'],
        },
        remediation_roadmap: {
          title: 'Remediation Roadmap',
          description: 'Phased remediation plan with timeline',
          sections: ['Phase 1', 'Phase 2', 'Phase 3', 'Timeline', 'Cost Estimate'],
        },
        red_team: {
          title: 'Red Team Assessment Report',
          description: 'Attack chains and exploitation paths',
          sections: ['Attack Chains', 'Lateral Movement', 'Persistence', 'Evasion Techniques'],
        },
      };

      return templates[input.reportType] || templates.executive_summary;
    }),
});
