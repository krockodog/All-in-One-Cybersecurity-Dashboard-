/**
 * Report Consolidation Engine
 * Multi-report selection, merging, and consolidation
 */

import { ConsolidatedReport, Finding, ReportConfig, ReportSection } from "./professionalReportGenerator";

export interface ReportMetadata {
  id: string;
  name: string;
  type: "executive" | "technical" | "risk" | "remediation" | "red-team";
  createdAt: Date;
  findings: Finding[];
  summary: string;
}

export interface ConsolidationRequest {
  reportIds: string[];
  config: ReportConfig;
  mergeStrategy: "comprehensive" | "executive" | "technical" | "risk-focused";
}

export class ReportConsolidationEngine {
  private reportCache: Map<string, ReportMetadata> = new Map();

  /**
   * Register report for consolidation
   */
  registerReport(metadata: ReportMetadata): void {
    this.reportCache.set(metadata.id, metadata);
  }

  /**
   * Get available reports
   */
  getAvailableReports(): ReportMetadata[] {
    const reports: ReportMetadata[] = [];
    this.reportCache.forEach((report) => reports.push(report));
    return reports;
  }

  /**
   * Consolidate multiple reports
   */
  async consolidateReports(request: ConsolidationRequest): Promise<ConsolidatedReport> {
    const reports = this.getReportsByIds(request.reportIds);

    if (reports.length === 0) {
      throw new Error("No reports found for consolidation");
    }

    const allFindings = this.mergeFindings(reports.map((r) => r.findings));
    const consolidatedSummary = this.generateConsolidatedSummary(
      reports,
      request.mergeStrategy
    );

    const sections = this.generateConsolidatedSections(
      reports,
      request.mergeStrategy
    );

    const recommendations = this.generateRecommendations(allFindings);

    return {
      config: request.config,
      sections,
      findings: allFindings,
      summary: consolidatedSummary,
      recommendations,
      timeline: this.generateTimeline(reports),
    };
  }

  /**
   * Get reports by IDs
   */
  private getReportsByIds(ids: string[]): ReportMetadata[] {
    return ids
      .map((id) => this.reportCache.get(id))
      .filter((report): report is ReportMetadata => report !== undefined);
  }

