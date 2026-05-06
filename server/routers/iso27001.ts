import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getISO27001Service } from "../iso27001Service";

export const iso27001Router = router({
  /**
   * Get all ISO 27001 controls
   */
  getAllControls: protectedProcedure.query(async () => {
    const service = getISO27001Service();
    return service.getAllControls();
  }),

  /**
   * Get controls by clause
   */
  getControlsByClause: protectedProcedure
    .input(z.object({ clause: z.string() }))
    .query(async ({ input }) => {
      const service = getISO27001Service();
      return service.getControlsByClause(input.clause);
    }),

  /**
   * Get controls by category
   */
  getControlsByCategory: protectedProcedure
    .input(
      z.object({
        category: z.enum(["administrative", "technical", "physical"]),
      })
    )
    .query(async ({ input }) => {
      const service = getISO27001Service();
      return service.getControlsByCategory(input.category);
    }),

  /**
   * Calculate risk score
   */
  calculateRiskScore: protectedProcedure
    .input(
      z.object({
        likelihood: z.enum([
          "rare",
          "unlikely",
          "possible",
          "likely",
          "almost_certain",
        ]),
        impact: z.enum([
          "negligible",
          "minor",
          "moderate",
          "major",
          "catastrophic",
        ]),
      })
    )
    .query(async ({ input }) => {
      const service = getISO27001Service();
      const score = service.calculateRiskScore(input.likelihood, input.impact);
      return { score, level: getRiskLevel(score) };
    }),

  /**
   * Identify control gaps
   */
  identifyControlGaps: protectedProcedure
    .input(
      z.object({
        currentControls: z.record(
          z.string(),
          z.enum(["not_implemented", "partial", "implemented", "optimized"])
        ),
      })
    )
    .query(async ({ input }) => {
      const service = getISO27001Service();
      const currentControlsMap = new Map(Object.entries(input.currentControls));
      const gaps = service.identifyControlGaps(currentControlsMap);
      return {
        gaps,
        totalGaps: gaps.length,
        estimatedRemediationCost: gaps.reduce((sum, g) => sum + g.remediationCost, 0),
      };
    }),

  /**
   * Generate compliance score
   */
  generateComplianceScore: protectedProcedure
    .input(
      z.object({
        implementedControls: z.number().int().nonnegative(),
        totalControls: z.number().int().positive(),
      })
    )
    .query(async ({ input }) => {
      const service = getISO27001Service();
      const score = service.generateComplianceScore(
        input.implementedControls,
        input.totalControls
      );
      return {
        score,
        percentage: score,
        level: getComplianceLevel(score),
        gap: 100 - score,
      };
    }),

  /**
   * Get assessment template
   */
  getAssessmentTemplate: protectedProcedure.query(async () => {
    const service = getISO27001Service();
    const allControls = service.getAllControls();
    
    return {
      totalControls: allControls.length,
      clauses: Array.from(new Set(allControls.map((c) => c.clause))).sort(),
      categories: ["administrative", "technical", "physical"],
      controlsByClause: Object.fromEntries(
        Array.from(new Set(allControls.map((c) => c.clause))).map((clause) => [
          clause,
          allControls.filter((c) => c.clause === clause).length,
        ])
      ),
    };
  }),

  /**
   * Get Statement of Applicability (SoA) template
   */
  getSoATemplate: protectedProcedure.query(async () => {
    const service = getISO27001Service();
    const allControls = service.getAllControls();

    return {
      applicableControls: allControls.map((c) => ({
        controlId: c.controlId,
        controlName: c.controlName,
        reason: "Applicable to organization",
      })),
      excludedControls: [],
      implementationPlan: "To be defined",
    };
  }),

  /**
   * Generate compliance report
   */
  generateComplianceReport: protectedProcedure
    .input(
      z.object({
        assessmentId: z.number().int().positive(),
        organizationName: z.string(),
        assessmentDate: z.string(),
      })
    )
    .query(async ({ input }) => {
      // Mock implementation
      return {
        reportId: Math.floor(Math.random() * 10000),
        title: `ISO 27001 Compliance Report - ${input.organizationName}`,
        assessmentDate: input.assessmentDate,
        generatedAt: new Date().toISOString(),
        sections: [
          {
            title: "Executive Summary",
            content: "Compliance assessment summary",
          },
          {
            title: "Control Assessment",
            content: "Detailed control evaluation",
          },
          {
            title: "Risk Assessment",
            content: "Risk identification and analysis",
          },
          {
            title: "Remediation Plan",
            content: "Action items and timeline",
          },
        ],
      };
    }),

  /**
   * Get control implementation guidance
   */
  getControlGuidance: protectedProcedure
    .input(z.object({ controlId: z.string() }))
    .query(async ({ input }) => {
      const service = getISO27001Service();
      const allControls = service.getAllControls();
      const control = allControls.find((c) => c.controlId === input.controlId);

      if (!control) {
        return null;
      }

      return {
        ...control,
        implementationSteps: [
          "Assess current state",
          "Define requirements",
          "Design solution",
          "Implement controls",
          "Test and verify",
          "Document and train",
          "Monitor and review",
        ],
        commonChallenges: [
          "Resource constraints",
          "Technical complexity",
          "Organizational resistance",
          "Cost implications",
        ],
        bestPractices: [
          "Start with risk assessment",
          "Involve stakeholders",
          "Document everything",
          "Regular reviews",
        ],
      };
    }),
});

function getRiskLevel(score: number): string {
  if (score <= 5) return "Low";
  if (score <= 12) return "Medium";
  if (score <= 20) return "High";
  return "Critical";
}

function getComplianceLevel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 60) return "Acceptable";
  if (score >= 40) return "Poor";
  return "Critical";
}

export type ISO27001Router = typeof iso27001Router;
