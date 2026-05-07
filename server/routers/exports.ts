import { z } from 'zod';
import { publicProcedure, protectedProcedure, router } from '../_core/trpc';
import { generateJsonReport, generateHtmlReport, generateCsvReport, generatePdfReport, generateExcelReport, generateDocxReport } from '../services/reportExport';

export const exportsRouter = router({
  /**
   * Export pentest report as JSON
   */
  exportReportAsJson: protectedProcedure
    .input(
      z.object({
        engagementId: z.string(),
        engagementName: z.string(),
        findings: z.array(
          z.object({
            id: z.number(),
            title: z.string(),
            description: z.string().nullable(),
            severity: z.enum(['critical', 'high', 'medium', 'low', 'info']),
            cvssScore: z.string().nullable().optional(),
            remediation: z.string(),
            discoveredAt: z.date().nullable().optional(),
          })
        ),
        testerName: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const reportData = {
        engagementId: input.engagementId,
        engagementName: input.engagementName,
        findings: input.findings,
        generatedAt: new Date(),
        testerName: input.testerName,
      };

      const json = generateJsonReport(reportData);
      return {
        success: true,
        format: 'json',
        content: json,
        filename: `report-${input.engagementId}-${Date.now()}.json`,
      };
    }),

  /**
   * Export pentest report as HTML
   */
  exportReportAsHtml: protectedProcedure
    .input(
      z.object({
        engagementId: z.string(),
        engagementName: z.string(),
        findings: z.array(
          z.object({
            id: z.number(),
            title: z.string(),
            description: z.string().nullable(),
            severity: z.enum(['critical', 'high', 'medium', 'low', 'info']),
            cvssScore: z.string().nullable().optional(),
            remediation: z.string(),
            discoveredAt: z.date().nullable().optional(),
          })
        ),
        testerName: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const reportData = {
        engagementId: input.engagementId,
        engagementName: input.engagementName,
        findings: input.findings,
        generatedAt: new Date(),
        testerName: input.testerName,
      };

      const html = generateHtmlReport(reportData);
      return {
        success: true,
        format: 'html',
        content: html,
        filename: `report-${input.engagementId}-${Date.now()}.html`,
      };
    }),

  /**
   * Export pentest report as CSV
   */
  exportReportAsCsv: protectedProcedure
    .input(
      z.object({
        engagementId: z.string(),
        engagementName: z.string(),
        findings: z.array(
          z.object({
            id: z.number(),
            title: z.string(),
            description: z.string().nullable(),
            severity: z.enum(['critical', 'high', 'medium', 'low', 'info']),
            cvssScore: z.string().nullable().optional(),
            remediation: z.string(),
            discoveredAt: z.date().nullable().optional(),
          })
        ),
        testerName: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const reportData = {
        engagementId: input.engagementId,
        engagementName: input.engagementName,
        findings: input.findings,
        generatedAt: new Date(),
        testerName: input.testerName,
      };

      const csv = generateCsvReport(reportData);
      return {
        success: true,
        format: 'csv',
        content: csv,
        filename: `report-${input.engagementId}-${Date.now()}.csv`,
      };
    }),

  /**
   * Export pentest report as PDF
   */
  exportReportAsPdf: protectedProcedure
    .input(
      z.object({
        engagementId: z.string(),
        engagementName: z.string(),
        findings: z.array(
          z.object({
            id: z.number(),
            title: z.string(),
            description: z.string().nullable(),
            severity: z.enum(['critical', 'high', 'medium', 'low', 'info']),
            cvssScore: z.string().nullable().optional(),
            remediation: z.string(),
            discoveredAt: z.date().nullable().optional(),
          })
        ),
        testerName: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const reportData = {
        engagementId: input.engagementId,
        engagementName: input.engagementName,
        findings: input.findings,
        generatedAt: new Date(),
        testerName: input.testerName,
      };

      const buffer = await generatePdfReport(reportData);
      return {
        success: true,
        format: 'pdf',
        content: buffer.toString('base64'),
        filename: `report-${input.engagementId}-${Date.now()}.pdf`,
      };
    }),

  /**
   * Export pentest report as Excel
   */
  exportReportAsExcel: protectedProcedure
    .input(
      z.object({
        engagementId: z.string(),
        engagementName: z.string(),
        findings: z.array(
          z.object({
            id: z.number(),
            title: z.string(),
            description: z.string().nullable(),
            severity: z.enum(['critical', 'high', 'medium', 'low', 'info']),
            cvssScore: z.string().nullable().optional(),
            remediation: z.string(),
            discoveredAt: z.date().nullable().optional(),
          })
        ),
        testerName: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const reportData = {
        engagementId: input.engagementId,
        engagementName: input.engagementName,
        findings: input.findings,
        generatedAt: new Date(),
        testerName: input.testerName,
      };

      const buffer = await generateExcelReport(reportData);
      return {
        success: true,
        format: 'excel',
        content: buffer.toString('base64'),
        filename: `report-${input.engagementId}-${Date.now()}.xlsx`,
      };
    }),

  /**
   * Export pentest report as DOCX
   */
  exportReportAsDocx: protectedProcedure
    .input(
      z.object({
        engagementId: z.string(),
        engagementName: z.string(),
        findings: z.array(
          z.object({
            id: z.number(),
            title: z.string(),
            description: z.string().nullable(),
            severity: z.enum(['critical', 'high', 'medium', 'low', 'info']),
            cvssScore: z.string().nullable().optional(),
            remediation: z.string(),
            discoveredAt: z.date().nullable().optional(),
          })
        ),
        testerName: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const reportData = {
        engagementId: input.engagementId,
        engagementName: input.engagementName,
        findings: input.findings,
        generatedAt: new Date(),
        testerName: input.testerName,
      };

      const buffer = await generateDocxReport(reportData);
      return {
        success: true,
        format: 'docx',
        content: buffer.toString('base64'),
        filename: `report-${input.engagementId}-${Date.now()}.docx`,
      };
    }),
});