  /**
   * Merge findings from multiple reports
   */
  private mergeFindings(findingArrays: Finding[][]): Finding[] {
    const findingMap = new Map<string, Finding>();

    for (const findings of findingArrays) {
      for (const finding of findings) {
        const key = `${finding.title}-${finding.severity}`;

        if (findingMap.has(key)) {
          const existing = findingMap.get(key)!;
          // Merge evidence
          const evidenceSet = new Set([...existing.evidence, ...finding.evidence]);
          const mergedEvidence: string[] = [];
          evidenceSet.forEach((e) => mergedEvidence.push(e));
          existing.evidence = mergedEvidence;
          // Keep highest CVSS
          if (finding.cvss > existing.cvss) {
            existing.cvss = finding.cvss;
          }
        } else {
          findingMap.set(key, { ...finding });
        }
      }
    }

    const mergedFindings: Finding[] = [];
    findingMap.forEach((finding) => mergedFindings.push(finding));

    // Sort by severity and CVSS
    return mergedFindings.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const severityDiff =
        severityOrder[a.severity] - severityOrder[b.severity];
      return severityDiff !== 0 ? severityDiff : b.cvss - a.cvss;
    });
  }

  /**
   * Generate consolidated summary based on merge strategy
   */
  private generateConsolidatedSummary(
    reports: ReportMetadata[],
    strategy: string
  ): string {
    switch (strategy) {
      case "comprehensive":
        return this.generateComprehensiveSummary(reports);
      case "executive":
        return this.generateExecutiveSummary(reports);
      case "technical":
        return this.generateTechnicalSummary(reports);
      case "risk-focused":
        return this.generateRiskFocusedSummary(reports);
      default:
        return this.generateComprehensiveSummary(reports);
    }
  }

  /**
   * Generate comprehensive summary
   */
  private generateComprehensiveSummary(reports: ReportMetadata[]): string {
    const allFindings = reports.flatMap((r) => r.findings);
    const criticalCount = allFindings.filter((f) => f.severity === "critical").length;
    const highCount = allFindings.filter((f) => f.severity === "high").length;

    return `This comprehensive security assessment consolidates findings from ${reports.length} separate security evaluations. 
    
The assessment identified ${allFindings.length} unique security issues, including ${criticalCount} critical and ${highCount} high-severity findings that require immediate attention. 
    
The consolidated report provides a complete view of the security posture across all assessed areas, with prioritized remediation recommendations and a detailed roadmap for addressing identified vulnerabilities.`;
  }

  /**
   * Generate executive summary
   */
  private generateExecutiveSummary(reports: ReportMetadata[]): string {
    const allFindings = reports.flatMap((r) => r.findings);
    const criticalCount = allFindings.filter((f) => f.severity === "critical").length;

    return `Executive Summary: This assessment identified ${criticalCount} critical security risks that pose immediate business impact. 
    
Immediate action is required to remediate these critical vulnerabilities. The organization should prioritize remediation efforts based on the detailed risk assessment and remediation roadmap provided in this report.`;
  }

  /**
   * Generate technical summary
   */
  private generateTechnicalSummary(reports: ReportMetadata[]): string {
    return `Technical Assessment Summary: This report consolidates technical findings from multiple security evaluations. 
    
The assessment covers vulnerability analysis, configuration review, and security control evaluation. Detailed technical findings and remediation guidance are provided for each identified issue.`;
  }

  /**
   * Generate risk-focused summary
   */
  private generateRiskFocusedSummary(reports: ReportMetadata[]): string {
    const allFindings = reports.flatMap((r) => r.findings);
    const criticalCount = allFindings.filter((f) => f.severity === "critical").length;
    const highCount = allFindings.filter((f) => f.severity === "high").length;

    return `Risk Assessment Summary: The organization faces ${criticalCount} critical and ${highCount} high-risk security vulnerabilities. 
    
These risks require immediate mitigation to prevent potential security incidents. A detailed risk matrix and remediation timeline are provided to guide the organization's response efforts.`;
  }

  /**
   * Generate consolidated sections
   */
  private generateConsolidatedSections(
    reports: ReportMetadata[],
    strategy: string
  ): ReportSection[] {
    const sections: ReportSection[] = [];

    if (strategy === "comprehensive" || strategy === "executive") {
      sections.push({
        title: "Assessment Overview",
        content: `This consolidated report combines findings from ${reports.length} separate security assessments. Each assessment focused on different aspects of the security posture.`,
      });
    }

    if (strategy === "comprehensive" || strategy === "technical") {
      sections.push({
        title: "Technical Findings",
        content: "Detailed technical vulnerabilities and security issues identified during the assessment.",
      });
    }

    if (strategy === "comprehensive" || strategy === "risk-focused") {
      sections.push({
        title: "Risk Analysis",
        content: "Business impact analysis and risk prioritization based on CVSS scoring and exploitability assessment.",
      });
    }

    sections.push({
      title: "Remediation Roadmap",
      content: "Prioritized remediation plan with timeline and resource requirements.",
    });

    return sections;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(findings: Finding[]): string[] {
    const recommendations: string[] = [];

    const criticalFindings = findings.filter((f) => f.severity === "critical");
    if (criticalFindings.length > 0) {
      recommendations.push(
        `Immediately remediate ${criticalFindings.length} critical vulnerabilities to prevent potential security breaches.`
      );
    }

    const highFindings = findings.filter((f) => f.severity === "high");
    if (highFindings.length > 0) {
      recommendations.push(
        `Develop and execute a remediation plan for ${highFindings.length} high-severity issues within 30 days.`
      );
    }

    recommendations.push(
      "Implement continuous security monitoring and vulnerability scanning to identify and remediate issues proactively."
    );

    recommendations.push(
      "Establish a security governance framework to ensure ongoing compliance and risk management."
    );

    recommendations.push(
      "Conduct security awareness training for all staff to reduce human-related security risks."
    );

    return recommendations;
  }

  /**
   * Generate timeline
   */
  private generateTimeline(reports: ReportMetadata[]): string {
    const dates = reports.map((r) => r.createdAt);
    const earliest = new Date(Math.min(...dates.map((d) => d.getTime())));
    const latest = new Date(Math.max(...dates.map((d) => d.getTime())));

    return `Assessment Period: ${earliest.toLocaleDateString()} to ${latest.toLocaleDateString()}
Reports Consolidated: ${reports.length}
Total Findings: ${reports.flatMap((r) => r.findings).length}`;
  }

  /**
   * Export consolidation metadata
   */
  exportConsolidationMetadata(
    consolidatedReport: ConsolidatedReport
  ): Record<string, unknown> {
    return {
      client: consolidatedReport.config.clientName,
      project: consolidatedReport.config.projectName,
      assessmentType: consolidatedReport.config.assessmentType,
      date: consolidatedReport.config.engagementDate,
      totalFindings: consolidatedReport.findings.length,
      criticalFindings: consolidatedReport.findings.filter(
        (f) => f.severity === "critical"
      ).length,
      highFindings: consolidatedReport.findings.filter((f) => f.severity === "high")
        .length,
      mediumFindings: consolidatedReport.findings.filter(
        (f) => f.severity === "medium"
      ).length,
      lowFindings: consolidatedReport.findings.filter((f) => f.severity === "low")
        .length,
      sections: consolidatedReport.sections.length,
      recommendations: consolidatedReport.recommendations.length,
    };
  }
}
